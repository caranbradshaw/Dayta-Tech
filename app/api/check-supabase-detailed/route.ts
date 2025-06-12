import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const postgresUrl = process.env.POSTGRES_URL

    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!supabaseAnonKey,
      SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceKey,
      POSTGRES_URL: !!postgresUrl,
    }

    // If no Supabase credentials, return early
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        message: "Missing Supabase credentials",
        envStatus,
        connectionTest: {
          success: false,
          message: "Cannot test connection without credentials",
        },
        tableStatus: {},
      })
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Test basic connection
    let connectionTest = {
      success: false,
      message: "Connection test failed",
      details: null as any,
    }

    try {
      const { data, error } = await supabase.from("profiles").select("count").limit(1)

      if (error) {
        if (error.code === "42P01") {
          // Table doesn't exist but connection works
          connectionTest = {
            success: true,
            message: "Connected to Supabase, but tables need to be created",
            details: { error: error.message, code: error.code },
          }
        } else {
          connectionTest = {
            success: false,
            message: `Connection error: ${error.message}`,
            details: error,
          }
        }
      } else {
        connectionTest = {
          success: true,
          message: "Successfully connected to Supabase",
          details: data,
        }
      }
    } catch (connectionError) {
      connectionTest = {
        success: false,
        message: `Connection failed: ${connectionError instanceof Error ? connectionError.message : "Unknown error"}`,
        details: connectionError,
      }
    }

    // Test individual tables
    const tablesToCheck = [
      "profiles",
      "organizations",
      "organization_members",
      "projects",
      "analyses",
      "insights",
      "subscriptions",
      "user_activities",
      "account_changes",
      "file_activities",
      "file_uploads",
      "custom_fields",
    ]

    const tableStatus: Record<string, any> = {}

    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase.from(tableName).select("count").limit(1)

        if (error) {
          if (error.code === "42P01") {
            tableStatus[tableName] = {
              exists: false,
              message: "Table does not exist",
              error: error.message,
            }
          } else {
            tableStatus[tableName] = {
              exists: false,
              message: `Error checking table: ${error.message}`,
              error: error.message,
            }
          }
        } else {
          tableStatus[tableName] = {
            exists: true,
            message: "Table exists and accessible",
            data: data,
          }
        }
      } catch (tableError) {
        tableStatus[tableName] = {
          exists: false,
          message: `Error checking table: ${tableError instanceof Error ? tableError.message : "Unknown error"}`,
          error: tableError,
        }
      }
    }

    // Check authentication
    let authStatus = {
      configured: false,
      message: "Auth status unknown",
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.getSession()
      authStatus = {
        configured: true,
        message: "Auth is configured and accessible",
      }
    } catch (authError) {
      authStatus = {
        configured: false,
        message: `Auth error: ${authError instanceof Error ? authError.message : "Unknown error"}`,
      }
    }

    // Summary
    const tablesExist = Object.values(tableStatus).filter((status: any) => status.exists).length
    const totalTables = tablesToCheck.length

    const summary = {
      environmentVariables: Object.values(envStatus).filter(Boolean).length + "/" + Object.keys(envStatus).length,
      connection: connectionTest.success,
      tablesSetup: `${tablesExist}/${totalTables}`,
      authConfigured: authStatus.configured,
      readyForUse: connectionTest.success && tablesExist > 0,
    }

    return NextResponse.json({
      success: connectionTest.success,
      message: connectionTest.success
        ? `Supabase check complete. ${tablesExist}/${totalTables} tables found.`
        : "Supabase connection issues detected",
      summary,
      envStatus,
      connectionTest,
      tableStatus,
      authStatus,
      recommendations: getRecommendations(summary, connectionTest, tableStatus),
    })
  } catch (error) {
    console.error("Error in detailed Supabase check:", error)
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

function getRecommendations(summary: any, connectionTest: any, tableStatus: any) {
  const recommendations = []

  if (!connectionTest.success) {
    recommendations.push({
      priority: "high",
      action: "Fix Supabase connection",
      description: "Check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
      link: "/auto-connect",
    })
  }

  const missingTables = Object.entries(tableStatus)
    .filter(([_, status]: [string, any]) => !status.exists)
    .map(([name, _]) => name)

  if (missingTables.length > 0) {
    recommendations.push({
      priority: "high",
      action: "Create missing tables",
      description: `Missing tables: ${missingTables.join(", ")}`,
      link: "/supabase-setup",
    })
  }

  if (summary.readyForUse) {
    recommendations.push({
      priority: "low",
      action: "Test the application",
      description: "Your Supabase setup looks good! Try creating an account and uploading a file.",
      link: "/signup",
    })
  }

  return recommendations
}
