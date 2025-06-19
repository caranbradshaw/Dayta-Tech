import { RedisService } from "./redis-service"

export interface DeepInfraResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface AIAnalysisRequest {
  text: string
  analysisType: "summary" | "insights" | "recommendations" | "sentiment" | "classification"
  context?: {
    industry?: string
    role?: string
    goals?: string[]
  }
  options?: {
    maxTokens?: number
    temperature?: number
    model?: string
  }
}

export class DeepInfraService {
  private static readonly BASE_URL = "https://api.deepinfra.com/v1/openai"
  private static readonly DEFAULT_MODEL = "meta-llama/Meta-Llama-3.1-70B-Instruct"

  // Generate AI summary using DeepInfra
  static async generateSummary(text: string, context?: { industry?: string; role?: string }): Promise<string> {
    try {
      console.log("Generating AI summary with DeepInfra...")

      // Check cache first
      const cacheKey = `deepinfra:summary:${this.hashText(text)}`
      const cached = await RedisService.redis.get(cacheKey)
      if (cached) {
        console.log("Found cached summary")
        return cached as string
      }

      const prompt = this.buildSummaryPrompt(text, context)

      const response = await fetch(`${this.BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.DEEPINFRA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.DEFAULT_MODEL,
          messages: [
            {
              role: "system",
              content: `You are an expert ${context?.industry || "business"} analyst. Provide clear, actionable summaries.`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 500,
          temperature: 0.3,
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`DeepInfra API error: ${response.statusText}`)
      }

      const result: DeepInfraResponse = await response.json()
      const summary = result.choices[0]?.message?.content || "No summary generated"

      // Cache for 1 hour
      await RedisService.redis.set(cacheKey, summary, { ex: 3600 })

      console.log(`Generated summary (${result.usage.total_tokens} tokens)`)
      return summary
    } catch (error) {
      console.error("Error generating summary:", error)
      throw error
    }
  }

  // Generate insights using DeepInfra
  static async generateInsights(request: AIAnalysisRequest): Promise<any[]> {
    try {
      console.log(`Generating ${request.analysisType} insights with DeepInfra...`)

      const prompt = this.buildInsightsPrompt(request)

      const response = await fetch(`${this.BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.DEEPINFRA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: request.options?.model || this.DEFAULT_MODEL,
          messages: [
            {
              role: "system",
              content: this.getSystemPrompt(request.analysisType, request.context),
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: request.options?.maxTokens || 1000,
          temperature: request.options?.temperature || 0.4,
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`DeepInfra API error: ${response.statusText}`)
      }

      const result: DeepInfraResponse = await response.json()
      const content = result.choices[0]?.message?.content || "[]"

      try {
        const insights = JSON.parse(content)
        console.log(`Generated ${insights.length} insights (${result.usage.total_tokens} tokens)`)
        return Array.isArray(insights) ? insights : [insights]
      } catch (parseError) {
        console.warn("Failed to parse insights JSON, returning raw content")
        return [
          {
            type: request.analysisType,
            title: `${request.analysisType.charAt(0).toUpperCase() + request.analysisType.slice(1)} Analysis`,
            content: content,
            confidence_score: 0.8,
          },
        ]
      }
    } catch (error) {
      console.error("Error generating insights:", error)
      throw error
    }
  }

  // Batch processing for multiple texts
  static async batchAnalyze(requests: AIAnalysisRequest[], options?: { concurrency?: number }): Promise<any[][]> {
    const concurrency = options?.concurrency || 3
    const results: any[][] = []

    // Process in batches to avoid rate limiting
    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency)
      const batchPromises = batch.map((request) => this.generateInsights(request))

      try {
        const batchResults = await Promise.all(batchPromises)
        results.push(...batchResults)

        // Add delay between batches
        if (i + concurrency < requests.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(`Error processing batch ${i / concurrency + 1}:`, error)
        // Add empty results for failed batch
        results.push(...batch.map(() => []))
      }
    }

    return results
  }

  // Sentiment analysis
  static async analyzeSentiment(text: string): Promise<{
    sentiment: "positive" | "negative" | "neutral"
    confidence: number
    details: string
  }> {
    try {
      const response = await fetch(`${this.BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.DEEPINFRA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.DEFAULT_MODEL,
          messages: [
            {
              role: "system",
              content:
                "You are a sentiment analysis expert. Analyze text and return JSON with sentiment, confidence, and details.",
            },
            {
              role: "user",
              content: `Analyze the sentiment of this text and return JSON format:
              {
                "sentiment": "positive|negative|neutral",
                "confidence": 0.95,
                "details": "explanation of the sentiment analysis"
              }
              
              Text: ${text}`,
            },
          ],
          max_tokens: 200,
          temperature: 0.1,
        }),
      })

      const result: DeepInfraResponse = await response.json()
      const content = result.choices[0]?.message?.content || "{}"

      try {
        return JSON.parse(content)
      } catch {
        return {
          sentiment: "neutral" as const,
          confidence: 0.5,
          details: "Unable to analyze sentiment",
        }
      }
    } catch (error) {
      console.error("Error analyzing sentiment:", error)
      return {
        sentiment: "neutral" as const,
        confidence: 0.0,
        details: "Error occurred during sentiment analysis",
      }
    }
  }

  // Helper methods
  private static buildSummaryPrompt(text: string, context?: { industry?: string; role?: string }): string {
    const industryContext = context?.industry ? ` in the ${context.industry} industry` : ""
    const roleContext = context?.role ? ` for a ${context.role}` : ""

    return `Please provide a concise, executive summary of the following data${industryContext}${roleContext}:

${text.slice(0, 4000)}

Focus on:
- Key findings and trends
- Important metrics and patterns  
- Actionable insights
- Business implications

Keep the summary under 200 words and make it actionable.`
  }

  private static buildInsightsPrompt(request: AIAnalysisRequest): string {
    const contextStr = request.context
      ? `Industry: ${request.context.industry || "General"}
Role: ${request.context.role || "Analyst"}
Goals: ${request.context.goals?.join(", ") || "General analysis"}`
      : ""

    return `Analyze the following data and generate ${request.analysisType} insights:

${contextStr ? `Context:\n${contextStr}\n\n` : ""}Data:
${request.text.slice(0, 3000)}

Return a JSON array of insights with this structure:
[
  {
    "type": "${request.analysisType}",
    "title": "Insight title",
    "content": "Detailed insight description",
    "confidence_score": 0.95,
    "category": "relevant category",
    "impact": "High|Medium|Low"
  }
]

Generate 3-5 high-quality insights.`
  }

  private static getSystemPrompt(analysisType: string, context?: any): string {
    const industry = context?.industry || "business"
    const role = context?.role || "analyst"

    const prompts = {
      summary: `You are an expert ${industry} ${role}. Provide clear, concise summaries that highlight key findings and actionable insights.`,
      insights: `You are a senior ${industry} ${role}. Generate deep, actionable insights that reveal patterns, trends, and opportunities in data.`,
      recommendations: `You are a strategic ${industry} consultant. Provide specific, actionable recommendations with clear implementation steps and expected outcomes.`,
      sentiment: `You are a sentiment analysis expert specializing in ${industry} communications. Analyze emotional tone and business implications.`,
      classification: `You are a data classification expert in ${industry}. Categorize and structure information for optimal business use.`,
    }

    return prompts[analysisType as keyof typeof prompts] || prompts.insights
  }

  private static hashText(text: string): string {
    // Simple hash function for caching
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  // Get available models
  static async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/models`, {
        headers: {
          Authorization: `Bearer ${process.env.DEEPINFRA_API_KEY}`,
        },
      })

      if (!response.ok) {
        throw new Error(`DeepInfra API error: ${response.statusText}`)
      }

      const result = await response.json()
      return result.data?.map((model: any) => model.id) || []
    } catch (error) {
      console.error("Error fetching available models:", error)
      return [this.DEFAULT_MODEL]
    }
  }

  // Usage statistics
  static async getUsageStats(): Promise<any> {
    // This would typically come from DeepInfra's usage API
    // For now, we'll return cached stats from Redis
    try {
      const stats = await RedisService.redis.get("deepinfra:usage:stats")
      return stats ? JSON.parse(stats as string) : null
    } catch (error) {
      console.error("Error fetching usage stats:", error)
      return null
    }
  }
}
