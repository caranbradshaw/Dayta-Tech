import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function testSupabaseConnection() {
  console.log("🔍 Testing Supabase connection...")

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test 1: Basic connection
    console.log("Test 1: Basic connection")
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    if (error) {
      console.log("❌ Profiles table error:", error.message)
    } else {
      console.log("✅ Profiles table accessible")
    }

    // Test 2: Raw SQL execution
    console.log("Test 2: Raw SQL execution")
    const { data: sqlData, error: sqlError } = await supabase.rpc("sql", {
      query: "SELECT 1 as test",
    })

    if (sqlError) {
      console.log("❌ SQL execution error:", sqlError.message)
    } else {
      console.log("✅ SQL execution works")
    }

    // Test 3: Check extensions
    console.log("Test 3: Check extensions")
    const { data: extensions, error: extError } = await supabase.rpc("sql", {
      query: "SELECT extname FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto')",
    })

    if (extError) {
      console.log("❌ Extensions check error:", extError.message)
    } else {
      console.log("✅ Extensions:", extensions)
    }

    return { success: true }
  } catch (error) {
    console.error("❌ Connection test failed:", error)
    return { success: false, error: error.message }
  }
}
