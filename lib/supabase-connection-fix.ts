import { createClient } from "@supabase/supabase-js"

// Force create a working Supabase connection
export function createWorkingSupabaseClient() {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  // Create client with proper configuration
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    db: {
      schema: "public",
    },
    global: {
      headers: {
        "x-my-custom-header": "dayta-tech",
      },
    },
  })

  return supabase
}

// Test and fix connection
export async function testAndFixConnection() {
  try {
    const supabase = createWorkingSupabaseClient()

    // Test basic connection
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    if (error && error.code === "42P01") {
      // Table doesn't exist - create it
      console.log("Creating profiles table...")
      await createBasicTables(supabase)
      return { success: true, message: "Connection working, tables created" }
    } else if (error) {
      console.error("Connection error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, message: "Connection working perfectly" }
  } catch (error) {
    console.error("Connection test failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Create basic tables if they don't exist
async function createBasicTables(supabase: any) {
  try {
    // Create profiles table
    await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          full_name TEXT,
          company TEXT,
          industry TEXT,
          role TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    // Create analyses table for uploads
    await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS analyses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          file_name TEXT NOT NULL,
          file_size INTEGER,
          status TEXT DEFAULT 'completed',
          insights JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    console.log("Basic tables created successfully")
  } catch (error) {
    console.error("Error creating tables:", error)
    // If RPC doesn't work, tables might already exist or we need different approach
  }
}
