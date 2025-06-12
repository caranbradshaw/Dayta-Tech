"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw, Bug, AlertTriangle, Info } from "lucide-react"

interface DiagnosisResult {
  timestamp: string
  environment: {
    nodeVersion: string
    platform: string
    nextjsVersion: string
  }
  environmentVariables: Record<string, any>
  supabaseTest: {
    canImport: boolean
    canConnect: boolean
    error: any
    connectionDetails: any
  }
  databaseTest: {
    tablesExist: Record<string, any>
    permissions: Record<string, any>
    errors: string[]
  }
  actualError: string
  recommendations: string[]
}

export default function DiagnosePage() {
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runDiagnosis()
  }, [])

  const runDiagnosis = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/diagnose-issue")
      const data = await response.json()
      setDiagnosis(data)
    } catch (error) {
      console.error("Diagnosis failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: boolean | string) => {
    if (typeof status === "boolean") {
      return status ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
    }

    switch (status) {
      case "SUCCESS":
      case "CONNECTED_WITH_TABLES":
      case "VALID_HTTPS":
      case "VALID_JWT":
      case "VALID_POSTGRES":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "CONNECTED_BUT_NO_TABLES":
      case "WARNING":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "ERROR":
      case "CONNECTION_ERROR":
      case "MISSING":
      case "INVALID_FORMAT":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityIcon = (recommendation: string) => {
    if (recommendation.startsWith("CRITICAL:")) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    } else if (recommendation.startsWith("ERROR:")) {
      return <XCircle className="h-4 w-4 text-red-500" />
    } else if (recommendation.startsWith("WARNING:")) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    } else if (recommendation.startsWith("SUCCESS:")) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <Info className="h-4 w-4 text-blue-500" />
  }

  const getPriorityColor = (recommendation: string) => {
    if (recommendation.startsWith("CRITICAL:")) {
      return "text-red-700 bg-red-50 border-red-200"
    } else if (recommendation.startsWith("ERROR:")) {
      return "text-red-700 bg-red-50 border-red-200"
    } else if (recommendation.startsWith("WARNING:")) {
      return "text-yellow-700 bg-yellow-50 border-yellow-200"
    } else if (recommendation.startsWith("SUCCESS:")) {
      return "text-green-700 bg-green-50 border-green-200"
    }
    return "text-blue-700 bg-blue-50 border-blue-200"
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
          <p>Running deep system diagnosis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bug className="h-8 w-8" />
            System Diagnosis
          </h1>
          <p className="text-gray-600">Deep analysis of your DaytaTech setup to identify the root issue</p>
        </div>
        <Button onClick={runDiagnosis} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> Re-run Diagnosis
        </Button>
      </div>

      {diagnosis && (
        <div className="space-y-6">
          {/* Root Issue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                Root Issue Identified
              </CardTitle>
              <CardDescription>Last diagnosed: {new Date(diagnosis.timestamp).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Primary Issue</AlertTitle>
                <AlertDescription className="text-lg font-medium">{diagnosis.actualError}</AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Specific Recommendations</CardTitle>
              <CardDescription>Prioritized actions to fix your setup</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {diagnosis.recommendations.map((rec, index) => (
                  <Alert key={index} className={getPriorityColor(rec)}>
                    {getPriorityIcon(rec)}
                    <AlertDescription className="ml-6">{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <Tabs defaultValue="environment">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="environment">Environment</TabsTrigger>
              <TabsTrigger value="supabase">Supabase</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value="environment">
              <Card>
                <CardHeader>
                  <CardTitle>Environment Variables Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(diagnosis.environmentVariables).map(([key, details]: [string, any]) => (
                      <div key={key} className="border rounded-md p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium font-mono text-sm">{key}</h4>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(details.exists)}
                            <Badge variant={details.exists ? "default" : "destructive"}>{details.value}</Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Length: </span>
                            <span>{details.length} characters</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600">Format: </span>
                            {getStatusIcon(details.format)}
                            <span>{details.format}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="supabase">
              <Card>
                <CardHeader>
                  <CardTitle>Supabase Connection Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-md p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(diagnosis.supabaseTest.canImport)}
                          <h4 className="font-medium">Package Import</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          {diagnosis.supabaseTest.canImport
                            ? "✅ Can import @supabase/supabase-js"
                            : "❌ Cannot import Supabase package"}
                        </p>
                      </div>

                      <div className="border rounded-md p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(diagnosis.supabaseTest.canConnect)}
                          <h4 className="font-medium">Connection Test</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          {diagnosis.supabaseTest.canConnect
                            ? "✅ Can connect to Supabase"
                            : "❌ Cannot connect to Supabase"}
                        </p>
                      </div>
                    </div>

                    {diagnosis.supabaseTest.connectionDetails && (
                      <div className="border rounded-md p-4">
                        <h4 className="font-medium mb-2">Connection Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(diagnosis.supabaseTest.connectionDetails.actualStatus)}
                            <span className="font-medium">Status: </span>
                            <span>{diagnosis.supabaseTest.connectionDetails.actualStatus}</span>
                          </div>
                          {diagnosis.supabaseTest.connectionDetails.errorMessage && (
                            <div>
                              <span className="font-medium text-red-600">Error: </span>
                              <span className="text-red-600">
                                {diagnosis.supabaseTest.connectionDetails.errorMessage}
                              </span>
                            </div>
                          )}
                          {diagnosis.supabaseTest.connectionDetails.errorCode && (
                            <div>
                              <span className="font-medium">Error Code: </span>
                              <span className="font-mono">{diagnosis.supabaseTest.connectionDetails.errorCode}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {diagnosis.supabaseTest.error && (
                      <div className="border border-red-200 rounded-md p-4 bg-red-50">
                        <h4 className="font-medium text-red-800 mb-2">Connection Error</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Message: </span>
                            <span className="text-red-700">{diagnosis.supabaseTest.error.message}</span>
                          </div>
                          <div>
                            <span className="font-medium">Type: </span>
                            <span className="font-mono">{diagnosis.supabaseTest.error.type}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="database">
              <Card>
                <CardHeader>
                  <CardTitle>Database Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Table Existence Check</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(diagnosis.databaseTest.tablesExist).map(
                          ([tableName, details]: [string, any]) => (
                            <div key={tableName} className="border rounded-md p-3">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-sm">{tableName}</span>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(details.exists)}
                                  <Badge variant={details.exists ? "default" : "destructive"}>
                                    {details.exists ? "EXISTS" : "MISSING"}
                                  </Badge>
                                </div>
                              </div>
                              {details.error && <p className="text-xs text-red-600 mt-1">{details.error}</p>}
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Permissions & Access</h4>
                      <div className="space-y-3">
                        {Object.entries(diagnosis.databaseTest.permissions).map(
                          ([permType, details]: [string, any]) => (
                            <div key={permType} className="border rounded-md p-3">
                              <div className="flex items-center gap-2 mb-2">
                                {getStatusIcon(details.canAccess || details.available || details.canConnect)}
                                <h5 className="font-medium capitalize">{permType.replace(/([A-Z])/g, " $1")}</h5>
                              </div>
                              {details.error && <p className="text-sm text-red-600">{details.error}</p>}
                              <div className="text-xs text-gray-600 mt-1">{JSON.stringify(details, null, 2)}</div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">Node.js</h4>
                      <p className="text-sm">{diagnosis.environment.nodeVersion}</p>
                    </div>
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">Platform</h4>
                      <p className="text-sm">{diagnosis.environment.platform}</p>
                    </div>
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium mb-2">Next.js</h4>
                      <p className="text-sm">{diagnosis.environment.nextjsVersion}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {diagnosis.actualError.includes("MISSING_CREDENTIALS") && (
                  <Button variant="outline" asChild>
                    <a href="/auto-connect">Fix Environment Variables</a>
                  </Button>
                )}
                {diagnosis.actualError.includes("TABLES_MISSING") && (
                  <Button variant="outline" asChild>
                    <a href="/complete-setup">Create Tables</a>
                  </Button>
                )}
                {diagnosis.actualError.includes("CONNECTION_FAILED") && (
                  <Button variant="outline" asChild>
                    <a href="/supabase-status">Check Supabase Status</a>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <a href="/comprehensive-check">Full System Check</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
