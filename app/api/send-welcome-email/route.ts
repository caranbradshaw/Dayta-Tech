import { type NextRequest, NextResponse } from "next/server"
import sgMail from "@sendgrid/mail"

export async function GET(request: NextRequest) {
  try {
    console.log("🚀 Starting Welcome Email Send Process...")

    // Check if SendGrid is configured
    const apiKey = process.env.SENDGRID_API_KEY
    const fromEmail = process.env.FROM_EMAIL

    if (!apiKey) {
      console.error("❌ SendGrid API key not found")
      return NextResponse.json(
        {
          success: false,
          error: "SendGrid API key not configured",
          debug: {
            hasApiKey: false,
            hasFromEmail: !!fromEmail,
          },
        },
        { status: 500 },
      )
    }

    console.log("✅ SendGrid API key found, length:", apiKey.length)
    sgMail.setApiKey(apiKey)

    const welcomeMsg = {
      to: "caranlharris@gmail.com",
      from: fromEmail || "noreply@daytatech.com",
      subject: `🎉 Welcome to DaytaTech - Your AI Analytics Platform is Ready!`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; background: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">Welcome to DaytaTech! 🚀</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Your AI-Powered Analytics Platform is Ready</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px; background: white;">
            <div style="background: #f8f9ff; padding: 25px; border-radius: 10px; border-left: 4px solid #667eea; margin-bottom: 30px;">
              <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px;">🎯 Platform Features Confirmed</h2>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="color: #22c55e; font-size: 18px;">✅</span>
                  <span style="color: #555;">Enhanced AI Analysis with Goals & Roles</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="color: #22c55e; font-size: 18px;">✅</span>
                  <span style="color: #555;">Professional Report Generation (PDF, Excel, Word)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="color: #22c55e; font-size: 18px;">✅</span>
                  <span style="color: #555;">SendGrid Email Integration</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="color: #22c55e; font-size: 18px;">✅</span>
                  <span style="color: #555;">Multi-Region Support (US, Europe, Asia)</span>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="color: #22c55e; font-size: 18px;">✅</span>
                  <span style="color: #555;">Advanced Dashboard & Analytics</span>
                </div>
              </div>
            </div>

            <div style="background: #fff7ed; padding: 25px; border-radius: 10px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
              <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 20px;">🚀 Ready to Get Started?</h3>
              <p style="color: #78350f; margin: 0 0 20px 0; line-height: 1.6;">Your DaytaTech platform is fully configured and ready for production use. Here's what you can do now:</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
                <h4 style="color: #333; margin: 0 0 10px 0;">📊 Upload & Analyze Data</h4>
                <p style="color: #666; margin: 0; font-size: 14px;">Upload CSV, Excel files and get AI-powered insights with custom goals and role-based analysis.</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
                <h4 style="color: #333; margin: 0 0 10px 0;">📋 Generate Professional Reports</h4>
                <p style="color: #666; margin: 0; font-size: 14px;">Export analysis results as PDF, Excel, or Word documents for sharing with stakeholders.</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
                <h4 style="color: #333; margin: 0 0 10px 0;">👥 Collaborate & Share</h4>
                <p style="color: #666; margin: 0; font-size: 14px;">Share reports with team members and collaborate on data-driven decisions.</p>
              </div>
            </div>

            <div style="background: #ecfdf5; padding: 25px; border-radius: 10px; border-left: 4px solid #10b981; margin-bottom: 30px;">
              <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 20px;">📈 Next Steps</h3>
              <ol style="color: #047857; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Visit your dashboard to explore the platform</li>
                <li>Upload your first dataset for analysis</li>
                <li>Set up your organization and team members</li>
                <li>Configure your preferred analysis goals</li>
                <li>Generate and share your first report</li>
              </ol>
            </div>

            <div style="text-align: center; padding: 30px 0;">
              <a href="https://daytatech.com/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                🚀 Access Your Dashboard
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">
              Need help? Contact our support team at 
              <a href="mailto:support@daytatech.com" style="color: #667eea;">support@daytatech.com</a>
            </p>
            <p style="color: #999; margin: 0; font-size: 12px;">
              This email was sent from your DaytaTech platform at ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `,
      text: `
🎉 Welcome to DaytaTech!

Your AI-Powered Analytics Platform is Ready

✅ Platform Features Confirmed:
- Enhanced AI Analysis with Goals & Roles
- Professional Report Generation (PDF, Excel, Word)  
- SendGrid Email Integration
- Multi-Region Support (US, Europe, Asia)
- Advanced Dashboard & Analytics

🚀 Ready to Get Started?

📊 Upload & Analyze Data
Upload CSV, Excel files and get AI-powered insights with custom goals and role-based analysis.

📋 Generate Professional Reports  
Export analysis results as PDF, Excel, or Word documents for sharing with stakeholders.

👥 Collaborate & Share
Share reports with team members and collaborate on data-driven decisions.

📈 Next Steps:
1. Visit your dashboard to explore the platform
2. Upload your first dataset for analysis
3. Set up your organization and team members
4. Configure your preferred analysis goals
5. Generate and share your first report

🚀 Access Your Dashboard: https://daytatech.com/dashboard

Need help? Contact support@daytatech.com
Sent at: ${new Date().toLocaleString()}
      `,
    }

    console.log("📧 Sending welcome email to:", welcomeMsg.to)
    const result = await sgMail.send(welcomeMsg)

    console.log("✅ Welcome email sent successfully!")
    console.log("📊 SendGrid Response:", {
      statusCode: result[0]?.statusCode,
      messageId: result[0]?.headers?.["x-message-id"],
    })

    return NextResponse.json({
      success: true,
      message: "🎉 Welcome email sent successfully!",
      details: {
        to: welcomeMsg.to,
        from: welcomeMsg.from,
        subject: welcomeMsg.subject,
        statusCode: result[0]?.statusCode,
        messageId: result[0]?.headers?.["x-message-id"],
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("❌ Welcome email failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send welcome email",
        details: {
          errorCode: error.code,
          errorType: error.name,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    )
  }
}
