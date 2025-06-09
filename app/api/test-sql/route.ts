import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Create Supabase client
    const supabaseUrl = process.env.SUPABASE_URL || ""
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          error: "Missing Supabase credentials",
          details: {
            hasUrl: !!process.env.SUPABASE_URL,
            hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
          },
        },
        { status: 500 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test 1: Simple query
    const { data: timeData, error: timeError } = await supabase.from("_test_results").select("*").limit(1)

    if (timeError) {
      // If table doesn't exist, try to create it
      const { error: createError } = await supabase.rpc("create_test_table")

      if (createError) {
        // Try direct SQL execution
        const { error: sqlError } = await supabase.rpc("execute_sql", {
          sql_query:
            "CREATE TABLE IF NOT EXISTS _test_results (id SERIAL PRIMARY KEY, test_name TEXT, result TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
        })

        return NextResponse.json(
          {
            error: "Database access issue",
            timeError,
            createError,
            sqlError,
            message: "Cannot create tables or execute SQL",
          },
          { status: 500 },
        )
      }
    }

    // Test 2: Insert data
    const { error: insertError } = await supabase
      .from("_test_results")
      .insert({ test_name: "api_test", result: "success" })

    return NextResponse.json({
      success: true,
      canQuery: !timeError || timeData !== null,
      canInsert: !insertError,
      message: "Database connection successful",
      timeData,
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
      },
    })
  } catch (error) {
    console.error("Error testing database:", error)
    return NextResponse.json(
      {
        error: "Database connection failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
