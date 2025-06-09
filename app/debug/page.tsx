"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const runDebug = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug/analytics")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Database Debug Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runDebug} disabled={loading}>
            {loading ? "Running Debug..." : "Debug Database"}
          </Button>

          {result && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Debug Result:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
