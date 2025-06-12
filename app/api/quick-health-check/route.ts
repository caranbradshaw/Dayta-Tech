import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simple environment check
    const envCheck = {
      hasSupabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      hasDatabase: !!(process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL),
      hasAI: !!(process.env.OPENAI_API_KEY || process.env.CLAUDE_API_KEY || process.env.GROQ_API_KEY),
      hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }

    const quickCheck = {
      timestamp: new Date().toISOString(),
      status: envCheck.hasSupabase ? "healthy" : "needs_setup",
      environment: {
        supabase: envCheck.hasSupabase,
        database: envCheck.hasDatabase,
        ai: envCheck.hasAI,
        serviceRole: envCheck.hasServiceRole,
      },
      recommendations: [] as Array<{
        priority: "critical" | "high" | "medium" | "low"
        issue: string
        solution: string
        link?: string
      }>,
      nextSteps: [] as string[],
    }

    // Add recommendations
    if (!envCheck.hasSupabase) {
      quickCheck.recommendations.push({
        priority: "critical",
        issue: "Missing Supabase configuration",
        solution: "Add your Supabase URL and anon key to environment variables",
        link: "/auto-repair",
      })
      quickCheck.nextSteps.push("Configure Supabase credentials")
    }

    if (!envCheck.hasAI) {
      quickCheck.recommendations.push({
        priority: "medium",
        issue: "No AI service configured",
        solution: "Add an AI API key for enhanced analysis features",
        link: "/env-status",
      })
      quickCheck.nextSteps.push("Add AI service API key")
    }

    if (envCheck.hasSupabase && !envCheck.hasServiceRole) {
      quickCheck.recommendations.push({
        priority: "high",
        issue: "Missing service role key",
        solution: "Add Supabase service role key for full functionality",
        link: "/auto-repair",
      })
      quickCheck.nextSteps.push("Add service role key")
    }

    if (envCheck.hasSupabase && envCheck.hasAI) {
      quickCheck.nextSteps.push("Your system is ready to use!")
    }

    return NextResponse.json(quickCheck)
  } catch (error) {
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        recommendations: [
          {
            priority: "critical" as const,
            issue: "Health check failed",
            solution: "Unable to run health check. Please try again.",
          },
        ],
        nextSteps: ["Check server logs", "Try again"],
      },
      { status: 500 },
    )
  }
}
