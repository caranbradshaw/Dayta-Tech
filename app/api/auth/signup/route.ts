import { type NextRequest, NextResponse } from "next/server"
import {
  createProTrial,
  validateEmail,
  validatePassword,
  getRegionalWelcomeMessage,
  detectUserRegion,
} from "@/lib/trial-subscription-system"
import { sendEmail } from "@/lib/email-service"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, industry, company, role, region } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: "Name, email, and password are required" }, { status: 400 })
    }

    // Detect or use provided region
    const userRegion = region || detectUserRegion(email)

    // Validate email
    const emailValidation = validateEmail(email, userRegion)
    if (!emailValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Email validation failed",
          details: emailValidation.errors,
        },
        { status: 400 },
      )
    }

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Password validation failed",
          details: passwordValidation.errors,
        },
        { status: 400 },
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase.from("profiles").select("email").eq("email", email).single()

    if (existingUser) {
      return NextResponse.json({ success: false, error: "User with this email already exists" }, { status: 409 })
    }

    // Create PRO trial subscription
    const trialSubscription = createProTrial(
      name,
      email,
      industry || "General",
      company || "Not specified",
      role || "business-analyst",
      userRegion,
    )

    // Create user profile in database
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: trialSubscription.userId,
        name,
        email,
        industry: industry || "General",
        company: company || "Not specified",
        role: role || "business-analyst",
        region: userRegion,
        account_type: "trial_pro",
        trial_status: "active",
        trial_start_date: trialSubscription.trialStartDate,
        trial_end_date: trialSubscription.trialEndDate,
        email_verified: false,
        features: trialSubscription.features,
        login_rules: trialSubscription.loginRules,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (profileError) {
      console.error("Profile creation error:", profileError)
      return NextResponse.json({ success: false, error: "Failed to create user profile" }, { status: 500 })
    }

    // Create subscription record
    const { error: subscriptionError } = await supabase.from("subscriptions").insert({
      id: trialSubscription.id,
      user_id: trialSubscription.userId,
      plan_type: "trial_pro",
      status: "active",
      trial_start: trialSubscription.trialStartDate,
      trial_end: trialSubscription.trialEndDate,
      region: userRegion,
      features: trialSubscription.features,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (subscriptionError) {
      console.error("Subscription creation error:", subscriptionError)
      // Continue anyway - profile was created successfully
    }

    // Generate verification token
    const verificationToken = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const verificationLink = `${request.nextUrl.origin}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`

    // Store verification token
    await supabase.from("email_verifications").insert({
      user_id: trialSubscription.userId,
      email,
      token: verificationToken,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      created_at: new Date().toISOString(),
    })

    // Send welcome email with verification
    const welcomeMessage = getRegionalWelcomeMessage(userRegion)

    await sendEmail({
      to: email,
      from: "welcome@daytatech.ai",
      subject: `Welcome to DaytaTech.ai - Verify Your Email & Start Your 30-Day PRO Trial! 🚀`,
      text: `
${welcomeMessage}

Hi ${name},

Congratulations! You've successfully signed up for DaytaTech.ai and your 30-day PRO trial has begun!

🎉 What you get with your PRO trial:
✅ Unlimited file uploads
✅ Advanced AI insights
✅ All file formats supported
✅ Industry-specific analysis
✅ Historical learning
✅ Team collaboration
✅ Priority support
✅ API access
✅ Custom reports
✅ Real-time analytics

To activate your account, please verify your email address:
${verificationLink}

Your trial details:
- Account Type: PRO Trial
- Region: ${userRegion.toUpperCase()}
- Trial Period: 30 days
- Expires: ${new Date(trialSubscription.trialEndDate).toLocaleDateString()}

Need help? Contact our ${userRegion} support team:
- Email: support-${userRegion === "nigeria" ? "ng" : userRegion === "america" ? "us" : "global"}@daytatech.ai
- Available: 24/7

Start analyzing your data today!

Best regards,
The DaytaTech.ai Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to DaytaTech.ai! 🚀</h1>
          <p>${welcomeMessage}</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #059669;">Your 30-Day PRO Trial Includes:</h2>
            <ul style="color: #374151;">
              <li>✅ Unlimited file uploads</li>
              <li>✅ Advanced AI insights</li>
              <li>✅ All file formats supported</li>
              <li>✅ Industry-specific analysis</li>
              <li>✅ Historical learning</li>
              <li>✅ Team collaboration</li>
              <li>✅ Priority support</li>
              <li>✅ API access</li>
              <li>✅ Custom reports</li>
              <li>✅ Real-time analytics</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify Email & Start Trial
            </a>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e;">Trial Details:</h3>
            <p style="color: #92400e; margin: 5px 0;"><strong>Account:</strong> PRO Trial</p>
            <p style="color: #92400e; margin: 5px 0;"><strong>Region:</strong> ${userRegion.toUpperCase()}</p>
            <p style="color: #92400e; margin: 5px 0;"><strong>Expires:</strong> ${new Date(trialSubscription.trialEndDate).toLocaleDateString()}</p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Need help? Contact our support team at support-${userRegion === "nigeria" ? "ng" : userRegion === "america" ? "us" : "global"}@daytatech.ai
          </p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: "Account created successfully! Please check your email to verify your account.",
      data: {
        userId: trialSubscription.userId,
        accountType: "trial_pro",
        trialDays: 30,
        region: userRegion,
        emailVerificationRequired: true,
        features: trialSubscription.features,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ success: false, error: "Internal server error during signup" }, { status: 500 })
  }
}
