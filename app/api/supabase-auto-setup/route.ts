import { NextResponse } from "next/server"
import { getSupabaseAutoConnect } from "@/lib/supabase-auto-connect"

export async function GET() {
  try {
    const supabaseAutoConnect = getSupabaseAutoConnect()

    // Check if Supabase is available
    if (!supabaseAutoConnect.isSupabaseAvailable()) {
      return NextResponse.json({
        success: false,
        message: "Supabase client not initialized. Check your environment variables.",
        status: {
          connection: {
            success: false,
            message: "Missing Supabase environment variables",
          },
        },
      })
    }

    // Test connection
    const connectionResult = await supabaseAutoConnect.testConnection()

    if (!connectionResult.success) {
      return NextResponse.json({
        success: false,
        message: "Failed to connect to Supabase",
        status: {
          connection: connectionResult,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Connected to Supabase successfully",
      status: {
        connection: connectionResult,
      },
    })
  } catch (error) {
    console.error("Error in Supabase auto setup API:", error)
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

export async function POST() {
  try {
    const supabaseAutoConnect = getSupabaseAutoConnect()

    // Run the complete setup
    const setupStatus = await supabaseAutoConnect.runDatabaseSetup()

    // Check if all steps were successful
    const allSuccessful = Object.values(setupStatus).every((result) => result.success)

    return NextResponse.json({
      success: allSuccessful,
      message: allSuccessful ? "Supabase setup completed successfully" : "Supabase setup completed with some issues",
      status: setupStatus,
    })
  } catch (error) {
    console.error("Error in Supabase auto setup API:", error)
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
