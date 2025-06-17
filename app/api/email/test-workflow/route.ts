import { type NextRequest, NextResponse } from "next/server"
import { EmailWorkflowService } from "@/lib/email-workflow-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { emailType, region = "america", testEmail } = body

    if (!emailType || !testEmail) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: emailType, testEmail" },
        { status: 400 },
      )
    }

    const emailService = EmailWorkflowService.getInstance()

    const testUser = {
      name: "Test User",
      email: testEmail,
      company: region === "nigeria" ? "Test Nigeria Ltd" : "Test Corp Inc",
      role: "business_analyst" as const,
      industry: region === "nigeria" ? "Fintech" : "Technology",
    }

    let result

    switch (emailType) {
      case "welcome":
        result = await emailService.sendWelcomeEmail({
          region: region as any,
          user: testUser,
          metadata: { test: true },
        })
        break

      case "security":
        result = await emailService.sendSecurityEmail({
          region: region as any,
          user: testUser,
          changeType: "password",
          ipAddress: "192.168.1.1",
          location: region === "nigeria" ? "Lagos, Nigeria" : "New York, USA",
          metadata: { test: true },
        })
        break

      case "platform_update":
        const now = new Date()
        const later = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours later

        result = await emailService.sendPlatformUpdateEmail({
          region: region as any,
          user: testUser,
          updateType: "maintenance",
          startTime: now.toISOString(),
          endTime: later.toISOString(),
          description: "We are performing scheduled maintenance to improve platform performance and add new features.",
          affectedServices: ["Data Analysis", "File Upload", "Report Generation"],
          metadata: { test: true },
        })
        break

      default:
        return NextResponse.json(
          { success: false, error: "Invalid emailType. Must be one of: welcome, security, platform_update" },
          { status: 400 },
        )
    }

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? `Test ${emailType} email sent successfully to ${testEmail}`
        : `Failed to send test ${emailType} email`,
      messageId: result.messageId,
      error: result.error,
    })
  } catch (error) {
    console.error("Test email workflow error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
