import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-context"
import { Toaster } from "@/components/ui/toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DaytaTech.ai - The Grammarly of Data Analysis",
  description:
    "Get expert data insights without the expert. DaytaTech's AI gives you the analytical power of data engineers and data scientists—no technical skills required.",
  keywords: "data analysis, AI analytics, business intelligence, data insights, automated analysis",
  authors: [{ name: "DaytaTech.ai Team" }],
  creator: "DaytaTech.ai",
  publisher: "DaytaTech.ai",
  openGraph: {
    title: "DaytaTech.ai - The Grammarly of Data Analysis",
    description: "Transform complex data into clear business insights with AI-powered analytics",
    url: "https://daytatech.ai",
    siteName: "DaytaTech.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DaytaTech.ai - The Grammarly of Data Analysis",
    description: "Get expert data insights without the expert",
    creator: "@daytatech",
  },
    generator: 'v0.dev'
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
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
