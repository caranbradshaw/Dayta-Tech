import { type NextRequest, NextResponse } from "next/server"
import { createProTrial, createUserAIContext, validateEmail, validatePassword } from "@/lib/trial-subscription-system"
import type { UserRole, Region } from "@/lib/trial-subscription-system"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  const supabase = createServerComponentClient({ cookies })

  try {
    const body = await request.json()
    const { name, email, password, confirmPassword, industry, company, role, region, aiContext } = body

    const requiredFields = { name, email, password, confirmPassword, industry, company, role, region }
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || value.trim() === "")
      .map(([key]) => key)

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, error: "Passwords do not match" }, { status: 400 })
    }

    const emailValidation = validateEmail(email, region as Region)
    if (!emailValidation.isValid) {
      return NextResponse.json({ success: false, error: emailValidation.errors.join(", ") }, { status: 400 })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json({ success: false, error: passwordValidation.errors.join(", ") }, { status: 400 })
    }

    // ✅ Actually create the Supabase user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        data: {
          name,
          industry,
          company,
          role,
          region,
        },
      },
    })

    if (authError) {
      console.error("Supabase signup error:", authError)
      return NextResponse.json({ success: false, error: authError.message }, { status: 400 })
    }

    const newUserId = authData.user?.id

    if (!newUserId) {
      return NextResponse.json({ success: false, error: "User ID not returned from Supabase." }, { status: 500 })
    }

    // Store additional profile metadata
    await supabase.from("profiles").insert({
      id: newUserId,
      name,
      email: email.toLowerCase(),
      industry,
      company,
      role,
      region,
      account_type: "trial",
      trial_status: "active",
      trial_start_date: new Date().toISOString(),
      trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      features: createProTrial(name, email, industry, company, role as UserRole, region as Region).features,
    })

    // AI Context can also be stored in its own table if needed
    const userAIContext = createUserAIContext(region as Region, industry, role as UserRole, company)

    console.log("New user signed up:", { email, id: newUserId })

    return NextResponse.json({
      success: true,
      message: "Account created! Please check your email to verify your address.",
      trial: {
        daysRemaining: 30,
        region,
      },
      aiContext: userAIContext,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ success: false, error: "Internal server error. Please try again." }, { status: 500 })
  }
}
