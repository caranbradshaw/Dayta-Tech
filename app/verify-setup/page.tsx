"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle } from "lucide-react"

export default function VerifySetupPage() {
  const [checks, setChecks] = useState({
    localStorage: { status: "pending", message: "" },
    fetch: { status: "pending", message: "" },
    supabase: { status: "pending", message: "" },
    env: { status: "pending", message: "" },
  })

  useEffect(() => {
    // Test localStorage
    try {
      localStorage.setItem("test", "working")
      const value = localStorage.getItem("test")
      localStorage.removeItem("test")

      setChecks((prev) => ({
        ...prev,
        localStorage: {
          status: value === "working" ? "success" : "error",
          message: value === "working" ? "localStorage is working correctly" : "localStorage test failed",
        },
      }))
    } catch (err) {
      setChecks((prev) => ({
        ...prev,
        localStorage: {
          status: "error",
          message: err instanceof Error ? err.message : "Unknown error occurred",
        },
      }))
    }

    // Test fetch API
    fetch("https://jsonplaceholder.typicode.com/todos/1")
      .then((response) => response.json())
      .then(() => {
        setChecks((prev) => ({
          ...prev,
          fetch: {
            status: "success",
            message: "Fetch API is working correctly",
          },
        }))
      })
      .catch((err) => {
        setChecks((prev) => ({
          ...prev,
          fetch: {
            status: "error",
            message: err instanceof Error ? err.message : "Unknown error occurred",
          },
        }))
      })

    // Check environment variables
    fetch("/api/debug/env-check")
      .then((response) => response.json())
      .then((data) => {
        const hasSupabaseVars =
          data.envStatus &&
          (data.envStatus.SUPABASE_URL || data.envStatus.NEXT_PUBLIC_SUPABASE_URL) &&
          (data.envStatus.SUPABASE_ANON_KEY || data.envStatus.NEXT_PUBLIC_SUPABASE_ANON_KEY)

        setChecks((prev) => ({
          ...prev,
          env: {
            status: hasSupabaseVars ? "success" : "error",
            message: hasSupabaseVars
              ? "Required environment variables are set"
              : "Missing required Supabase environment variables",
          },
        }))
      })
      .catch(() => {
        setChecks((prev) => ({
          ...prev,
          env: {
            status: "error",
            message: "Failed to check environment variables",
          },
        }))
      })
  }, [])

  const testSupabase = async () => {
    setChecks((prev) => ({
      ...prev,
      supabase: {
        status: "pending",
        message: "Testing Supabase connection...",
      },
    }))

    try {
      const response = await fetch("/api/debug/supabase-connection")
      const data = await response.json()

      setChecks((prev) => ({
        ...prev,
        supabase: {
          status: data.error ? "error" : "success",
          message: data.error ? `Connection error: ${data.error}` : "Supabase connection successful",
        },
      }))
    } catch (err) {
      setChecks((prev) => ({
        ...prev,
        supabase: {
          status: "error",
          message: err instanceof Error ? err.message : "Unknown error occurred",
        },
      }))
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === "pending") return <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
    if (status === "success") return <CheckCircle className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusClass = (status: string) => {
    if (status === "pending") return "text-gray-500"
    if (status === "success") return "text-green-700"
    return "text-red-700"
  }

  const allChecksSuccessful = Object.values(checks).every((check) => check.status === "success")

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Setup Verification</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>System Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {Object.entries(checks).map(([key, { status, message }]) => (
                <li key={key} className="flex items-start">
                  <div className="mr-3 mt-0.5">{getStatusIcon(status)}</div>
                  <div>
                    <p className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                    <p className={getStatusClass(status)}>{message}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <Button onClick={testSupabase} disabled={checks.supabase.status === "pending"}>
                {checks.supabase.status === "pending" ? "Testing..." : "Test Supabase Connection"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {allChecksSuccessful ? (
          <Alert>
            <AlertTitle>All checks passed!</AlertTitle>
            <AlertDescription>Your environment is correctly set up and ready to use.</AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertTitle>Setup issues detected</AlertTitle>
            <AlertDescription>
              <p className="mb-2">Some checks failed. Please fix the issues above to ensure proper functionality.</p>
              <p>The application will still work in demo mode with limited functionality.</p>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full" onClick={() => (window.location.href = "/demo")}>
                Continue to Demo Mode
              </Button>

              {!allChecksSuccessful && (
                <Button variant="outline" className="w-full" onClick={() => (window.location.href = "/debug-env")}>
                  View Detailed Diagnostics
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
