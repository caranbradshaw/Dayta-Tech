/**
 * Analytics Tracker - Safe for SSR
 *
 * This module provides a safe way to track analytics events
 * that works in both client and server environments.
 */

import { trackEvents } from "@/lib/analytics-service"

// Check if we're running on the client
const isClient = typeof window !== "undefined"

// Safe tracking functions that check for client-side execution
export const safeTrackEvents = {
  // Authentication events
  signUp: (userId: string, method = "email") => {
    if (isClient) {
      trackEvents.signUp(userId, method)
    }
  },

  signIn: (userId: string, method = "email") => {
    if (isClient) {
      trackEvents.signIn(userId, method)
    }
  },

  signOut: (userId: string) => {
    if (isClient) {
      trackEvents.signOut(userId)
    }
  },

  // File and analysis events
  fileUploaded: (userId: string, fileName: string, fileSize: number, fileType: string) => {
    if (isClient) {
      trackEvents.fileUploaded(userId, fileName, fileSize, fileType)
    }
  },

  analysisStarted: (userId: string, analysisId: string, fileType: string) => {
    if (isClient) {
      trackEvents.analysisStarted(userId, analysisId, fileType)
    }
  },

  analysisCompleted: (userId: string, analysisId: string, processingTime: number, aiProvider: string) => {
    if (isClient) {
      trackEvents.analysisCompleted(userId, analysisId, processingTime, aiProvider)
    }
  },

  // Feature usage
  featureUsed: (userId: string, feature: string, context?: Record<string, any>) => {
    if (isClient) {
      trackEvents.featureUsed(userId, feature, context)
    }
  },

  demoStarted: (userId?: string) => {
    if (isClient) {
      trackEvents.demoStarted(userId)
    }
  },

  demoCompleted: (userId?: string, completionRate = 100) => {
    if (isClient) {
      trackEvents.demoCompleted(userId, completionRate)
    }
  },
}

// Safe tracking function for any event
export function trackEvent(eventName: string, userId?: string, properties?: Record<string, any>) {
  if (!isClient) return

  try {
    const { analytics } = require("@/lib/analytics-service")
    analytics
      .trackEvent({
        event_name: eventName,
        user_id: userId,
        properties,
      })
      .catch(console.error)
  } catch (error) {
    // Silent fail for SSR
  }
}

// Safe page view tracking
export function trackPageView(url?: string, userId?: string) {
  if (!isClient) return

  try {
    const { analytics } = require("@/lib/analytics-service")
    analytics.trackPageView(url, userId).catch(console.error)
  } catch (error) {
    // Silent fail for SSR
  }
}
