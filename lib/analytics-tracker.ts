// Simple analytics tracker that works with the auto-setup
export class AnalyticsTracker {
  private static instance: AnalyticsTracker
  private supabase: any

  constructor() {
    // Initialize Supabase client
    if (typeof window !== "undefined") {
      import("@/lib/supabase").then(({ createClient }) => {
        this.supabase = createClient()
      })
    }
  }

  static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker()
    }
    return AnalyticsTracker.instance
  }

  async track(eventName: string, userId?: string, properties: Record<string, any> = {}) {
    if (!this.supabase) return

    try {
      await this.supabase.from("analytics_events").insert({
        event_name: eventName,
        user_id: userId,
        properties,
      })
    } catch (error) {
      console.error("Analytics tracking error:", error)
    }
  }

  // Convenience methods
  async trackPageView(page: string, userId?: string) {
    return this.track("page_view", userId, { page })
  }

  async trackFileUpload(fileType: string, fileSize: number, userId?: string) {
    return this.track("file_upload", userId, { file_type: fileType, size: fileSize })
  }

  async trackAnalysisComplete(duration: number, aiProvider: string, userId?: string) {
    return this.track("analysis_complete", userId, { duration, ai_provider: aiProvider })
  }

  async trackSignup(plan: string, userId?: string) {
    return this.track("signup", userId, { plan })
  }
}

// Export singleton instance
export const analytics = AnalyticsTracker.getInstance()
