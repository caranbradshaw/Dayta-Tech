import { createClient } from "@supabase/supabase-js"

class AnalyticsClient {
  private supabase: any

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.warn("Supabase credentials missing - analytics disabled")
      return
    }

    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  async track(eventName: string, userId?: string, properties: Record<string, any> = {}) {
    if (!this.supabase) return

    try {
      const { error } = await this.supabase.from("analytics_events").insert([
        {
          event_name: eventName,
          user_id: userId,
          properties: {
            ...properties,
            timestamp: new Date().toISOString(),
            url: typeof window !== "undefined" ? window.location.href : undefined,
            user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
          },
        },
      ])

      if (error) {
        console.warn("Analytics tracking failed:", error.message)
      }
    } catch (error) {
      console.warn("Analytics error:", error)
    }
  }

  async getEvents(limit = 100) {
    if (!this.supabase) return []

    try {
      const { data, error } = await this.supabase
        .from("analytics_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.warn("Failed to fetch analytics:", error.message)
        return []
      }

      return data || []
    } catch (error) {
      console.warn("Analytics fetch error:", error)
      return []
    }
  }
}

export const analytics = new AnalyticsClient()
