import { type NextRequest, NextResponse } from "next/server"
import sgMail from "@sendgrid/mail"

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
    overall: "UNKNOWN" as "PASS" | "FAIL" | "UNKNOWN",
  }

  try {
    // Test 1: Environment Variables
    console.log("🔍 Testing SendGrid Environment Variables...")
    const apiKey = process.env.SENDGRID_API_KEY
    const fromEmail = process.env.FROM_EMAIL

    results.tests.push({
      name: "Environment Variables",
      status: apiKey && fromEmail ? "PASS" : "FAIL",
      details: {
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey ? apiKey.length : 0,
        fromEmail: fromEmail || "NOT_SET",
        apiKeyPrefix: apiKey ? apiKey.substring(0, 7) + "..." : "MISSING",
      },
    })

    if (!apiKey) {
      results.overall = "FAIL"
      return NextResponse.json(results, { status: 500 })
    }

    // Test 2: SendGrid API Key Validation
    console.log("🔑 Testing SendGrid API Key...")
    sgMail.setApiKey(apiKey)

    try {
      // This will validate the API key without sending
      await sgMail.send(
        {
          to: "test@example.com",
          from: fromEmail || "noreply@daytatech.com",
          subject: "Test",
          text: "Test",
        },
        false,
      ) // false = don't actually send
    } catch (error: any) {
      // Expected to fail with test email, but should validate API key format
      const isValidKeyError =
        error.message?.includes("does not contain a valid email") || error.message?.includes("Sandbox Mode")

      results.tests.push({
        name: "API Key Validation",
        status: isValidKeyError ? "PASS" : "FAIL",
        details: {
          error: error.message,
          isValidFormat: isValidKeyError,
        },
      })
    }

    // Test 3: Send Real Test Email
    console.log("📧 Sending Real Test Email...")
    const testEmail = {
      to: "caranlharris@gmail.com",
      from: fromEmail || "noreply@daytatech.com",
      subject: `DaytaTech SendGrid Test - ${new Date().toLocaleString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">✅ SendGrid Test Successful!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">DaytaTech Email System is Working</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">📊 Test Results</h2>
            <ul style="color: #666; line-height: 1.8;">
              <li>✅ SendGrid API Key: Valid</li>
              <li>✅ Email Delivery: Working</li>
              <li>✅ HTML Formatting: Enabled</li>
              <li>✅ From Address: Configured</li>
            </ul>
          </div>

          <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #1976d2; margin-top: 0;">🚀 Ready for Production</h3>
            <p style="color: #333; margin: 0;">Your DaytaTech platform can now send:</p>
            <ul style="color: #666; margin: 10px 0;">
              <li>Welcome emails to new users</li>
              <li>Analysis completion notifications</li>
              <li>Report sharing invitations</li>
              <li>Account and security updates</li>
            </ul>
          </div>

          <div style="text-align: center; padding: 20px; color: #666;">
            <p>Test sent at: ${new Date().toLocaleString()}</p>
            <p>From: DaytaTech Email System</p>
          </div>
        </div>
      `,
      text: `
DaytaTech SendGrid Test - SUCCESS!

✅ SendGrid API Key: Valid
✅ Email Delivery: Working  
✅ HTML Formatting: Enabled
✅ From Address: Configured

Your DaytaTech platform is ready for production email delivery!

Test sent at: ${new Date().toLocaleString()}
      `,
    }

    const emailResult = await sgMail.send(testEmail)

    results.tests.push({
      name: "Email Delivery",
      status: "PASS",
      details: {
        messageId: emailResult[0]?.headers?.["x-message-id"],
        statusCode: emailResult[0]?.statusCode,
        to: testEmail.to,
        from: testEmail.from,
        subject: testEmail.subject,
      },
    })

    // Test 4: Template System (if templates exist)
    console.log("📋 Testing Email Templates...")
    const welcomeTemplateId = process.env.SENDGRID_WELCOME_TEMPLATE_ID
    const updateTemplateId = process.env.SENDGRID_UPDATE_TEMPLATE_ID

    results.tests.push({
      name: "Email Templates",
      status: welcomeTemplateId ? "PASS" : "PARTIAL",
      details: {
        welcomeTemplate: !!welcomeTemplateId,
        updateTemplate: !!updateTemplateId,
        templatesConfigured: !!(welcomeTemplateId && updateTemplateId),
      },
    })

    // Overall Status
    const failedTests = results.tests.filter((t) => t.status === "FAIL")
    results.overall = failedTests.length === 0 ? "PASS" : "FAIL"

    console.log("✅ SendGrid Full Test Complete:", results.overall)

    return NextResponse.json({
      ...results,
      message:
        results.overall === "PASS"
          ? "🎉 SendGrid is fully configured and working!"
          : "❌ SendGrid has configuration issues",
      nextSteps:
        results.overall === "PASS"
          ? [
              "✅ Email system is ready for production",
              "✅ Users will receive welcome emails",
              "✅ Analysis notifications will be sent",
              "✅ Report sharing will work",
            ]
          : [
              "🔧 Check environment variables",
              "🔧 Verify SendGrid API key",
              "🔧 Confirm from email address",
              "🔧 Test email delivery",
            ],
    })
  } catch (error: any) {
    console.error("❌ SendGrid Test Failed:", error)

    results.tests.push({
      name: "Critical Error",
      status: "FAIL",
      details: {
        error: error.message,
        stack: error.stack?.split("\n").slice(0, 3),
      },
    })

    results.overall = "FAIL"

    return NextResponse.json(
      {
        ...results,
        message: "❌ SendGrid configuration failed",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
