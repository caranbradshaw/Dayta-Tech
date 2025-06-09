import { createServerClient } from "@/lib/supabase"

export async function debugDatabase() {
  const supabase = createServerClient()

  try {
    console.log("🔍 Debugging database structure...")

    // Check if we can connect
    const { data: connection, error: connectionError } = await supabase
      .from("analytics_events")
      .select("count")
      .limit(1)

    if (connectionError) {
      console.error("❌ Connection error:", connectionError.message)
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

    return { success: true, message: "Database is working correctly" }
  } catch (error) {
    console.error("❌ Debug error:", error)
    return { success: false, error: error.message }
  }
}
