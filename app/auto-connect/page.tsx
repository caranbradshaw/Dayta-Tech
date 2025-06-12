"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react"
import { EnvTemplateGenerator } from "@/components/env-template-generator"
import { SupabaseStatusBadge } from "@/components/supabase-status-badge"

export default function AutoConnectPage() {
  const [status, setStatus] = useState<{
    checking: boolean
    envVars: {
      hasRequired: boolean
      missing: string[]
      present: string[]
    }
    connection: {
      success: boolean
      message: string
    }
    setup: {
      success: boolean
      message: string
      details: Record<string, any>
    }
  }>({
    checking: true,
    envVars: {
      hasRequired: false,
      missing: [],
      present: [],
    },
    connection: {
      success: false,
      message: "Checking connection...",
    },
    setup: {
      success: false,
      message: "",
      details: {},
    },
  })

  const [setupRunning, setSetupRunning] = useState(false)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    setStatus((prev) => ({ ...prev, checking: true }))

    try {
      const response = await fetch("/api/check-supabase-status")
      const data = await response.json()

      setStatus({
        checking: false,
        envVars: {
          hasRequired: data.envStatus.hasRequiredVars,
          missing: data.envStatus.missingVars || [],
          present: data.envStatus.presentVars || [],
        },
        connection: {
          success: data.connectionStatus?.success || false,
          message: data.connectionStatus?.message || "Connection status unknown",
        },
        setup: {
          success: data.setupStatus?.success || false,
          message: data.setupStatus?.message || "Setup status unknown",
          details: data.setupStatus?.details || {},
        },
      })
    } catch (error) {
      setStatus({
        checking: false,
        envVars: {
          hasRequired: false,
          missing: ["Error checking environment variables"],
          present: [],
        },
        connection: {
          success: false,
          message: "Failed to check connection",
        },
        setup: {
          success: false,
          message: "Failed to check setup status",
          details: {},
        },
      })
    }
  }

  const runSetup = async () => {
    setSetupRunning(true)

    try {
      const response = await fetch("/api/supabase-auto-setup", {
        method: "POST",
      })
      const data = await response.json()

      // Update status after setup
      await checkStatus()
    } catch (error) {
      console.error("Error running setup:", error)
    } finally {
      setSetupRunning(false)
    }
  }

  const getStatusIcon = (success: boolean, loading = false) => {
    if (loading) return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    if (success) return <CheckCircle className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Supabase Auto Connect</h1>
        <SupabaseStatusBadge />
      </div>

      <div className="space-y-6">
        {status.checking ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
                <p>Checking Supabase status...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Connection Status</CardTitle>
                <CardDescription>Current status of your Supabase connection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="mr-3 mt-0.5">{getStatusIcon(status.envVars.hasRequired)}</div>
                    <div>
                      <p className="font-medium">Environment Variables</p>
                      <p className={status.envVars.hasRequired ? "text-green-700" : "text-red-700"}>
                        {status.envVars.hasRequired
                          ? "All required environment variables are set"
                          : `Missing required variables: ${status.envVars.missing.join(", ")}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-3 mt-0.5">{getStatusIcon(status.connection.success)}</div>
                    <div>
                      <p className="font-medium">Supabase Connection</p>
                      <p className={status.connection.success ? "text-green-700" : "text-red-700"}>
                        {status.connection.message}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button onClick={checkStatus}>Refresh Status</Button>
                </div>
              </CardContent>
            </Card>

            {!status.envVars.hasRequired && <EnvTemplateGenerator />}

            {status.envVars.hasRequired && status.connection.success && (
              <Card>
                <CardHeader>
                  <CardTitle>Database Setup</CardTitle>
                  <CardDescription>Automatically set up all required database tables</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    This will create all necessary tables in your Supabase database. Your existing data will not be
                    affected.
                  </p>

                  <Button onClick={runSetup} disabled={setupRunning || !status.connection.success}>
                    {setupRunning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up...
                      </>
                    ) : (
                      "Run Auto Setup"
                    )}
                  </Button>

                  {Object.keys(status.setup.details).length > 0 && (
                    <div className="mt-6 space-y-3">
                      <h3 className="font-medium">Setup Status:</h3>
                      {Object.entries(status.setup.details).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex items-start border rounded-md p-2">
                          <div className="mr-2 mt-0.5">{getStatusIcon(value.success)}</div>
                          <div>
                            <p className="font-medium capitalize">{key}</p>
                            <p className={value.success ? "text-green-700" : "text-red-700"}>{value.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {!status.envVars.hasRequired && (
                    <div className="flex items-center justify-between border rounded-md p-3">
                      <div className="flex items-center">
                        <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3">
                          1
                        </div>
                        <span>Set up environment variables</span>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1" asChild>
                        <a href="#env-template">
                          Configure <ArrowRight className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  )}

                  {status.envVars.hasRequired && !status.connection.success && (
                    <div className="flex items-center justify-between border rounded-md p-3">
                      <div className="flex items-center">
                        <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3">
                          2
                        </div>
                        <span>Fix connection issues</span>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1" asChild>
                        <a href="/supabase-setup">
                          Troubleshoot <ArrowRight className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  )}

                  {status.connection.success && !status.setup.success && (
                    <div className="flex items-center justify-between border rounded-md p-3">
                      <div className="flex items-center">
                        <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3">
                          3
                        </div>
                        <span>Run database setup</span>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1" onClick={runSetup} disabled={setupRunning}>
                        {setupRunning ? "Running..." : "Setup"} <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {status.setup.success && (
                    <div className="flex items-center justify-between border rounded-md p-3 bg-green-50">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        <span>Setup complete!</span>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1" asChild>
                        <a href="/verify-setup">
                          Verify <ArrowRight className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center justify-between border rounded-md p-3">
                    <div className="flex items-center">
                      <div className="bg-gray-100 text-gray-800 rounded-full w-6 h-6 flex items-center justify-center mr-3">
                        ?
                      </div>
                      <span>View detailed setup guide</span>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1" asChild>
                      <a href="/supabase-setup">
                        Advanced <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
