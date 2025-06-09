import { supabase } from "@/lib/supabase"

export interface AnalyticsDashboardData {
  overview: {
    totalUsers: number
    activeUsers: number
    totalSessions: number
    avgSessionDuration: number
    totalRevenue: number
    conversionRate: number
  }
  growth: {
    userGrowth: Array<{ date: string; users: number; newUsers: number }>
    revenueGrowth: Array<{ date: string; revenue: number; subscriptions: number }>
    retentionRate: Array<{ cohort: string; day1: number; day7: number; day30: number }>
  }
  behavior: {
    topPages: Array<{ page: string; views: number; uniqueUsers: number }>
    topFeatures: Array<{ feature: string; usage: number; users: number }>
    userJourney: Array<{ step: string; users: number; dropoffRate: number }>
  }
  business: {
    subscriptionMetrics: {
      mrr: number
      churn: number
      ltv: number
      cac: number
    }
    fileAnalytics: {
      totalFiles: number
      totalAnalyses: number
      avgProcessingTime: number
      topFileTypes: Array<{ type: string; count: number }>
    }
  }
}

export class AnalyticsDashboard {
  // Get overview metrics
  static async getOverviewMetrics(dateRange: { start: string; end: string }): Promise<
    AnalyticsDashboardData["overview"]
  > {
    try {
      // Total users
      const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

      // Active users (users with sessions in date range)
      const { count: activeUsers } = await supabase
        .from("user_sessions")
        .select("user_id", { count: "exact", head: true })
        .gte("start_time", dateRange.start)
        .lte("start_time", dateRange.end)
        .not("user_id", "is", null)

      // Total sessions
      const { count: totalSessions } = await supabase
        .from("user_sessions")
        .select("*", { count: "exact", head: true })
        .gte("start_time", dateRange.start)
        .lte("start_time", dateRange.end)

      // Average session duration
      const { data: sessionData } = await supabase
        .from("user_sessions")
        .select("duration_seconds")
        .gte("start_time", dateRange.start)
        .lte("start_time", dateRange.end)
        .not("duration_seconds", "is", null)

      const avgSessionDuration = sessionData?.length
        ? sessionData.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessionData.length
        : 0

      // Total revenue
      const { data: revenueData } = await supabase
        .from("analytics_events")
        .select("revenue")
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end)
        .not("revenue", "is", null)

      const totalRevenue = revenueData?.reduce((sum, r) => sum + (r.revenue || 0), 0) || 0

      // Conversion rate (signups to paid)
      const { count: signups } = await supabase
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("event_name", "sign_up")
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end)

