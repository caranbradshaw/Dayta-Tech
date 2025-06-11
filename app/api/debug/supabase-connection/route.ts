import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Get Supabase credentials
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Check if credentials are available
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: "Missing Supabase credentials",
        details: {
          supabaseUrl: !!supabaseUrl,
          supabaseKey: !!supabaseKey,
        },
      })
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test connection with a simple query
    const { data, error } = await supabase.from("test_table").select("*").limit(1).maybeSingle()

    if (error) {
      // If the error is about the table not existing, try to create it
      if (error.message.includes("does not exist")) {
        // Try to create a test table
        const { error: createError } = await supabase.rpc("execute_sql", {
          sql_query: `
            CREATE TABLE IF NOT EXISTS test_table (
              id SERIAL PRIMARY KEY,
              name TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            INSERT INTO test_table (name) VALUES ('Test connection');
          `,
        })

        if (createError) {
          return NextResponse.json({
            error: "Failed to create test table",
            details: createError,
          })
        }

        // Try the query again
        const { data: retryData, error: retryError } = await supabase
          .from("test_table")
          .select("*")
          .limit(1)
          .maybeSingle()

        if (retryError) {
          return NextResponse.json({
            error: "Connection established but query failed after table creation",
            details: retryError,
          })
        }

        return NextResponse.json({
          message: "Connection successful (created test table)",
          data: retryData,
        })
      }

      return NextResponse.json({
        error: "Connection established but query failed",
        details: error,
      })
    }

    return NextResponse.json({
      message: "Connection successful",
      data,
    })
  } catch (err) {
    return NextResponse.json({
      error: "Failed to connect to Supabase",
      details: err instanceof Error ? err.message : String(err),
    })
  }
}
