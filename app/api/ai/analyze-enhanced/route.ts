import { type NextRequest, NextResponse } from "next/server"
import { analyzeUploadedFileEnhanced } from "@/lib/ai-service-enhanced"
import { supabase } from "@/lib/supabase"
import type { AnalysisRole } from "@/components/role-selector"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Get file and basic data
    const files = []
    let fileIndex = 0
    while (formData.get(`file_${fileIndex}`)) {
      files.push(formData.get(`file_${fileIndex}`) as File)
      fileIndex++
    }

    const file = files[0] // Use first file for now
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Get wizard data
    const companyName = formData.get("companyName") as string
    const industry = formData.get("industry") as string
    const companySize = formData.get("companySize") as string
    const role = formData.get("role") as string
    const goals = JSON.parse((formData.get("goals") as string) || "[]")
    const context = formData.get("context") as string
    const analysisId = formData.get("analysisId") as string
    const userId = (formData.get("userId") as string) || "temp-user"
    const analysisRole = (formData.get("analysisRole") as AnalysisRole) || (role as AnalysisRole)
    const analysisTier = (formData.get("analysisTier") as string) || "enhanced"

    console.log(`Starting enhanced AI analysis for ${companyName} in ${industry} industry`)
    console.log(`Analysis role: ${analysisRole}, Goals: ${goals.join(", ")}`)

    // Update status to processing
    await supabase
      .from("analyses")
      .update({
        status: "processing",
        processing_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", analysisId)

    // Create enhanced user context
    const userContext = {
      company: companyName,
      industry: industry,
      companySize: companySize,
      role: analysisRole,
      goals: goals,
      context: context,
      region: "global", // Default for now
    }

    // Perform enhanced AI analysis with all context
    const analysisResult = await analyzeUploadedFileEnhanced(
      file,
      userId,
      analysisId,
      analysisRole,
      analysisTier as "standard" | "enhanced" | "claude_premium",
      userContext,
    )

    // Update the analysis record with comprehensive results
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
          user_goals: goals,
          user_context: userContext,
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
          company_name: companyName,
          company_size: companySize,
          user_goals: goals,
          user_context: context,
          plan_type: "enhanced",
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

    // Create comprehensive report for export
    const reportTitle = `${analysisRole.replace("_", " ").toUpperCase()} Analysis: ${companyName} - ${file.name}`

    const { error: reportError } = await supabase.from("reports").insert({
      user_id: userId,
      analysis_id: analysisId,
      title: reportTitle,
      description: `Comprehensive ${analysisRole.replace("_", " ")} analysis for ${companyName} in ${industry} industry`,
      report_type: "enhanced_analysis_report",
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
        user_context: userContext,
      },
      summary: analysisResult.executiveSummary.overview,
      executive_summary: analysisResult.executiveSummary,
      insights: analysisResult.detailedInsights,
      recommendations: analysisResult.roleBasedRecommendations,
      file_name: file.name,
      company_name: companyName,
      industry: industry,
      analysis_role: analysisRole,
      tags: [industry, analysisRole, companySize, ...goals],
      status: "generated",
      created_at: new Date().toISOString(),
    })

    if (reportError) {
      console.error("Failed to create report:", reportError)
    }

    console.log(`Enhanced AI analysis completed successfully for ${companyName}`)

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
      userContext,
      message: "Enhanced analysis completed successfully",
    })
  } catch (error) {
    console.error("Enhanced AI analysis error:", error)

    return NextResponse.json(
      {
        error: "Enhanced analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
