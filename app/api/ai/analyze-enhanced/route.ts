import { type NextRequest, NextResponse } from "next/server"
import { analyzeUploadedFileEnhanced } from "@/lib/ai-service-enhanced"
import { supabase } from "@/lib/supabase"
import type { AnalysisRole } from "@/components/role-selector"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string
    const analysisId = formData.get("analysisId") as string
    const analysisRole = (formData.get("analysisRole") as AnalysisRole) || "business_analyst"
    const industry = formData.get("industry") as string
    const planType = formData.get("planType") as string

    if (!file || !userId || !analysisId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    console.log(`Starting enhanced AI analysis for user ${userId}, analysis ${analysisId}, role ${analysisRole}`)

    // Update status to processing
    await supabase
      .from("analyses")
      .update({
        status: "processing",
        processing_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", analysisId)

    // Perform enhanced AI analysis with specified role
    const analysisResult = await analyzeUploadedFileEnhanced(file, userId, analysisId, analysisRole)

    // Update the analysis record with enhanced results
    const { error: updateError } = await supabase
      .from("analyses")
      .update({
        status: "completed",
        summary: analysisResult.executiveSummary.overview,
        insights: {
          executive_summary: analysisResult.executiveSummary,
          detailed_insights: analysisResult.detailedInsights,
          industry_insights: analysisResult.industrySpecificInsights,
          role_recommendations: analysisResult.roleBasedRecommendations,
          data_quality_report: analysisResult.dataQualityReport,
          competitive_analysis: analysisResult.competitiveAnalysis,
          market_trends: analysisResult.marketTrends,
          technical_details: analysisResult.technicalDetails,
          processing_metrics: analysisResult.processingMetrics,
          analysis_type: "enhanced_professional",
          analysis_role: analysisRole,
        },
        recommendations: {
          strategic_recommendations: analysisResult.executiveSummary.strategicRecommendations,
          next_steps: analysisResult.executiveSummary.nextSteps,
          role_based: analysisResult.roleBasedRecommendations,
          generated_by: analysisResult.processingMetrics.aiProvider,
          generated_at: new Date().toISOString(),
          analysis_depth: analysisResult.processingMetrics.analysisDepth,
          analysis_role: analysisRole,
        },
        processing_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          analysis_role: analysisRole,
          industry,
          plan_type: planType,
          rows_analyzed: analysisResult.processingMetrics.totalRowsAnalyzed,
          columns_analyzed: analysisResult.processingMetrics.totalColumnsAnalyzed,
          processing_time_ms: analysisResult.processingMetrics.processingTimeMs,
          file_size: file.size,
          file_type: file.type,
        },
      })
      .eq("id", analysisId)

    if (updateError) {
      throw new Error(`Failed to update analysis: ${updateError.message}`)
    }

    // Create enhanced insight records
    const enhancedInsightRecords = [
      ...analysisResult.detailedInsights.map((insight) => ({
        analysis_id: analysisId,
        project_id: analysisId,
        type: insight.category || "business_intelligence",
        title: insight.title,
        content: insight.finding,
        confidence_score: insight.confidence || 0.9,
        metadata: {
          impact: insight.impact,
          supporting_data: insight.supporting_data,
          analysis_type: "enhanced",
          analysis_role: analysisRole,
          ai_provider: analysisResult.processingMetrics.aiProvider,
        },
        ai_model: `Enhanced ${analysisResult.processingMetrics.aiProvider}`,
        processing_time_ms: analysisResult.processingMetrics.processingTimeMs,
        created_at: new Date().toISOString(),
      })),
      ...analysisResult.industrySpecificInsights.map((insight) => ({
        analysis_id: analysisId,
        project_id: analysisId,
        type: "industry_specific",
        title: `Industry Insight: ${insight.category}`,
        content: insight.insight,
        confidence_score: 0.92,
        metadata: {
          benchmark: insight.benchmark,
          competitive_advantage: insight.competitive_advantage,
          analysis_type: "industry_enhanced",
          analysis_role: analysisRole,
        },
        ai_model: `Enhanced ${analysisResult.processingMetrics.aiProvider}`,
        processing_time_ms: analysisResult.processingMetrics.processingTimeMs,
        created_at: new Date().toISOString(),
      })),
    ]

    if (enhancedInsightRecords.length > 0) {
      const { error: insightsError } = await supabase.from("insights").insert(enhancedInsightRecords)

      if (insightsError) {
        console.error("Failed to insert enhanced insights:", insightsError)
      }
    }

    // Create a saved report after successful analysis
    try {
      const reportTitle = `${analysisRole.replace("_", " ").toUpperCase()} Analysis: ${file.name}`

      const { error: reportError } = await supabase.from("reports").insert({
        user_id: userId,
        analysis_id: analysisId,
        title: reportTitle,
        description: `Comprehensive ${analysisRole.replace("_", " ")} analysis report generated from ${file.name}`,
        report_type: "analysis_report",
        content: {
          executive_summary: analysisResult.executiveSummary,
          detailed_insights: analysisResult.detailedInsights,
          industry_insights: analysisResult.industrySpecificInsights,
          role_recommendations: analysisResult.roleBasedRecommendations,
          data_quality_report: analysisResult.dataQualityReport,
          competitive_analysis: analysisResult.competitiveAnalysis,
          market_trends: analysisResult.marketTrends,
          technical_details: analysisResult.technicalDetails,
          processing_metrics: analysisResult.processingMetrics,
        },
        summary: analysisResult.executiveSummary.overview,
        executive_summary: analysisResult.executiveSummary,
        insights: analysisResult.detailedInsights,
        recommendations: analysisResult.roleBasedRecommendations,
        file_name: file.name,
        analysis_role: analysisRole,
        industry: industry,
        status: "generated",
        created_at: new Date().toISOString(),
      })

      if (reportError) {
        console.error("Failed to create report:", reportError)
      } else {
        console.log("Enhanced report created successfully for analysis:", analysisId)
      }
    } catch (reportCreationError) {
      console.error("Error creating enhanced report:", reportCreationError)
    }

    console.log(`Enhanced AI analysis completed successfully for analysis ${analysisId}`)

    return NextResponse.json({
      success: true,
      analysisId,
      executiveSummary: analysisResult.executiveSummary,
      detailedInsights: analysisResult.detailedInsights,
      industryInsights: analysisResult.industrySpecificInsights,
      roleRecommendations: analysisResult.roleBasedRecommendations,
      dataQualityReport: analysisResult.dataQualityReport,
      competitiveAnalysis: analysisResult.competitiveAnalysis,
      marketTrends: analysisResult.marketTrends,
      technicalDetails: analysisResult.technicalDetails,
      processingMetrics: analysisResult.processingMetrics,
      analysisType: "enhanced_professional",
      analysisRole,
      message: "Enhanced analysis completed successfully",
    })
  } catch (error) {
    console.error("Enhanced AI analysis error:", error)

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
              error_message: error instanceof Error ? error.message : "Enhanced analysis failed",
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
        error: "Enhanced analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
