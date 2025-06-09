"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function TestSQLPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testDatabase = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/test-sql")
      const data = await response.json()

      setResult(data)

      if (data.error) {
        setError(data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Database Connection Test</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Database Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testDatabase} disabled={loading}>
              {loading ? "Testing..." : "Run Database Test"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              {result?.details && (
                <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              )}
            </AlertDescription>
          </Alert>
        )}

        {result && !error && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-700 font-medium">{result.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="font-medium">Can Query: {result.canQuery ? "✅" : "❌"}</p>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <p className="font-medium">Can Insert: {result.canInsert ? "✅" : "❌"}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Environment:</h3>
                  <pre className="p-2 bg-gray-100 rounded text-sm overflow-auto">
                    {JSON.stringify(result.env, null, 2)}
                  </pre>
                </div>

                {result.timeData && (
                  <div>
                    <h3 className="font-medium mb-2">Query Result:</h3>
                    <pre className="p-2 bg-gray-100 rounded text-sm overflow-auto">
                      {JSON.stringify(result.timeData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
