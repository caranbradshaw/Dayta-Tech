import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    console.log("🔄 Starting setup reset...")

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        message: "Missing Supabase credentials for reset operation",
      })
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey)

    // Drop all tables in reverse dependency order
    const resetSQL = `
      -- Drop tables in reverse dependency order
      DROP TABLE IF EXISTS business_events CASCADE;
      DROP TABLE IF EXISTS analytics_page_views CASCADE;
      DROP TABLE IF EXISTS analytics_sessions CASCADE;
      DROP TABLE IF EXISTS analytics_events CASCADE;
      DROP TABLE IF EXISTS custom_fields CASCADE;
      DROP TABLE IF EXISTS file_uploads CASCADE;
      DROP TABLE IF EXISTS file_activities CASCADE;
      DROP TABLE IF EXISTS account_changes CASCADE;
      DROP TABLE IF EXISTS user_activities CASCADE;
      DROP TABLE IF EXISTS subscriptions CASCADE;
      DROP TABLE IF EXISTS insights CASCADE;
      DROP TABLE IF EXISTS analyses CASCADE;
      DROP TABLE IF EXISTS projects CASCADE;
      DROP TABLE IF EXISTS organization_members CASCADE;
      DROP TABLE IF EXISTS organizations CASCADE;
      DROP TABLE IF EXISTS profiles CASCADE;

      -- Reset any sequences or other objects if needed
      -- Note: auth.users table is managed by Supabase Auth and should not be dropped
    `

    await serviceClient.sql(resetSQL)

    console.log("✅ Setup reset completed successfully")

    return NextResponse.json({
      success: true,
      message: "Setup reset completed successfully. All custom tables have been dropped.",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Setup reset failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: `Setup reset failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
