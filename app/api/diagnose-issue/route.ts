import { NextResponse } from "next/server"

export async function GET() {
  const diagnosis = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      nextjsVersion: "14.x", // Assuming based on project structure
    },
    environmentVariables: {} as Record<string, any>,
    supabaseTest: {
      canImport: false,
      canConnect: false,
      error: null as any,
      connectionDetails: null as any,
    },
    databaseTest: {
      tablesExist: {} as Record<string, boolean>,
      permissions: {} as Record<string, any>,
      errors: [] as string[],
    },
    actualError: null as any,
    recommendations: [] as string[],
  }

  try {
    console.log("🔍 Starting real issue diagnosis...")

    // 1. Check actual environment variables (safely)
    console.log("📋 Checking environment variables...")
    diagnosis.environmentVariables = {
      NEXT_PUBLIC_SUPABASE_URL: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        value: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING",
        length: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
        format: process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("https://") ? "VALID_HTTPS" : "INVALID_FORMAT",
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING",
        length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        format: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith("eyJ") ? "VALID_JWT" : "INVALID_FORMAT",
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        value: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING",
        length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
        format: process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith("eyJ") ? "VALID_JWT" : "INVALID_FORMAT",
      },
      POSTGRES_URL: {
        exists: !!process.env.POSTGRES_URL,
        value: process.env.POSTGRES_URL ? "SET" : "MISSING",
        format: process.env.POSTGRES_URL?.startsWith("postgres://") ? "VALID_POSTGRES" : "INVALID_FORMAT",
      },
    }

    // 2. Test Supabase import and initialization
    console.log("📦 Testing Supabase import...")
    try {
      const { createClient } = await import("@supabase/supabase-js")
      diagnosis.supabaseTest.canImport = true

      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.log("🔗 Testing Supabase connection...")

        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

        // Test with timeout
        const connectionPromise = supabase.from("profiles").select("count").limit(1)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Connection timeout after 10 seconds")), 10000),
        )

        try {
          const result = (await Promise.race([connectionPromise, timeoutPromise])) as any
          diagnosis.supabaseTest.canConnect = true
          diagnosis.supabaseTest.connectionDetails = {
            error: result.error,
            errorCode: result.error?.code,
            errorMessage: result.error?.message,
            data: result.data,
            status: result.error ? "ERROR" : "SUCCESS",
          }

          // If we get a table doesn't exist error, that's actually good - it means connection works
          if (result.error?.code === "42P01") {
            diagnosis.supabaseTest.connectionDetails.actualStatus = "CONNECTED_BUT_NO_TABLES"
          } else if (!result.error) {
            diagnosis.supabaseTest.connectionDetails.actualStatus = "CONNECTED_WITH_TABLES"
          } else {
            diagnosis.supabaseTest.connectionDetails.actualStatus = "CONNECTION_ERROR"
          }
        } catch (connectionError) {
          diagnosis.supabaseTest.error = {
            message: connectionError instanceof Error ? connectionError.message : "Unknown connection error",
            type: connectionError instanceof Error ? connectionError.constructor.name : "Unknown",
            stack: connectionError instanceof Error ? connectionError.stack : null,
          }
        }

        // 3. Test specific database operations
        console.log("🗄️ Testing database operations...")

        // Test auth
        try {
          const { data: authData, error: authError } = await supabase.auth.getSession()
          diagnosis.databaseTest.permissions.auth = {
            canAccess: !authError,
            error: authError?.message,
          }
        } catch (authTestError) {
          diagnosis.databaseTest.permissions.auth = {
            canAccess: false,
            error: authTestError instanceof Error ? authTestError.message : "Auth test failed",
          }
        }

        // Test table access for common tables
        const tablesToTest = ["profiles", "organizations", "projects", "analyses", "insights"]

        for (const tableName of tablesToTest) {
          try {
            const { data, error } = await supabase.from(tableName).select("count").limit(1)
            diagnosis.databaseTest.tablesExist[tableName] = {
              exists: !error || error.code !== "42P01",
              accessible: !error,
              error: error?.message,
              errorCode: error?.code,
            }
          } catch (tableError) {
            diagnosis.databaseTest.tablesExist[tableName] = {
              exists: false,
              accessible: false,
              error: tableError instanceof Error ? tableError.message : "Table test failed",
              errorCode: "UNKNOWN",
            }
          }
        }

        // Test RPC function availability
        try {
          const { data, error } = await supabase.rpc("exec_sql", { sql: "SELECT 1;" })
          diagnosis.databaseTest.permissions.rpc = {
            available: !error,
            error: error?.message,
            canExecuteSQL: !error,
          }
        } catch (rpcError) {
          diagnosis.databaseTest.permissions.rpc = {
            available: false,
            error: rpcError instanceof Error ? rpcError.message : "RPC test failed",
            canExecuteSQL: false,
          }
        }

        // Test with service role if available
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
          try {
            const serviceClient = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL,
              process.env.SUPABASE_SERVICE_ROLE_KEY,
            )

            const { data, error } = await serviceClient.from("profiles").select("count").limit(1)
            diagnosis.databaseTest.permissions.serviceRole = {
              canConnect: true,
              canAccessTables: !error || error.code === "42P01",
              error: error?.message,
              errorCode: error?.code,
            }
          } catch (serviceError) {
            diagnosis.databaseTest.permissions.serviceRole = {
              canConnect: false,
              error: serviceError instanceof Error ? serviceError.message : "Service role test failed",
            }
          }
        }
      } else {
        diagnosis.supabaseTest.error = {
          message: "Missing Supabase environment variables",
          type: "CONFIGURATION_ERROR",
        }
      }
    } catch (importError) {
      diagnosis.supabaseTest.error = {
        message: importError instanceof Error ? importError.message : "Failed to import Supabase",
        type: "IMPORT_ERROR",
        stack: importError instanceof Error ? importError.stack : null,
      }
    }

    // 4. Generate specific recommendations based on findings
    console.log("💡 Generating recommendations...")

    if (!diagnosis.supabaseTest.canImport) {
      diagnosis.recommendations.push("CRITICAL: Cannot import @supabase/supabase-js - check package installation")
    }

    if (!diagnosis.environmentVariables.NEXT_PUBLIC_SUPABASE_URL.exists) {
      diagnosis.recommendations.push("CRITICAL: NEXT_PUBLIC_SUPABASE_URL is missing")
    } else if (diagnosis.environmentVariables.NEXT_PUBLIC_SUPABASE_URL.format !== "VALID_HTTPS") {
      diagnosis.recommendations.push("ERROR: NEXT_PUBLIC_SUPABASE_URL format is invalid - should start with https://")
    }

    if (!diagnosis.environmentVariables.NEXT_PUBLIC_SUPABASE_ANON_KEY.exists) {
      diagnosis.recommendations.push("CRITICAL: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing")
    } else if (diagnosis.environmentVariables.NEXT_PUBLIC_SUPABASE_ANON_KEY.format !== "VALID_JWT") {
      diagnosis.recommendations.push(
        "ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY format is invalid - should be a JWT token starting with eyJ",
      )
    }

    if (diagnosis.supabaseTest.canConnect) {
      const connectionStatus = diagnosis.supabaseTest.connectionDetails?.actualStatus

      if (connectionStatus === "CONNECTED_BUT_NO_TABLES") {
        diagnosis.recommendations.push(
          "SUCCESS: Connected to Supabase but tables don't exist - run setup to create them",
        )
      } else if (connectionStatus === "CONNECTED_WITH_TABLES") {
        diagnosis.recommendations.push("SUCCESS: Fully connected to Supabase with existing tables")
      } else if (connectionStatus === "CONNECTION_ERROR") {
        diagnosis.recommendations.push(
          `ERROR: Connected to Supabase but got error: ${diagnosis.supabaseTest.connectionDetails?.errorMessage}`,
        )
      }
    } else if (diagnosis.supabaseTest.error) {
      diagnosis.recommendations.push(`CRITICAL: Cannot connect to Supabase - ${diagnosis.supabaseTest.error.message}`)
    }

    if (!diagnosis.databaseTest.permissions.rpc?.available) {
      diagnosis.recommendations.push("WARNING: RPC functions not available - may need service role key for setup")
    }

    if (!diagnosis.environmentVariables.SUPABASE_SERVICE_ROLE_KEY.exists) {
      diagnosis.recommendations.push(
        "WARNING: SUPABASE_SERVICE_ROLE_KEY missing - needed for table creation and RLS setup",
      )
    }

    // 5. Determine the actual root issue
    if (!diagnosis.supabaseTest.canImport) {
      diagnosis.actualError = "PACKAGE_MISSING: @supabase/supabase-js package is not properly installed"
    } else if (
      !diagnosis.environmentVariables.NEXT_PUBLIC_SUPABASE_URL.exists ||
      !diagnosis.environmentVariables.NEXT_PUBLIC_SUPABASE_ANON_KEY.exists
    ) {
      diagnosis.actualError = "MISSING_CREDENTIALS: Required Supabase environment variables are not set"
    } else if (
      diagnosis.environmentVariables.NEXT_PUBLIC_SUPABASE_URL.format !== "VALID_HTTPS" ||
      diagnosis.environmentVariables.NEXT_PUBLIC_SUPABASE_ANON_KEY.format !== "VALID_JWT"
    ) {
      diagnosis.actualError = "INVALID_CREDENTIALS: Supabase environment variables are malformed"
    } else if (!diagnosis.supabaseTest.canConnect) {
      diagnosis.actualError = `CONNECTION_FAILED: ${diagnosis.supabaseTest.error?.message || "Cannot connect to Supabase"}`
    } else if (diagnosis.supabaseTest.connectionDetails?.actualStatus === "CONNECTION_ERROR") {
      diagnosis.actualError = `DATABASE_ERROR: ${diagnosis.supabaseTest.connectionDetails?.errorMessage}`
    } else if (diagnosis.supabaseTest.connectionDetails?.actualStatus === "CONNECTED_BUT_NO_TABLES") {
      diagnosis.actualError = "TABLES_MISSING: Connected successfully but database tables don't exist"
    } else {
      diagnosis.actualError = "NO_MAJOR_ISSUES: System appears to be working correctly"
    }

    console.log(`🎯 Root issue identified: ${diagnosis.actualError}`)

    return NextResponse.json(diagnosis)
  } catch (error) {
    console.error("❌ Diagnosis failed:", error)

    diagnosis.actualError = `DIAGNOSIS_FAILED: ${error instanceof Error ? error.message : "Unknown error during diagnosis"}`
    diagnosis.recommendations.push("CRITICAL: Unable to complete diagnosis - check server logs")

    return NextResponse.json(diagnosis, { status: 500 })
  }
}
