import { NextResponse } from "next/server"
import { checkSupabaseEnvVars } from "@/lib/supabase-setup-helper"
import { getSupabaseAutoConnect } from "@/lib/supabase-auto-connect"

export async function GET() {
  try {
    // Check environment variables
    const envStatus = checkSupabaseEnvVars()

    // If required vars are missing, return early
    if (!envStatus.hasRequiredVars) {
      return NextResponse.json({
        success: false,
        message: "Missing required Supabase environment variables",
        envStatus,
        connectionStatus: {
          success: false,
          message: "Cannot connect without required environment variables",
        },
        setupStatus: {
          success: false,
          message: "Setup not possible without connection",
        },
      })
    }

    // Check connection
    const supabaseAutoConnect = getSupabaseAutoConnect()
    const connectionResult = await supabaseAutoConnect.testConnection()

    // Get setup status if connected
    let setupStatus = {
      success: false,
      message: "Setup status unknown",
      details: {},
    }

    if (connectionResult.success) {
      setupStatus = {
        success: true,
        message: "Connected to Supabase",
        details: supabaseAutoConnect.getSetupStatus(),
      }
    }

    return NextResponse.json({
      success: connectionResult.success,
      message: connectionResult.success ? "Supabase connection successful" : "Failed to connect to Supabase",
      envStatus,
      connectionStatus: connectionResult,
      setupStatus,
    })
  } catch (error) {
    console.error("Error checking Supabase status:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        error,
      },
      { status: 500 },
    )
  }
}
