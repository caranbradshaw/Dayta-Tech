import { NextResponse } from "next/server"
import { getEnvironmentStatus } from "@/lib/env-check"

export async function GET() {
  try {
    const status = getEnvironmentStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error("Error checking environment status:", error)
    return NextResponse.json(
      {
        hasDatabase: false,
        hasAI: false,
        hasStorage: false,
        hasEmail: false,
        missingVars: ["Unable to check environment variables"],
        mode: "demo",
        message: "Running in demo mode",
        recommendations: "Check server configuration",
      },
      { status: 200 },
    )
  }
}
