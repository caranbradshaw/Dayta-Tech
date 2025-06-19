"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-context"
import { getClientEnvConfig } from "@/lib/client-safe-env"

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [fixingConnection, setFixingConnection] = useState(false)
  const [connectionFixed, setConnectionFixed] = useState(false)
  const [showDemoModal, setShowDemoModal] = useState(false)

  // Check client environment safely
  const clientEnv = getClientEnvConfig()

  // Fix Supabase connection on page load
  useEffect(() => {
    if (clientEnv.hasSupabase) {
      fixSupabaseConnection()
    }
  }, [clientEnv.hasSupabase])

  const fixSupabaseConnection = async () => {
    setFixingConnection(true)
    try {
      const response = await fetch("/api/fix-supabase-now", { method: "POST" })
      const result = await response.json()

      if (result.success) {
        setConnectionFixed(true)
        console.log("✅ Supabase connection fixed:", result.message)
      } else {
        console.error("❌ Connection fix failed:", result.error)
      }
    } catch (error) {
      console.error("❌ Fix request failed:", error)
    } finally {
      setFixingConnection(false)
    }
  }

  // If user is logged in, redirect to upload
  useEffect(() => {
    if (user) {
      router.push("/upload")
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">DaytaTech</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your data into actionable insights with our powerful analytics platform. Upload, analyze, and
            visualize your data with AI-powered recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-3">
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
              <Link href="/demo">View Demo</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">📊 Smart Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI-powered data analysis that automatically identifies patterns, trends, and insights in your data.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">🚀 Easy Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Simply drag and drop your CSV, Excel, or JSON files. Our platform handles the rest automatically.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">📈 Visual Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generate beautiful, interactive charts and reports that you can share with your team or export.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Ready to get started?</h2>
          <Button asChild size="lg" className="text-lg px-8 py-3">
            <Link href="/signup">Create Your Account</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
