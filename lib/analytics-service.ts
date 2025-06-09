import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/database.types"

type AnalyticsEvent = Database["public"]["Tables"]["analytics_events"]["Insert"]
type UserSession = Database["public"]["Tables"]["user_sessions"]["Insert"]

export interface EventData {
  event_name: string
  user_id?: string
  session_id?: string
  page_url?: string
  referrer?: string
  user_agent?: string
  ip_address?: string
  properties?: Record<string, any>
  revenue?: number
}

export interface SessionData {
  user_id?: string
  session_id: string
  start_time: string
  end_time?: string
  page_views: number
  events_count: number
  duration_seconds?: number
  device_type?: string
  browser?: string
  os?: string
  country?: string
  city?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}

class AnalyticsService {
  private static instance: AnalyticsService
  private sessionId: string | null = null
  private sessionStartTime: Date | null = null
  private pageViews = 0
  private eventsCount = 0

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  // Initialize session tracking
  async initializeSession(userId?: string): Promise<string> {
    this.sessionId = this.generateSessionId()
    this.sessionStartTime = new Date()
    this.pageViews = 0
    this.eventsCount = 0

    const sessionData: SessionData = {
      user_id: userId,
      session_id: this.sessionId,
      start_time: this.sessionStartTime.toISOString(),
      page_views: 0,
      events_count: 0,
      device_type: this.getDeviceType(),
      browser: this.getBrowser(),
      os: this.getOS(),
      ...this.getUTMParams(),
    }

    try {
      await supabase.from("user_sessions").insert(sessionData)
    } catch (error) {
      console.error("Failed to initialize session:", error)
    }

    return this.sessionId
  }

  // Track events
  async trackEvent(eventData: Partial<EventData>): Promise<void> {
    if (!this.sessionId) {
      await this.initializeSession(eventData.user_id)
    }

    this.eventsCount++

    const event: AnalyticsEvent = {
      event_name: eventData.event_name || "unknown",
      user_id: eventData.user_id,
      session_id: this.sessionId,
      page_url: eventData.page_url || window.location.href,
      referrer: eventData.referrer || document.referrer,
      user_agent: navigator.userAgent,
      ip_address: await this.getClientIP(),
      properties: eventData.properties || {},
      revenue: eventData.revenue,
      created_at: new Date().toISOString(),
    }

    try {
      await supabase.from("analytics_events").insert(event)
      await this.updateSession()
    } catch (error) {
      console.error("Failed to track event:", error)
    }
  }

  // Track page views
  async trackPageView(url?: string, userId?: string): Promise<void> {
    this.pageViews++

    await this.trackEvent({
      event_name: "page_view",
      user_id: userId,
      page_url: url || window.location.href,
      properties: {
        title: document.title,
        path: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      },
    })
  }

