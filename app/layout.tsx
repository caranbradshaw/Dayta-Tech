import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toast"
import { AuthProvider } from "@/components/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { AnalyticsProvider } from "@/components/analytics/analytics-provider"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DaytaTech.ai - AI-Powered Data Analysis",
  description: "Transform raw data into executive-ready summaries with AI — no dashboards, formulas, or SQL required.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AnalyticsProvider>
              <Suspense>{children}</Suspense>
              <Toaster />
            </AnalyticsProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
