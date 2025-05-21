import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { deepinfra } from "@ai-sdk/deepinfra"
import { kv } from "@vercel/kv"

// Define recommendation types
export type RecommendationLevel = "basic" | "detailed" | "comprehensive"
export type RecommendationCategory = "marketing" | "sales" | "operations" | "finance" | "general"

export interface Recommendation {
  id: string
  title: string
  description: string
  impact: "High" | "Medium" | "Low"
  effort: "High" | "Medium" | "Low"
  category: RecommendationCategory
  details?: string // More detailed explanation (for higher tier plans)
  actionSteps?: string[] // Step-by-step actions (for higher tier plans)
}

interface AnalysisData {
  metrics: Record<string, any>
  trends: Record<string, any>
  anomalies: Record<string, any>
  correlations: Record<string, any>
}

// Cache key builder
const getCacheKey = (analysisId: string, industry: string) => `recommendations:${analysisId}:${industry}`

/**
 * Generate recommendations based on analysis data
 * The quality of recommendations is consistent across all membership levels
 * The difference is in quantity and additional details provided
 */
export async function generateRecommendations(
  analysisId: string,
  analysisData: AnalysisData,
  industry: string,
  membershipLevel: "free" | "pro" | "team" = "free",
): Promise<Recommendation[]> {
  // Check cache first
  const cacheKey = getCacheKey(analysisId, industry)
  const cachedRecommendations = await kv.get<Recommendation[]>(cacheKey)

  if (cachedRecommendations) {
    // Return appropriate number of recommendations based on membership level
    return filterRecommendationsByMembershipLevel(cachedRecommendations, membershipLevel)
  }

  try {
    // Prepare context for AI
    const context = prepareAnalysisContext(analysisData, industry)

    // Use Groq for fast, high-quality recommendations
    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt: `
        You are an expert business analyst specializing in the ${industry} industry.
        
        Analyze the following data and provide actionable recommendations:
        ${JSON.stringify(context)}
        
        Generate 10 specific, actionable recommendations based on this data.
        For each recommendation, include:
        1. A clear, concise title
        2. A brief description explaining the recommendation
        3. Impact level (High, Medium, or Low)
        4. Effort level (High, Medium, or Low)
        5. Category (Marketing, Sales, Operations, Finance, or General)
        6. Detailed explanation with supporting data
        7. 3-5 specific action steps to implement the recommendation
        
        Format your response as a JSON array of recommendation objects.
      `,
      temperature: 0.2, // Low temperature for more consistent, factual responses
      maxTokens: 4000,
    })

    // Parse recommendations from AI response
    const recommendations = parseRecommendations(text)

    // Store all recommendations in cache
    await kv.set(cacheKey, recommendations, { ex: 86400 }) // Cache for 24 hours

    // Return appropriate number of recommendations based on membership level
    return filterRecommendationsByMembershipLevel(recommendations, membershipLevel)
  } catch (error) {
    console.error("Error generating recommendations:", error)

    // Fallback to DeepInfra if Groq fails
    return generateFallbackRecommendations(analysisData, industry, membershipLevel)
  }
}

// Helper function to prepare analysis context
function prepareAnalysisContext(analysisData: AnalysisData, industry: string) {
  // Transform raw analysis data into a format optimized for the AI model
  return {
    industry,
    keyMetrics: analysisData.metrics,
    identifiedTrends: analysisData.trends,
    anomalies: analysisData.anomalies,
    correlations: analysisData.correlations,
    industryBenchmarks: getIndustryBenchmarks(industry),
  }
}

// Get industry benchmarks from database
function getIndustryBenchmarks(industry: string) {
  // In a real implementation, this would fetch industry benchmarks from a database
  // For now, return placeholder data
  return {
    averageGrowth: "18%",
    averageCAC: "$150",
    averageRetention: "70%",
    topPerformerMetrics: {
      growth: "25%",
      cac: "$120",
      retention: "80%",
    },
  }
}

// Parse recommendations from AI response
function parseRecommendations(text: string): Recommendation[] {
  try {
    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error("No JSON found in response")
    }

    const recommendations = JSON.parse(jsonMatch[0])

    // Validate and format recommendations
    return recommendations.map((rec: any, index: number) => ({
      id: `rec-${index + 1}`,
      title: rec.title || `Recommendation ${index + 1}`,
      description: rec.description || "",
      impact: validateImpact(rec.impact),
      effort: validateEffort(rec.effort),
      category: validateCategory(rec.category),
      details: rec.details || rec.explanation || "",
      actionSteps: Array.isArray(rec.actionSteps) ? rec.actionSteps : [],
    }))
  } catch (error) {
    console.error("Error parsing recommendations:", error)
    return []
  }
}

// Validate impact level
function validateImpact(impact: string): "High" | "Medium" | "Low" {
  const normalized = impact?.toLowerCase() || ""
  if (normalized.includes("high")) return "High"
  if (normalized.includes("medium") || normalized.includes("med")) return "Medium"
  return "Low"
}

