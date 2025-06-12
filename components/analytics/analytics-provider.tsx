"use client"

import type { ReactNode } from "react"
import { AnalyticsProvider as ClientAnalyticsProvider } from "@/lib/analytics-client"

interface AnalyticsProviderProps {
  children: ReactNode
  userId?: string
}

/**
 * Analytics Provider Component
 *
 * This is a wrapper around the client-side analytics provider
 * that ensures it only runs on the client side.
 */
export function AnalyticsProvider({ children, userId }: AnalyticsProviderProps) {
  return <ClientAnalyticsProvider userId={userId}>{children}</ClientAnalyticsProvider>
}
