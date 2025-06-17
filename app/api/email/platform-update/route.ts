import { type NextRequest, NextResponse } from "next/server"
import { EmailWorkflowService } from "@/lib/email-workflow-service"
import type { Region, UserRole } from "@/lib/trial-subscription-system"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      users, // Array of users or single user
      region,
      updateType,
      startTime,
      endTime,
      description,
      affectedServices,
      metadata,
    } = body

    // Validate required fields
    if (!users || !region || !updateType || !startTime || !endTime || !description) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: users, region, updateType, startTime, endTime, description",
        },
        { status: 400 },
      )
    }

    // Validate region
    const validRegions = ["nigeria", "america", "global", "europe", "asia"]
    if (!validRegions.includes(region)) {
      return NextResponse.json(
        { success: false, error: "Invalid region. Must be one of: nigeria, america, global, europe, asia" },
        { status: 400 },
      )
    }

    // Validate update type
    const validUpdateTypes = ["maintenance", "feature", "security", "emergency"]
    if (!validUpdateTypes.includes(updateType)) {
      return NextResponse.json(
        { success: false, error: "Invalid updateType. Must be one of: maintenance, feature, security, emergency" },
        { status: 400 },
      )
    }

    // Validate dates
    const start = new Date(startTime)
    const end = new Date(endTime)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid date format for startTime or endTime" },
        { status: 400 },
      )
    }

    if (end <= start) {
      return NextResponse.json({ success: false, error: "endTime must be after startTime" }, { status: 400 })
    }

    const emailService = EmailWorkflowService.getInstance()

    // Handle both single user and array of users
    const userList = Array.isArray(users) ? users : [users]
    const results = []

    for (const user of userList) {
      if (!user?.email || !user?.name) {
        console.warn("Skipping user with missing email or name:", user)
        continue
      }

      try {
        const result = await emailService.sendPlatformUpdateEmail({
          region: region as Region,
          user: {
            name: user.name,
            email: user.email,
            company: user.company,
            role: user.role as UserRole,
            industry: user.industry,
          },
          updateType: updateType as "maintenance" | "feature" | "security" | "emergency",
          startTime,
          endTime,
          description,
          affectedServices: affectedServices || [],
          metadata,
        })

        results.push({
          email: user.email,
          success: result.success,
          messageId: result.messageId,
          error: result.error,
        })
      } catch (error) {
        console.error(`Failed to send platform update email to ${user.email}:`, error)
        results.push({
          email: user.email,
          success: false,
          error: "Failed to send email",
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.length - successCount

    return NextResponse.json({
      success: failureCount === 0,
      message: `Platform update emails sent: ${successCount} successful, ${failureCount} failed`,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount,
      },
    })
  } catch (error) {
    console.error("Platform update email API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