  // Track user actions
  async trackUserAction(action: string, userId?: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      event_name: "user_action",
      user_id: userId,
      properties: {
        action,
        ...properties,
      },
    })
  }

  // Track business events
  async trackBusinessEvent(
    event: string,
    userId?: string,
    revenue?: number,
    properties?: Record<string, any>,
  ): Promise<void> {
    await this.trackEvent({
      event_name: event,
      user_id: userId,
      revenue,
      properties,
    })
  }

  // End session
  async endSession(): Promise<void> {
    if (!this.sessionId || !this.sessionStartTime) return

    const endTime = new Date()
    const duration = Math.floor((endTime.getTime() - this.sessionStartTime.getTime()) / 1000)

    try {
      await supabase
        .from("user_sessions")
        .update({
          end_time: endTime.toISOString(),
          duration_seconds: duration,
          page_views: this.pageViews,
          events_count: this.eventsCount,
        })
        .eq("session_id", this.sessionId)
    } catch (error) {
      console.error("Failed to end session:", error)
    }
  }

  // Update session stats
  private async updateSession(): Promise<void> {
    if (!this.sessionId) return

    try {
      await supabase
        .from("user_sessions")
        .update({
          page_views: this.pageViews,
          events_count: this.eventsCount,
        })
        .eq("session_id", this.sessionId)
    } catch (error) {
      console.error("Failed to update session:", error)
    }
  }

  // Utility methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase()
    if (/tablet|ipad|playbook|silk/.test(userAgent)) return "tablet"
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(userAgent))
      return "mobile"
    return "desktop"
  }

  private getBrowser(): string {
    const userAgent = navigator.userAgent
    if (userAgent.includes("Chrome")) return "Chrome"
    if (userAgent.includes("Firefox")) return "Firefox"
    if (userAgent.includes("Safari")) return "Safari"
    if (userAgent.includes("Edge")) return "Edge"
    return "Other"
  }

  private getOS(): string {
    const userAgent = navigator.userAgent
    if (userAgent.includes("Windows")) return "Windows"
    if (userAgent.includes("Mac")) return "macOS"
    if (userAgent.includes("Linux")) return "Linux"
    if (userAgent.includes("Android")) return "Android"
    if (userAgent.includes("iOS")) return "iOS"
    return "Other"
  }

  private getUTMParams(): { utm_source?: string; utm_medium?: string; utm_campaign?: string } {
    const urlParams = new URLSearchParams(window.location.search)
    return {
      utm_source: urlParams.get("utm_source") || undefined,
      utm_medium: urlParams.get("utm_medium") || undefined,
      utm_campaign: urlParams.get("utm_campaign") || undefined,
    }
  }

  private async getClientIP(): Promise<string | null> {
    try {
      const response = await fetch("https://api.ipify.org?format=json")
      const data = await response.json()
      return data.ip
    } catch {
      return null
    }
  }
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance()

// Predefined event tracking functions
export const trackEvents = {
  // Authentication events
  signUp: (userId: string, method = "email") => analytics.trackBusinessEvent("sign_up", userId, undefined, { method }),

  signIn: (userId: string, method = "email") => analytics.trackUserAction("sign_in", userId, { method }),

  signOut: (userId: string) => analytics.trackUserAction("sign_out", userId),

  // Subscription events
  subscriptionStarted: (userId: string, plan: string, revenue: number) =>
    analytics.trackBusinessEvent("subscription_started", userId, revenue, { plan }),

  subscriptionUpgraded: (userId: string, oldPlan: string, newPlan: string, revenue: number) =>
    analytics.trackBusinessEvent("subscription_upgraded", userId, revenue, { oldPlan, newPlan }),

  subscriptionCancelled: (userId: string, plan: string) =>
    analytics.trackBusinessEvent("subscription_cancelled", userId, undefined, { plan }),

  // File and analysis events
  fileUploaded: (userId: string, fileName: string, fileSize: number, fileType: string) =>
    analytics.trackUserAction("file_uploaded", userId, { fileName, fileSize, fileType }),

  analysisStarted: (userId: string, analysisId: string, fileType: string) =>
    analytics.trackUserAction("analysis_started", userId, { analysisId, fileType }),

  analysisCompleted: (userId: string, analysisId: string, processingTime: number, aiProvider: string) =>
    analytics.trackUserAction("analysis_completed", userId, { analysisId, processingTime, aiProvider }),

  insightViewed: (userId: string, insightId: string, insightType: string) =>
    analytics.trackUserAction("insight_viewed", userId, { insightId, insightType }),

  reportExported: (userId: string, analysisId: string, format: string) =>
    analytics.trackUserAction("report_exported", userId, { analysisId, format }),

  // Feature usage
  featureUsed: (userId: string, feature: string, context?: Record<string, any>) =>
    analytics.trackUserAction("feature_used", userId, { feature, ...context }),

  demoStarted: (userId?: string) => analytics.trackUserAction("demo_started", userId),

  demoCompleted: (userId?: string, completionRate = 100) =>
    analytics.trackUserAction("demo_completed", userId, { completionRate }),

  // Business events
  contactSales: (userId?: string, source = "unknown") =>
    analytics.trackBusinessEvent("contact_sales", userId, undefined, { source }),

  supportTicket: (userId: string, category: string, priority: string) =>
    analytics.trackUserAction("support_ticket", userId, { category, priority }),

  feedbackSubmitted: (userId: string, rating: number, category: string) =>
    analytics.trackUserAction("feedback_submitted", userId, { rating, category }),
}
