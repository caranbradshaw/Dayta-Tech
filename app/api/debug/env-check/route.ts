import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check environment variables safely on server side
    const envVars = {
      // Public variables (safe to check)
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

      // Server-only variables
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
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
      DEEPINFRA_API_KEY: !!process.env.DEEPINFRA_API_KEY,

      // Storage
      BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,

      // Email
      SENDGRID_API_KEY: !!process.env.SENDGRID_API_KEY,
      FROM_EMAIL: !!process.env.FROM_EMAIL,

      // Redis/KV
      KV_URL: !!process.env.KV_URL,
      KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
      KV_REST_API_URL: !!process.env.KV_REST_API_URL,
      REDIS_URL: !!process.env.REDIS_URL,

      // FAL
      FAL_KEY: !!process.env.FAL_KEY,
    }

    // Calculate summary
    const totalVars = Object.keys(envVars).length
    const setVars = Object.values(envVars).filter(Boolean).length
    const missingVars = Object.entries(envVars)
      .filter(([_, value]) => !value)
      .map(([key, _]) => key)

    // Determine application mode
    const hasDatabase = envVars.POSTGRES_URL || envVars.NEXT_PUBLIC_SUPABASE_URL
    const hasAI = envVars.OPENAI_API_KEY || envVars.CLAUDE_API_KEY || envVars.GROQ_API_KEY
    const hasStorage = envVars.BLOB_READ_WRITE_TOKEN

    let mode = "demo"
    if (hasDatabase && hasAI && hasStorage) {
      mode = "full"
    } else if (hasDatabase || hasAI) {
      mode = "partial"
    }

    return NextResponse.json({
      status: "success",
      message: "Environment check completed",
      environment: {
        node_env: process.env.NODE_ENV,
        mode,
        summary: {
          total: totalVars,
          set: setVars,
          missing: totalVars - setVars,
          percentage: Math.round((setVars / totalVars) * 100),
        },
        capabilities: {
          database: hasDatabase,
          ai: hasAI,
          storage: hasStorage,
          email: envVars.SENDGRID_API_KEY,
        },
      },
      envStatus: envVars,
      missingVars,
      recommendations: generateRecommendations(mode, missingVars),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Environment check error:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to check environment",
        error: error instanceof Error ? error.message : "Unknown error",
        fallback_mode: true,
      },
      { status: 500 },
    )
  }
}

function generateRecommendations(mode: string, missingVars: string[]) {
  const recommendations = []

  if (mode === "demo") {
    recommendations.push({
      priority: "high",
      action: "Set up database connection",
      description: "Add Supabase or PostgreSQL environment variables to enable full functionality",
      vars: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    })
  }

  if (
    missingVars.includes("OPENAI_API_KEY") &&
    missingVars.includes("CLAUDE_API_KEY") &&
    missingVars.includes("GROQ_API_KEY")
  ) {
    recommendations.push({
      priority: "high",
      action: "Add AI service API key",
      description: "Add at least one AI service API key for enhanced analysis",
      vars: ["OPENAI_API_KEY", "CLAUDE_API_KEY", "GROQ_API_KEY"],
    })
  }

  if (missingVars.includes("BLOB_READ_WRITE_TOKEN")) {
    recommendations.push({
      priority: "medium",
      action: "Set up file storage",
      description: "Add Vercel Blob token for file upload functionality",
      vars: ["BLOB_READ_WRITE_TOKEN"],
    })
  }

  if (mode === "full") {
    recommendations.push({
      priority: "low",
      action: "All set!",
      description: "Your application is fully configured and ready for production use",
      vars: [],
    })
  }

  return recommendations
}
