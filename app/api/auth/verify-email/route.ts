import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { sendEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, email } = body

    if (!token || !email) {
      return NextResponse.json({ success: false, error: "Token and email are required" }, { status: 400 })
    }

    // Verify the token
    const { data: verification, error: verificationError } = await supabase
      .from("email_verifications")
      .select("*")
      .eq("token", token)
      .eq("email", email)
      .single()

    if (verificationError || !verification) {
      return NextResponse.json({ success: false, error: "Invalid or expired verification token" }, { status: 400 })
    }

    // Check if token is expired
    if (new Date(verification.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: "Verification token has expired" }, { status: 400 })
    }

    // Update user profile to mark email as verified
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        email_verified: true,
        email_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", verification.user_id)

    if (updateError) {
      console.error("Profile update error:", updateError)
      return NextResponse.json({ success: false, error: "Failed to verify email" }, { status: 500 })
    }

    // Mark verification as used
    await supabase
      .from("email_verifications")
      .update({
        verified_at: new Date().toISOString(),
        used: true,
      })
      .eq("id", verification.id)

    // Get user profile for welcome message
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", verification.user_id).single()

    // Send welcome email with trial details
    if (profile) {
      await sendEmail({
        to: email,
        from: "welcome@daytatech.ai",
        subject: "🎉 Email Verified! Your 30-Day PRO Trial is Now Active",
        text: `
Hi ${profile.name},

Great news! Your email has been verified and your 30-day PRO trial is now fully active!

🚀 You can now:
- Upload unlimited files for analysis
- Access advanced AI insights
- Use all file formats (CSV, Excel, JSON, etc.)
- Get industry-specific analysis
- Collaborate with your team
- Export custom reports
- Access our API

Trial Details:
- Days Remaining: ${Math.max(0, Math.ceil((new Date(profile.trial_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
- Region: ${profile.region.toUpperCase()}
- Account Type: PRO Trial

Ready to get started? Log in to your dashboard and upload your first file!

Dashboard: ${process.env.NEXT_PUBLIC_APP_URL || "https://daytatech.ai"}/dashboard

Questions? Our ${profile.region} support team is here to help:
support-${profile.region === "nigeria" ? "ng" : profile.region === "america" ? "us" : "global"}@daytatech.ai

Welcome aboard!
The DaytaTech.ai Team
        `,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #059669;">🎉 Email Verified Successfully!</h1>
            <p>Hi ${profile.name},</p>
            <p>Great news! Your email has been verified and your <strong>30-day PRO trial</strong> is now fully active!</p>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #059669;">🚀 You Can Now:</h2>
              <ul style="color: #374151;">
                <li>Upload unlimited files for analysis</li>
                <li>Access advanced AI insights</li>
                <li>Use all file formats (CSV, Excel, JSON, etc.)</li>
                <li>Get industry-specific analysis</li>
                <li>Collaborate with your team</li>
                <li>Export custom reports</li>
                <li>Access our API</li>
              </ul>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #92400e;">Trial Status:</h3>
              <p style="color: #92400e; margin: 5px 0;"><strong>Days Remaining:</strong> ${Math.max(0, Math.ceil((new Date(profile.trial_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}</p>
              <p style="color: #92400e; margin: 5px 0;"><strong>Region:</strong> ${profile.region.toUpperCase()}</p>
              <p style="color: #92400e; margin: 5px 0;"><strong>Account:</strong> PRO Trial</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://daytatech.ai"}/dashboard" 
                 style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Go to Dashboard
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              Questions? Contact support-${profile.region === "nigeria" ? "ng" : profile.region === "america" ? "us" : "global"}@daytatech.ai
            </p>
          </div>
        `,
      })
    }

    // Log verification activity
    await supabase.from("user_activities").insert({
      user_id: verification.user_id,
      activity_type: "email_verified",
      description: "Email address verified successfully",
      metadata: {
        email,
        verified_at: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Email verified successfully! Your PRO trial is now active.",
      data: {
        emailVerified: true,
        trialActive: true,
      },
    })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error during email verification" },
      { status: 500 },
    )
  }
}
