"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Play } from "lucide-react"

export default function AnalyticsSetupPage() {
  const [setupState, setSetupState] = useState<{
    running: boolean
    complete: boolean
    success: boolean
    logs: string[]
    error?: string
    data?: any
  }>({
    running: false,
    complete: false,
    success: false,
    logs: [],
  })

  const runSetup = async () => {
    setSetupState((prev) => ({ ...prev, running: true, complete: false, logs: [] }))

    try {
      const response = await fetch("/api/setup-analytics")
      const result = await response.json()

      setSetupState({
        running: false,
        complete: true,
        success: result.success,
        logs: result.logs || [],
        error: result.error,
        data: result.data,
      })
    } catch (error) {
      setSetupState({
        running: false,
        complete: true,
        success: false,
        logs: [`Network error: ${error}`],
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  // Auto-run on page load
  useEffect(() => {
    runSetup()
  }, [])

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Analytics Setup</h1>
        <p className="text-muted-foreground mt-2">Automated setup for DaytaTech analytics system</p>
      </div>

      <div className="grid gap-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {setupState.running && <Loader2 className="h-5 w-5 animate-spin" />}
              {setupState.complete && setupState.success && <CheckCircle className="h-5 w-5 text-green-500" />}
              {setupState.complete && !setupState.success && <XCircle className="h-5 w-5 text-red-500" />}
              Setup Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {setupState.running && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>Running analytics setup...</AlertDescription>
              </Alert>
            )}

            {setupState.complete && (
              <Alert variant={setupState.success ? "default" : "destructive"}>
                {setupState.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <AlertDescription>
                  {setupState.success ? "Analytics setup completed successfully!" : `Setup failed: ${setupState.error}`}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 mt-4">
              <Button onClick={runSetup} disabled={setupState.running} variant="outline">
                <Play className="h-4 w-4 mr-2" />
                {setupState.running ? "Running..." : "Run Setup"}
              </Button>

              {setupState.success && (
                <Button asChild>
                  <a href="/admin/analytics">View Analytics Dashboard</a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Logs Card */}
        {setupState.logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Setup Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                {setupState.logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Card */}
        {setupState.complete && setupState.data && (
          <Card>
            <CardHeader>
              <CardTitle>Setup Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Sample Events Created</p>
                  <p className="text-2xl font-bold">{setupState.data.sampleDataCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Events Retrieved</p>
                  <p className="text-2xl font-bold">{setupState.data.retrievedDataCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Setup Duration</p>
                  <p className="text-2xl font-bold">{setupState.data.setupDuration || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
