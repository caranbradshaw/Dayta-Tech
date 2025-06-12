import { NextResponse } from "next/server"
import { getSupabaseAutoRepair } from "@/lib/supabase-auto-repair"

export async function GET() {
  try {
    const supabaseAutoRepair = getSupabaseAutoRepair()

    // Check if Supabase is available
    if (!supabaseAutoRepair.isSupabaseAvailable()) {
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
    const connectionResult = await supabaseAutoRepair.testConnection()

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
    console.error("Error in Supabase auto repair API:", error)
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
    const supabaseAutoRepair = getSupabaseAutoRepair()

    // Run the complete repair
    const repairStatus = await supabaseAutoRepair.runDatabaseRepair()

    // Check if all steps were successful
    const allSuccessful = Object.values(repairStatus).every((result) => result.success)

    return NextResponse.json({
      success: allSuccessful,
      message: allSuccessful ? "Supabase repair completed successfully" : "Supabase repair completed with some issues",
      status: repairStatus,
    })
  } catch (error) {
    console.error("Error in Supabase auto repair API:", error)
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
