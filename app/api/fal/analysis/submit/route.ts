import { type NextRequest, NextResponse } from "next/server"
import { FALService, type ReportAnalysisInput } from "@/lib/fal-service"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })

    // Get user session
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { reportId, data, analysisType, userContext, options } = body

    if (!reportId || !data) {
      return NextResponse.json({ error: "Report ID and data are required" }, { status: 400 })
    }

    // Get user profile for context
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    // Prepare analysis input
    const analysisInput: ReportAnalysisInput = {
      reportId,
      data,
      analysisType: analysisType || "comprehensive",
      userContext: {
        industry: userContext?.industry || profile?.industry,
        role: userContext?.role || profile?.role,
        goals: userContext?.goals || [],
      },
      options: {
        includeVisualizations: options?.includeVisualizations ?? true,
        includeRecommendations: options?.includeRecommendations ?? true,
        detailLevel: options?.detailLevel || "intermediate",
      },
    }

    // Submit to FAL
    const result = await FALService.submitReportAnalysis(analysisInput)

    // Update database with task ID
    await supabase
      .from("analyses")
      .update({
        analysis_task_id: result.taskId,
        analysis_status: "queued",
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId)

    return NextResponse.json({
      success: true,
      taskId: result.taskId,
      status: result.status,
      estimatedTime: result.estimatedTime,
      message: "Analysis task submitted successfully",
    })
  } catch (error) {
    console.error("Error submitting analysis task:", error)
    return NextResponse.json({ error: "Failed to submit analysis task" }, { status: 500 })
  }
}
