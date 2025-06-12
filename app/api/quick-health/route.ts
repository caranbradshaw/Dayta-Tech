import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Quick environment check
    const envVars = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      postgresUrl: !!process.env.POSTGRES_URL,
    }

    const envScore = Object.values(envVars).filter(Boolean).length
    let envStatus = "critical"
    if (envScore === 3) envStatus = "good"
    else if (envScore >= 1) envStatus = "partial"

    // Quick connection test
    let connectionStatus = "critical"
    let connectionMessage = "Not tested"

    if (envVars.supabaseUrl && envVars.supabaseKey) {
      try {
        const { createClient } = await import("@supabase/supabase-js")
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

        const { error } = await supabase.from("profiles").select("count").limit(1)

        if (!error || error.code === "42P01") {
          connectionStatus = "good"
          connectionMessage = error ? "Connected (tables need setup)" : "Connected successfully"
        } else {
          connectionMessage = `Connection error: ${error.message}`
        }
      } catch (error) {
        connectionMessage = `Failed to test: ${error instanceof Error ? error.message : "Unknown error"}`
      }
    } else {
      connectionMessage = "Missing credentials"
    }

    // Overall status
    let overall = "critical"
    if (envStatus === "good" && connectionStatus === "good") {
      overall = "excellent"
    } else if (envStatus === "good" || connectionStatus === "good") {
      overall = "good"
    } else if (envStatus === "partial") {
      overall = "needs-attention"
    }

    return NextResponse.json({
      success: true,
      environment: {
        ...envVars,
        status: envStatus,
      },
      connection: {
        canConnect: connectionStatus === "good",
        message: connectionMessage,
        status: connectionStatus,
      },
      overall,
    })
  } catch (error) {
    console.error("Quick health check failed:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      environment: {
        supabaseUrl: false,
        supabaseKey: false,
        postgresUrl: false,
        status: "critical",
      },
      connection: {
        canConnect: false,
        message: "Health check failed",
        status: "critical",
      },
      overall: "critical",
    })
  }
}
