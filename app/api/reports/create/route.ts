import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      analysisId,
      userId,
      title,
      description,
      reportType = "analysis_report",
      content,
      summary,
      executiveSummary,
      insights,
      recommendations,
      chartsData,
      analysisRole,
      industry,
      companyName,
      tags = [],
    } = body

    if (!analysisId || !userId || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get analysis details to link the report
    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .select("project_id, file_name")
      .eq("id", analysisId)
      .single()

    if (analysisError) {
      console.error("Error fetching analysis:", analysisError)
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    // Create the report record
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        user_id: userId,
        analysis_id: analysisId,
        project_id: analysis.project_id,
        title,
        description,
        report_type: reportType,
        content,
        summary,
        executive_summary: executiveSummary,
        insights,
        recommendations,
        charts_data: chartsData,
        file_name: analysis.file_name,
        analysis_role: analysisRole,
        industry,
        company_name: companyName,
        tags,
        status: "generated",
      })
      .select()
      .single()

    if (reportError) {
      console.error("Error creating report:", reportError)
      return NextResponse.json({ error: "Failed to create report" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      report,
      message: "Report created successfully",
    })
  } catch (error) {
    console.error("Report creation error:", error)
    return NextResponse.json(
      {
        error: "Failed to create report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
