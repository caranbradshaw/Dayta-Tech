"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw, ExternalLink } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SupabaseStatus {
  success: boolean
  message: string
  summary: {
    environmentVariables: string
    connection: boolean
    tablesSetup: string
    authConfigured: boolean
    readyForUse: boolean
  }
  envStatus: Record<string, boolean>
  connectionTest: {
    success: boolean
    message: string
    details: any
  }
  tableStatus: Record<
    string,
    {
      exists: boolean
      message: string
      error?: string
      data?: any
    }
  >
  authStatus: {
    configured: boolean
    message: string
  }
  recommendations: Array<{
    priority: string
    action: string
    description: string
    link: string
  }>
}

export default function SupabaseStatusPage() {
  const [status, setStatus] = useState<SupabaseStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    setLoading(true)
    setRefreshing(true)

    try {
      const response = await fetch("/api/check-supabase-detailed")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("Error checking Supabase status:", error)
      setStatus({
        success: false,
        message: "Failed to check Supabase status",
        summary: {
          environmentVariables: "0/4",
          connection: false,
          tablesSetup: "0/12",
          authConfigured: false,
          readyForUse: false,
        },
        envStatus: {},
        connectionTest: {
          success: false,
          message: "Failed to test connection",
          details: null,
        },
        tableStatus: {},
        authStatus: {
          configured: false,
          message: "Failed to check auth status",
        },
        recommendations: [],
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getStatusIcon = (success: boolean | undefined, loading = false) => {
    if (loading) return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    if (success === undefined) return <AlertCircle className="h-5 w-5 text-yellow-500" />
    if (success) return <CheckCircle className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusColor = (success: boolean | undefined) => {
    if (success === undefined) return "text-yellow-700"
    if (success) return "text-green-700"
    return "text-red-700"
  }

  const getBadgeVariant = (success: boolean | undefined) => {
    if (success === undefined) return "secondary"
    if (success) return "default"
    return "destructive"
  }

  if (loading && !status) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
          <p>Checking Supabase status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Supabase Status Check</h1>
        <Button onClick={checkStatus} disabled={refreshing} variant="outline">
          {refreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </>
          )}
        </Button>
      </div>

      {status && (
        <div className="space-y-6">
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(status.success)}
                Overall Status
              </CardTitle>
              <CardDescription>{status.message}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Environment</p>
                  <Badge variant={getBadgeVariant(status.summary.environmentVariables === "4/4")}>
                    {status.summary.environmentVariables}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Connection</p>
                  <Badge variant={getBadgeVariant(status.summary.connection)}>
                    {status.summary.connection ? "Connected" : "Failed"}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Tables</p>
                  <Badge variant={getBadgeVariant(status.summary.tablesSetup.startsWith("12/"))}>
                    {status.summary.tablesSetup}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Auth</p>
                  <Badge variant={getBadgeVariant(status.summary.authConfigured)}>
                    {status.summary.authConfigured ? "Ready" : "Not Ready"}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Ready</p>
                  <Badge variant={getBadgeVariant(status.summary.readyForUse)}>
                    {status.summary.readyForUse ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {status.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Actions to improve your Supabase setup</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {status.recommendations.map((rec, index) => (
                    <Alert key={index} variant={rec.priority === "high" ? "destructive" : "default"}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="flex items-center justify-between">
                        {rec.action}
                        <Button variant="ghost" size="sm" asChild>
                          <a href={rec.link} className="gap-1">
                            Fix <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </AlertTitle>
                      <AlertDescription>{rec.description}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Status */}
          <Tabs defaultValue="connection">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="connection">Connection</TabsTrigger>
              <TabsTrigger value="environment">Environment</TabsTrigger>
              <TabsTrigger value="tables">Tables</TabsTrigger>
              <TabsTrigger value="auth">Authentication</TabsTrigger>
            </TabsList>

            <TabsContent value="connection">
              <Card>
                <CardHeader>
                  <CardTitle>Connection Test</CardTitle>
                  <CardDescription>Test connection to your Supabase project</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start">
                    <div className="mr-3 mt-0.5">{getStatusIcon(status.connectionTest.success)}</div>
                    <div>
                      <p className="font-medium">Connection Status</p>
                      <p className={getStatusColor(status.connectionTest.success)}>{status.connectionTest.message}</p>
                      {status.connectionTest.details && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm text-gray-600">View Details</summary>
                          <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                            {JSON.stringify(status.connectionTest.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="environment">
              <Card>
                <CardHeader>
                  <CardTitle>Environment Variables</CardTitle>
                  <CardDescription>Status of required environment variables</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(status.envStatus).map(([key, value]) => (
                      <div key={key} className="flex items-start">
                        <div className="mr-3 mt-0.5">{getStatusIcon(value)}</div>
                        <div>
                          <p className="font-medium font-mono text-sm">{key}</p>
                          <p className={getStatusColor(value)}>{value ? "Set" : "Missing"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tables">
              <Card>
                <CardHeader>
                  <CardTitle>Database Tables</CardTitle>
                  <CardDescription>Status of required database tables</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(status.tableStatus).map(([tableName, tableInfo]) => (
                      <div key={tableName} className="flex items-start">
                        <div className="mr-3 mt-0.5">{getStatusIcon(tableInfo.exists)}</div>
                        <div>
                          <p className="font-medium font-mono text-sm">{tableName}</p>
                          <p className={getStatusColor(tableInfo.exists)}>{tableInfo.message}</p>
                          {tableInfo.error && <p className="text-xs text-red-600 mt-1">{tableInfo.error}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="auth">
              <Card>
                <CardHeader>
                  <CardTitle>Authentication</CardTitle>
                  <CardDescription>Supabase authentication status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start">
                    <div className="mr-3 mt-0.5">{getStatusIcon(status.authStatus.configured)}</div>
                    <div>
                      <p className="font-medium">Authentication Service</p>
                      <p className={getStatusColor(status.authStatus.configured)}>{status.authStatus.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" asChild>
                  <a href="/auto-connect">Auto Setup</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/supabase-setup">Manual Setup</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/verify-setup">Verify Setup</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
