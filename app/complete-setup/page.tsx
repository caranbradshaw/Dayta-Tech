"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  Database,
  Settings,
  Shield,
  Table,
  Key,
  Activity,
  BarChart3,
  CheckSquare,
} from "lucide-react"

interface SetupStep {
  success: boolean
  message: string
  details?: any
}

interface SetupResults {
  timestamp: string
  steps: Record<string, SetupStep>
  overall: {
    success: boolean
    message: string
    completedSteps: number
    totalSteps: number
  }
  error?: {
    message: string
    details: any
  }
}

export default function CompleteSetupPage() {
  const [setupResults, setSetupResults] = useState<SetupResults | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  const runCompleteSetup = async () => {
    setIsRunning(true)
    setProgress(0)
    setSetupResults(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 8
          return newProgress >= 95 ? 95 : newProgress
        })
      }, 500)

      const response = await fetch("/api/complete-setup", {
        method: "POST",
      })

      const data = await response.json()

      clearInterval(progressInterval)
      setProgress(100)
      setSetupResults(data)
    } catch (error) {
      setSetupResults({
        timestamp: new Date().toISOString(),
        steps: {},
        overall: {
          success: false,
          message: `Setup failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          completedSteps: 0,
          totalSteps: 8,
        },
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          details: error,
        },
      })
      setProgress(100)
    } finally {
      setIsRunning(false)
    }
  }

  const getStepIcon = (stepName: string) => {
    switch (stepName) {
      case "environment":
        return <Settings className="h-5 w-5" />
      case "connection":
        return <Database className="h-5 w-5" />
      case "extensions":
        return <Key className="h-5 w-5" />
      case "coreTables":
        return <Table className="h-5 w-5" />
      case "activityTables":
        return <Activity className="h-5 w-5" />
      case "analyticsTables":
        return <BarChart3 className="h-5 w-5" />
      case "rowLevelSecurity":
        return <Shield className="h-5 w-5" />
      case "verification":
        return <CheckSquare className="h-5 w-5" />
      default:
        return <Settings className="h-5 w-5" />
    }
  }

  const getStepTitle = (stepName: string) => {
    switch (stepName) {
      case "environment":
        return "Environment Variables"
      case "connection":
        return "Supabase Connection"
      case "extensions":
        return "PostgreSQL Extensions"
      case "coreTables":
        return "Core Tables"
      case "activityTables":
        return "Activity Tables"
      case "analyticsTables":
        return "Analytics Tables"
      case "rowLevelSecurity":
        return "Row Level Security"
      case "verification":
        return "Setup Verification"
      default:
        return stepName
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusColor = (success: boolean) => {
    return success ? "text-green-700" : "text-red-700"
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Complete DaytaTech Setup</h1>
        <p className="text-gray-600 mb-8">
          Run the complete setup process to configure your DaytaTech SaaS application with all necessary database
          tables, security policies, and configurations.
        </p>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Setup Process</CardTitle>
              <CardDescription>
                This will automatically configure your entire DaytaTech application including database tables, security
                policies, and analytics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isRunning && (
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span>Running complete setup...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-medium">Setup Steps:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Check environment variables</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Test Supabase connection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Key className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Enable PostgreSQL extensions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Table className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Create core tables</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Create activity tables</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Create analytics tables</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Enable Row Level Security</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Verify setup completion</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={runCompleteSetup} disabled={isRunning} className="w-full">
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running Complete Setup...
                  </>
                ) : (
                  "Start Complete Setup"
                )}
              </Button>
            </CardFooter>
          </Card>

          {setupResults && (
            <>
              {/* Overall Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(setupResults.overall.success)}
                    Setup Results
                    <Badge variant={setupResults.overall.success ? "default" : "destructive"}>
                      {setupResults.overall.completedSteps}/{setupResults.overall.totalSteps} COMPLETED
                    </Badge>
                  </CardTitle>
                  <CardDescription>Completed at: {new Date(setupResults.timestamp).toLocaleString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Setup Progress</span>
                        <span className="text-sm text-gray-600">
                          {setupResults.overall.completedSteps}/{setupResults.overall.totalSteps} (
                          {Math.round((setupResults.overall.completedSteps / setupResults.overall.totalSteps) * 100)}%)
                        </span>
                      </div>
                      <Progress
                        value={(setupResults.overall.completedSteps / setupResults.overall.totalSteps) * 100}
                        className="h-3"
                      />
                    </div>

                    <Alert variant={setupResults.overall.success ? "default" : "destructive"}>
                      <AlertTitle>{setupResults.overall.success ? "Setup Successful" : "Setup Issues"}</AlertTitle>
                      <AlertDescription>{setupResults.overall.message}</AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Step Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Step Details</CardTitle>
                  <CardDescription>Detailed results for each setup step</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(setupResults.steps).map(([stepName, stepResult]) => (
                      <div key={stepName} className="border rounded-md p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">{getStatusIcon(stepResult.success)}</div>
                          <div className="flex-shrink-0 mt-0.5">{getStepIcon(stepName)}</div>
                          <div className="flex-grow">
                            <h4 className="font-medium">{getStepTitle(stepName)}</h4>
                            <p className={`text-sm ${getStatusColor(stepResult.success)}`}>{stepResult.message}</p>
                            {stepResult.details && (
                              <details className="mt-2">
                                <summary className="cursor-pointer text-xs text-gray-600">View Details</summary>
                                <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                                  {JSON.stringify(stepResult.details, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                  <CardDescription>What to do after setup</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      className="w-full"
                      variant={setupResults.overall.success ? "default" : "outline"}
                      onClick={() => (window.location.href = "/comprehensive-check")}
                    >
                      Verify Setup
                    </Button>

                    <Button className="w-full" variant="outline" onClick={() => (window.location.href = "/signup")}>
                      Test Signup
                    </Button>

                    <Button className="w-full" variant="outline" onClick={() => (window.location.href = "/dashboard")}>
                      Go to Dashboard
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Database className="h-4 w-4 mr-1" />
                    <span>DaytaTech Complete Setup</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="/system-health" className="flex items-center gap-1">
                      System Health <ArrowRight className="h-3 w-3" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
