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
} from "lucide-react"

interface HealthCheck {
  timestamp: string
  overall: {
    status: string
    score: number
    maxScore: number
  }
  environment: {
    status: string
    variables: Record<string, boolean>
    score: number
    maxScore: number
  }
  supabase: {
    status: string
    connection: boolean
    auth: boolean
    tables: Record<string, boolean>
    score: number
    maxScore: number
  }
  application: {
    status: string
    features: Record<string, boolean>
    score: number
    maxScore: number
  }
  recommendations: Array<{
    priority: "critical" | "high" | "medium" | "low"
    category: string
    issue: string
    solution: string
    link?: string
  }>
  error?: {
    message: string
    details: any
  }
}

export default function SystemHealthPage() {
  const [healthCheck, setHealthCheck] = useState<HealthCheck | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    runHealthCheck()
  }, [])

  const runHealthCheck = async () => {
    setLoading(true)
    setRefreshing(true)

    try {
      const response = await fetch("/api/system-health-check")
      const data = await response.json()
      setHealthCheck(data)
    } catch (error) {
      console.error("Error running health check:", error)
      setHealthCheck({
        timestamp: new Date().toISOString(),
        overall: { status: "error", score: 0, maxScore: 0 },
        environment: { status: "error", variables: {}, score: 0, maxScore: 0 },
        supabase: { status: "error", connection: false, auth: false, tables: {}, score: 0, maxScore: 0 },
        application: { status: "error", features: {}, score: 0, maxScore: 0 },
        recommendations: [
          {
            priority: "critical",
            category: "System",
            issue: "Health check failed",
            solution: "Unable to run system health check. Check your connection and try again.",
          },
        ],
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          details: error,
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
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "good":
      case "partial":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "fair":
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case "poor":
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
      case "healthy":
        return "text-green-700"
      case "good":
      case "partial":
        return "text-yellow-700"
      case "fair":
        return "text-orange-700"
      case "poor":
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
      case "healthy":
        return "default"
      case "good":
      case "partial":
        return "secondary"
      case "fair":
        return "outline"
      case "poor":
      case "critical":
      case "error":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-700 bg-red-50 border-red-200"
      case "high":
        return "text-orange-700 bg-orange-50 border-orange-200"
      case "medium":
        return "text-yellow-700 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-green-700 bg-green-50 border-green-200"
      default:
        return "text-gray-700 bg-gray-50 border-gray-200"
    }
  }

  if (loading && !healthCheck) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
          <p>Running comprehensive system health check...</p>
        </div>
      </div>
    )
  }

  const healthPercentage = healthCheck ? (healthCheck.overall.score / healthCheck.overall.maxScore) * 100 : 0

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">System Health Check</h1>
          <p className="text-gray-600">Complete verification of your DaytaTech application</p>
        </div>
        <Button onClick={runHealthCheck} disabled={refreshing} variant="outline">
          {refreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" /> Run Check
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
                Overall System Health
                <Badge variant={getBadgeVariant(healthCheck.overall.status)}>
                  {healthCheck.overall.status.toUpperCase()}
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
                      {healthCheck.overall.score}/{healthCheck.overall.maxScore} ({Math.round(healthPercentage)}%)
                    </span>
                  </div>
                  <Progress value={healthPercentage} className="h-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Environment</p>
                      <p className={`text-xs ${getStatusColor(healthCheck.environment.status)}`}>
                        {healthCheck.environment.score}/{healthCheck.environment.maxScore} variables
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Supabase</p>
                      <p className={`text-xs ${getStatusColor(healthCheck.supabase.status)}`}>
                        {healthCheck.supabase.score}/{healthCheck.supabase.maxScore} components
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Application</p>
                      <p className={`text-xs ${getStatusColor(healthCheck.application.status)}`}>
                        {healthCheck.application.score}/{healthCheck.application.maxScore} features
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Critical Issues Alert */}
          {healthCheck.recommendations.some((r) => r.priority === "critical") && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Critical Issues Detected</AlertTitle>
              <AlertDescription>
                Your system has critical issues that need immediate attention. Please review the recommendations below.
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {healthCheck.overall.status === "excellent" && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>System Fully Operational</AlertTitle>
              <AlertDescription>
                Congratulations! Your DaytaTech application is fully configured and ready for production use.
              </AlertDescription>
            </Alert>
          )}

          {/* Recommendations */}
          {healthCheck.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Actions to improve your system health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {healthCheck.recommendations.map((rec, index) => (
                    <Alert key={index} className={getPriorityColor(rec.priority)}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="flex items-center justify-between">
                        <span>
                          [{rec.priority.toUpperCase()}] {rec.category}: {rec.issue}
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
                  <a href="/auto-connect">Auto Setup</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/supabase-status">Detailed Status</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/verify-setup">Test Application</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/signup">Try Signup</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
