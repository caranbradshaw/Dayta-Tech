import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { analyzeUploadedFileEnhanced } from "@/lib/ai-service-enhanced"

// Force Node.js runtime for file operations
export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string
    const analysisRole = formData.get("analysisRole") as string
    const goals = formData.get("goals") as string

    console.log("Analysis request:", { fileName: file?.name, userId, analysisRole, goals })

    if (!file || !userId) {
      return NextResponse.json({ error: "Missing file or user ID" }, { status: 400 })
    }

    // Create analysis record first
    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .insert({
        user_id: userId,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        status: "processing",
        role: analysisRole || "business_analyst",
        goals: goals ? JSON.parse(goals) : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (analysisError) {
      console.error("Error creating analysis record:", analysisError)
      return NextResponse.json({ error: "Failed to create analysis record" }, { status: 500 })
    }

    console.log("Analysis record created:", analysis.id)

    try {
      // Perform the AI analysis
      const result = await analyzeUploadedFileEnhanced(
        file,
        userId,
        analysis.id,
        analysisRole as any,
        "standard",
        goals ? JSON.parse(goals) : undefined,
      )

      console.log("AI analysis completed for:", analysis.id)

      // Update analysis with results
      const { error: updateError } = await supabase
        .from("analyses")
        .update({
          status: "completed",
          summary: result.executiveSummary.overview,
          insights: result.detailedInsights,
          recommendations: result.roleBasedRecommendations,
          data_quality: result.dataQualityReport,
          processing_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {
            processing_metrics: result.processingMetrics,
            ai_provider: result.processingMetrics.aiProvider,
          },
        })
        .eq("id", analysis.id)

      if (updateError) {
        console.error("Error updating analysis:", updateError)
        // Don't fail the request, just log the error
      }

      // Create a report record
      const { error: reportError } = await supabase.from("reports").insert({
        user_id: userId,
        analysis_id: analysis.id,
        title: `Analysis of ${file.name}`,
        content: {
          executive_summary: result.executiveSummary,
          detailed_insights: result.detailedInsights,
          industry_insights: result.industrySpecificInsights,
          recommendations: result.roleBasedRecommendations,
          data_quality: result.dataQualityReport,
          competitive_analysis: result.competitiveAnalysis,
          market_trends: result.marketTrends,
          technical_details: result.technicalDetails,
        },
        status: "completed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (reportError) {
        console.error("Error creating report:", reportError)
        // Don't fail the request, just log the error
      }

      return NextResponse.json({
        success: true,
        analysisId: analysis.id,
        result: result,
      })
    } catch (analysisError) {
      console.error("AI analysis failed:", analysisError)

      // Update analysis status to failed
      await supabase
        .from("analyses")
        .update({
          status: "failed",
          error_message: analysisError instanceof Error ? analysisError.message : "Analysis failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", analysis.id)

      return NextResponse.json(
        {
          error: "Analysis failed",
          details: analysisError instanceof Error ? analysisError.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Request processing error:", error)
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
