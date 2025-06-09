"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestDBPage() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    setLoading(true)
    setResults([])

    try {
      // Test basic table creation
      const response = await fetch("/api/test-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "basic" }),
      })

      const result = await response.json()
      setResults((prev) => [...prev, `Basic test: ${JSON.stringify(result)}`])
    } catch (error) {
      setResults((prev) => [...prev, `Error: ${error.message}`])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Database Test Page</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runTest} disabled={loading}>
            {loading ? "Testing..." : "Run Database Tests"}
          </Button>

          <div className="mt-4 space-y-2">
            {results.map((result, index) => (
              <div key={index} className="p-2 bg-gray-100 rounded text-sm">
                {result}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
