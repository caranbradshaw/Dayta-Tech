import { Redis } from "@upstash/redis"

// Initialize Redis client
const redis = Redis.fromEnv()

export class RedisService {
  // Cache AI summaries
  static async cacheAISummary(reportId: string, summary: string): Promise<void> {
    try {
      await redis.set(`ai:summary:${reportId}`, summary, { ex: 3600 }) // 1 hour cache
      console.log(`Cached AI summary for report: ${reportId}`)
    } catch (error) {
      console.error("Error caching AI summary:", error)
    }
  }

  // Get cached AI summary
  static async getCachedAISummary(reportId: string): Promise<string | null> {
    try {
      const result = await redis.get(`ai:summary:${reportId}`)
      return result as string | null
    } catch (error) {
      console.error("Error getting cached AI summary:", error)
      return null
    }
  }

  // Add PDF generation job to queue
  static async addPDFJob(reportId: string): Promise<void> {
    try {
      await redis.lpush("jobs:pdf", reportId)
      await redis.set(`pdf:status:${reportId}`, "queued", { ex: 7200 }) // 2 hour expiry
      console.log(`Added PDF job to queue: ${reportId}`)
    } catch (error) {
      console.error("Error adding PDF job:", error)
    }
  }

  // Get PDF generation status
  static async getPDFStatus(reportId: string): Promise<string | null> {
    try {
      const result = await redis.get(`pdf:status:${reportId}`)
      return result as string | null
    } catch (error) {
      console.error("Error getting PDF status:", error)
      return null
    }
  }

  // Update PDF status
  static async updatePDFStatus(
    reportId: string,
    status: "queued" | "processing" | "completed" | "failed",
  ): Promise<void> {
    try {
      await redis.set(`pdf:status:${reportId}`, status, { ex: 7200 })
      console.log(`Updated PDF status for ${reportId}: ${status}`)
    } catch (error) {
      console.error("Error updating PDF status:", error)
    }
  }

  // Process PDF queue (for background jobs)
  static async processPDFQueue(): Promise<string[]> {
    try {
      const jobs = await redis.lrange("jobs:pdf", 0, 9) // Get up to 10 jobs
      if (jobs.length > 0) {
        // Remove processed jobs from queue
        await redis.ltrim("jobs:pdf", jobs.length, -1)
      }
      return jobs as string[]
    } catch (error) {
      console.error("Error processing PDF queue:", error)
      return []
    }
  }

  // Cache analysis results
  static async cacheAnalysisResult(analysisId: string, result: any): Promise<void> {
    try {
      await redis.set(`analysis:${analysisId}`, JSON.stringify(result), { ex: 1800 }) // 30 minutes
      console.log(`Cached analysis result: ${analysisId}`)
    } catch (error) {
      console.error("Error caching analysis result:", error)
    }
  }

  // Get cached analysis result
  static async getCachedAnalysisResult(analysisId: string): Promise<any | null> {
    try {
      const result = await redis.get(`analysis:${analysisId}`)
      return result ? JSON.parse(result as string) : null
    } catch (error) {
      console.error("Error getting cached analysis result:", error)
      return null
    }
  }

  // Rate limiting
  static async checkRateLimit(userId: string, action: string, limit = 10, window = 3600): Promise<boolean> {
    try {
      const key = `rate_limit:${userId}:${action}`
      const current = await redis.incr(key)

      if (current === 1) {
        await redis.expire(key, window)
      }

      return current <= limit
    } catch (error) {
      console.error("Error checking rate limit:", error)
      return true // Allow on error
    }
  }

  // Session management
  static async storeUserSession(sessionId: string, userData: any): Promise<void> {
    try {
      await redis.set(`session:${sessionId}`, JSON.stringify(userData), { ex: 86400 }) // 24 hours
    } catch (error) {
      console.error("Error storing user session:", error)
    }
  }

  // Get user session
  static async getUserSession(sessionId: string): Promise<any | null> {
    try {
      const result = await redis.get(`session:${sessionId}`)
      return result ? JSON.parse(result as string) : null
    } catch (error) {
      console.error("Error getting user session:", error)
      return null
    }
  }
}

export { redis }
