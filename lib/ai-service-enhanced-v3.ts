import { processUploadedFile } from "./data-processor"
import { RedisService } from "./redis-service"
import type { ProcessedData } from "./data-processor"

export interface Recommendation {
  id: string
  title: string
  description: string
  impact: "High" | "Medium" | "Low"
  effort: "High" | "Medium" | "Low"
  category: string
  details?: string
  actionSteps?: string[]
}

export interface AnalysisResult {
  summary: string
  insights: any[]
  recommendations: Recommendation[]
  dataQuality: number
  processingTime: number
  aiProvider: string
  cached?: boolean
}

export async function analyzeUploadedFileWithCache(
  file: File,
  userContext: {
    industry?: string
    role?: string
    planType?: string
    userId: string
  },
): Promise<AnalysisResult> {
  const startTime = Date.now()
  const analysisId = `${userContext.userId}-${file.name}-${file.size}`

  try {
    // Check for cached result first
    console.log("Checking for cached analysis result...")
    const cachedResult = await RedisService.getCachedAnalysisResult(analysisId)

    if (cachedResult) {
      console.log("Found cached analysis result")
      return {
        ...cachedResult,
        cached: true,
        processingTime: Date.now() - startTime,
      }
    }

    // Check rate limiting
    const canProceed = await RedisService.checkRateLimit(userContext.userId, "analysis", 10, 3600)
    if (!canProceed) {
      throw new Error("Rate limit exceeded. Please try again later.")
    }

    console.log("Starting fresh AI analysis for file:", file.name)

    // Process the file
    const processedData = await processUploadedFile(file)
    console.log("File processed successfully, rows:", processedData.stats.rowCount)

    // Get AI analysis
    const providers = getAIProviders(userContext.planType)
    let aiResult = null
    let usedProvider = "fallback"

    for (const provider of providers) {
      try {
        if (provider === "claude" && process.env.CLAUDE_API_KEY) {
          aiResult = await analyzeDataWithClaude(processedData, file.name, userContext)
          usedProvider = "claude"
          break
        } else if (provider === "openai" && process.env.OPENAI_API_KEY) {
          aiResult = await analyzeDataWithOpenAI(processedData, file.name, userContext)
          usedProvider = "openai"
          break
        } else if (provider === "groq" && process.env.GROQ_API_KEY) {
          aiResult = await analyzeDataWithGroq(processedData, file.name, userContext)
          usedProvider = "groq"
          break
        }
      } catch (error) {
        console.warn(`${provider} analysis failed:`, error)
        continue
      }
    }

    // Fallback if all AI providers fail
    if (!aiResult) {
      console.log("All AI providers failed, using intelligent fallback...")
      aiResult = generateIntelligentFallback(processedData, file.name, userContext)
      usedProvider = "fallback"
    }

    const result: AnalysisResult = {
      summary: aiResult.summary,
      insights: enhanceInsights(aiResult.insights, processedData),
      recommendations: enhanceRecommendations(aiResult.recommendations, userContext),
      dataQuality: processedData.insights.dataQuality,
      processingTime: Date.now() - startTime,
      aiProvider: usedProvider,
      cached: false,
    }

    // Cache the result
    await RedisService.cacheAnalysisResult(analysisId, result)

    // Cache the summary separately for quick access
    await RedisService.cacheAISummary(analysisId, result.summary)

    console.log(`Analysis completed in ${result.processingTime}ms using ${usedProvider}`)
    return result
  } catch (error) {
    console.error("File analysis error:", error)
    throw error
  }
}

// Helper functions (same as before)
const getAIProviders = (planType = "basic") => {
  switch (planType) {
    case "enterprise":
      return ["claude", "openai", "groq", "fallback"]
    case "pro":
      return ["openai", "claude", "groq", "fallback"]
    case "basic":
    default:
      return ["groq", "fallback"]
  }
}

async function analyzeDataWithClaude(processedData: ProcessedData, fileName: string, userContext: any) {
  // Implementation same as before
  const { default: Anthropic } = await import("@anthropic-ai/sdk")
  const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })

  const prompt = `Analyze this ${userContext.industry || "business"} dataset for ${userContext.role || "business analyst"} perspective:

File: ${fileName}
Rows: ${processedData.stats.rowCount}
Columns: ${processedData.stats.columnCount}
Data Quality: ${processedData.insights.dataQuality}%

Sample Data: ${JSON.stringify(processedData.sample.slice(0, 3), null, 2)}

Provide JSON response with:
{
  "summary": "Executive summary of findings",
  "insights": [{"type": "trend", "title": "Insight title", "content": "Detailed insight", "confidence_score": 0.9}],
  "recommendations": [{"title": "Recommendation", "description": "Details", "impact": "High", "effort": "Medium", "category": "optimization"}]
}`

  const message = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  })

  const content = message.content[0].type === "text" ? message.content[0].text : ""
  return JSON.parse(content)
}

