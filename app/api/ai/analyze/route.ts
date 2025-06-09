import { type NextRequest, NextResponse } from "next/server"
import { analyzeUploadedFile } from "@/lib/ai-service"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string
    const analysisId = formData.get("analysisId") as string
    const industry = formData.get("industry") as string
    const role = formData.get("role") as string
    const planType = formData.get("planType") as string

    if (!file || !userId || !analysisId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Analyze the file with AI
    const analysisResult = await analyzeUploadedFile(file, {
      industry,
      role,
      planType,
      userId,
    })

    // Update the analysis record in database
    const { error: updateError } = await supabase
      .from("analyses")
      .update({
        status: "completed",
        summary: analysisResult.summary,
        insights: {
          ai_insights: analysisResult.insights,
          data_quality: analysisResult.dataQuality,
          processing_time_ms: analysisResult.processingTime,
          ai_provider: analysisResult.aiProvider,
        },
        recommendations: {
          recommendations: analysisResult.recommendations,
          generated_by: analysisResult.aiProvider,
          generated_at: new Date().toISOString(),
        },
        processing_completed_at: new Date().toISOString(),
      })
      .eq("id", analysisId)

    if (updateError) {
      throw new Error(`Failed to update analysis: ${updateError.message}`)
    }

    // Create individual insight records
    const insightRecords = analysisResult.insights.map((insight) => ({
      analysis_id: analysisId,
      project_id: analysisId, // Using analysis ID as project ID for simplicity
      type: insight.type,
      title: insight.title,
      content: insight.content,
      confidence_score: insight.confidence_score,
      metadata: insight.metadata || {},
      ai_model: insight.ai_model,
      processing_time_ms: insight.processing_time_ms,
    }))

    if (insightRecords.length > 0) {
      const { error: insightsError } = await supabase.from("insights").insert(insightRecords)

      if (insightsError) {
        console.error("Failed to insert insights:", insightsError)
        // Don't throw here as the main analysis is complete
      }
    }

    return NextResponse.json({
      success: true,
      analysisId,
      summary: analysisResult.summary,
      insights: analysisResult.insights,
      recommendations: analysisResult.recommendations,
      dataQuality: analysisResult.dataQuality,
      processingTime: analysisResult.processingTime,
      aiProvider: analysisResult.aiProvider,
    })
  } catch (error) {
    console.error("AI analysis error:", error)

    // Try to update the analysis record with error status
    const analysisId = (await request.formData()).get("analysisId") as string
    if (analysisId) {
      await supabase
        .from("analyses")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
          processing_completed_at: new Date().toISOString(),
        })
        .eq("id", analysisId)
    }

    return NextResponse.json(
      {
        error: "Analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
