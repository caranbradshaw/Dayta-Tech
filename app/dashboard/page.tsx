"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard-header"
import { useAuth } from "@/components/auth-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import {
  Upload,
  FileText,
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

interface Analysis {
  id: string
  file_name: string
  status: string
  created_at: string
  summary?: string
  insights_count?: number
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    completedAnalyses: 0,
    totalInsights: 0,
    creditsRemaining: 0,
  })
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const supabase = createClientComponentClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if not logged in
  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, mounted, router])

  // Redirect if role not selected
  useEffect(() => {
    if (mounted && !authLoading && user && profile && !profile.analysis_type) {
      router.push("/select-role")
    }
  }, [user, profile, authLoading, mounted, router])

  // Load dashboard data
  useEffect(() => {
    if (user && profile) {
      loadDashboardData()
    }
  }, [user, profile])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Load recent analyses
      const { data: analysesData, error: analysesError } = await supabase
        .from("analyses")
        .select("id, file_name, status, created_at, summary, insights_count")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (analysesError) {
        console.error("Error loading analyses:", analysesError)
      } else {
        setAnalyses(analysesData || [])
      }

      // Load stats
      const { data: statsData, error: statsError } = await supabase
        .from("analyses")
        .select("status, insights_count")
        .eq("user_id", user.id)

      if (!statsError && statsData) {
        const totalAnalyses = statsData.length
        const completedAnalyses = statsData.filter((a) => a.status === "completed").length
        const totalInsights = statsData.reduce((sum, a) => sum + (a.insights_count || 0), 0)

        setStats({
          totalAnalyses,
          completedAnalyses,
          totalInsights,
          creditsRemaining: profile?.upload_credits || 0,
        })
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back{profile.name ? `, ${profile.name.split(" ")[0]}` : ""}!
          </h1>
          <p className="text-gray-600">
            Ready to analyze your data? Upload a file to get started with AI-powered insights.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/upload")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upload Data</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">New Analysis</div>
              <p className="text-xs text-muted-foreground">Start analyzing your data</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAnalyses}</div>
              <p className="text-xs text-muted-foreground">{stats.completedAnalyses} completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Insights Generated</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInsights}</div>
              <p className="text-xs text-muted-foreground">AI-powered insights</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.creditsRemaining}</div>
              <p className="text-xs text-muted-foreground">Upload credits</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Analyses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Analyses</CardTitle>
              <CardDescription>Your latest data analysis results</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/history">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : analyses.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses yet</h3>
                <p className="text-gray-500 mb-4">Upload your first data file to get started with AI insights</p>
                <Button asChild>
                  <Link href="/upload">
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Data
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/analysis/${analysis.id}`)}
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(analysis.status)}
                      <div>
                        <h4 className="font-medium">{analysis.file_name}</h4>
                        <p className="text-sm text-gray-500">{new Date(analysis.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(analysis.status)}>{analysis.status}</Badge>
                      {analysis.insights_count && (
                        <span className="text-sm text-gray-500">{analysis.insights_count} insights</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
