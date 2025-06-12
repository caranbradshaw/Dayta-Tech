import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    // Check if we have the required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required environment variables",
        },
        { status: 400 },
      )
    }

    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // SQL to create the exec_sql function
    const createFunctionSQL = `
      -- Create the exec_sql function if it doesn't exist
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS JSONB
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        result JSONB;
      BEGIN
        EXECUTE sql;
        result := '{"success": true}'::JSONB;
        RETURN result;
      EXCEPTION WHEN OTHERS THEN
        result := jsonb_build_object(
          'success', false,
          'error', SQLERRM,
          'detail', SQLSTATE
        );
        RETURN result;
      END;
      $$;

      -- Grant execute permission to authenticated users
      GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;
      GRANT EXECUTE ON FUNCTION exec_sql TO service_role;
    `

    // Execute the SQL to create the function
    try {
      // Try direct SQL execution first
      await supabase.sql(createFunctionSQL)
    } catch (directError) {
      console.error("Failed to create exec_sql function via direct SQL:", directError)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create exec_sql function",
          error: directError,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "exec_sql function created successfully",
    })
  } catch (error) {
    console.error("Error creating exec_sql function:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        error,
      },
      { status: 500 },
    )
  }
}
