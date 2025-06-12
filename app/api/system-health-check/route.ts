import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    overall: {
      status: "checking",
      score: 0,
      maxScore: 0,
    },
    environment: {
      status: "checking",
      variables: {} as Record<string, boolean>,
      score: 0,
      maxScore: 8,
    },
    supabase: {
      status: "checking",
      connection: false,
      auth: false,
      tables: {} as Record<string, boolean>,
      score: 0,
      maxScore: 15,
    },
    application: {
      status: "checking",
      features: {} as Record<string, boolean>,
      score: 0,
      maxScore: 5,
    },
    recommendations: [] as Array<{
      priority: "critical" | "high" | "medium" | "low"
      category: string
      issue: string
      solution: string
      link?: string
    }>,
  }

  try {
    // 1. CHECK ENVIRONMENT VARIABLES
    console.log("🔍 Checking environment variables...")

    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      POSTGRES_URL: !!process.env.POSTGRES_URL,
      POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
      POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
      POSTGRES_USER: !!process.env.POSTGRES_USER,
      POSTGRES_PASSWORD: !!process.env.POSTGRES_PASSWORD,
    }

    healthCheck.environment.variables = envVars
    healthCheck.environment.score = Object.values(envVars).filter(Boolean).length

    if (healthCheck.environment.score === healthCheck.environment.maxScore) {
      healthCheck.environment.status = "healthy"
    } else if (healthCheck.environment.score >= 3) {
      healthCheck.environment.status = "partial"
    } else {
      healthCheck.environment.status = "critical"
    }

    // Add recommendations for missing env vars
    Object.entries(envVars).forEach(([key, value]) => {
      if (!value) {
        healthCheck.recommendations.push({
          priority: key.includes("SUPABASE") ? "critical" : "high",
          category: "Environment",
          issue: `Missing ${key}`,
          solution: `Add ${key} to your .env.local file`,
          link: "/auto-connect",
        })
      }
    })

    // 2. CHECK SUPABASE CONNECTION
    console.log("🔍 Checking Supabase connection...")

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

      // Test basic connection
      try {
        const { data, error } = await supabase.from("profiles").select("count").limit(1)

        if (error && error.code !== "42P01") {
          // Connection error (not just missing table)
          healthCheck.recommendations.push({
            priority: "critical",
            category: "Supabase",
            issue: "Cannot connect to Supabase",
            solution: `Connection error: ${error.message}`,
            link: "/supabase-status",
          })
        } else {
          healthCheck.supabase.connection = true
          healthCheck.supabase.score += 1
        }
      } catch (connectionError) {
        healthCheck.recommendations.push({
          priority: "critical",
          category: "Supabase",
          issue: "Supabase connection failed",
          solution: `Check your Supabase URL and keys: ${connectionError instanceof Error ? connectionError.message : "Unknown error"}`,
          link: "/auto-connect",
        })
      }

      // Test authentication
      try {
        const { data: authData, error: authError } = await supabase.auth.getSession()
        if (!authError) {
          healthCheck.supabase.auth = true
          healthCheck.supabase.score += 1
        } else {
          healthCheck.recommendations.push({
            priority: "high",
            category: "Supabase",
            issue: "Authentication service issue",
            solution: `Auth error: ${authError.message}`,
            link: "/supabase-setup",
          })
        }
      } catch (authError) {
        healthCheck.recommendations.push({
          priority: "high",
          category: "Supabase",
          issue: "Cannot test authentication",
          solution: `Auth test failed: ${authError instanceof Error ? authError.message : "Unknown error"}`,
        })
      }

      // Check all required tables
      const requiredTables = [
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

      console.log("🔍 Checking database tables...")

      for (const tableName of requiredTables) {
        try {
          const { data, error } = await supabase.from(tableName).select("count").limit(1)

          if (error) {
            if (error.code === "42P01") {
              // Table doesn't exist
              healthCheck.supabase.tables[tableName] = false
              healthCheck.recommendations.push({
                priority: "high",
                category: "Database",
                issue: `Missing table: ${tableName}`,
                solution: "Run the auto-setup to create missing tables",
                link: "/supabase-setup",
              })
            } else {
              // Other error
              healthCheck.supabase.tables[tableName] = false
              healthCheck.recommendations.push({
                priority: "medium",
                category: "Database",
                issue: `Table ${tableName} has issues`,
                solution: `Error: ${error.message}`,
              })
            }
          } else {
            // Table exists and accessible
            healthCheck.supabase.tables[tableName] = true
            healthCheck.supabase.score += 1
          }
        } catch (tableError) {
          healthCheck.supabase.tables[tableName] = false
          healthCheck.recommendations.push({
            priority: "medium",
            category: "Database",
            issue: `Cannot check table: ${tableName}`,
            solution: `Error: ${tableError instanceof Error ? tableError.message : "Unknown error"}`,
          })
        }
      }

      // Determine Supabase status
      const tablesWorking = Object.values(healthCheck.supabase.tables).filter(Boolean).length
      const totalTables = requiredTables.length

      if (healthCheck.supabase.connection && healthCheck.supabase.auth && tablesWorking === totalTables) {
        healthCheck.supabase.status = "healthy"
      } else if (healthCheck.supabase.connection && tablesWorking > 0) {
        healthCheck.supabase.status = "partial"
      } else {
        healthCheck.supabase.status = "critical"
      }
    } else {
      healthCheck.supabase.status = "critical"
      healthCheck.recommendations.push({
        priority: "critical",
        category: "Supabase",
        issue: "Missing Supabase credentials",
        solution: "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment",
        link: "/auto-connect",
      })
    }

    // 3. CHECK APPLICATION FEATURES
    console.log("🔍 Checking application features...")

    const features = {
      localStorage: typeof window !== "undefined" && !!window.localStorage,
      authSystem: healthCheck.supabase.connection && healthCheck.supabase.auth,
      databaseOperations: healthCheck.supabase.connection && Object.values(healthCheck.supabase.tables).some(Boolean),
      fileUpload: true, // Always available with localStorage fallback
      analysisGeneration: true, // Always available with mock data
    }

    healthCheck.application.features = features
    healthCheck.application.score = Object.values(features).filter(Boolean).length

    if (healthCheck.application.score === healthCheck.application.maxScore) {
      healthCheck.application.status = "healthy"
    } else if (healthCheck.application.score >= 3) {
      healthCheck.application.status = "partial"
    } else {
      healthCheck.application.status = "critical"
    }

    // 4. CALCULATE OVERALL HEALTH
    healthCheck.overall.maxScore =
      healthCheck.environment.maxScore + healthCheck.supabase.maxScore + healthCheck.application.maxScore
    healthCheck.overall.score =
      healthCheck.environment.score + healthCheck.supabase.score + healthCheck.application.score

    const healthPercentage = (healthCheck.overall.score / healthCheck.overall.maxScore) * 100

    if (healthPercentage >= 90) {
      healthCheck.overall.status = "excellent"
    } else if (healthPercentage >= 75) {
      healthCheck.overall.status = "good"
    } else if (healthPercentage >= 50) {
      healthCheck.overall.status = "fair"
    } else {
      healthCheck.overall.status = "poor"
    }

    // 5. ADD GENERAL RECOMMENDATIONS
    if (healthCheck.overall.status === "excellent") {
      healthCheck.recommendations.push({
        priority: "low",
        category: "Success",
        issue: "System is fully operational",
        solution: "Your DaytaTech application is ready for production use!",
        link: "/signup",
      })
    } else if (healthCheck.recommendations.length === 0) {
      healthCheck.recommendations.push({
        priority: "medium",
        category: "General",
        issue: "System needs attention",
        solution: "Some components may need configuration or troubleshooting",
        link: "/supabase-status",
      })
    }

    console.log(
      `✅ System health check completed. Overall status: ${healthCheck.overall.status} (${healthCheck.overall.score}/${healthCheck.overall.maxScore})`,
    )

    return NextResponse.json(healthCheck)
  } catch (error) {
    console.error("❌ System health check failed:", error)

    return NextResponse.json({
      ...healthCheck,
      overall: {
        status: "error",
        score: 0,
        maxScore: 0,
      },
      error: {
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      },
      recommendations: [
        {
          priority: "critical" as const,
          category: "System",
          issue: "Health check failed",
          solution: "There was an error running the system health check. Check the server logs for details.",
        },
      ],
    })
  }
}
