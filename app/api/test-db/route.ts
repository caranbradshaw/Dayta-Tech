import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Test 1: Simple query
    console.log("Testing simple query...")
    const { data: test1, error: error1 } = await supabase.from("profiles").select("id").limit(1)

    if (error1) {
      return NextResponse.json({
        success: false,
        error: "Profiles query failed",
        details: error1.message,
      })
    }

    // Test 2: Try to create a simple table
    console.log("Testing table creation...")
    const { data: test2, error: error2 } = await supabase.rpc("sql", {
      query: `
        CREATE TABLE IF NOT EXISTS test_analytics (
          id SERIAL PRIMARY KEY,
          name TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
        INSERT INTO test_analytics (name) VALUES ('test');
        SELECT * FROM test_analytics;
        DROP TABLE test_analytics;
      `,
    })

    if (error2) {
      return NextResponse.json({
        success: false,
        error: "Table creation failed",
        details: error2.message,
      })
    }

    return NextResponse.json({
      success: true,
      message: "All tests passed",
      test1: test1,
      test2: test2,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "API error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
