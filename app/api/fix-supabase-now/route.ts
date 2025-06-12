import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Check if Supabase environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: "Missing Supabase environment variables",
        message: "Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment",
        recommendations: [
          "Add NEXT_PUBLIC_SUPABASE_URL to your .env.local file",
          "Add NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file",
          "Restart your development server after adding environment variables",
        ],
      })
    }

    // Try to create a Supabase client and test connection
    try {
      const { createClient } = await import("@supabase/supabase-js")
      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      // Test the connection
      const { data, error } = await supabase.from("profiles").select("count").limit(1)

      if (error) {
        if (error.code === "42P01") {
          // Table doesn't exist but connection works
          return NextResponse.json({
            success: true,
            message: "Supabase connection established successfully! Tables need to be created.",
            status: "connected_no_tables",
            recommendation: "Run the database setup to create required tables",
          })
        } else {
          return NextResponse.json({
            success: false,
            error: error.message,
            message: "Supabase connection failed",
            details: error,
          })
        }
      }

      return NextResponse.json({
        success: true,
        message: "Supabase connection and tables verified successfully!",
        status: "fully_connected",
        data: data,
      })
    } catch (connectionError) {
      return NextResponse.json({
        success: false,
        error: connectionError instanceof Error ? connectionError.message : "Connection test failed",
        message: "Failed to test Supabase connection",
        details: connectionError,
      })
    }
  } catch (error) {
    console.error("Fix Supabase error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        message: "Failed to fix Supabase connection",
      },
      { status: 500 },
    )
  }
}
