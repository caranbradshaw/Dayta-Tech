"use client"

import type React from "react"
import { createContext, useContext, useEffect } from "react"
import { useAuth } from "@/components/auth-context"
import { analytics, trackEvents } from "@/lib/analytics-service"
import { usePathname } from "next/navigation"

interface AnalyticsContextType {
  trackEvent: typeof analytics.trackEvent
  trackPageView: typeof analytics.trackPageView
  trackUserAction: typeof analytics.trackUserAction
  trackBusinessEvent: typeof analytics.trackBusinessEvent
  trackEvents: typeof trackEvents
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()

  // Initialize session when component mounts
  useEffect(() => {
    analytics.initializeSession(user?.id)

    // End session when page unloads
    const handleBeforeUnload = () => {
      analytics.endSession()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      analytics.endSession()
    }
  }, [user?.id])

  // Track page views when pathname changes
  useEffect(() => {
    analytics.trackPageView(window.location.href, user?.id)
  }, [pathname, user?.id])

  const contextValue: AnalyticsContextType = {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackUserAction: analytics.trackUserAction.bind(analytics),
    trackBusinessEvent: analytics.trackBusinessEvent.bind(analytics),
    trackEvents,
  }

  return <AnalyticsContext.Provider value={contextValue}>{children}</AnalyticsContext.Provider>
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider")
  }
  return context
}
