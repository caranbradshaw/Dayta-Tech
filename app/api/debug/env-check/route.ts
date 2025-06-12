import { NextResponse } from "next/server"
import { getDatabaseSetup } from "@/lib/database-setup"

export async function GET() {
  try {
    // Check environment variables
    const envVars = {
      SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || null,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || null,
    }

    // Check database setup
    const dbSetup = getDatabaseSetup()
    const setupResult = await dbSetup.runMinimalSetup()

    return NextResponse.json({
      status: "success",
      message: "Environment check completed",
      environment: {
        node_env: process.env.NODE_ENV,
        supabase_available: !!envVars.SUPABASE_URL && !!envVars.SUPABASE_ANON_KEY,
        env_vars: {
          SUPABASE_URL: envVars.SUPABASE_URL ? "✓ Set" : "✗ Missing",
          SUPABASE_ANON_KEY: envVars.SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing",
          SUPABASE_SERVICE_ROLE_KEY: envVars.SUPABASE_SERVICE_ROLE_KEY ? "✓ Set" : "✗ Missing",
        },
      },
      database_setup: setupResult,
      fallback_mode: !dbSetup.isSupabaseAvailable() || !setupResult.success,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Environment check error:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to check environment",
        error: error instanceof Error ? error.message : "Unknown error",
        fallback_mode: true,
      },
      { status: 500 },
    )
  }
}
