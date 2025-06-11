"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SimpleTestPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testLocalStorage = () => {
    try {
      // Test if localStorage is available
      localStorage.setItem("test", "working")
      const value = localStorage.getItem("test")
      localStorage.removeItem("test")

      setResult({
        success: value === "working",
        message: value === "working" ? "localStorage is working correctly" : "localStorage test failed",
      })
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      setResult(null)
    }
  }

  const testFetch = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/todos/1")
      const data = await response.json()

      setResult({
        success: true,
        message: "Fetch API is working correctly",
        data,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Simple Functionality Test</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test localStorage</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testLocalStorage}>Test localStorage</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Fetch API</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testFetch} disabled={loading}>
              {loading ? "Testing..." : "Test Fetch API"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className={`p-4 ${result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} border rounded-md`}
                >
                  <p className={result.success ? "text-green-700" : "text-red-700"}>{result.message}</p>
                </div>

                {result.data && (
                  <div>
                    <h3 className="font-medium mb-2">Response Data:</h3>
                    <pre className="p-2 bg-gray-100 rounded text-sm overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
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