// Validate effort level
function validateEffort(effort: string): "High" | "Medium" | "Low" {
  const normalized = effort?.toLowerCase() || ""
  if (normalized.includes("high")) return "High"
  if (normalized.includes("medium") || normalized.includes("med")) return "Medium"
  return "Low"
}

// Validate category
function validateCategory(category: string): RecommendationCategory {
  const normalized = category?.toLowerCase() || ""
  if (normalized.includes("market")) return "marketing"
  if (normalized.includes("sale")) return "sales"
  if (normalized.includes("operat")) return "operations"
  if (normalized.includes("financ")) return "finance"
  return "general"
}

// Filter recommendations based on membership level
function filterRecommendationsByMembershipLevel(
  recommendations: Recommendation[],
  membershipLevel: "free" | "pro" | "team",
): Recommendation[] {
  // All levels get the same quality recommendations, but different quantities
  let filteredRecommendations: Recommendation[]

  switch (membershipLevel) {
    case "free":
      // Free tier gets top 3 recommendations
      filteredRecommendations = recommendations.slice(0, 3)
      // Remove detailed information
      return filteredRecommendations.map((rec) => ({
        ...rec,
        details: undefined,
        actionSteps: undefined,
      }))

    case "pro":
      // Pro tier gets top 5 recommendations with full details
      return recommendations.slice(0, 5)

    case "team":
      // Team tier gets all recommendations with full details
      return recommendations

    default:
      return recommendations.slice(0, 3)
  }
}

// Fallback to DeepInfra if Groq fails
async function generateFallbackRecommendations(
  analysisData: AnalysisData,
  industry: string,
  membershipLevel: "free" | "pro" | "team",
): Promise<Recommendation[]> {
  try {
    const context = prepareAnalysisContext(analysisData, industry)

    const { text } = await generateText({
      model: deepinfra("mistralai/mixtral-8x7b-instruct-v0.1"),
      prompt: `
        You are an expert business analyst specializing in the ${industry} industry.
        
        Analyze the following data and provide actionable recommendations:
        ${JSON.stringify(context)}
        
        Generate 10 specific, actionable recommendations based on this data.
        For each recommendation, include:
        1. A clear, concise title
        2. A brief description explaining the recommendation
        3. Impact level (High, Medium, or Low)
        4. Effort level (High, Medium, or Low)
        5. Category (Marketing, Sales, Operations, Finance, or General)
        6. Detailed explanation with supporting data
        7. 3-5 specific action steps to implement the recommendation
        
        Format your response as a JSON array of recommendation objects.
      `,
      temperature: 0.3,
      maxTokens: 4000,
    })

    const recommendations = parseRecommendations(text)
    return filterRecommendationsByMembershipLevel(recommendations, membershipLevel)
  } catch (error) {
    console.error("Fallback recommendation generation failed:", error)
    return getDefaultRecommendations(industry, membershipLevel)
  }
}

// Default recommendations as a last resort
function getDefaultRecommendations(industry: string, membershipLevel: "free" | "pro" | "team"): Recommendation[] {
  const defaultRecs = [
    {
      id: "default-1",
      title: "Increase content marketing in underperforming regions",
      description:
        "Based on regional performance data, allocate more resources to content marketing in regions showing lower growth rates.",
      impact: "High" as const,
      effort: "Medium" as const,
      category: "marketing" as const,
      details:
        "Content marketing has shown a strong correlation with customer retention across all regions. The data indicates that regions with higher content marketing investment have 15-20% better customer retention rates.",
      actionSteps: [
        "Identify the bottom 2 performing regions by growth rate",
        "Increase content marketing budget by 25% in these regions",
        "Focus on industry-specific content that addresses customer pain points",
        "Measure impact after 3 months and adjust strategy accordingly",
      ],
    },
    {
      id: "default-2",
      title: "Optimize customer acquisition strategy",
      description:
        "Implement the successful acquisition strategies from top-performing regions across all territories.",
      impact: "High" as const,
      effort: "Medium" as const,
      category: "sales" as const,
      details:
        "The Northeast region has demonstrated 15% lower customer acquisition costs while maintaining higher conversion rates. Their approach emphasizes targeted digital marketing and personalized outreach.",
      actionSteps: [
        "Document the Northeast region's acquisition process in detail",
        "Create a standardized playbook based on their approach",
        "Train sales teams in other regions on the new methodology",
        "Implement A/B testing to validate effectiveness in each region",
      ],
    },
    {
      id: "default-3",
      title: "Reduce paid advertising in low-ROI channels",
      description:
        "Reallocate marketing budget from underperforming paid channels to higher-performing organic strategies.",
      impact: "Medium" as const,
      effort: "Low" as const,
      category: "marketing" as const,
      details:
        "Analysis shows negative ROI on paid advertising in certain channels, particularly in the Southwest region. Email marketing and content marketing show stronger conversion rates with lower costs.",
      actionSteps: [
        "Reduce paid advertising spend by 30% in identified low-ROI channels",
        "Redirect funds to email marketing campaigns and content creation",
        "Develop more targeted audience segments for remaining paid campaigns",
        "Implement stronger analytics tracking to measure channel performance",
      ],
    },
  ]

  return filterRecommendationsByMembershipLevel(defaultRecs, membershipLevel)
}
