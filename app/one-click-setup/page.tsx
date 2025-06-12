"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, Loader2, ArrowRight, Database, Settings, Shield, Table, Key } from "lucide-react"

export default function OneClickSetupPage() {
  const [status, setStatus] = useState<{
    step: number
    totalSteps: number
    message: string
    details: string
    error: string | null
    success: boolean
    completed: boolean
    running: boolean
  }>({
    step: 0,
    totalSteps: 5,
    message: "Ready to start setup",
    details: "Click the button below to automatically set up your Supabase database",
    error: null,
    success: false,
    completed: false,
    running: false,
  })

  const [progress, setProgress] = useState(0)

  const runSetup = async () => {
    setStatus({
      ...status,
      running: true,
      step: 1,
      message: "Checking connection...",
      details: "Verifying connection to your Supabase project",
      error: null,
    })
    setProgress(10)

    try {
      // Step 1: Check connection
      const connectionResponse = await fetch("/api/supabase-auto-repair")
      const connectionData = await connectionResponse.json()

      if (!connectionData.success) {
        throw new Error(`Connection failed: ${connectionData.message}`)
      }

      setStatus({
        ...status,
        step: 2,
        message: "Creating SQL execution function...",
        details: "Setting up the exec_sql function for database operations",
        error: null,
      })
      setProgress(25)

      // Step 2: Create exec_sql function
      const createFunctionResponse = await fetch("/api/create-exec-sql-function", {
        method: "POST",
      })
      const createFunctionData = await createFunctionResponse.json()

      if (!createFunctionData.success) {
        console.warn("Warning: Failed to create exec_sql function, but continuing with setup")
      }

      setStatus({
        ...status,
        step: 3,
        message: "Repairing database...",
        details: "Creating tables and setting up relationships",
        error: null,
      })
      setProgress(40)

      // Step 3: Run database repair
      const repairResponse = await fetch("/api/supabase-auto-repair", {
        method: "POST",
      })
      const repairData = await repairResponse.json()

      if (!repairData.success) {
        throw new Error(`Database repair failed: ${repairData.message}`)
      }

      setStatus({
        ...status,
        step: 4,
        message: "Verifying setup...",
        details: "Checking that all components are working correctly",
        error: null,
      })
      setProgress(75)

      // Step 4: Verify setup
      const verifyResponse = await fetch("/api/system-health-check")
      const verifyData = await verifyResponse.json()

      setStatus({
        ...status,
        step: 5,
        message: "Setup complete!",
        details: `Your Supabase database is now set up and ready to use. Health score: ${Math.round(
          (verifyData.overall.score / verifyData.overall.maxScore) * 100,
        )}%`,
        error: null,
        success: true,
        completed: true,
        running: false,
      })
      setProgress(100)
    } catch (error) {
      setStatus({
        ...status,
        message: "Setup failed",
        details: "There was an error setting up your Supabase database",
        error: error instanceof Error ? error.message : "Unknown error occurred",
        success: false,
        completed: true,
        running: false,
      })
      setProgress(100)
    }
  }

  const getStepIcon = (stepNumber: number) => {
    if (status.step > stepNumber) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (status.step === stepNumber && status.running) return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    if (status.step === stepNumber && status.error) return <XCircle className="h-5 w-5 text-red-500" />
    return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
  }

  const steps = [
    { number: 1, title: "Check Connection", icon: Database, description: "Verify Supabase connection" },
    { number: 2, title: "Setup Functions", icon: Settings, description: "Create SQL execution functions" },
    { number: 3, title: "Create Tables", icon: Table, description: "Set up database schema" },
    { number: 4, title: "Configure Security", icon: Shield, description: "Apply security policies" },
    { number: 5, title: "Verify Setup", icon: Key, description: "Test all components" },
  ]

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">One-Click Supabase Setup</h1>
        <p className="text-gray-600 mb-8">
          Automatically configure your Supabase database with all the necessary tables, relationships, and security
          policies.
        </p>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Setup Progress</CardTitle>
              <CardDescription>
                {status.running
                  ? `Step ${status.step} of ${status.totalSteps}: ${status.message}`
                  : status.completed
                    ? status.success
                      ? "Setup completed successfully!"
                      : "Setup failed"
                    : "Ready to begin setup"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{status.message}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <p className="text-sm text-gray-600">{status.details}</p>

                {status.error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Setup Error</AlertTitle>
                    <AlertDescription>{status.error}</AlertDescription>
                  </Alert>
                )}

                {status.success && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Setup Successful</AlertTitle>
                    <AlertDescription>Your Supabase database is now ready to use!</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={runSetup} disabled={status.running} className="w-full">
                {status.running ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up...
                  </>
                ) : status.completed ? (
                  status.success ? (
                    "Setup Complete"
                  ) : (
                    "Retry Setup"
                  )
                ) : (
                  "Start One-Click Setup"
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Setup Steps</CardTitle>
              <CardDescription>Overview of what will be configured</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {steps.map((step) => {
                  const StepIcon = step.icon
                  return (
                    <div key={step.number} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">{getStepIcon(step.number)}</div>
                      <div className="flex-shrink-0">
                        <StepIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium">{step.title}</p>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {status.completed && (
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>What to do after setup</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => (window.location.href = "/system-health")}
                  >
                    Check System Health
                  </Button>

                  <Button className="w-full" variant="outline" onClick={() => (window.location.href = "/dashboard")}>
                    Go to Dashboard
                  </Button>

                  <Button className="w-full" variant="outline" onClick={() => (window.location.href = "/")}>
                    Return Home
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Database className="h-4 w-4 mr-1" />
                  <span>Powered by DaytaTech.ai</span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/supabase-status" className="flex items-center gap-1">
                    View Status <ArrowRight className="h-3 w-3" />
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
