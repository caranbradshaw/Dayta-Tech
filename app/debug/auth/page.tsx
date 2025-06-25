"use client"

import { useAuth } from "@/components/auth-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

export default function AuthDebugPage() {
  const { user, profile, loading } = useAuth()
  const [testResult, setTestResult] = useState<string>("")
  const supabase = createClientComponentClient()

  const testConnection = async () => {
    try {
      setTestResult("Testing connection...")

      // Test basic connection
      const { data, error } = await supabase.from("profiles").select("count").limit(1)

      if (error) {
        setTestResult(`Connection error: ${error.message}`)
      } else {
        setTestResult("✅ Connection successful!")
      }
    } catch (error) {
      setTestResult(`Test failed: ${error}`)
    }
  }

  const testAuth = async () => {
    try {
      setTestResult("Testing auth...")

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        setTestResult(`Auth error: ${error.message}`)
      } else if (session) {
        setTestResult(`✅ Auth working! User: ${session.user.email}`)
      } else {
        setTestResult("No active session")
      }
    } catch (error) {
      setTestResult(`Auth test failed: ${error}`)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Auth Context Status:</h3>
            <p>Loading: {loading ? "Yes" : "No"}</p>
            <p>User: {user ? user.email : "None"}</p>
            <p>Profile: {profile ? profile.name || profile.email : "None"}</p>
          </div>

          <div className="space-x-2">
            <Button onClick={testConnection}>Test DB Connection</Button>
            <Button onClick={testAuth}>Test Auth</Button>
          </div>

          {testResult && (
            <div className="p-4 bg-gray-100 rounded">
              <pre>{testResult}</pre>
            </div>
          )}

          <div>
            <h3 className="font-semibold">Environment Check:</h3>
            <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}</p>
            <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
