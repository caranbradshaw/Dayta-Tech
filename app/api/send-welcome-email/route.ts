import { type NextRequest, NextResponse } from "next/server"
import sgMail from "@sendgrid/mail"

export async function GET(request: NextRequest) {
  try {
    // Check if SendGrid is configured
    const apiKey = process.env.SENDGRID_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "SendGrid API key not configured",
        },
        { status: 500 },
      )
    }

    sgMail.setApiKey(apiKey)

    const msg = {
      to: "caranlharris@gmail.com",
      from: process.env.FROM_EMAIL || "noreply@daytatech.com",
      subject: "Welcome to DaytaTech - Test Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to DaytaTech!</h1>
          <p>This is a test email to confirm SendGrid integration is working.</p>
          <p>Your platform is ready for production use!</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>✅ Features Confirmed:</h3>
            <ul>
              <li>SendGrid email delivery</li>
              <li>Enhanced wizard with goals</li>
              <li>Flexible role system</li>
              <li>Multi-region support</li>
            </ul>
          </div>
          <p>Best regards,<br>The DaytaTech Team</p>
        </div>
      `,
    }

    await sgMail.send(msg)

    return NextResponse.json({
      success: true,
      message: "Welcome email sent successfully!",
    })
  } catch (error: any) {
    console.error("SendGrid error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send email",
      },
      { status: 500 },
    )
  }
}
