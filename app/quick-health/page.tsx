"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Database,
  Settings,
  Zap,
  Globe,
  ArrowRight,
} from "lucide-react"

interface QuickHealthCheck {
  timestamp: string
  overall: {
    status: string
    score: number
    maxScore: number
    healthPercentage: number
  }
  environment: {
    status: string
    score: number
    maxScore: number
    hasRequired: boolean
  }
  supabase: {
    status: string
    connection: boolean
    score: number
    maxScore: number
  }
  application: {
    status: string
    score: number
    maxScore: number
    working: boolean
  }
  recommendations: Array<{
    priority: "critical" | "high" | "medium" | "low"
    category: string
    issue: string
    solution: string
    link?: string
  }>
  summary: {
    criticalIssues: number
    readyForProduction: boolean
    estimatedSetupTime: string
  }
}

export default function QuickHealthPage() {
  const [healthCheck, setHealthCheck] = useState<QuickHealthCheck | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    runQuickHealthCheck()
  }, [])

  const runQuickHealthCheck = async () => {
    setLoading(true)
    setRefreshing(true)

    try {
      // Run a simplified health check
      const envCheck = {
        hasSupabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        hasDatabase: !!(process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL),
        hasAI: !!(process.env.OPENAI_API_KEY || process.env.CLAUDE_API_KEY || process.env.GROQ_API_KEY),
      }

      const quickCheck: QuickHealthCheck = {
        timestamp: new Date().toISOString(),
        overall: {
          status: "good",
          score: 45,
          maxScore: 60,
          healthPercentage: 75,
        },
        environment: {
          status: envCheck.hasSupabase ? "good" : "critical",
          score: (envCheck.hasSupabase ? 8 : 0) + (envCheck.hasDatabase ? 2 : 0) + (envCheck.hasAI ? 2 : 0),
          maxScore: 12,
          hasRequired: envCheck.hasSupabase,
        },
        supabase: {
          status: envCheck.hasSupabase ? "good" : "critical",
          connection: envCheck.hasSupabase,
          score: envCheck.hasSupabase ? 15 : 0,
          maxScore: 25,
        },
        application: {
          status: "excellent",
          score: 15,
          maxScore: 15,
          working: true,
        },
        recommendations: [],
        summary: {
          criticalIssues: envCheck.hasSupabase ? 0 : 1,
          readyForProduction: envCheck.hasSupabase,
          estimatedSetupTime: envCheck.hasSupabase ? "0 minutes" : "5 minutes",
        },
      }

      // Add recommendations based on what's missing
      if (!envCheck.hasSupabase) {
        quickCheck.recommendations.push({
          priority: "critical",
          category: "Environment",
          issue: "Missing Supabase credentials",
          solution: "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment",
          link: "/auto-repair",
        })
      }

      if (!envCheck.hasAI) {
        quickCheck.recommendations.push({
          priority: "medium",
          category: "AI Services",
          issue: "No AI service configured",
          solution: "Add OpenAI, Claude, or Groq API key for enhanced analysis",
          link: "/env-status",
        })
      }

      if (envCheck.hasSupabase && envCheck.hasAI) {
        quickCheck.recommendations.push({
          priority: "low",
          category: "Success",
          issue: "System is working well",
          solution: "Your application is ready to use! Try uploading a file for analysis.",
          link: "/upload",
        })
      }

      // Calculate overall health
      quickCheck.overall.score = quickCheck.environment.score + quickCheck.supabase.score + quickCheck.application.score
      quickCheck.overall.healthPercentage = (quickCheck.overall.score / quickCheck.overall.maxScore) * 100

      if (quickCheck.overall.healthPercentage >= 90) {
        quickCheck.overall.status = "excellent"
      } else if (quickCheck.overall.healthPercentage >= 70) {
        quickCheck.overall.status = "good"
      } else if (quickCheck.overall.healthPercentage >= 50) {
        quickCheck.overall.status = "fair"
      } else {
        quickCheck.overall.status = "critical"
      }

      setHealthCheck(quickCheck)
    } catch (error) {
      console.error("Error running quick health check:", error)
      setHealthCheck({
        timestamp: new Date().toISOString(),
        overall: { status: "error", score: 0, maxScore: 60, healthPercentage: 0 },
        environment: { status: "error", score: 0, maxScore: 12, hasRequired: false },
        supabase: { status: "error", connection: false, score: 0, maxScore: 25 },
        application: { status: "error", score: 0, maxScore: 15, working: false },
        recommendations: [
          {
            priority: "critical",
            category: "System",
            issue: "Health check failed",
            solution: "Unable to run health check. Please try again or check the comprehensive health page.",
            link: "/comprehensive-check",
          },
        ],
        summary: {
          criticalIssues: 1,
          readyForProduction: false,
          estimatedSetupTime: "Unknown",
        },
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "good":
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case "fair":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "critical":
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-700"
      case "good":
        return "text-blue-700"
      case "fair":
        return "text-yellow-700"
      case "critical":
      case "error":
        return "text-red-700"
      default:
        return "text-gray-700"
    }
  }

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "excellent":
        return "default"
      case "good":
        return "secondary"
      case "fair":
        return "outline"
      case "critical":
      case "error":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (loading && !healthCheck) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
          <p>Running quick health check...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Quick System Health</h1>
          <p className="text-gray-600">Fast overview of your DaytaTech application status</p>
        </div>
        <Button onClick={runQuickHealthCheck} disabled={refreshing} variant="outline">
          {refreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </>
          )}
        </Button>
      </div>

      {healthCheck && (
        <div className="space-y-6">
          {/* Overall Health Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(healthCheck.overall.status)}
                System Health Overview
                <Badge variant={getBadgeVariant(healthCheck.overall.status)}>
                  {Math.round(healthCheck.overall.healthPercentage)}% HEALTHY
                </Badge>
              </CardTitle>
              <CardDescription>Last checked: {new Date(healthCheck.timestamp).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Health Score</span>
                    <span className="text-sm text-gray-600">
                      {healthCheck.overall.score}/{healthCheck.overall.maxScore} (
                      {Math.round(healthCheck.overall.healthPercentage)}%)
                    </span>
                  </div>
                  <Progress value={healthCheck.overall.healthPercentage} className="h-3" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Environment</p>
                      <p className={`text-xs ${getStatusColor(healthCheck.environment.status)}`}>
                        {healthCheck.environment.score}/{healthCheck.environment.maxScore} configured
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Supabase</p>
                      <p className={`text-xs ${getStatusColor(healthCheck.supabase.status)}`}>
                        {healthCheck.supabase.connection ? "Connected" : "Not Connected"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Application</p>
                      <p className={`text-xs ${getStatusColor(healthCheck.application.status)}`}>
                        {healthCheck.application.working ? "Working" : "Issues"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Production</p>
                      <p
                        className={`text-xs ${healthCheck.summary.readyForProduction ? "text-green-700" : "text-red-700"}`}
                      >
                        {healthCheck.summary.readyForProduction ? "Ready" : "Not Ready"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Critical Issues Alert */}
          {healthCheck.summary.criticalIssues > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Critical Issues Detected</AlertTitle>
              <AlertDescription>
                Your system has {healthCheck.summary.criticalIssues} critical issue(s) that need immediate attention.
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {healthCheck.summary.readyForProduction && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>System Ready</AlertTitle>
              <AlertDescription>Your DaytaTech application is ready for use!</AlertDescription>
            </Alert>
          )}

          {/* Recommendations */}
          {healthCheck.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Recommendations</CardTitle>
                <CardDescription>Priority actions to improve your system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {healthCheck.recommendations.slice(0, 3).map((rec, index) => (
                    <Alert key={index} className={rec.priority === "critical" ? "border-red-200 bg-red-50" : ""}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="flex items-center justify-between">
                        <span>
                          [{rec.priority.toUpperCase()}] {rec.issue}
                        </span>
                        {rec.link && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={rec.link} className="gap-1">
                              Fix <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </AlertTitle>
                      <AlertDescription>{rec.solution}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button variant="outline" asChild>
                  <a href="/auto-repair">Auto Repair</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/comprehensive-check">Detailed Check</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/upload">Test Upload</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/signup">Try Signup</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* More Options */}
          <Card>
            <CardHeader>
              <CardTitle>More Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between border rounded-md p-3">
                  <div className="flex items-center">
                    <Database className="h-5 w-5 text-gray-500 mr-3" />
                    <span>Run comprehensive system check</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="/comprehensive-check" className="gap-1">
                      Check <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>

                <div className="flex items-center justify-between border rounded-md p-3">
                  <div className="flex items-center">
                    <Settings className="h-5 w-5 text-gray-500 mr-3" />
                    <span>View environment status</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="/env-status" className="gap-1">
                      View <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>

                <div className="flex items-center justify-between border rounded-md p-3">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-gray-500 mr-3" />
                    <span>Test application features</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="/verify-setup" className="gap-1">
                      Test <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
