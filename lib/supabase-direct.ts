import { createClient } from "@supabase/supabase-js"

// Create a direct connection to Supabase using service role key
export function getAdminSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || ""
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase admin credentials")
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

// Execute raw SQL directly (for admin operations)
export async function executeRawSQL(sql: string) {
  try {
    const supabase = getAdminSupabase()

    // Try using PostgreSQL function if available
    const { data, error: rpcError } = await supabase.rpc("execute_sql", { sql_query: sql })

    if (rpcError) {
      console.error("RPC error:", rpcError)

      // Fallback to REST API for SQL execution
      const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
          "X-Client-Info": "supabase-js/2.0.0",
        },
        body: JSON.stringify({ query: sql }),
      })

      if (!response.ok) {
        throw new Error(`SQL execution failed: ${await response.text()}`)
      }

      return await response.json()
    }

    return data
  } catch (error) {
    console.error("SQL execution error:", error)
    throw error
  }
}

// Create a simple analytics table
export async function createSimpleAnalyticsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS simple_analytics (
      id SERIAL PRIMARY KEY,
      event_name TEXT NOT NULL,
      user_id TEXT,
      properties JSONB DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Create a simple index
    CREATE INDEX IF NOT EXISTS idx_simple_analytics_event_name ON simple_analytics(event_name);
    
    -- Insert test data
    INSERT INTO simple_analytics (event_name, user_id, properties)
    VALUES ('page_view', 'test-user', '{"page": "/dashboard"}');
    
    -- Return success message
    SELECT 'Simple analytics table created' as result;
  `

  return executeRawSQL(sql)
}
