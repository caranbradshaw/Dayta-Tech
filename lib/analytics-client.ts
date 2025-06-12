/**
 * Client-side Analytics Provider
 *
 * This component safely initializes analytics on the client side only.
 * It's completely safe for SSR and won't cause any hydration mismatches.
 */

"use client"

import { useEffect, createContext, useContext, useState, type ReactNode } from "react"
import { analytics } from "@/lib/analytics-service"

// Define the context type
interface AnalyticsContextType {
  initialized: boolean
  trackPageView: (url?: string, userId?: string) => Promise<void>
  trackEvent: (eventName: string, properties?: Record<string, any>) => Promise<void>
}

// Create the context with default values
const AnalyticsContext = createContext<AnalyticsContextType>({
  initialized: false,
  trackPageView: async () => {},
  trackEvent: async () => {},
})

// Props for the provider component
interface AnalyticsProviderProps {
  children: ReactNode
  userId?: string
}

// Analytics Provider Component
export function AnalyticsProvider({ children, userId }: AnalyticsProviderProps) {
  const [initialized, setInitialized] = useState(false)

  // Initialize analytics on mount (client-side only)
  useEffect(() => {
    const initAnalytics = async () => {
      try {
        await analytics.initializeSession(userId)
        await analytics.trackPageView(window.location.href, userId)
        setInitialized(true)
      } catch (error) {
        console.error("Failed to initialize analytics:", error)
      }
    }

    initAnalytics()

    // Clean up on unmount
    return () => {
      analytics.endSession().catch(console.error)
    }
  }, [userId])

  // Track page views on route changes
  useEffect(() => {
    if (!initialized) return

    const handleRouteChange = (url: string) => {
      analytics.trackPageView(url, userId).catch(console.error)
    }

    // Listen for route changes in Next.js
    window.addEventListener("popstate", () => handleRouteChange(window.location.href))

    return () => {
      window.removeEventListener("popstate", () => handleRouteChange(window.location.href))
    }
  }, [initialized, userId])

  // Context value
  const value = {
    initialized,
    trackPageView: async (url?: string, trackUserId?: string) => {
      if (initialized) {
        await analytics.trackPageView(url, trackUserId || userId)
      }
    },
    trackEvent: async (eventName: string, properties?: Record<string, any>) => {
      if (initialized) {
        await analytics.trackEvent({
          event_name: eventName,
          user_id: userId,
          properties,
        })
      }
    },
  }

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

// Custom hook to use analytics
export function useAnalytics() {
  return useContext(AnalyticsContext)
}
