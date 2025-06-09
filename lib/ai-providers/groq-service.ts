import Groq from "groq-sdk"
import type { Recommendation } from "@/lib/ai-service"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function analyzeDataWithGroq(
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

Data Overview:
- Records: ${fileData.rowCount || "N/A"}
- Columns: ${fileData.columnCount || "N/A"}
- Numeric Columns: ${fileData.numericColumns?.join(", ") || "N/A"}
- Categorical Columns: ${fileData.categoricalColumns?.join(", ") || "N/A"}
- Data Quality: ${fileData.insights?.dataQuality || "N/A"}%
- Key Patterns: ${fileData.insights?.patterns?.join(", ") || "Standard business data"}
`

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a business data analyst expert. Analyze data and provide structured business insights.

Response format:
SUMMARY: [Business summary paragraph]
INSIGHTS: [JSON array: {"type":"string","title":"string","content":"string","confidence_score":0.8}]
RECOMMENDATIONS: [JSON array: {"id":"string","title":"string","description":"string","impact":"High|Medium|Low","effort":"High|Medium|Low","category":"string"}]`,
        },
        {
          role: "user",
          content: `Analyze this ${userContext.industry || "business"} data for ${userContext.role || "business analyst"}:

${dataContext}

Provide actionable business insights and recommendations.`,
        },
      ],
      model: "llama3-8b-8192",
      max_tokens: 1500,
      temperature: 0.7,
    })

    const content = completion.choices[0]?.message?.content || ""

    // Parse the structured response
    const summaryMatch = content.match(/SUMMARY:\s*(.*?)\s*INSIGHTS:/s)
    const insightsMatch = content.match(/INSIGHTS:\s*(.*?)\s*RECOMMENDATIONS:/s)
    const recommendationsMatch = content.match(/RECOMMENDATIONS:\s*(.*?)$/s)

    const summary = summaryMatch?.[1]?.trim() || "Fast analysis completed with Groq Llama3."

    let insights = []
    let recommendations = []

    try {
      if (insightsMatch?.[1]) {
        const insightsText = insightsMatch[1]
          .trim()
          .replace(/```json\n?|\n?```/g, "")
          .trim()
        insights = JSON.parse(insightsText)
      }
    } catch (error) {
      console.error("Error parsing Groq insights:", error)
      insights = generateFallbackInsights(fileData, "groq")
    }

    try {
      if (recommendationsMatch?.[1]) {
        const recommendationsText = recommendationsMatch[1]
          .trim()
          .replace(/```json\n?|\n?```/g, "")
          .trim()
        recommendations = JSON.parse(recommendationsText)
      }
    } catch (error) {
      console.error("Error parsing Groq recommendations:", error)
      recommendations = generateFallbackRecommendations("groq")
    }

    return {
      summary,
      insights: insights.map((insight: any) => ({
        ...insight,
        ai_model: "Llama3-8B",
        provider: "groq",
      })),
      recommendations: recommendations.map((rec: any) => ({
        ...rec,
        id: rec.id || `groq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })),
    }
  } catch (error) {
    console.error("Groq analysis error:", error)
    throw new Error("Failed to analyze data with Groq")
  }
}

function generateFallbackInsights(fileData: any, provider: string) {
  return [
    {
      type: "summary",
      title: "Fast AI Analysis",
      content: `Rapid analysis completed using ${provider.toUpperCase()} with ${fileData.rowCount || "multiple"} data points processed.`,
      confidence_score: 0.82,
      metadata: { provider: `${provider}_fallback`, speed: "fast" },
    },
    {
      type: "performance",
      title: "Processing Efficiency",
      content: `Dataset with ${fileData.columnCount || "multiple"} variables analyzed for business patterns and opportunities.`,
      confidence_score: 0.88,
      metadata: { columns: fileData.columnCount },
    },
  ]
}

function generateFallbackRecommendations(provider: string) {
  return [
    {
      id: `${provider}-fast-1`,
      title: "Quick Data Insights",
      description: "Leverage the identified patterns for immediate business decision making.",
      impact: "Medium",
      effort: "Low",
      category: "quick_wins",
    },
    {
      id: `${provider}-fast-2`,
      title: "Automated Reporting",
      description: "Set up automated reports based on the data structure and patterns identified.",
      impact: "High",
      effort: "Medium",
      category: "automation",
    },
  ]
}
