import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { analyzeUploadedFileEnhanced } from "@/lib/ai-service-enhanced"

export async function POST(request: NextRequest) {
  let formData
  try {
    console.log("🔄 Starting AI analysis...")

    formData = await request.formData()
    const file = formData.get("file_0") as File
    const analysisId = formData.get("analysisId") as string
    const userId = formData.get("userId") as string
    const role = (formData.get("role") as string) || "business_analyst"
    const goals = JSON.parse((formData.get("goals") as string) || "[]")
    const context = (formData.get("context") as string) || ""
    const companyName = formData.get("companyName") as string
    const industry = formData.get("industry") as string
    const companySize = formData.get("companySize") as string

    if (!file || !analysisId || !userId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    console.log("📊 Analysis parameters:", {
      fileName: file.name,
      fileSize: file.size,
      analysisId,
      userId,
      role,
      goals,
      companyName,
      industry,
    })

    // Update analysis status to processing
    await supabase
      .from("analyses")
      .update({
        status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", analysisId)

    // Create user context for AI analysis
    const userContext = {
      company: companyName,
      industry,
      companySize,
      goals,
      context,
      region: "global",
    }

    console.log("🤖 Starting AI analysis with context:", userContext)

    // Run the AI analysis
    const analysisResult = await analyzeUploadedFileEnhanced(
      file,
      userId,
      analysisId,
      role as any,
      "enhanced",
      userContext,
    )

    console.log("✅ AI analysis completed:", {
      executiveSummary: !!analysisResult.executiveSummary,
      detailedInsights: analysisResult.detailedInsights?.length || 0,
      recommendations: analysisResult.roleBasedRecommendations?.length || 0,
    })

    // Update analysis with results
    const { error: updateError } = await supabase
      .from("analyses")
      .update({
        status: "completed",
        summary: analysisResult.executiveSummary?.overview || "Analysis completed",
        insights: {
          executive_summary: analysisResult.executiveSummary,
          detailed_insights: analysisResult.detailedInsights,
          role_recommendations: analysisResult.roleBasedRecommendations,
          data_quality_report: analysisResult.dataQualityReport,
          user_context: userContext,
          user_goals: goals,
          processing_metrics: analysisResult.processingMetrics,
        },
        processing_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", analysisId)

    if (updateError) {
      console.error("❌ Error updating analysis:", updateError)
      throw new Error("Failed to save analysis results")
    }

    // Also create a report entry
    const { error: reportError } = await supabase.from("reports").insert({
      id: analysisId, // Use same ID as analysis
      user_id: userId,
      title: `Analysis: ${file.name}`,
      description: analysisResult.executiveSummary?.overview || "Data analysis report",
      report_data: {
        executive_summary: analysisResult.executiveSummary,
        detailed_insights: analysisResult.detailedInsights,
        recommendations: analysisResult.roleBasedRecommendations,
        data_quality: analysisResult.dataQualityReport,
        user_context: userContext,
      },
      status: "completed",
      created_at: new Date().toISOString(),
    })

    if (reportError) {
      console.warn("⚠️ Could not create report entry:", reportError)
    }

    console.log("🎉 Analysis saved successfully!")

    return NextResponse.json({
      success: true,
      analysisId,
      summary: analysisResult.executiveSummary?.overview,
      insights: analysisResult.detailedInsights?.length || 0,
      recommendations: analysisResult.roleBasedRecommendations?.length || 0,
    })
  } catch (error) {
    console.error("❌ AI Analysis error:", error)

    // Update analysis status to failed
    if (formData?.get("analysisId")) {
      await supabase
        .from("analyses")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", formData.get("analysisId") as string)
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

export const runtime = "nodejs"
export const maxDuration = 60
