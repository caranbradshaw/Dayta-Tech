import { type NextRequest, NextResponse } from "next/server"
import { EmailWorkflowService } from "@/lib/email-workflow-service"
import type { Region, UserRole } from "@/lib/trial-subscription-system"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user, region, metadata } = body

    // Validate required fields
    if (!user?.email || !user?.name || !region) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: user.email, user.name, region" },
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

    const emailService = EmailWorkflowService.getInstance()

    const result = await emailService.sendWelcomeEmail({
      region: region as Region,
      user: {
        name: user.name,
        email: user.email,
        company: user.company,
        role: user.role as UserRole,
        industry: user.industry,
      },
      metadata,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Welcome email sent successfully",
        messageId: result.messageId,
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to send welcome email" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Welcome email API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
