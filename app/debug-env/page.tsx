"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DebugEnvPage() {
  const [envStatus, setEnvStatus] = useState<Record<string, boolean>>({})
  const [connectionStatus, setConnectionStatus] = useState<string>("Not tested")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detailedError, setDetailedError] = useState<any>(null)

  useEffect(() => {
    // Check which environment variables are available
    const checkEnvVars = async () => {
      try {
        const response = await fetch("/api/debug/env-check")
        const data = await response.json()
        setEnvStatus(data.envStatus || {})
      } catch (err) {
        console.error("Failed to check environment variables:", err)
      }
    }

    checkEnvVars()
  }, [])

  const testSupabaseConnection = async () => {
    setLoading(true)
    setError(null)
    setDetailedError(null)
    setConnectionStatus("Testing...")

    try {
      const response = await fetch("/api/debug/supabase-connection")
      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setDetailedError(data.details || null)
        setConnectionStatus("Failed")
      } else {
        setConnectionStatus(data.message || "Connected successfully")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      setConnectionStatus("Failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Environment & Connection Diagnostics</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Supabase Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(envStatus).length > 0 ? (
                Object.entries(envStatus).map(([key, exists]) => (
                  <div key={key} className="flex items-center">
                    <span className={`mr-2 ${exists ? "text-green-500" : "text-red-500"}`}>{exists ? "✅" : "❌"}</span>
                    <span className="font-mono">{key}</span>
                  </div>
                ))
              ) : (
                <p>Loading environment status...</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Supabase Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={testSupabaseConnection} disabled={loading}>
                {loading ? "Testing..." : "Test Connection"}
              </Button>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                <p className="font-medium">
                  Status:{" "}
                  <span className={connectionStatus === "Failed" ? "text-red-500" : "text-green-500"}>
                    {connectionStatus}
                  </span>
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Connection Error</AlertTitle>
                  <AlertDescription>
                    {error}
                    {detailedError && (
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                        {JSON.stringify(detailedError, null, 2)}
                      </pre>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Verify that all required Supabase environment variables are set (check ✅ marks above)</li>
              <li>Ensure your Supabase project is active and running</li>
              <li>Check that the service role key has sufficient permissions</li>
              <li>Verify network connectivity to the Supabase instance</li>
              <li>Check for any IP restrictions on your Supabase project</li>
              <li>Try regenerating your Supabase API keys</li>
              <li>Ensure your database has not reached storage or connection limits</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alternative Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              If you continue to experience issues with Supabase, the application can run in demo mode without a
              database connection. This uses local storage to simulate database functionality for demonstration
              purposes.
            </p>
            <Button variant="outline" onClick={() => (window.location.href = "/demo")}>
              Try Demo Mode
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
