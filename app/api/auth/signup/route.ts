import { type NextRequest, NextResponse } from "next/server"
import { createProTrial, createUserAIContext, validateEmail, validatePassword } from "@/lib/trial-subscription-system"
import type { UserRole, Region } from "@/lib/trial-subscription-system"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, confirmPassword, industry, company, role, region, aiContext } = body

    // Validate all required fields
    const requiredFields = { name, email, password, confirmPassword, industry, company, role, region }
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || value.trim() === "")
      .map(([key, _]) => key)

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 },
      )
    }

    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, error: "Passwords do not match" }, { status: 400 })
    }

    // Validate email format and rules
    const emailValidation = validateEmail(email, region as Region)
    if (!emailValidation.isValid) {
      return NextResponse.json({ success: false, error: emailValidation.errors.join(", ") }, { status: 400 })
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json({ success: false, error: passwordValidation.errors.join(", ") }, { status: 400 })
    }

    // Create PRO trial subscription with all user context
    const trialSubscription = createProTrial(
      name.trim(),
      email.toLowerCase().trim(),
      industry.trim(),
      company.trim(), // Now required
      role as UserRole,
      region as Region,
    )

    // Create AI context for personalized analysis
    const userAIContext = createUserAIContext(region as Region, industry.trim(), role as UserRole, company.trim())

    // In a real application, you would:
    // 1. Save user to database with all context
    // 2. Send verification email with trial activation
    // 3. Store AI context for future analysis personalization

    console.log("New user signup with full context:", {
      user: { name, email, industry, company, role, region },
      trial: trialSubscription,
      aiContext: userAIContext,
    })

    // Simulate successful signup
    return NextResponse.json({
      success: true,
      message: "Account created successfully! Please check your email to verify and activate your 30-day PRO trial.",
      trial: {
        daysRemaining: 30,
        features: trialSubscription.features,
        region: trialSubscription.region,
      },
      aiContext: {
        personalized: true,
        industry: userAIContext.industry,
        role: userAIContext.role,
        region: userAIContext.region,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ success: false, error: "Internal server error. Please try again." }, { status: 500 })
  }
}