      const { count: subscriptions } = await supabase
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("event_name", "subscription_started")
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end)

      const conversionRate = signups ? ((subscriptions || 0) / signups) * 100 : 0

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalSessions: totalSessions || 0,
        avgSessionDuration: Math.round(avgSessionDuration),
        totalRevenue,
        conversionRate: Math.round(conversionRate * 100) / 100,
      }
    } catch (error) {
      console.error("Error fetching overview metrics:", error)
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalSessions: 0,
        avgSessionDuration: 0,
        totalRevenue: 0,
        conversionRate: 0,
      }
    }
  }

  // Get growth metrics
  static async getGrowthMetrics(days = 30): Promise<AnalyticsDashboardData["growth"]> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      // User growth by day
      const { data: userGrowthData } = await supabase.rpc("get_daily_user_growth", {
        start_date: startDate.toISOString().split("T")[0],
        end_date: new Date().toISOString().split("T")[0],
      })

      // Revenue growth by day
      const { data: revenueGrowthData } = await supabase.rpc("get_daily_revenue_growth", {
        start_date: startDate.toISOString().split("T")[0],
        end_date: new Date().toISOString().split("T")[0],
      })

      // Retention rates (simplified)
      const retentionRate = [
        { cohort: "This Month", day1: 85, day7: 65, day30: 45 },
        { cohort: "Last Month", day1: 82, day7: 62, day30: 42 },
        { cohort: "2 Months Ago", day1: 80, day7: 60, day30: 40 },
      ]

      return {
        userGrowth: userGrowthData || [],
        revenueGrowth: revenueGrowthData || [],
        retentionRate,
      }
    } catch (error) {
      console.error("Error fetching growth metrics:", error)
      return {
        userGrowth: [],
        revenueGrowth: [],
        retentionRate: [],
      }
    }
  }

  // Get behavior metrics
  static async getBehaviorMetrics(dateRange: { start: string; end: string }): Promise<
    AnalyticsDashboardData["behavior"]
  > {
    try {
      // Top pages
      const { data: pageData } = await supabase
        .from("analytics_events")
        .select("page_url, user_id")
        .eq("event_name", "page_view")
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end)

      const pageStats =
        pageData?.reduce(
          (acc, event) => {
            const page = new URL(event.page_url || "").pathname
            if (!acc[page]) {
              acc[page] = { views: 0, users: new Set() }
            }
            acc[page].views++
            if (event.user_id) acc[page].users.add(event.user_id)
            return acc
          },
          {} as Record<string, { views: number; users: Set<string> }>,
        ) || {}

      const topPages = Object.entries(pageStats)
        .map(([page, stats]) => ({
          page,
          views: stats.views,
          uniqueUsers: stats.users.size,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10)

      // Top features
      const { data: featureData } = await supabase
        .from("analytics_events")
        .select("properties, user_id")
        .eq("event_name", "feature_used")
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end)

      const featureStats =
        featureData?.reduce(
          (acc, event) => {
            const feature = event.properties?.feature
            if (!feature) return acc
            if (!acc[feature]) {
              acc[feature] = { usage: 0, users: new Set() }
            }
            acc[feature].usage++
            if (event.user_id) acc[feature].users.add(event.user_id)
            return acc
          },
          {} as Record<string, { usage: number; users: Set<string> }>,
        ) || {}

      const topFeatures = Object.entries(featureStats)
        .map(([feature, stats]) => ({
          feature,
          usage: stats.usage,
          users: stats.users.size,
        }))
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 10)

      // User journey (simplified)
      const userJourney = [
        { step: "Landing Page", users: 1000, dropoffRate: 0 },
        { step: "Sign Up", users: 300, dropoffRate: 70 },
        { step: "Email Verification", users: 250, dropoffRate: 17 },
        { step: "First Upload", users: 180, dropoffRate: 28 },
        { step: "First Analysis", users: 150, dropoffRate: 17 },
        { step: "Subscription", users: 45, dropoffRate: 70 },
      ]

      return {
        topPages,
        topFeatures,
        userJourney,
      }
    } catch (error) {
      console.error("Error fetching behavior metrics:", error)
      return {
        topPages: [],
        topFeatures: [],
        userJourney: [],
      }
    }
  }

  // Get business metrics
  static async getBusinessMetrics(): Promise<AnalyticsDashboardData["business"]> {
    try {
      // Subscription metrics
      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("plan_type, monthly_price, status, created_at")
        .eq("status", "active")

      const mrr = subscriptions?.reduce((sum, sub) => sum + (sub.monthly_price || 0), 0) || 0
      const churn = 5.2 // Placeholder - would need complex calculation
      const ltv = 450 // Placeholder - would need complex calculation
      const cac = 85 // Placeholder - would need complex calculation

      // File analytics
      const { count: totalFiles } = await supabase.from("file_uploads").select("*", { count: "exact", head: true })

      const { count: totalAnalyses } = await supabase.from("analyses").select("*", { count: "exact", head: true })

      const { data: processingTimes } = await supabase
        .from("analyses")
        .select("processing_time")
        .not("processing_time", "is", null)

      const avgProcessingTime = processingTimes?.length
        ? processingTimes.reduce((sum, a) => sum + (a.processing_time || 0), 0) / processingTimes.length
        : 0

      const { data: fileTypes } = await supabase.from("file_uploads").select("file_type")

      const fileTypeStats =
        fileTypes?.reduce(
          (acc, file) => {
            const type = file.file_type || "unknown"
            acc[type] = (acc[type] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ) || {}

      const topFileTypes = Object.entries(fileTypeStats)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      return {
        subscriptionMetrics: {
          mrr,
          churn,
          ltv,
          cac,
        },
        fileAnalytics: {
          totalFiles: totalFiles || 0,
          totalAnalyses: totalAnalyses || 0,
          avgProcessingTime: Math.round(avgProcessingTime),
          topFileTypes,
        },
      }
    } catch (error) {
      console.error("Error fetching business metrics:", error)
      return {
        subscriptionMetrics: { mrr: 0, churn: 0, ltv: 0, cac: 0 },
        fileAnalytics: { totalFiles: 0, totalAnalyses: 0, avgProcessingTime: 0, topFileTypes: [] },
      }
    }
  }

  // Get complete dashboard data
  static async getDashboardData(dateRange?: { start: string; end: string }): Promise<AnalyticsDashboardData> {
    const defaultDateRange = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    }

    const range = dateRange || defaultDateRange

    const [overview, growth, behavior, business] = await Promise.all([
      this.getOverviewMetrics(range),
      this.getGrowthMetrics(30),
      this.getBehaviorMetrics(range),
      this.getBusinessMetrics(),
    ])

    return {
      overview,
      growth,
      behavior,
      business,
    }
  }
}
