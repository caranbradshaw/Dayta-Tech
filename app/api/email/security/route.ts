import { type NextRequest, NextResponse } from "next/server"
import { EmailWorkflowService } from "@/lib/email-workflow-service"
import type { Region, UserRole } from "@/lib/trial-subscription-system"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user, region, changeType, ipAddress, location, metadata } = body

    // Validate required fields
    if (!user?.email || !user?.name || !region || !changeType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: user.email, user.name, region, changeType" },
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

    // Validate change type
    const validChangeTypes = ["password", "email", "profile", "billing"]
    if (!validChangeTypes.includes(changeType)) {
      return NextResponse.json(
        { success: false, error: "Invalid changeType. Must be one of: password, email, profile, billing" },
        { status: 400 },
      )
    }

    // Get client IP if not provided
    const clientIP = ipAddress || request.ip || request.headers.get("x-forwarded-for") || "Unknown"

    const emailService = EmailWorkflowService.getInstance()

    const result = await emailService.sendSecurityEmail({
      region: region as Region,
      user: {
        name: user.name,
        email: user.email,
        company: user.company,
        role: user.role as UserRole,
        industry: user.industry,
      },
      changeType: changeType as "password" | "email" | "profile" | "billing",
      ipAddress: clientIP,
      location: location || "Unknown",
      metadata,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Security notification email sent successfully",
        messageId: result.messageId,
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to send security email" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Security email API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
