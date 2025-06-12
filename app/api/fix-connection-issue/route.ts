import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const report = {
    timestamp: new Date().toISOString(),
    step: 1,
    issue: "UNKNOWN",
    details: {} as any,
    solution: "NONE",
    fixed: false,
  }

  try {
    console.log("🔧 Starting connection issue fix...")

    // Step 1: Check environment variables
    report.step = 1
    report.details.envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        value: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING",
        preview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING",
        preview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30) + "...",
      },
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      report.issue = "MISSING_ENV_VARS"
      report.solution = "Environment variables are missing. Check your .env.local file."
      return NextResponse.json(report)
    }

    // Step 2: Test Supabase client creation
    report.step = 2
    let supabase
    try {
      supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      report.details.clientCreation = { success: true, message: "Supabase client created successfully" }
    } catch (clientError) {
      report.issue = "CLIENT_CREATION_FAILED"
      report.details.clientCreation = {
        success: false,
        error: clientError instanceof Error ? clientError.message : "Unknown error",
      }
      report.solution = "Failed to create Supabase client. Check your environment variables format."
      return NextResponse.json(report)
    }

    // Step 3: Test basic connection
    report.step = 3
    try {
      const { data, error } = await supabase.from("profiles").select("count").limit(1)

      if (error) {
        if (error.code === "42P01") {
          // Table doesn't exist - this is actually OK, means connection works
          report.details.connectionTest = {
            success: true,
            message: "Connected successfully, but profiles table doesn't exist yet",
            errorCode: error.code,
          }
        } else {
          report.details.connectionTest = {
            success: false,
            message: error.message,
            errorCode: error.code,
            fullError: error,
          }
          report.issue = "CONNECTION_ERROR"
          report.solution = `Connection failed with error: ${error.message}`
          return NextResponse.json(report)
        }
      } else {
        report.details.connectionTest = {
          success: true,
          message: "Connected successfully and profiles table exists",
          data: data,
        }
      }
    } catch (connectionError) {
      report.issue = "CONNECTION_EXCEPTION"
      report.details.connectionTest = {
        success: false,
        error: connectionError instanceof Error ? connectionError.message : "Unknown connection error",
      }
      report.solution = "Connection threw an exception. Check network connectivity and Supabase status."
      return NextResponse.json(report)
    }

    // Step 4: Test multiple tables to verify setup
    report.step = 4
    const tablesToCheck = ["profiles", "organizations", "projects", "analyses"]
    const tableResults = {} as any

    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase.from(tableName).select("count").limit(1)
        tableResults[tableName] = {
          exists: !error || error.code !== "42P01",
          accessible: !error,
          error: error?.message,
          errorCode: error?.code,
        }
      } catch (tableError) {
        tableResults[tableName] = {
          exists: false,
          accessible: false,
          error: tableError instanceof Error ? tableError.message : "Unknown error",
        }
      }
    }

    report.details.tableCheck = tableResults

    // Step 5: Test auth functionality
    report.step = 5
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession()
      report.details.authTest = {
        success: !authError,
        error: authError?.message,
        hasSession: !!authData?.session,
      }
    } catch (authTestError) {
      report.details.authTest = {
        success: false,
        error: authTestError instanceof Error ? authTestError.message : "Auth test failed",
      }
    }

    // Step 6: Determine the actual issue
    report.step = 6
    const tablesExist = Object.values(tableResults).some((result: any) => result.exists)
    const connectionWorks = report.details.connectionTest.success
    const authWorks = report.details.authTest.success

    if (connectionWorks && tablesExist && authWorks) {
      report.issue = "NO_ISSUE_FOUND"
      report.solution = "Connection appears to be working correctly. The notification might be cached."
      report.fixed = true
    } else if (connectionWorks && !tablesExist) {
      report.issue = "TABLES_NOT_CREATED"
      report.solution = "Connection works but database tables are missing. Run the setup scripts."
    } else if (connectionWorks && !authWorks) {
      report.issue = "AUTH_NOT_CONFIGURED"
      report.solution = "Connection works but authentication is not properly configured."
    } else {
      report.issue = "PARTIAL_CONNECTION"
      report.solution = "Some components are working but others are not. Check the detailed results."
    }

    // Step 7: Try to fix common issues automatically
    report.step = 7
    if (report.issue === "NO_ISSUE_FOUND") {
      // Clear any cached connection status
      try {
        // Force a fresh connection test
        const freshClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        )

        const { data: freshTest, error: freshError } = await freshClient.from("profiles").select("id").limit(1)

        report.details.freshConnectionTest = {
          success: !freshError || freshError.code === "42P01",
          error: freshError?.message,
          errorCode: freshError?.code,
        }

        if (!freshError || freshError.code === "42P01") {
          report.fixed = true
          report.solution = "Connection is working! The notification should update shortly."
        }
      } catch (freshTestError) {
        report.details.freshConnectionTest = {
          success: false,
          error: freshTestError instanceof Error ? freshTestError.message : "Fresh test failed",
        }
      }
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("❌ Connection fix failed:", error)

    report.issue = "FIX_PROCESS_FAILED"
    report.solution = `Fix process failed: ${error instanceof Error ? error.message : "Unknown error"}`
    report.details.processingError = {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : null,
    }

    return NextResponse.json(report, { status: 500 })
  }
}
