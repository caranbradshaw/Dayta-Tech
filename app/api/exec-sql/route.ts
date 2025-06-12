import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    // Check if we have the required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required environment variables for SQL execution",
        },
        { status: 400 },
      )
    }

    // Get the SQL from the request body
    const body = await request.json()
    const { sql } = body

    if (!sql) {
      return NextResponse.json(
        {
          success: false,
          message: "No SQL provided",
        },
        { status: 400 },
      )
    }

    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Execute the SQL
    let result
    try {
      // Try direct SQL execution first
      result = await supabase.sql(sql)
    } catch (directError) {
      // If direct SQL fails, try using the exec_sql RPC function
      try {
        const { data, error } = await supabase.rpc("exec_sql", { sql })

        if (error) {
          return NextResponse.json(
            {
              success: false,
              message: `Failed to execute SQL via RPC: ${error.message}`,
              error,
            },
            { status: 500 },
          )
        }

        result = { data }
      } catch (rpcError) {
        return NextResponse.json(
          {
            success: false,
            message: "Failed to execute SQL via both direct and RPC methods",
            errors: {
              directError,
              rpcError,
            },
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: "SQL executed successfully",
      result,
    })
  } catch (error) {
    console.error("Error executing SQL:", error)
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
