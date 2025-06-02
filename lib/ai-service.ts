import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { deepinfra } from "@ai-sdk/deepinfra"
import { kv } from "@vercel/kv"

// Define recommendation types
export type RecommendationLevel = "basic" | "detailed" | "comprehensive"
export type RecommendationCategory =
  | "marketing"
  | "sales"
  | "operations"
  | "finance"
  | "general"
  | "pipeline"
  | "architecture"
  | "transformation"
  | "governance"
  | "performance"
  | "cleaning"

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
const getCacheKey = (analysisId: string, industry: string, userRole?: string) =>
  `recommendations:${analysisId}:${industry}:${userRole || "general"}`

/**
 * Generate recommendations based on analysis data and user role
 * Data Engineers get specialized pipeline, architecture, and engineering insights
 * Data Scientists get business and analytical insights
 */
export async function generateRecommendations(
  analysisId: string,
  analysisData: AnalysisData,
  industry: string,
  membershipLevel: "basic" | "pro" | "team" = "basic",
  userRole?: "data-scientist" | "data-engineer",
): Promise<Recommendation[]> {
  // Check cache first
  const cacheKey = getCacheKey(analysisId, industry, userRole)
  const cachedRecommendations = await kv.get<Recommendation[]>(cacheKey)

  if (cachedRecommendations) {
    // Return appropriate number of recommendations based on membership level
    return filterRecommendationsByMembershipLevel(cachedRecommendations, membershipLevel)
  }

  try {
    // Prepare context for AI based on user role
    const context = prepareAnalysisContext(analysisData, industry, userRole)

    // Generate role-specific prompt
    const prompt = generateRoleSpecificPrompt(context, industry, userRole)

    // Use Groq for fast, high-quality recommendations
    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt,
      temperature: 0.2, // Low temperature for more consistent, factual responses
      maxTokens: 4000,
    })

    // Parse recommendations from AI response
    const recommendations = parseRecommendations(text, userRole)

    // Store all recommendations in cache
    await kv.set(cacheKey, recommendations, { ex: 86400 }) // Cache for 24 hours

    // Return appropriate number of recommendations based on membership level
    return filterRecommendationsByMembershipLevel(recommendations, membershipLevel)
  } catch (error) {
    console.error("Error generating recommendations:", error)

    // Fallback to DeepInfra if Groq fails
    return generateFallbackRecommendations(analysisData, industry, membershipLevel, userRole)
  }
}

// Generate role-specific prompts
function generateRoleSpecificPrompt(context: any, industry: string, userRole?: string): string {
  const basePrompt = `You are an expert analyst specializing in the ${industry} industry.`

  if (userRole === "data-engineer") {
    return `${basePrompt}
    
    You are specifically focused on data engineering, infrastructure, and technical optimization.
    
    Analyze the following data and provide actionable recommendations focused on:
    1. Data pipeline development and optimization
    2. Data storage and architecture recommendations
    3. Data transformation and processing insights
    4. Data governance and security insights
    5. Performance tuning and optimizations
    6. Data cleaning and quality recommendations
    
    Context: ${JSON.stringify(context)}
    
    Generate 10 specific, actionable recommendations for a data engineer based on this data.
    Focus on technical implementation, infrastructure optimization, data quality, and engineering best practices.
    
    For each recommendation, include:
    1. A clear, technical title
    2. A brief description explaining the engineering recommendation
    3. Impact level (High, Medium, or Low)
    4. Effort level (High, Medium, or Low)
    5. Category (Pipeline, Architecture, Transformation, Governance, Performance, or Cleaning)
    6. Detailed technical explanation with supporting data
    7. 3-5 specific implementation steps
    
    Format your response as a JSON array of recommendation objects.`
  }

  if (userRole === "data-scientist") {
    return `${basePrompt}
    
    You are specifically focused on data science, analytics, and business insights.
    
    Analyze the following data and provide actionable recommendations focused on:
    1. Statistical analysis and modeling opportunities
    2. Business intelligence and insights
    3. Predictive analytics recommendations
    4. Data visualization and reporting
    5. Executive summary insights
    6. Industry-specific analytical approaches
    
    Context: ${JSON.stringify(context)}
    
    Generate 10 specific, actionable recommendations for a data scientist based on this data.
    Focus on analytical insights, business value, and data science methodologies.
    
    For each recommendation, include:
    1. A clear, analytical title
    2. A brief description explaining the data science recommendation
    3. Impact level (High, Medium, or Low)
    4. Effort level (High, Medium, or Low)
    5. Category (Marketing, Sales, Operations, Finance, or General)
    6. Detailed analytical explanation with supporting data
    7. 3-5 specific analytical steps
    
    Format your response as a JSON array of recommendation objects.`
  }

  // Default prompt for general users
  return `${basePrompt}
  
  Analyze the following data and provide actionable business recommendations:
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
  
  Format your response as a JSON array of recommendation objects.`
}