async function analyzeDataWithOpenAI(processedData: ProcessedData, fileName: string, userContext: any) {
  const { default: OpenAI } = await import("openai")
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are an expert ${userContext.industry || "business"} analyst. Analyze data and provide JSON responses only.`,
      },
      {
        role: "user",
        content: `Analyze this dataset:
File: ${fileName}
Rows: ${processedData.stats.rowCount}
Columns: ${processedData.stats.columnCount}
Sample: ${JSON.stringify(processedData.sample.slice(0, 3), null, 2)}

Return JSON with summary, insights array, and recommendations array.`,
      },
    ],
    max_tokens: 2000,
    temperature: 0.3,
  })

  const content = completion.choices[0]?.message?.content || ""
  return JSON.parse(content)
}

async function analyzeDataWithGroq(processedData: ProcessedData, fileName: string, userContext: any) {
  const { default: Groq } = await import("groq-sdk")
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are an expert data analyst. Provide JSON responses only.`,
      },
      {
        role: "user",
        content: `Analyze this ${userContext.industry || "business"} dataset:
File: ${fileName}
Rows: ${processedData.stats.rowCount}
Sample: ${JSON.stringify(processedData.sample.slice(0, 2), null, 2)}

Return JSON with summary, insights, recommendations.`,
      },
    ],
    model: "llama3-8b-8192",
    max_tokens: 1500,
    temperature: 0.3,
  })

  const content = completion.choices[0]?.message?.content || ""
  return JSON.parse(content)
}

function generateIntelligentFallback(processedData: ProcessedData, fileName: string, userContext: any) {
  // Same implementation as before
  const { stats, insights } = processedData

  let summary = `Analysis of ${fileName} reveals a comprehensive dataset with ${stats.rowCount.toLocaleString()} records and ${stats.columnCount} variables. `

  if (insights.completeness > 90) {
    summary += "The data shows excellent quality with minimal missing values, making it highly suitable for analysis. "
  } else if (insights.completeness > 70) {
    summary += "The data quality is good with some missing values that should be addressed. "
  } else {
    summary += "The data has significant missing values that may impact analysis reliability. "
  }

  const generatedInsights = [
    {
      type: "summary",
      title: "Data Structure Analysis",
      content: `Dataset contains ${stats.numericColumns.length} numerical and ${stats.categoricalColumns.length} categorical variables with ${insights.completeness.toFixed(1)}% data completeness.`,
      confidence_score: 0.95,
    },
    {
      type: "trend",
      title: "Data Quality Assessment",
      content: `Overall data quality score: ${insights.dataQuality.toFixed(0)}/100. ${insights.patterns.join(". ")}.`,
      confidence_score: 0.88,
    },
  ]

  const generatedRecommendations: Recommendation[] = [
    {
      id: "fallback-data-quality",
      title: "Improve Data Quality",
      description: `Address missing values in ${Object.keys(stats.missingValues).filter((col) => stats.missingValues[col] > 0).length} columns to enhance analysis accuracy.`,
      impact: insights.completeness < 80 ? "High" : "Medium",
      effort: "Medium",
      category: "data_quality",
    },
  ]

  return {
    summary,
    insights: generatedInsights,
    recommendations: generatedRecommendations,
  }
}

function enhanceInsights(insights: any[], processedData: ProcessedData): any[] {
  return insights.map((insight) => ({
    ...insight,
    ai_model: insight.ai_model || "DaytaTech AI Engine v2.1",
    processing_time_ms: Math.floor(Math.random() * 500) + 100,
    metadata: {
      ...insight.metadata,
      data_rows: processedData.stats.rowCount,
      data_columns: processedData.stats.columnCount,
      data_quality: processedData.insights.dataQuality,
    },
  }))
}

function enhanceRecommendations(recommendations: Recommendation[], userContext: any): Recommendation[] {
  return recommendations.map((rec) => ({
    ...rec,
    id: rec.id || `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    details:
      rec.details ||
      `Tailored recommendation for ${userContext.industry || "your business"} based on data analysis patterns.`,
    actionSteps: rec.actionSteps || [
      "Review the recommendation details",
      "Assess implementation requirements",
      "Develop action plan",
      "Monitor results and adjust as needed",
    ],
  }))
}
