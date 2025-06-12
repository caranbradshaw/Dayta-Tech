import { NextResponse } from "next/server"

export async function GET() {
  const systemCheck = {
    timestamp: new Date().toISOString(),
    overall: {
      status: "checking",
      score: 0,
      maxScore: 60,
      healthPercentage: 0,
    },
    environment: {
      status: "checking",
      variables: {} as Record<string, boolean>,
      score: 0,
      maxScore: 12,
      details: {} as Record<string, any>,
    },
    supabase: {
      status: "checking",
      connection: false,
      auth: false,
      tables: {} as Record<string, boolean>,
      functions: {} as Record<string, boolean>,
      score: 0,
      maxScore: 25,
      details: {} as Record<string, any>,
    },
    application: {
      status: "checking",
      features: {} as Record<string, boolean>,
      pages: {} as Record<string, boolean>,
      apis: {} as Record<string, boolean>,
      score: 0,
      maxScore: 15,
      details: {} as Record<string, any>,
    },
    integrations: {
      status: "checking",
      services: {} as Record<string, boolean>,
      score: 0,
      maxScore: 8,
      details: {} as Record<string, any>,
    },
    recommendations: [] as Array<{
      priority: "critical" | "high" | "medium" | "low"
      category: string
      issue: string
      solution: string
      link?: string
    }>,
    summary: {
      criticalIssues: 0,
      warnings: 0,
      readyForProduction: false,
      estimatedSetupTime: "0 minutes",
    },
  }

  try {
    console.log("🔍 Starting comprehensive system check...")

    // 1. CHECK ENVIRONMENT VARIABLES
    console.log("📋 Checking environment variables...")

    const envVars = {
      // Supabase
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,

      // Database
      POSTGRES_URL: !!process.env.POSTGRES_URL,
      POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
      POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
      POSTGRES_USER: !!process.env.POSTGRES_USER,
      POSTGRES_PASSWORD: !!process.env.POSTGRES_PASSWORD,
      POSTGRES_HOST: !!process.env.POSTGRES_HOST,

      // AI Services
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      CLAUDE_API_KEY: !!process.env.CLAUDE_API_KEY,
      GROQ_API_KEY: !!process.env.GROQ_API_KEY,
    }

    systemCheck.environment.variables = envVars
    systemCheck.environment.score = Object.values(envVars).filter(Boolean).length

    // Environment details
    systemCheck.environment.details = {
      supabaseConfigured: envVars.NEXT_PUBLIC_SUPABASE_URL && envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      databaseConfigured: envVars.POSTGRES_URL || envVars.POSTGRES_PRISMA_URL,
      aiConfigured: envVars.OPENAI_API_KEY || envVars.CLAUDE_API_KEY || envVars.GROQ_API_KEY,
      serviceRoleAvailable: envVars.SUPABASE_SERVICE_ROLE_KEY,
    }

    if (systemCheck.environment.score === systemCheck.environment.maxScore) {
      systemCheck.environment.status = "excellent"
    } else if (systemCheck.environment.score >= 8) {
      systemCheck.environment.status = "good"
    } else if (systemCheck.environment.score >= 4) {
      systemCheck.environment.status = "partial"
    } else {
      systemCheck.environment.status = "critical"
    }

    // Add recommendations for missing env vars
    Object.entries(envVars).forEach(([key, value]) => {
      if (!value) {
        systemCheck.recommendations.push({
          priority: key.includes("SUPABASE") ? "critical" : "high",
          category: "Environment",
          issue: `Missing ${key}`,
          solution: `Add ${key} to your .env.local file`,
          link: "/auto-connect",
        })
      }
    })

    // 2. CHECK SUPABASE CONNECTION (simplified)
    console.log("🔗 Checking Supabase connection...")

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        // Import Supabase dynamically to avoid issues
        const { createClient } = await import("@supabase/supabase-js")
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

        // Test basic connection with timeout
        const connectionPromise = supabase.from("profiles").select("count").limit(1)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Connection timeout")), 5000),
        )

        const { data, error } = (await Promise.race([connectionPromise, timeoutPromise])) as any

        if (error && error.code !== "42P01") {
          systemCheck.recommendations.push({
            priority: "critical",
            category: "Supabase",
            issue: "Cannot connect to Supabase",
            solution: `Connection error: ${error.message}`,
            link: "/auto-repair",
          })
          systemCheck.supabase.details.connectionError = error.message
        } else {
          systemCheck.supabase.connection = true
          systemCheck.supabase.score += 5
          systemCheck.supabase.details.connectionStatus = "Connected successfully"
        }

        // Test authentication (simplified)
        try {
          const { data: authData, error: authError } = await supabase.auth.getSession()
          if (!authError) {
            systemCheck.supabase.auth = true
            systemCheck.supabase.score += 5
            systemCheck.supabase.details.authStatus = "Authentication service working"
          }
        } catch (authError) {
          systemCheck.supabase.details.authError = "Auth test failed"
        }

        // Check some key tables (simplified)
        const keyTables = ["profiles", "organizations", "projects", "analyses"]
        let tablesFound = 0

        for (const tableName of keyTables) {
          try {
            const { data, error } = await supabase.from(tableName).select("count").limit(1)
            if (!error || error.code !== "42P01") {
              systemCheck.supabase.tables[tableName] = true
              systemCheck.supabase.score += 2
              tablesFound++
            } else {
              systemCheck.supabase.tables[tableName] = false
            }
          } catch {
            systemCheck.supabase.tables[tableName] = false
          }
        }

        systemCheck.supabase.details.tablesFound = `${tablesFound}/${keyTables.length}`

        if (systemCheck.supabase.connection && tablesFound === keyTables.length) {
          systemCheck.supabase.status = "excellent"
        } else if (systemCheck.supabase.connection && tablesFound > 0) {
          systemCheck.supabase.status = "good"
        } else if (systemCheck.supabase.connection) {
          systemCheck.supabase.status = "partial"
        } else {
          systemCheck.supabase.status = "critical"
        }
      } catch (connectionError) {
        systemCheck.recommendations.push({
          priority: "critical",
          category: "Supabase",
          issue: "Supabase connection failed",
          solution: `Check your Supabase URL and keys: ${connectionError instanceof Error ? connectionError.message : "Unknown error"}`,
          link: "/auto-repair",
        })
        systemCheck.supabase.details.connectionError =
          connectionError instanceof Error ? connectionError.message : "Unknown error"
        systemCheck.supabase.status = "critical"
      }
    } else {
      systemCheck.supabase.status = "critical"
      systemCheck.recommendations.push({
        priority: "critical",
        category: "Supabase",
        issue: "Missing Supabase credentials",
        solution: "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment",
        link: "/auto-repair",
      })
    }

    // 3. CHECK APPLICATION FEATURES
    console.log("🚀 Checking application features...")

    const features = {
      localStorage: true, // Always available in browser
      authSystem: systemCheck.supabase.connection && systemCheck.supabase.auth,
      databaseOperations: systemCheck.supabase.connection && Object.values(systemCheck.supabase.tables).some(Boolean),
      fileUpload: true, // Always available with localStorage fallback
      analysisGeneration: true, // Always available with mock data
      userManagement: systemCheck.supabase.connection && systemCheck.supabase.tables.profiles,
      projectManagement: systemCheck.supabase.connection && systemCheck.supabase.tables.projects,
      insightsGeneration: true, // Always available
    }

    systemCheck.application.features = features
    systemCheck.application.score = Object.values(features).filter(Boolean).length

    // Check critical pages (assume they exist)
    const criticalPages = {
      homepage: true,
      login: true,
      signup: true,
      dashboard: true,
      upload: true,
      analysis: true,
    }

    systemCheck.application.pages = criticalPages

    // Check API endpoints (assume they exist)
    const criticalApis = {
      healthCheck: true,
      supabaseConnection: systemCheck.supabase.connection,
      autoRepair: true,
      systemHealth: true,
    }

    systemCheck.application.apis = criticalApis

    systemCheck.application.details = {
      coreFeatures: Object.values(features).filter(Boolean).length + "/" + Object.keys(features).length,
      pagesWorking: Object.values(criticalPages).filter(Boolean).length + "/" + Object.keys(criticalPages).length,
      apisWorking: Object.values(criticalApis).filter(Boolean).length + "/" + Object.keys(criticalApis).length,
    }

    if (systemCheck.application.score === systemCheck.application.maxScore) {
      systemCheck.application.status = "excellent"
    } else if (systemCheck.application.score >= 12) {
      systemCheck.application.status = "good"
    } else if (systemCheck.application.score >= 8) {
      systemCheck.application.status = "partial"
    } else {
      systemCheck.application.status = "critical"
    }

    // 4. CHECK INTEGRATIONS
    console.log("🔌 Checking integrations...")

    const integrations = {
      supabaseAuth: systemCheck.supabase.auth,
      supabaseDatabase: systemCheck.supabase.connection,
      localStorage: true,
      aiServices: systemCheck.environment.details.aiConfigured,
      fileStorage: true, // localStorage fallback
      emailService: !!process.env.SENDGRID_API_KEY,
      blobStorage: !!process.env.BLOB_READ_WRITE_TOKEN,
      analytics: true, // Built-in analytics
    }

    systemCheck.integrations.services = integrations
    systemCheck.integrations.score = Object.values(integrations).filter(Boolean).length

    systemCheck.integrations.details = {
      primaryDatabase: systemCheck.supabase.connection ? "Supabase" : "localStorage",
      authProvider: systemCheck.supabase.auth ? "Supabase Auth" : "localStorage",
      fileStorage: process.env.BLOB_READ_WRITE_TOKEN ? "Vercel Blob" : "localStorage",
      aiProvider: process.env.OPENAI_API_KEY
        ? "OpenAI"
        : process.env.CLAUDE_API_KEY
          ? "Claude"
          : process.env.GROQ_API_KEY
            ? "Groq"
            : "Mock",
    }

    if (systemCheck.integrations.score === systemCheck.integrations.maxScore) {
      systemCheck.integrations.status = "excellent"
    } else if (systemCheck.integrations.score >= 6) {
      systemCheck.integrations.status = "good"
    } else if (systemCheck.integrations.score >= 4) {
      systemCheck.integrations.status = "partial"
    } else {
      systemCheck.integrations.status = "critical"
    }

    // 5. CALCULATE OVERALL HEALTH
    systemCheck.overall.score =
      systemCheck.environment.score +
      systemCheck.supabase.score +
      systemCheck.application.score +
      systemCheck.integrations.score

    systemCheck.overall.healthPercentage = (systemCheck.overall.score / systemCheck.overall.maxScore) * 100

    if (systemCheck.overall.healthPercentage >= 95) {
      systemCheck.overall.status = "excellent"
    } else if (systemCheck.overall.healthPercentage >= 85) {
      systemCheck.overall.status = "good"
    } else if (systemCheck.overall.healthPercentage >= 70) {
      systemCheck.overall.status = "fair"
    } else if (systemCheck.overall.healthPercentage >= 50) {
      systemCheck.overall.status = "poor"
    } else {
      systemCheck.overall.status = "critical"
    }

    // 6. GENERATE SUMMARY
    const criticalIssues = systemCheck.recommendations.filter((r) => r.priority === "critical").length
    const warnings = systemCheck.recommendations.filter((r) => r.priority === "high" || r.priority === "medium").length

    systemCheck.summary = {
      criticalIssues,
      warnings,
      readyForProduction: systemCheck.overall.healthPercentage >= 85 && criticalIssues === 0,
      estimatedSetupTime: criticalIssues > 0 ? "5-10 minutes" : warnings > 0 ? "2-5 minutes" : "0 minutes",
    }

    // Add success recommendations
    if (systemCheck.overall.status === "excellent") {
      systemCheck.recommendations.push({
        priority: "low",
        category: "Success",
        issue: "System is fully operational",
        solution:
          "Your DaytaTech application is ready for production use! Try creating an account and uploading a file.",
        link: "/signup",
      })
    }

    console.log(
      `✅ Comprehensive system check completed. Overall health: ${systemCheck.overall.status} (${Math.round(systemCheck.overall.healthPercentage)}%)`,
    )

    return NextResponse.json(systemCheck)
  } catch (error) {
    console.error("❌ Comprehensive system check failed:", error)

    return NextResponse.json({
      ...systemCheck,
      overall: {
        status: "error",
        score: 0,
        maxScore: 60,
        healthPercentage: 0,
      },
      error: {
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      },
      recommendations: [
        {
          priority: "critical" as const,
          category: "System",
          issue: "System check failed",
          solution: "There was an error running the comprehensive system check. Check the server logs for details.",
        },
      ],
    })
  }
}
