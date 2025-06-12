"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SupabaseSetupPage() {
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean
    message: string
    checking: boolean
  }>({
    success: false,
    message: "Checking connection...",
    checking: true,
  })

  const [setupStatus, setSetupStatus] = useState<{
    success: boolean
    message: string
    details: Record<string, any>
    running: boolean
  }>({
    success: false,
    message: "",
    details: {},
    running: false,
  })

  const [envVariables, setEnvVariables] = useState<{
    supabaseUrl: boolean
    supabaseKey: boolean
    serviceRoleKey: boolean
    postgresUrl: boolean
  }>({
    supabaseUrl: false,
    supabaseKey: false,
    serviceRoleKey: false,
    postgresUrl: false,
  })

  useEffect(() => {
    checkConnection()
    checkEnvVariables()
  }, [])

  const checkConnection = async () => {
    setConnectionStatus({
      success: false,
      message: "Checking connection...",
      checking: true,
    })

    try {
      const response = await fetch("/api/supabase-auto-setup")
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

  const checkEnvVariables = async () => {
    try {
      const response = await fetch("/api/debug/env-check")
      const data = await response.json()

      if (data.envStatus) {
        setEnvVariables({
          supabaseUrl: !!(data.envStatus.NEXT_PUBLIC_SUPABASE_URL || data.envStatus.SUPABASE_URL),
          supabaseKey: !!(data.envStatus.NEXT_PUBLIC_SUPABASE_ANON_KEY || data.envStatus.SUPABASE_ANON_KEY),
          serviceRoleKey: !!data.envStatus.SUPABASE_SERVICE_ROLE_KEY,
          postgresUrl: !!(
            data.envStatus.POSTGRES_URL ||
            data.envStatus.DATABASE_URL ||
            data.envStatus.POSTGRES_PRISMA_URL
          ),
        })
      }
    } catch (error) {
      console.error("Failed to check environment variables:", error)
    }
  }

  const runSetup = async () => {
    setSetupStatus({
      ...setupStatus,
      running: true,
      message: "Setting up Supabase database...",
    })

    try {
      const response = await fetch("/api/supabase-auto-setup", {
        method: "POST",
      })
      const data = await response.json()

      setSetupStatus({
        success: data.success,
        message: data.message,
        details: data.status || {},
        running: false,
      })
    } catch (error) {
      setSetupStatus({
        success: false,
        message: error instanceof Error ? error.message : "Failed to run setup",
        details: {},
        running: false,
      })
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

  const allEnvVariablesSet = Object.values(envVariables).every(Boolean)
  const canRunSetup = connectionStatus.success && !setupStatus.running

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Supabase Auto Setup</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Check if all required environment variables are set</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="mr-3 mt-0.5">{getStatusIcon(envVariables.supabaseUrl)}</div>
                <div>
                  <p className="font-medium">Supabase URL</p>
                  <p className={getStatusClass(envVariables.supabaseUrl)}>
                    {envVariables.supabaseUrl
                      ? "NEXT_PUBLIC_SUPABASE_URL is set"
                      : "NEXT_PUBLIC_SUPABASE_URL is missing"}
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="mr-3 mt-0.5">{getStatusIcon(envVariables.supabaseKey)}</div>
                <div>
                  <p className="font-medium">Supabase Anon Key</p>
                  <p className={getStatusClass(envVariables.supabaseKey)}>
                    {envVariables.supabaseKey
                      ? "NEXT_PUBLIC_SUPABASE_ANON_KEY is set"
                      : "NEXT_PUBLIC_SUPABASE_ANON_KEY is missing"}
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="mr-3 mt-0.5">{getStatusIcon(envVariables.serviceRoleKey)}</div>
                <div>
                  <p className="font-medium">Supabase Service Role Key</p>
                  <p className={getStatusClass(envVariables.serviceRoleKey)}>
                    {envVariables.serviceRoleKey
                      ? "SUPABASE_SERVICE_ROLE_KEY is set"
                      : "SUPABASE_SERVICE_ROLE_KEY is missing (optional but recommended)"}
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="mr-3 mt-0.5">{getStatusIcon(envVariables.postgresUrl)}</div>
                <div>
                  <p className="font-medium">PostgreSQL URL</p>
                  <p className={getStatusClass(envVariables.postgresUrl)}>
                    {envVariables.postgresUrl
                      ? "Database connection URL is set"
                      : "Database connection URL is missing (optional)"}
                  </p>
                </div>
              </li>
            </ul>

            {!allEnvVariablesSet && (
              <Alert className="mt-4" variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Missing environment variables</AlertTitle>
                <AlertDescription>
                  Some required environment variables are missing. Please add them to your .env.local file.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

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
            <CardTitle>Database Setup</CardTitle>
            <CardDescription>Automatically set up all required database tables</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This will create all necessary tables in your Supabase database. Your existing data will not be affected.
            </p>

            <Button onClick={runSetup} disabled={!canRunSetup || setupStatus.running}>
              {setupStatus.running ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up...
                </>
              ) : (
                "Run Auto Setup"
              )}
            </Button>

            {setupStatus.message && (
              <Alert className="mt-4" variant={setupStatus.success ? "default" : "destructive"}>
                <AlertTitle>{setupStatus.success ? "Success" : "Setup Issues"}</AlertTitle>
                <AlertDescription>{setupStatus.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {Object.keys(setupStatus.details).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Setup Details</CardTitle>
              <CardDescription>Detailed results of the database setup process</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tables">
                <TabsList>
                  <TabsTrigger value="tables">Tables</TabsTrigger>
                  <TabsTrigger value="json">JSON Response</TabsTrigger>
                </TabsList>
                <TabsContent value="tables">
                  <div className="space-y-4 mt-4">
                    {Object.entries(setupStatus.details).map(([key, value]: [string, any]) => (
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
                </TabsContent>
                <TabsContent value="json">
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 text-sm mt-4">
                    {JSON.stringify(setupStatus.details, null, 2)}
                  </pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                className="w-full"
                variant={connectionStatus.success && setupStatus.success ? "default" : "outline"}
                onClick={() => (window.location.href = "/verify-setup")}
              >
                Verify Complete Setup
              </Button>

              <Button className="w-full" variant="outline" onClick={() => (window.location.href = "/env-status")}>
                View Environment Status
              </Button>

              <Button className="w-full" variant="outline" onClick={() => (window.location.href = "/")}>
                Return to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
