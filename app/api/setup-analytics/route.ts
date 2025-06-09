import { NextResponse } from "next/server"
import { DirectAnalyticsSetup } from "@/lib/analytics-setup-direct"

export async function GET() {
  try {
    const setup = new DirectAnalyticsSetup()
    const result = await setup.setup()

    return NextResponse.json({
      success: result.success,
      message: result.success ? "Analytics setup completed!" : "Setup failed",
      logs: result.logs,
      data: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        logs: [`Error: ${error}`],
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  return GET()
}
