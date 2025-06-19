import { neon } from "@neondatabase/serverless"
import { Pool } from "pg"

// Initialize Neon SQL client (serverless)
const sql = neon(process.env.DATABASE_URL!)

// Initialize traditional Pool for complex operations
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

export interface InsightRecord {
  id: string
  report_id: string
  insight_type: string
  title: string
  content: string
  confidence_score: number
  ai_model: string
  created_at: string
  metadata?: any
}

export interface AnalysisRecord {
  id: string
  user_id: string
  file_name: string
  analysis_type: string
  status: string
  summary: string
  insights_count: number
  recommendations_count: number
  processing_time_ms: number
  ai_provider: string
  created_at: string
  updated_at: string
}

export class NeonService {
  // High-speed insight retrieval
  static async getInsightsByReportId(reportId: string): Promise<InsightRecord[]> {
    try {
      console.log(`Fetching insights for report: ${reportId}`)

      // Use Neon serverless for ultra-fast queries
      const result = await sql`
        SELECT 
          id, report_id, insight_type, title, content, 
          confidence_score, ai_model, created_at, metadata
        FROM insights 
        WHERE report_id = ${reportId}
        ORDER BY confidence_score DESC, created_at DESC
      `

      return result as InsightRecord[]
    } catch (error) {
      console.error("Error fetching insights:", error)
      throw error
    }
  }

  // Fast analysis lookup with caching
  static async getAnalysisById(analysisId: string): Promise<AnalysisRecord | null> {
    try {
      const result = await sql`
        SELECT 
          id, user_id, file_name, analysis_type, status,
          summary, insights_count, recommendations_count,
          processing_time_ms, ai_provider, created_at, updated_at
        FROM analyses 
        WHERE id = ${analysisId}
        LIMIT 1
      `

      return (result[0] as AnalysisRecord) || null
    } catch (error) {
      console.error("Error fetching analysis:", error)
      return null
    }
  }

  // Bulk insert insights (high performance)
  static async bulkInsertInsights(insights: Omit<InsightRecord, "id" | "created_at">[]): Promise<void> {
    if (insights.length === 0) return

    try {
      console.log(`Bulk inserting ${insights.length} insights`)

      // Use traditional pool for complex operations
      const client = await pool.connect()

      try {
        await client.query("BEGIN")

        const insertQuery = `
          INSERT INTO insights (
            report_id, insight_type, title, content, 
            confidence_score, ai_model, metadata, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        `

        for (const insight of insights) {
          await client.query(insertQuery, [
            insight.report_id,
            insight.insight_type,
            insight.title,
            insight.content,
            insight.confidence_score,
            insight.ai_model,
            JSON.stringify(insight.metadata || {}),
          ])
        }

        await client.query("COMMIT")
        console.log(`Successfully inserted ${insights.length} insights`)
      } catch (error) {
        await client.query("ROLLBACK")
        throw error
      } finally {
        client.release()
      }
    } catch (error) {
      console.error("Error bulk inserting insights:", error)
      throw error
    }
  }

  // Advanced analytics queries
  static async getAnalyticsData(userId: string, timeRange: "7d" | "30d" | "90d" = "30d"): Promise<any> {
    try {
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90

      const result = await sql`
        WITH analysis_stats AS (
          SELECT 
            DATE_TRUNC('day', created_at) as date,
            COUNT(*) as analyses_count,
            AVG(processing_time_ms) as avg_processing_time,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
            COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
          FROM analyses 
          WHERE user_id = ${userId}
            AND created_at >= NOW() - INTERVAL '${days} days'
          GROUP BY DATE_TRUNC('day', created_at)
          ORDER BY date DESC
        ),
        insight_stats AS (
          SELECT 
            DATE_TRUNC('day', i.created_at) as date,
            COUNT(*) as insights_count,
            AVG(i.confidence_score) as avg_confidence,
            COUNT(DISTINCT i.insight_type) as unique_types
          FROM insights i
          JOIN analyses a ON i.report_id = a.id
          WHERE a.user_id = ${userId}
            AND i.created_at >= NOW() - INTERVAL '${days} days'
          GROUP BY DATE_TRUNC('day', i.created_at)
        )
        SELECT 
          COALESCE(a.date, i.date) as date,
          COALESCE(a.analyses_count, 0) as analyses_count,
          COALESCE(a.avg_processing_time, 0) as avg_processing_time,
          COALESCE(a.completed_count, 0) as completed_count,
          COALESCE(a.failed_count, 0) as failed_count,
          COALESCE(i.insights_count, 0) as insights_count,
          COALESCE(i.avg_confidence, 0) as avg_confidence,
          COALESCE(i.unique_types, 0) as unique_types
        FROM analysis_stats a
        FULL OUTER JOIN insight_stats i ON a.date = i.date
        ORDER BY date DESC
      `

      return result
    } catch (error) {
      console.error("Error fetching analytics data:", error)
      throw error
    }
  }

  // Real-time search across insights
  static async searchInsights(
    userId: string,
    query: string,
    filters?: {
      insightType?: string
      minConfidence?: number
      dateRange?: { start: string; end: string }
    },
  ): Promise<InsightRecord[]> {
    try {
      let whereClause = `a.user_id = ${userId} AND (i.title ILIKE '%${query}%' OR i.content ILIKE '%${query}%')`

      if (filters?.insightType) {
        whereClause += ` AND i.insight_type = '${filters.insightType}'`
      }

      if (filters?.minConfidence) {
        whereClause += ` AND i.confidence_score >= ${filters.minConfidence}`
      }

      if (filters?.dateRange) {
        whereClause += ` AND i.created_at BETWEEN '${filters.dateRange.start}' AND '${filters.dateRange.end}'`
      }

      const result = await sql`
        SELECT 
          i.id, i.report_id, i.insight_type, i.title, i.content,
          i.confidence_score, i.ai_model, i.created_at, i.metadata
        FROM insights i
        JOIN analyses a ON i.report_id = a.id
        WHERE ${sql.unsafe(whereClause)}
        ORDER BY i.confidence_score DESC, i.created_at DESC
        LIMIT 50
      `

      return result as InsightRecord[]
    } catch (error) {
      console.error("Error searching insights:", error)
      throw error
    }
  }

  // Performance monitoring
  static async getDatabaseStats(): Promise<any> {
    try {
      const result = await sql`
        SELECT 
          (SELECT COUNT(*) FROM analyses) as total_analyses,
          (SELECT COUNT(*) FROM insights) as total_insights,
          (SELECT COUNT(*) FROM profiles) as total_users,
          (SELECT AVG(processing_time_ms) FROM analyses WHERE status = 'completed') as avg_processing_time,
          (SELECT COUNT(*) FROM analyses WHERE created_at >= NOW() - INTERVAL '24 hours') as analyses_last_24h,
          (SELECT COUNT(*) FROM insights WHERE created_at >= NOW() - INTERVAL '24 hours') as insights_last_24h
      `

      return result[0]
    } catch (error) {
      console.error("Error fetching database stats:", error)
      throw error
    }
  }

  // Connection health check
  static async healthCheck(): Promise<{ status: string; latency: number; timestamp: string }> {
    const startTime = Date.now()

    try {
      await sql`SELECT 1 as health_check`
      const latency = Date.now() - startTime

      return {
        status: "healthy",
        latency,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        status: "unhealthy",
        latency: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      }
    }
  }
}

// Export both clients for different use cases
export { sql, pool }
