import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { sendEmail } from "@/lib/email-service"
import { getRegionalWelcomeMessage } from "@/lib/trial-subscription-system"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Check if already verified
    if (profile.email_verified) {
      return NextResponse.json({ success: false, error: "Email is already verified" }, { status: 400 })
    }

    // Check rate limiting (max 3 attempts per hour)
    const { data: recentVerifications } = await supabase
      .from("email_verifications")
      .select("created_at")
      .eq("email", email)
      .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())

    if (recentVerifications && recentVerifications.length >= 3) {
      return NextResponse.json(
        { success: false, error: "Too many verification attempts. Please try again later." },
        { status: 429 },
      )
    }

    // Generate new verification token
    const verificationToken = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const verificationLink = `${request.nextUrl.origin}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`

    // Store new verification token
    await supabase.from("email_verifications").insert({
      user_id: profile.id,
      email,
      token: verificationToken,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      created_at: new Date().toISOString(),
    })

    // Send verification email
    const welcomeMessage = getRegionalWelcomeMessage(profile.region || "global")

    await sendEmail({
      to: email,
      from: "verify@daytatech.ai",
      subject: "Verify Your Email - DaytaTech.ai PRO Trial Waiting!",
      text: `
Hi ${profile.name},

${welcomeMessage}

Please verify your email address to activate your 30-day PRO trial:
${verificationLink}

This link will expire in 24 hours.

If you didn't request this, please ignore this email.

Best regards,
The DaytaTech.ai Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Verify Your Email Address</h1>
          <p>Hi ${profile.name},</p>
          <p>${welcomeMessage}</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify Email & Activate Trial
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            This link will expire in 24 hours. If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: "Verification email sent successfully",
    })
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
