import * as fal from "@fal-ai/serverless"
import { RedisService } from "./redis-service"

// Configure FAL with API key
fal.config({
  credentials: process.env.FAL_KEY,
})

export interface FALTaskResult {
  taskId: string
  status: "queued" | "processing" | "completed" | "failed"
  result?: any
  error?: string
  progress?: number
  estimatedTime?: number
}

export interface PDFGenerationInput {
  reportId: string
  reportData: {
    title: string
    summary: string
    insights: any[]
    recommendations: any[]
    charts?: any[]
    metadata: any
  }
  template?: "standard" | "executive" | "detailed"
  branding?: {
    logo?: string
    colors?: {
      primary: string
      secondary: string
    }
  }
}

export interface ReportAnalysisInput {
  reportId: string
  data: any[]
  analysisType: "comprehensive" | "quick" | "custom"
  userContext: {
    industry?: string
    role?: string
    goals?: string[]
  }
  options?: {
    includeVisualizations?: boolean
    includeRecommendations?: boolean
    detailLevel?: "basic" | "intermediate" | "advanced"
  }
}

export class FALService {
  // Submit PDF generation task to FAL
  static async submitPDFGeneration(input: PDFGenerationInput): Promise<FALTaskResult> {
    try {
      console.log(`Submitting PDF generation task for report: ${input.reportId}`)

      // Submit to FAL endpoint for PDF generation
      const response = await fetch("https://fal.run/fal-ai/pdf-generator", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.FAL_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId: input.reportId,
          reportData: input.reportData,
          template: input.template || "standard",
          branding: input.branding,
          options: {
            format: "A4",
            orientation: "portrait",
            includeCharts: true,
            includeWatermark: false,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`FAL API error: ${response.statusText}`)
      }

      const result = await response.json()

      // Store task info in Redis for tracking
      await RedisService.redis.set(
        `fal:pdf:${input.reportId}`,
        JSON.stringify({
          taskId: result.request_id,
          status: "queued",
          submittedAt: new Date().toISOString(),
          reportId: input.reportId,
        }),
        { ex: 3600 }, // 1 hour expiry
      )

      return {
        taskId: result.request_id,
        status: "queued",
        estimatedTime: 120, // 2 minutes estimated
      }
    } catch (error) {
      console.error("Error submitting PDF generation task:", error)
      throw error
    }
  }

  // Submit report analysis task to FAL
  static async submitReportAnalysis(input: ReportAnalysisInput): Promise<FALTaskResult> {
    try {
      console.log(`Submitting analysis task for report: ${input.reportId}`)

      // Submit to FAL endpoint for heavy analysis
      const response = await fetch("https://fal.run/fal-ai/data-analyzer", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.FAL_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId: input.reportId,
          data: input.data.slice(0, 10000), // Limit data size for API
          analysisType: input.analysisType,
          userContext: input.userContext,
          options: {
            ...input.options,
            aiModels: ["gpt-4", "claude-3", "llama-2"],
            includeStatisticalAnalysis: true,
            generateVisualizations: input.options?.includeVisualizations ?? true,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`FAL API error: ${response.statusText}`)
      }

      const result = await response.json()

      // Store task info in Redis
      await RedisService.redis.set(
        `fal:analysis:${input.reportId}`,
        JSON.stringify({
          taskId: result.request_id,
          status: "queued",
          submittedAt: new Date().toISOString(),
          reportId: input.reportId,
          analysisType: input.analysisType,
        }),
        { ex: 7200 }, // 2 hours expiry
      )

      return {
        taskId: result.request_id,
        status: "queued",
        estimatedTime: input.analysisType === "comprehensive" ? 300 : 120, // 5 min or 2 min
      }
    } catch (error) {
      console.error("Error submitting analysis task:", error)
      throw error
    }
  }

