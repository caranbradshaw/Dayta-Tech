import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { DemoWalkthrough } from "@/components/demo-walkthrough"
import { Toaster } from "@/components/ui/toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DaytaTech - AI-Powered Data Analysis",
  description: "Transform raw data into executive-ready summaries with AI — no dashboards, formulas, or SQL required.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <DemoWalkthrough />
        <Toaster />
      </body>
    </html>
  )
}
