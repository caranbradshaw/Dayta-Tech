import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { canUserLogin, calculateDaysRemaining, getTrialStatus } from "@/lib/trial-subscription-system"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // Check login attempts (simplified - in production, use proper rate limiting)
    const { data: loginAttempts } = await supabase
      .from("login_attempts")
      .select("attempts, last_attempt")
      .eq("email", email)
      .single()

    const currentAttempts = loginAttempts?.attempts || 0

    // Check if user can login
    const loginCheck = canUserLogin(
      {
        id: profile.id,
        userId: profile.id,
        accountType: profile.account_type,
        trialStatus: profile.trial_status,
        region: profile.region,
        trialStartDate: profile.trial_start_date,
        trialEndDate: profile.trial_end_date,
        isTrialActive: calculateDaysRemaining(profile.trial_end_date) > 0,
        daysRemaining: calculateDaysRemaining(profile.trial_end_date),
        features: profile.features,
        emailVerified: profile.email_verified,
        loginRules: profile.login_rules,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      },
      currentAttempts,
    )

    if (!loginCheck.canLogin) {
      // Record failed login attempt
      await supabase.from("login_attempts").upsert({
        email,
        attempts: currentAttempts + 1,
        last_attempt: new Date().toISOString(),
      })

      return NextResponse.json(
        {
          success: false,
          error: loginCheck.reason,
          requiresAction: loginCheck.requiresAction,
        },
        { status: 401 },
      )
    }

    // Simulate password verification (in production, use proper hashing)
    // For demo purposes, we'll assume password is correct

    // Reset login attempts on successful login
    await supabase.from("login_attempts").upsert({
      email,
      attempts: 0,
      last_attempt: new Date().toISOString(),
    })

    // Update last login
    await supabase
      .from("profiles")
      .update({
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id)

    // Get trial status
    const trialStatus = getTrialStatus({
      id: profile.id,
      userId: profile.id,
      accountType: profile.account_type,
      trialStatus: profile.trial_status,
      region: profile.region,
      trialStartDate: profile.trial_start_date,
      trialEndDate: profile.trial_end_date,
      isTrialActive: calculateDaysRemaining(profile.trial_end_date) > 0,
      daysRemaining: calculateDaysRemaining(profile.trial_end_date),
      features: profile.features,
      emailVerified: profile.email_verified,
      loginRules: profile.login_rules,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    })

    // Log successful login
    await supabase.from("user_activities").insert({
      user_id: profile.id,
      activity_type: "login",
      description: "User logged in successfully",
      metadata: {
        region: profile.region,
        trial_status: trialStatus.status,
        days_remaining: trialStatus.daysRemaining,
      },
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        userId: profile.id,
        name: profile.name,
        email: profile.email,
        accountType: profile.account_type,
        region: profile.region,
        emailVerified: profile.email_verified,
        trial: trialStatus,
        features: profile.features,
        requiresAction: trialStatus.actionRequired,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "Internal server error during login" }, { status: 500 })
  }
}
