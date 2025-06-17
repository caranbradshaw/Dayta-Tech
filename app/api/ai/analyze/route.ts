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

    console.log(`Starting AI analysis for user ${userId}, analysis ${analysisId}`)

    // Update status to processing
    await supabase
      .from("analyses")
      .update({
        status: "processing",
        processing_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", analysisId)

    // Analyze the file with AI
    const analysisResult = await analyzeUploadedFile(file, {
      industry: industry || "general",
      role: role || "business_analyst",
      planType: planType || "basic",
      userId,
    })

    // Update the analysis record in database with results
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
          analysis_type: "standard",
        },
        recommendations: {
          recommendations: analysisResult.recommendations,
          generated_by: analysisResult.aiProvider,
          generated_at: new Date().toISOString(),
        },
        processing_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          industry,
          role,
          plan_type: planType,
          file_size: file.size,
          file_type: file.type,
        },
      })
      .eq("id", analysisId)

    if (updateError) {
      throw new Error(`Failed to update analysis: ${updateError.message}`)
    }

    // Create individual insight records for better querying
    const insightRecords = analysisResult.insights.map((insight) => ({
      analysis_id: analysisId,
      project_id: analysisId,
      type: insight.type,
      title: insight.title,
      content: insight.content,
      confidence_score: insight.confidence_score,
      metadata: insight.metadata || {},
      ai_model: insight.ai_model || analysisResult.aiProvider,
      processing_time_ms: insight.processing_time_ms || analysisResult.processingTime,
      created_at: new Date().toISOString(),
    }))

    if (insightRecords.length > 0) {
      const { error: insightsError } = await supabase.from("insights").insert(insightRecords)

      if (insightsError) {
        console.error("Failed to insert insights:", insightsError)
        // Don't throw here as the main analysis is complete
      }
    }

    // Create a saved report after successful analysis
    try {
      const reportTitle = `${role?.toUpperCase() || "BUSINESS"} Analysis: ${file.name}`

      const { error: reportError } = await supabase.from("reports").insert({
        user_id: userId,
        analysis_id: analysisId,
        title: reportTitle,
        description: `AI-powered analysis report generated from ${file.name}`,
        report_type: "analysis_report",
        content: {
          summary: analysisResult.summary,
          insights: analysisResult.insights,
          recommendations: analysisResult.recommendations,
          data_quality: analysisResult.dataQuality,
          processing_time: analysisResult.processingTime,
          ai_provider: analysisResult.aiProvider,
        },
        summary: analysisResult.summary,
        insights: analysisResult.insights,
        recommendations: analysisResult.recommendations.map((rec) => ({
          title: rec.title,
          description: rec.description,
          impact: rec.impact,
          effort: rec.effort,
          category: rec.category,
        })),
        file_name: file.name,
        analysis_role: role,
        industry: industry,
        status: "generated",
        created_at: new Date().toISOString(),
      })

      if (reportError) {
        console.error("Failed to create report:", reportError)
      } else {
        console.log("Report created successfully for analysis:", analysisId)
      }
    } catch (reportCreationError) {
      console.error("Error creating report:", reportCreationError)
    }

    console.log(`AI analysis completed successfully for analysis ${analysisId}`)

    return NextResponse.json({
      success: true,
      analysisId,
      summary: analysisResult.summary,
      insights: analysisResult.insights,
      recommendations: analysisResult.recommendations,
      dataQuality: analysisResult.dataQuality,
      processingTime: analysisResult.processingTime,
      aiProvider: analysisResult.aiProvider,
      message: "Analysis completed successfully",
    })
  } catch (error) {
    console.error("AI analysis error:", error)

    // Update analysis record with error status
    if (request.formData) {
      try {
        const formData = await request.formData()
        const analysisId = formData.get("analysisId") as string
        if (analysisId) {
          await supabase
            .from("analyses")
            .update({
              status: "failed",
              error_message: error instanceof Error ? error.message : "Analysis failed",
              processing_completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", analysisId)
        }
      } catch (updateError) {
        console.error("Failed to update error status:", updateError)
      }
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
