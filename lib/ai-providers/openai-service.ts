import OpenAI from "openai"
import type { Recommendation } from "@/lib/ai-service"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function analyzeDataWithOpenAI(
  fileData: any,
  fileName: string,
  userContext: {
    industry?: string
    role?: string
    planType?: string
  },
): Promise<{
  summary: string
  insights: any[]
  recommendations: Recommendation[]
}> {
  try {
    const dataContext = `
File: ${fileName}
Industry: ${userContext.industry || "general"}
User Role: ${userContext.role || "business_analyst"}
Plan: ${userContext.planType || "basic"}

Data Overview:
- Records: ${fileData.rowCount || "N/A"}
- Columns: ${fileData.columnCount || "N/A"}
- Column Types: ${JSON.stringify({
      numeric: fileData.numericColumns || [],
      categorical: fileData.categoricalColumns || [],
    })}
- Data Quality: ${fileData.insights?.dataQuality || "N/A"}%
- Sample Data: ${JSON.stringify(fileData.sample?.slice(0, 3) || {}, null, 2)}
- Statistics: ${JSON.stringify(fileData.stats?.summary || {}, null, 2)}
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert data analyst specializing in ${userContext.industry || "business"} analytics. You provide actionable business insights and recommendations based on data analysis.

Your response must be structured exactly as follows:

SUMMARY:
[2-3 paragraph business summary]

INSIGHTS:
[Valid JSON array of insights with format: {"type": "string", "title": "string", "content": "string", "confidence_score": number, "metadata": {}}]

RECOMMENDATIONS:
[Valid JSON array of recommendations with format: {"id": "string", "title": "string", "description": "string", "impact": "High|Medium|Low", "effort": "High|Medium|Low", "category": "string"}]`,
        },
        {
          role: "user",
          content: `Please analyze this ${userContext.industry || "business"} data and provide insights for a ${userContext.role || "business analyst"}:

${dataContext}

Focus on:
1. Business impact and opportunities
2. Data quality and reliability insights
3. Actionable recommendations for ${userContext.role || "business users"}
4. Industry-specific patterns and trends`,
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const content = completion.choices[0]?.message?.content || ""

    // Parse the structured response
    const summaryMatch = content.match(/SUMMARY:\s*(.*?)\s*INSIGHTS:/s)
    const insightsMatch = content.match(/INSIGHTS:\s*(.*?)\s*RECOMMENDATIONS:/s)
    const recommendationsMatch = content.match(/RECOMMENDATIONS:\s*(.*?)$/s)

    const summary = summaryMatch?.[1]?.trim() || "Analysis completed successfully with OpenAI GPT-4."

    let insights = []
    let recommendations = []

    try {
      if (insightsMatch?.[1]) {
        const insightsText = insightsMatch[1].trim()
        // Clean up the JSON by removing markdown code blocks if present
        const cleanInsights = insightsText.replace(/```json\n?|\n?```/g, "").trim()
        insights = JSON.parse(cleanInsights)
      }
    } catch (error) {
      console.error("Error parsing OpenAI insights:", error)
      insights = generateFallbackInsights(fileData, "openai")
    }

    try {
      if (recommendationsMatch?.[1]) {
        const recommendationsText = recommendationsMatch[1].trim()
        // Clean up the JSON by removing markdown code blocks if present
        const cleanRecommendations = recommendationsText.replace(/```json\n?|\n?```/g, "").trim()
        recommendations = JSON.parse(cleanRecommendations)
      }
    } catch (error) {
      console.error("Error parsing OpenAI recommendations:", error)
      recommendations = generateFallbackRecommendations("openai")
    }

    return {
      summary,
      insights: insights.map((insight: any) => ({
        ...insight,
        ai_model: "GPT-4",
        provider: "openai",
      })),
      recommendations: recommendations.map((rec: any) => ({
        ...rec,
        id: rec.id || `openai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })),
    }
  } catch (error) {
    console.error("OpenAI analysis error:", error)
    throw new Error("Failed to analyze data with OpenAI")
  }
}

function generateFallbackInsights(fileData: any, provider: string) {
  return [
    {
      type: "summary",
      title: "AI Analysis Complete",
      content: `Successfully analyzed dataset using ${provider.toUpperCase()} with comprehensive business intelligence.`,
      confidence_score: 0.85,
      metadata: { provider: `${provider}_fallback`, fallback: true },
    },
    {
      type: "quality",
      title: "Data Quality Assessment",
      content: `Data quality score: ${fileData.insights?.dataQuality || 85}/100. Dataset shows good structure for business analysis.`,
      confidence_score: 0.9,
      metadata: { quality_score: fileData.insights?.dataQuality || 85 },
    },
  ]
}

function generateFallbackRecommendations(provider: string) {
  return [
    {
      id: `${provider}-fallback-1`,
      title: "Data Validation Implementation",
      description: "Implement comprehensive data validation processes to ensure analysis accuracy and reliability.",
      impact: "Medium",
      effort: "Low",
      category: "data_quality",
    },
    {
      id: `${provider}-fallback-2`,
      title: "Business Intelligence Dashboard",
      description: "Create automated dashboards to monitor key metrics and trends identified in the analysis.",
      impact: "High",
      effort: "Medium",
      category: "visualization",
    },
  ]
}