// Helper function to prepare analysis context
function prepareAnalysisContext(analysisData: AnalysisData, industry: string, userRole?: string) {
  const baseContext = {
    industry,
    keyMetrics: analysisData.metrics,
    identifiedTrends: analysisData.trends,
    anomalies: analysisData.anomalies,
    correlations: analysisData.correlations,
    industryBenchmarks: getIndustryBenchmarks(industry),
  }

  // Add role-specific context
  if (userRole === "data-engineer") {
    return {
      ...baseContext,
      engineeringFocus: {
        dataQuality: "Assess data completeness, accuracy, and consistency",
        pipelineEfficiency: "Evaluate data processing speed and resource utilization",
        architectureScalability: "Consider current and future data volume requirements",
        securityCompliance: "Review data governance and security measures",
        performanceMetrics: "Analyze query performance and system bottlenecks",
      },
    }
  }

  if (userRole === "data-scientist") {
    return {
      ...baseContext,
      analyticalFocus: {
        statisticalSignificance: "Identify statistically significant patterns",
        businessImpact: "Quantify potential business value of insights",
        modelingOpportunities: "Assess predictive modeling potential",
        visualizationNeeds: "Determine optimal data presentation methods",
        executiveInsights: "Extract high-level business intelligence",
      },
    }
  }

  return baseContext
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

// Parse recommendations from AI response with role-specific categories
function parseRecommendations(text: string, userRole?: string): Recommendation[] {
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
      category: validateCategory(rec.category, userRole),
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

// Validate category with role-specific categories
function validateCategory(category: string, userRole?: string): RecommendationCategory {
  const normalized = category?.toLowerCase() || ""

  // Data Engineer specific categories
  if (userRole === "data-engineer") {
    if (normalized.includes("pipeline")) return "pipeline"
    if (normalized.includes("architect")) return "architecture"
    if (normalized.includes("transform")) return "transformation"
    if (normalized.includes("governance") || normalized.includes("security")) return "governance"
    if (normalized.includes("performance") || normalized.includes("optim")) return "performance"
    if (normalized.includes("clean") || normalized.includes("quality")) return "cleaning"
  }

  // General categories
  if (normalized.includes("market")) return "marketing"
  if (normalized.includes("sale")) return "sales"
  if (normalized.includes("operat")) return "operations"
  if (normalized.includes("financ")) return "finance"
  return "general"
}

// Filter recommendations based on membership level
function filterRecommendationsByMembershipLevel(
  recommendations: Recommendation[],
  membershipLevel: "basic" | "pro" | "team",
): Recommendation[] {
  // All levels get the same quality recommendations, but different quantities
  let filteredRecommendations: Recommendation[]

  switch (membershipLevel) {
    case "basic":
      // Basic tier gets top 3 recommendations
      filteredRecommendations = recommendations.slice(0, 3)
      // Remove detailed information for basic users (unless they have role-specific features)
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
  membershipLevel: "basic" | "pro" | "team",
  userRole?: string,
): Promise<Recommendation[]> {
  try {
    const context = prepareAnalysisContext(analysisData, industry, userRole)
    const prompt = generateRoleSpecificPrompt(context, industry, userRole)

    const { text } = await generateText({
      model: deepinfra("mistralai/mixtral-8x7b-instruct-v0.1"),
      prompt,
      temperature: 0.3,
      maxTokens: 4000,
    })

    const recommendations = parseRecommendations(text, userRole)
    return filterRecommendationsByMembershipLevel(recommendations, membershipLevel)
  } catch (error) {
    console.error("Fallback recommendation generation failed:", error)
    return getDefaultRecommendations(industry, membershipLevel, userRole)
  }
}

// Default recommendations as a last resort
function getDefaultRecommendations(
  industry: string,
  membershipLevel: "basic" | "pro" | "team",
  userRole?: string,
): Recommendation[] {
  if (userRole === "data-engineer") {
    const engineeringRecs = [
      {
        id: "eng-default-1",
        title: "Implement automated data quality monitoring",
        description: "Set up automated checks to monitor data quality metrics and alert on anomalies in real-time.",
        impact: "High" as const,
        effort: "Medium" as const,
        category: "cleaning" as const,
        details:
          "Data quality issues can cascade through your entire pipeline. Implementing automated monitoring will catch issues early and prevent downstream problems.",
        actionSteps: [
          "Identify key data quality metrics (completeness, accuracy, consistency)",
          "Set up monitoring dashboards with alerting thresholds",
          "Implement automated data profiling on incoming data",
          "Create escalation procedures for quality issues",
        ],
      },
      {
        id: "eng-default-2",
        title: "Optimize data pipeline performance",
        description: "Analyze and optimize your data processing pipelines to reduce latency and improve throughput.",
        impact: "High" as const,
        effort: "Medium" as const,
        category: "pipeline" as const,
        details:
          "Performance bottlenecks in data pipelines can impact business operations. Optimization can reduce costs and improve data freshness.",
        actionSteps: [
          "Profile current pipeline performance and identify bottlenecks",
          "Implement parallel processing where possible",
          "Optimize data transformations and reduce unnecessary operations",
          "Consider caching strategies for frequently accessed data",
        ],
      },
      {
        id: "eng-default-3",
        title: "Enhance data governance framework",
        description: "Strengthen data governance policies and implement better access controls and audit trails.",
        impact: "Medium" as const,
        effort: "High" as const,
        category: "governance" as const,
        details: "Strong data governance ensures compliance, security, and data quality across your organization.",
        actionSteps: [
          "Document data lineage and ownership",
          "Implement role-based access controls",
          "Set up audit logging for data access and modifications",
          "Create data classification and retention policies",
        ],
      },
    ]
    return filterRecommendationsByMembershipLevel(engineeringRecs, membershipLevel)
  }

  // Default business recommendations for other roles
  const defaultRecs = [
    {
      id: "default-1",
      title: "Increase content marketing in underperforming regions",
      description:
        "Based on regional performance data, allocate more resources to content marketing in regions showing lower growth rates.",
      impact: "High" as const,
      effort: "Medium" as const,
      category: "marketing" as const,
      details: "Content marketing has shown a strong correlation with customer retention across all regions.",
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
        "The Northeast region has demonstrated 15% lower customer acquisition costs while maintaining higher conversion rates.",
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
        "Analysis shows negative ROI on paid advertising in certain channels, particularly in the Southwest region.",
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
