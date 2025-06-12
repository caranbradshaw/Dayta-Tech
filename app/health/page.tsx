"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react"

interface QuickHealthCheck {
  environment: {
    supabaseUrl: boolean
    supabaseKey: boolean
    postgresUrl: boolean
    status: "good" | "partial" | "critical"
  }
  connection: {
    canConnect: boolean
    message: string
    status: "good" | "critical"
  }
  overall: "excellent" | "good" | "needs-attention" | "critical"
}

export default function HealthPage() {
  const [health, setHealth] = useState<QuickHealthCheck | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkHealth()
  }, [])

  const checkHealth = async () => {
    setLoading(true)

    try {
      // Quick environment check
      const envCheck = {
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        postgresUrl: !!process.env.POSTGRES_URL,
        status: "critical" as const,
      }

      const envScore = Object.values(envCheck).filter((v) => typeof v === "boolean" && v).length
      if (envScore === 3) envCheck.status = "good"
      else if (envScore >= 1) envCheck.status = "partial"

      // Quick connection test
      let connectionCheck = {
        canConnect: false,
        message: "Not tested",
        status: "critical" as const,
      }

      try {
        const response = await fetch("/api/check-supabase-status")
        const result = await response.json()
        connectionCheck = {
          canConnect: result.success || false,
          message: result.message || "Connection test failed",
          status: result.success ? "good" : "critical",
        }
      } catch (error) {
        connectionCheck = {
          canConnect: false,
          message: "Failed to test connection",
          status: "critical",
        }
      }

      // Overall status
      let overall: QuickHealthCheck["overall"] = "critical"
      if (envCheck.status === "good" && connectionCheck.status === "good") {
        overall = "excellent"
      } else if (envCheck.status === "good" || connectionCheck.status === "good") {
        overall = "good"
      } else if (envCheck.status === "partial") {
        overall = "needs-attention"
      }

      setHealth({
        environment: envCheck,
        connection: connectionCheck,
        overall,
      })
    } catch (error) {
      console.error("Health check failed:", error)
      setHealth({
        environment: {
          supabaseUrl: false,
          supabaseKey: false,
          postgresUrl: false,
          status: "critical",
        },
        connection: {
          canConnect: false,
          message: "Health check failed",
          status: "critical",
        },
        overall: "critical",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
      case "good":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "needs-attention":
      case "partial":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "critical":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    }
  }

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "excellent":
      case "good":
        return "default"
      case "needs-attention":
      case "partial":
        return "secondary"
      case "critical":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
          <p>Checking system health...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-gray-600">Quick overview of your DaytaTech setup</p>
        </div>
        <Button onClick={checkHealth} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {health && (
        <div className="space-y-6">
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(health.overall)}
                System Status
                <Badge variant={getBadgeVariant(health.overall)}>
                  {health.overall.replace("-", " ").toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(health.environment.status)}
                    <h3 className="font-medium">Environment Variables</h3>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Supabase URL:</span>
                      <Badge variant={health.environment.supabaseUrl ? "default" : "destructive"}>
                        {health.environment.supabaseUrl ? "Set" : "Missing"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Supabase Key:</span>
                      <Badge variant={health.environment.supabaseKey ? "default" : "destructive"}>
                        {health.environment.supabaseKey ? "Set" : "Missing"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Postgres URL:</span>
                      <Badge variant={health.environment.postgresUrl ? "default" : "destructive"}>
                        {health.environment.postgresUrl ? "Set" : "Missing"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(health.connection.status)}
                    <h3 className="font-medium">Database Connection</h3>
                  </div>
                  <p className="text-sm text-gray-600">{health.connection.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {health.overall !== "excellent" && (
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {health.environment.status === "critical" && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Missing critical environment variables. Please set up your Supabase credentials.
                      </AlertDescription>
                    </Alert>
                  )}

                  {health.connection.status === "critical" && health.environment.status !== "critical" && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Cannot connect to database. Check your Supabase project settings and run the setup scripts.
                      </AlertDescription>
                    </Alert>
                  )}

                  {health.overall === "good" && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        System is mostly working! Run the detailed health check to identify any remaining issues.
                      </AlertDescription>
                    </Alert>
                  )}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" asChild>
                  <a href="/auto-connect">Setup Supabase</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/system-health">Detailed Check</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/signup">Test App</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
