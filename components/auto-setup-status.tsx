"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

interface SetupResult {
  success: boolean
  message: string
  details?: any
}

export function AutoSetupStatus() {
  const [setupStatus, setSetupStatus] = useState<{
    running: boolean
    complete: boolean
    success: boolean
    results: SetupResult[]
    error?: string
  }>({
    running: false,
    complete: false,
    success: false,
    results: [],
  })

  const runSetup = async () => {
    setSetupStatus((prev) => ({ ...prev, running: true, complete: false }))

    try {
      const response = await fetch("/api/auto-setup", { method: "POST" })
      const data = await response.json()

      setSetupStatus({
        running: false,
        complete: true,
        success: data.success,
        results: data.results || [],
        error: data.error,
      })
    } catch (error) {
      setSetupStatus({
        running: false,
        complete: true,
        success: false,
        results: [],
        error: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  // Auto-run setup on component mount
  useEffect(() => {
    const hasRun = localStorage.getItem("auto_setup_complete")
    if (!hasRun) {
      runSetup()
      localStorage.setItem("auto_setup_complete", "true")
    }
  }, [])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {setupStatus.running && <Loader2 className="h-5 w-5 animate-spin" />}
          Analytics Setup Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {setupStatus.running && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Running automated analytics setup...</AlertDescription>
          </Alert>
        )}

        {setupStatus.complete && (
          <Alert variant={setupStatus.success ? "default" : "destructive"}>
            {setupStatus.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertDescription>
              {setupStatus.success ? "Analytics setup completed successfully!" : `Setup failed: ${setupStatus.error}`}
            </AlertDescription>
          </Alert>
        )}

        {setupStatus.results.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Setup Results:</h3>
            {setupStatus.results.map((result, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>{result.message}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={runSetup} disabled={setupStatus.running} variant="outline">
            {setupStatus.running ? "Running..." : "Run Setup Again"}
          </Button>

          {setupStatus.success && (
            <Button asChild>
              <a href="/admin/analytics">View Analytics</a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
