import { createServerClient } from "@/lib/supabase"

export async function debugDatabase() {
  try {
    console.log("🔍 Debugging database structure...")

    // Check if Supabase is available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.log("❌ Missing Supabase credentials")
      return {
        success: false,
        error: "Missing Supabase credentials",
        fallbackMode: true,
      }
    }

    // Create Supabase client
    const supabase = createServerClient()

    // Check if we can connect
    const { data: connection, error: connectionError } = await supabase
      .from("analytics_events")
      .select("count")
      .limit(1)

    if (connectionError) {
      console.error("❌ Connection error:", connectionError.message)

      // Check if it's a table not found error
      if (connectionError.code === "42P01") {
        return {
          success: false,
          error: "Analytics tables not found. Please run setup.",
          needsSetup: true,
        }
      }

      return { success: false, error: connectionError.message }
    }

    // Check tables
    const { data: tables, error: tablesError } = await supabase.rpc("get_table_list")

    if (tablesError) {
      console.log("⚠️ Could not get table list:", tablesError.message)
    } else {
      console.log("✅ Available tables:", tables)
    }

    // Test basic insert
    const { data: insertTest, error: insertError } = await supabase
      .from("analytics_events")
      .insert({
        event_name: "test_event",
        properties: { test: true },
      })
      .select()

    if (insertError) {
      console.error("❌ Insert test failed:", insertError.message)
      return { success: false, error: insertError.message }
    }

    console.log("✅ Insert test successful:", insertTest)

    // Clean up test data
    await supabase.from("analytics_events").delete().eq("event_name", "test_event")

    return {
      success: true,
      message: "Database is working correctly",
      tables: tables || [],
    }
  } catch (error: any) {
    console.error("❌ Debug error:", error)
    return {
      success: false,
      error: error.message,
      fallbackMode: true,
    }
  }
}
