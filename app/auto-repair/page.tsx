"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, AlertCircle, Loader2, Database, ArrowRight, ShieldCheck } from "lucide-react"

export default function AutoRepairPage() {
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean
    message: string
    checking: boolean
  }>({
    success: false,
    message: "Checking connection...",
    checking: true,
  })

  const [repairStatus, setRepairStatus] = useState<{
    success: boolean
    message: string
    details: Record<string, any>
    running: boolean
    completed: boolean
  }>({
    success: false,
    message: "",
    details: {},
    running: false,
    completed: false,
  })

  const [progress, setProgress] = useState(0)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    setConnectionStatus({
      success: false,
      message: "Checking connection...",
      checking: true,
    })

    try {
      const response = await fetch("/api/supabase-auto-repair")
      const data = await response.json()

      setConnectionStatus({
        success: data.success,
        message: data.message,
        checking: false,
      })
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: error instanceof Error ? error.message : "Failed to check connection",
        checking: false,
      })
    }
  }

  const runRepair = async () => {
    setRepairStatus({
      ...repairStatus,
      running: true,
      message: "Repairing Supabase database...",
      completed: false,
    })
    setProgress(10)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 5
          return newProgress >= 90 ? 90 : newProgress
        })
      }, 500)

      const response = await fetch("/api/supabase-auto-repair", {
        method: "POST",
      })
      const data = await response.json()

      clearInterval(progressInterval)
      setProgress(100)

      setRepairStatus({
        success: data.success,
        message: data.message,
        details: data.status || {},
        running: false,
        completed: true,
      })
    } catch (error) {
      setRepairStatus({
        success: false,
        message: error instanceof Error ? error.message : "Failed to run repair",
        details: {},
        running: false,
        completed: true,
      })
      setProgress(100)
    }
  }

  const getStatusIcon = (status: boolean | undefined, loading = false) => {
    if (loading) return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    if (status === undefined) return <AlertCircle className="h-5 w-5 text-yellow-500" />
    if (status) return <CheckCircle className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusClass = (status: boolean | undefined, loading = false) => {
    if (loading) return "text-blue-700"
    if (status === undefined) return "text-yellow-700"
    if (status) return "text-green-700"
    return "text-red-700"
  }

  const getBadgeVariant = (status: boolean | undefined) => {
    if (status === undefined) return "secondary"
    if (status) return "default"
    return "destructive"
  }

  const canRunRepair = connectionStatus.success && !repairStatus.running

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Supabase Auto Repair</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>Check if we can connect to your Supabase project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start">
              <div className="mr-3 mt-0.5">{getStatusIcon(connectionStatus.success, connectionStatus.checking)}</div>
              <div>
                <p className="font-medium">Supabase Connection</p>
                <p className={getStatusClass(connectionStatus.success, connectionStatus.checking)}>
                  {connectionStatus.message}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <Button onClick={checkConnection} disabled={connectionStatus.checking}>
                {connectionStatus.checking ? "Checking..." : "Test Connection"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Auto Repair</CardTitle>
            <CardDescription>Automatically fix common Supabase setup issues</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This tool will automatically detect and fix issues with your Supabase setup, including:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Creating missing database tables</li>
              <li>Setting up proper relationships between tables</li>
              <li>Configuring Row Level Security policies</li>
              <li>Enabling required PostgreSQL extensions</li>
            </ul>

            {repairStatus.running && (
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Repair in progress...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <Button onClick={runRepair} disabled={!canRunRepair || repairStatus.running}>
              {repairStatus.running ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Repairing...
                </>
              ) : (
                "Run Auto Repair"
              )}
            </Button>

            {repairStatus.completed && (
              <Alert className="mt-4" variant={repairStatus.success ? "default" : "destructive"}>
                <AlertTitle>{repairStatus.success ? "Repair Successful" : "Repair Issues"}</AlertTitle>
                <AlertDescription>{repairStatus.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {Object.keys(repairStatus.details).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Repair Details</CardTitle>
              <CardDescription>Detailed results of the database repair process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(repairStatus.details).map(([key, value]: [string, any]) => (
                  <div key={key} className="border rounded-md p-3">
                    <div className="flex items-center">
                      <div className="mr-3">{getStatusIcon(value.success)}</div>
                      <div>
                        <p className="font-medium capitalize">{key}</p>
                        <p className={getStatusClass(value.success)}>{value.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {repairStatus.completed && repairStatus.success && (
                <Alert>
                  <ShieldCheck className="h-4 w-4" />
                  <AlertTitle>Supabase Setup Complete</AlertTitle>
                  <AlertDescription>
                    Your Supabase database has been successfully set up and is ready to use!
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  className="w-full"
                  variant={repairStatus.completed && repairStatus.success ? "default" : "outline"}
                  onClick={() => (window.location.href = "/verify-setup")}
                >
                  Verify Setup
                </Button>

                <Button className="w-full" variant="outline" onClick={() => (window.location.href = "/system-health")}>
                  Check System Health
                </Button>

                <Button className="w-full" variant="outline" onClick={() => (window.location.href = "/")}>
                  Return to Homepage
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <Database className="h-4 w-4 mr-1" />
              <span>Powered by Supabase Auto Repair</span>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a href="/supabase-status" className="flex items-center gap-1">
                View Detailed Status <ArrowRight className="h-3 w-3" />
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
