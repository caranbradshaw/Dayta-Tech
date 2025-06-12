"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw, Wrench, Zap } from "lucide-react"

interface ConnectionReport {
  timestamp: string
  step: number
  issue: string
  details: any
  solution: string
  fixed: boolean
}

export default function ConnectionFixPage() {
  const [report, setReport] = useState<ConnectionReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    runConnectionFix()
  }, [])

  const runConnectionFix = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/fix-connection-issue")
      const data = await response.json()
      setReport(data)
    } catch (error) {
      console.error("Connection fix failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const forceRefresh = async () => {
    setRefreshing(true)
    try {
      const response = await fetch("/api/force-connection-refresh", { method: "POST" })
      const data = await response.json()

      if (data.connected) {
        // Connection is working, refresh the page to update notifications
        window.location.reload()
      } else {
        // Still not connected, run the full fix again
        await runConnectionFix()
      }
    } catch (error) {
      console.error("Force refresh failed:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const getIssueIcon = (issue: string) => {
    switch (issue) {
      case "NO_ISSUE_FOUND":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "MISSING_ENV_VARS":
      case "CLIENT_CREATION_FAILED":
      case "CONNECTION_ERROR":
        return <XCircle className="h-6 w-6 text-red-500" />
      case "TABLES_NOT_CREATED":
      case "AUTH_NOT_CONFIGURED":
        return <AlertCircle className="h-6 w-6 text-yellow-500" />
      default:
        return <AlertCircle className="h-6 w-6 text-gray-500" />
    }
  }

  const getIssueColor = (issue: string) => {
    switch (issue) {
      case "NO_ISSUE_FOUND":
        return "text-green-700 bg-green-50 border-green-200"
      case "MISSING_ENV_VARS":
      case "CLIENT_CREATION_FAILED":
      case "CONNECTION_ERROR":
        return "text-red-700 bg-red-50 border-red-200"
      case "TABLES_NOT_CREATED":
      case "AUTH_NOT_CONFIGURED":
        return "text-yellow-700 bg-yellow-50 border-yellow-200"
      default:
        return "text-gray-700 bg-gray-50 border-gray-200"
    }
  }

  if (loading && !report) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
          <p>Diagnosing connection issue...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wrench className="h-8 w-8" />
            Connection Issue Fix
          </h1>
          <p className="text-gray-600">Diagnosing and fixing your Supabase connection issue</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runConnectionFix} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> Re-diagnose
          </Button>
          <Button onClick={forceRefresh} disabled={refreshing} variant="default">
            {refreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Refreshing...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" /> Force Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {report && (
        <div className="space-y-6">
          {/* Main Issue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getIssueIcon(report.issue)}
                Issue Identified: {report.issue.replace(/_/g, " ")}
              </CardTitle>
              <CardDescription>
                Diagnosed at step {report.step} on {new Date(report.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className={getIssueColor(report.issue)}>
                <AlertTitle className="flex items-center gap-2">
                  {report.fixed ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {report.fixed ? "Issue Resolved!" : "Solution Required"}
                </AlertTitle>
                <AlertDescription className="text-base">{report.solution}</AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Environment Check */}
            {report.details.envCheck && (
              <Card>
                <CardHeader>
                  <CardTitle>Environment Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(report.details.envCheck).map(([key, details]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-sm">{key}</p>
                          <p className="text-xs text-gray-600">{details.preview}</p>
                        </div>
                        <Badge variant={details.exists ? "default" : "destructive"}>{details.value}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Connection Test */}
            {report.details.connectionTest && (
              <Card>
                <CardHeader>
                  <CardTitle>Connection Test</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {report.details.connectionTest.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        {report.details.connectionTest.success ? "Connected" : "Failed"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{report.details.connectionTest.message}</p>
                    {report.details.connectionTest.errorCode && (
                      <p className="text-xs font-mono">Error Code: {report.details.connectionTest.errorCode}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Table Check */}
            {report.details.tableCheck && (
              <Card>
                <CardHeader>
                  <CardTitle>Database Tables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(report.details.tableCheck).map(([tableName, details]: [string, any]) => (
                      <div key={tableName} className="flex items-center justify-between">
                        <span className="font-mono text-sm">{tableName}</span>
                        <div className="flex items-center gap-2">
                          {details.exists ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <Badge variant={details.exists ? "default" : "secondary"}>
                            {details.exists ? "EXISTS" : "MISSING"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Auth Test */}
            {report.details.authTest && (
              <Card>
                <CardHeader>
                  <CardTitle>Authentication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {report.details.authTest.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">{report.details.authTest.success ? "Working" : "Not Working"}</span>
                  </div>
                  {report.details.authTest.error && (
                    <p className="text-sm text-red-600 mt-2">{report.details.authTest.error}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {report.issue === "MISSING_ENV_VARS" && (
                  <Button variant="outline" asChild>
                    <a href="/auto-connect">Set Environment Variables</a>
                  </Button>
                )}
                {report.issue === "TABLES_NOT_CREATED" && (
                  <Button variant="outline" asChild>
                    <a href="/complete-setup">Create Tables</a>
                  </Button>
                )}
                {report.fixed && (
                  <Button onClick={() => window.location.reload()} variant="default">
                    Refresh Page
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <a href="/supabase-status">Full Status Check</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Raw Details (for debugging) */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
            </CardHeader>
            <CardContent>
              <details>
                <summary className="cursor-pointer text-sm text-gray-600 mb-2">View Raw Diagnostic Data</summary>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">{JSON.stringify(report, null, 2)}</pre>
              </details>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
