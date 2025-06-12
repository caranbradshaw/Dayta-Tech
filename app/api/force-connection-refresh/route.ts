import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    console.log("🔄 Forcing connection refresh...")

    // Create a completely fresh Supabase client
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        message: "Missing Supabase environment variables",
      })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false, // Don't use cached sessions
      },
    })

    // Test connection with a simple query
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    const isConnected = !error || error.code === "42P01" // 42P01 means table doesn't exist, but connection works

    return NextResponse.json({
      success: true,
      connected: isConnected,
      message: isConnected ? "✅ Supabase connection confirmed!" : `❌ Connection failed: ${error?.message}`,
      details: {
        error: error?.message,
        errorCode: error?.code,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Connection refresh failed:", error)

    return NextResponse.json(
      {
        success: false,
        connected: false,
        message: `Connection refresh failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
