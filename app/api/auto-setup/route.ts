import { NextResponse } from "next/server"
import { AutoSetup } from "@/lib/auto-setup"

export async function POST() {
  try {
    const setup = new AutoSetup()
    const result = await setup.runFullSetup()

    return NextResponse.json({
      success: result.success,
      message: result.success ? "Analytics setup completed successfully!" : "Setup completed with some errors",
      results: result.results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Auto-setup error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to run automated setup",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  // Run setup automatically when accessed
  return POST()
}