  // Check task status using FAL
  static async checkTaskStatus(taskId: string, taskType: "pdf" | "analysis"): Promise<FALTaskResult> {
    try {
      // Get status from FAL
      const result = await fal.queue.status("fal-ai/pdf-generator", {
        requestId: taskId,
      })

      const status = this.mapFALStatus(result.status)

      // Update Redis cache
      const redisKey = taskType === "pdf" ? `fal:pdf:${taskId}` : `fal:analysis:${taskId}`
      const cachedData = await RedisService.redis.get(redisKey)

      if (cachedData) {
        const parsed = JSON.parse(cachedData as string)
        await RedisService.redis.set(
          redisKey,
          JSON.stringify({
            ...parsed,
            status,
            lastChecked: new Date().toISOString(),
            progress: this.calculateProgress(status),
          }),
          { ex: 3600 },
        )
      }

      return {
        taskId,
        status,
        result: result.status === "COMPLETED" ? result.data : undefined,
        error: result.status === "FAILED" ? result.error : undefined,
        progress: this.calculateProgress(status),
      }
    } catch (error) {
      console.error("Error checking task status:", error)
      return {
        taskId,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Get task result when completed
  static async getTaskResult(taskId: string, taskType: "pdf" | "analysis"): Promise<any> {
    try {
      const result = await fal.queue.result("fal-ai/pdf-generator", {
        requestId: taskId,
      })

      if (taskType === "pdf") {
        // Handle PDF result
        return {
          pdfUrl: result.pdf_url,
          downloadUrl: result.download_url,
          metadata: result.metadata,
          generatedAt: new Date().toISOString(),
        }
      } else {
        // Handle analysis result
        return {
          summary: result.summary,
          insights: result.insights,
          recommendations: result.recommendations,
          visualizations: result.charts,
          statistics: result.statistical_analysis,
          confidence: result.confidence_score,
          processingTime: result.processing_time_ms,
          aiModelsUsed: result.ai_models_used,
          generatedAt: new Date().toISOString(),
        }
      }
    } catch (error) {
      console.error("Error getting task result:", error)
      throw error
    }
  }

  // Submit custom AI task
  static async submitCustomTask(endpoint: string, payload: any): Promise<FALTaskResult> {
    try {
      const response = await fetch(`https://fal.run/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.FAL_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`FAL API error: ${response.statusText}`)
      }

      const result = await response.json()

      return {
        taskId: result.request_id,
        status: "queued",
        result: result.data,
      }
    } catch (error) {
      console.error("Error submitting custom task:", error)
      throw error
    }
  }

  // Helper methods
  private static mapFALStatus(falStatus: string): "queued" | "processing" | "completed" | "failed" {
    switch (falStatus.toUpperCase()) {
      case "IN_QUEUE":
        return "queued"
      case "IN_PROGRESS":
        return "processing"
      case "COMPLETED":
        return "completed"
      case "FAILED":
        return "failed"
      default:
        return "queued"
    }
  }

  private static calculateProgress(status: string): number {
    switch (status) {
      case "queued":
        return 10
      case "processing":
        return 50
      case "completed":
        return 100
      case "failed":
        return 0
      default:
        return 0
    }
  }

  // Batch operations
  static async submitBatchAnalysis(reports: ReportAnalysisInput[]): Promise<FALTaskResult[]> {
    const results = []

    for (const report of reports) {
      try {
        const result = await this.submitReportAnalysis(report)
        results.push(result)
        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Error submitting batch analysis for ${report.reportId}:`, error)
        results.push({
          taskId: "",
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return results
  }

  // Monitor all active tasks
  static async getActiveTasks(): Promise<{ pdf: any[]; analysis: any[] }> {
    try {
      const pdfKeys = await RedisService.redis.keys("fal:pdf:*")
      const analysisKeys = await RedisService.redis.keys("fal:analysis:*")

      const pdfTasks = []
      const analysisTasks = []

      // Get PDF tasks
      for (const key of pdfKeys) {
        const data = await RedisService.redis.get(key)
        if (data) {
          pdfTasks.push(JSON.parse(data as string))
        }
      }

      // Get analysis tasks
      for (const key of analysisKeys) {
        const data = await RedisService.redis.get(key)
        if (data) {
          analysisTasks.push(JSON.parse(data as string))
        }
      }

      return {
        pdf: pdfTasks,
        analysis: analysisTasks,
      }
    } catch (error) {
      console.error("Error getting active tasks:", error)
      return { pdf: [], analysis: [] }
    }
  }
}

export { fal }
