import { type NextRequest, NextResponse } from "next/server"
import { FALService, type PDFGenerationInput } from "@/lib/fal-service"
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
    const { reportId, template, branding } = body

    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 })
    }

    // Get report data from database
    const { data: report, error: reportError } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", reportId)
      .eq("user_id", session.user.id)
      .single()

    if (reportError || !report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // Prepare PDF generation input
    const pdfInput: PDFGenerationInput = {
      reportId,
      reportData: {
        title: report.file_name || "Analysis Report",
        summary: report.summary || "No summary available",
        insights: report.insights || [],
        recommendations: report.recommendations || [],
        charts: report.charts || [],
        metadata: {
          createdAt: report.created_at,
          userId: session.user.id,
          analysisType: report.analysis_type,
        },
      },
      template: template || "standard",
      branding,
    }

    // Submit to FAL
    const result = await FALService.submitPDFGeneration(pdfInput)

    // Update database with task ID
    await supabase.from("analyses").update({ pdf_task_id: result.taskId, pdf_status: "queued" }).eq("id", reportId)

    return NextResponse.json({
      success: true,
      taskId: result.taskId,
      status: result.status,
      estimatedTime: result.estimatedTime,
      message: "PDF generation task submitted successfully",
    })
  } catch (error) {
    console.error("Error submitting PDF generation:", error)
    return NextResponse.json({ error: "Failed to submit PDF generation task" }, { status: 500 })
  }
}
