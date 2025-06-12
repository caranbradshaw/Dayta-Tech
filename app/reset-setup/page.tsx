"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, AlertTriangle, RotateCcw, ArrowRight } from "lucide-react"

export default function ResetSetupPage() {
  const [resetResult, setResetResult] = useState<{
    success: boolean
    message: string
    timestamp?: string
  } | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const runReset = async () => {
    setIsResetting(true)
    setResetResult(null)

    try {
      const response = await fetch("/api/reset-setup", {
        method: "POST",
      })

      const data = await response.json()
      setResetResult(data)
    } catch (error) {
      setResetResult({
        success: false,
        message: `Reset failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Reset Setup</h1>
        <p className="text-gray-600 mb-8">
          Reset your DaytaTech database setup by dropping all custom tables. This will allow you to start fresh with a
          clean setup.
        </p>

        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning: Destructive Operation</AlertTitle>
            <AlertDescription>
              This will permanently delete all your custom database tables and data. This action cannot be undone. Only
              proceed if you want to completely reset your setup.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Reset Database Setup</CardTitle>
              <CardDescription>
                This will drop all custom tables including profiles, organizations, projects, analyses, and analytics
                data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <h4 className="font-medium text-red-800 mb-2">What will be deleted:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• All user profiles and data</li>
                    <li>• Organizations and memberships</li>
                    <li>• Projects and analyses</li>
                    <li>• File uploads and activities</li>
                    <li>• Analytics and tracking data</li>
                    <li>• Custom fields and subscriptions</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h4 className="font-medium text-green-800 mb-2">What will be preserved:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Supabase Auth users (login accounts)</li>
                    <li>• Environment variables and configuration</li>
                    <li>• Application code and settings</li>
                  </ul>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="confirmReset"
                    checked={confirmReset}
                    onChange={(e) => setConfirmReset(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="confirmReset" className="text-sm">
                    I understand this will permanently delete all data and cannot be undone
                  </label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={runReset}
                disabled={!confirmReset || isResetting}
                variant="destructive"
                className="w-full"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting Database...
                  </>
                ) : (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4" /> Reset Database Setup
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {resetResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {resetResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  Reset Results
                </CardTitle>
                {resetResult.timestamp && (
                  <CardDescription>Completed at: {new Date(resetResult.timestamp).toLocaleString()}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <Alert variant={resetResult.success ? "default" : "destructive"}>
                  <AlertTitle>{resetResult.success ? "Reset Successful" : "Reset Failed"}</AlertTitle>
                  <AlertDescription>{resetResult.message}</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {resetResult?.success && (
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>Your database has been reset. You can now run a fresh setup.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="w-full" onClick={() => (window.location.href = "/complete-setup")}>
                    Run Complete Setup
                  </Button>

                  <Button className="w-full" variant="outline" onClick={() => (window.location.href = "/auto-repair")}>
                    Run Auto Repair
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  <span>Database Reset Complete</span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/system-health" className="flex items-center gap-1">
                    Check Health <ArrowRight className="h-3 w-3" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
