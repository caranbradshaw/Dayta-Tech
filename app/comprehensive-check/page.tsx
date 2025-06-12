"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Database,
  Settings,
  Zap,
  Globe,
  Shield,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ComprehensiveCheck {
  timestamp: string
  overall: {
    status: string
    score: number
    maxScore: number
    healthPercentage: number
  }
  environment: {
    status: string
    variables: Record<string, boolean>
    score: number
    maxScore: number
    details: Record<string, any>
  }
  supabase: {
    status: string
    connection: boolean
    auth: boolean
    tables: Record<string, boolean>
    functions: Record<string, boolean>
    policies: Record<string, boolean>
    score: number
    maxScore: number
    details: Record<string, any>
  }
  application: {
    status: string
    features: Record<string, boolean>
    pages: Record<string, boolean>
    apis: Record<string, boolean>
    score: number
    maxScore: number
    details: Record<string, any>
  }
  integrations: {
    status: string
    services: Record<string, boolean>
    score: number
    maxScore: number
    details: Record<string, any>
  }
  recommendations: Array<{
    priority: "critical" | "high" | "medium" | "low"
    category: string
    issue: string
    solution: string
    link?: string
  }>
  summary: {
    criticalIssues: number
    warnings: number
    readyForProduction: boolean
    estimatedSetupTime: string
  }
  error?: {
    message: string
    details: any
  }
}

export default function ComprehensiveCheckPage() {
  const [checkResult, setCheckResult] = useState<ComprehensiveCheck | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    runComprehensiveCheck()
  }, [])

  const runComprehensiveCheck = async () => {
    setLoading(true)
    setRefreshing(true)

    try {
      const response = await fetch("/api/comprehensive-system-check")
      const data = await response.json()
      setCheckResult(data)
    } catch (error) {
      console.error("Error running comprehensive check:", error)
      setCheckResult({
        timestamp: new Date().toISOString(),
        overall: { status: "error", score: 0, maxScore: 0, healthPercentage: 0 },
        environment: { status: "error", variables: {}, score: 0, maxScore: 0, details: {} },
        supabase: {
          status: "error",
          connection: false,
          auth: false,
          tables: {},
          functions: {},
          policies: {},
          score: 0,
          maxScore: 0,
          details: {},
        },
        application: { status: "error", features: {}, pages: {}, apis: {}, score: 0, maxScore: 0, details: {} },
        integrations: { status: "error", services: {}, score: 0, maxScore: 0, details: {} },
        recommendations: [
          {
            priority: "critical",
            category: "System",
            issue: "Comprehensive check failed",
            solution: "Unable to run comprehensive system check. Check your connection and try again.",
          },
        ],
        summary: {
          criticalIssues: 1,
          warnings: 0,
          readyForProduction: false,
          estimatedSetupTime: "Unknown",
        },
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          details: error,
        },
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "good":
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      case "fair":
      case "partial":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "poor":
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      case "critical":
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-700"
      case "good":
        return "text-blue-700"
      case "fair":
      case "partial":
        return "text-yellow-700"
      case "poor":
        return "text-orange-700"
      case "critical":
      case "error":
        return "text-red-700"
      default:
        return "text-gray-700"
    }
  }

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "excellent":
        return "default"
      case "good":
        return "secondary"
      case "fair":
      case "partial":
        return "outline"
      case "poor":
      case "critical":
      case "error":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "text-red-700 bg-red-50 border-red-200"
      case "high":
        return "text-orange-700 bg-orange-50 border-orange-200"
      case "medium":
        return "text-yellow-700 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-green-700 bg-green-50 border-green-200"
      default:
        return "text-gray-700 bg-gray-50 border-gray-200"
    }
  }

  if (loading && !checkResult) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
          <p>Running comprehensive system check...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Comprehensive System Check</h1>
          <p className="text-gray-600">Complete verification of your DaytaTech application</p>
        </div>
        <Button onClick={runComprehensiveCheck} disabled={refreshing} variant="outline">
          {refreshing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" /> Run Check
            </>
          )}
        </Button>
      </div>

      {checkResult && (
        <div className="space-y-6">
          {/* Overall Health Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(checkResult.overall.status)}
                System Health Overview
                <Badge variant={getBadgeVariant(checkResult.overall.status)}>
                  {Math.round(checkResult.overall.healthPercentage)}% HEALTHY
                </Badge>
              </CardTitle>
              <CardDescription>Last checked: {new Date(checkResult.timestamp).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Health Score</span>
                    <span className="text-sm text-gray-600">
                      {checkResult.overall.score}/{checkResult.overall.maxScore} (
                      {Math.round(checkResult.overall.healthPercentage)}%)
                    </span>
                  </div>
                  <Progress value={checkResult.overall.healthPercentage} className="h-3" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Environment</p>
                      <p className={`text-xs ${getStatusColor(checkResult.environment.status)}`}>
                        {checkResult.environment.score}/{checkResult.environment.maxScore} variables
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Supabase</p>
                      <p className={`text-xs ${getStatusColor(checkResult.supabase.status)}`}>
                        {checkResult.supabase.score}/{checkResult.supabase.maxScore} components
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Application</p>
                      <p className={`text-xs ${getStatusColor(checkResult.application.status)}`}>
                        {checkResult.application.score}/{checkResult.application.maxScore} features
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Integrations</p>
                      <p className={`text-xs ${getStatusColor(checkResult.integrations.status)}`}>
                        {checkResult.integrations.score}/{checkResult.integrations.maxScore} services
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={`h-5 w-5 ${checkResult.summary.criticalIssues > 0 ? "text-red-500" : "text-green-500"}`}
                  />
                  <div>
                    <p className="text-sm font-medium">Critical Issues</p>
                    <p className="text-2xl font-bold">{checkResult.summary.criticalIssues}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle
                    className={`h-5 w-5 ${checkResult.summary.warnings > 0 ? "text-yellow-500" : "text-green-500"}`}
                  />
                  <div>
                    <p className="text-sm font-medium">Warnings</p>
                    <p className="text-2xl font-bold">{checkResult.summary.warnings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Shield
                    className={`h-5 w-5 ${checkResult.summary.readyForProduction ? "text-green-500" : "text-red-500"}`}
                  />
                  <div>
                    <p className="text-sm font-medium">Production Ready</p>
                    <p className="text-lg font-bold">{checkResult.summary.readyForProduction ? "YES" : "NO"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Setup Time</p>
                    <p className="text-lg font-bold">{checkResult.summary.estimatedSetupTime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Critical Issues Alert */}
          {checkResult.summary.criticalIssues > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Critical Issues Detected</AlertTitle>
              <AlertDescription>
                Your system has {checkResult.summary.criticalIssues} critical issue(s) that need immediate attention.
                Please review the recommendations below.
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {checkResult.summary.readyForProduction && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>System Ready for Production</AlertTitle>
              <AlertDescription>
                Congratulations! Your DaytaTech application is fully configured and ready for production use.
              </AlertDescription>
            </Alert>
          )}

          {/* Detailed Results */}
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="environment">Environment</TabsTrigger>
              <TabsTrigger value="supabase">Supabase</TabsTrigger>
              <TabsTrigger value="application">Application</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>System Overview</CardTitle>
                  <CardDescription>High-level status of all system components</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Component Status</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span>Environment Variables</span>
                            <Badge variant={getBadgeVariant(checkResult.environment.status)}>
                              {checkResult.environment.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Supabase Setup</span>
                            <Badge variant={getBadgeVariant(checkResult.supabase.status)}>
                              {checkResult.supabase.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Application Features</span>
                            <Badge variant={getBadgeVariant(checkResult.application.status)}>
                              {checkResult.application.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>External Integrations</span>
                            <Badge variant={getBadgeVariant(checkResult.integrations.status)}>
                              {checkResult.integrations.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Quick Stats</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Database Tables:</span>
                            <span>
                              {Object.values(checkResult.supabase.tables).filter(Boolean).length}/
                              {Object.keys(checkResult.supabase.tables).length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>App Features:</span>
                            <span>
                              {Object.values(checkResult.application.features).filter(Boolean).length}/
                              {Object.keys(checkResult.application.features).length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Integrations:</span>
                            <span>
                              {Object.values(checkResult.integrations.services).filter(Boolean).length}/
                              {Object.keys(checkResult.integrations.services).length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Overall Health:</span>
                            <span className="font-medium">{Math.round(checkResult.overall.healthPercentage)}%</span>
                          </div>
                        </div>
                      </div>
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
                    {Object.entries(checkResult.environment.variables).map(([key, value]) => (
                      <div key={key} className="flex items-start">
                        <div className="mr-3 mt-0.5">
                          {value ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium font-mono text-sm">{key}</p>
                          <p className={value ? "text-green-700" : "text-red-700"}>{value ? "Set" : "Missing"}</p>
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
                  <CardTitle>Supabase Configuration</CardTitle>
                  <CardDescription>Database connection, tables, and functions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">Connection Status</h4>
                      <div className="flex items-center gap-2">
                        {checkResult.supabase.connection ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span>{checkResult.supabase.connection ? "Connected" : "Not Connected"}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Database Tables</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(checkResult.supabase.tables).map(([tableName, exists]) => (
                          <div key={tableName} className="flex items-center gap-2">
                            {exists ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm font-mono">{tableName}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {Object.keys(checkResult.supabase.functions).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Database Functions</h4>
                        <div className="space-y-2">
                          {Object.entries(checkResult.supabase.functions).map(([funcName, exists]) => (
                            <div key={funcName} className="flex items-center gap-2">
                              {exists ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="text-sm font-mono">{funcName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="application">
              <Card>
                <CardHeader>
                  <CardTitle>Application Features</CardTitle>
                  <CardDescription>Core application functionality and pages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">Core Features</h4>
                      <div className="space-y-2">
                        {Object.entries(checkResult.application.features).map(([feature, working]) => (
                          <div key={feature} className="flex items-center gap-2">
                            {working ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm">
                              {feature.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Critical Pages</h4>
                      <div className="space-y-2">
                        {Object.entries(checkResult.application.pages).map(([page, working]) => (
                          <div key={page} className="flex items-center gap-2">
                            {working ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm">{page.charAt(0).toUpperCase() + page.slice(1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">API Endpoints</h4>
                      <div className="space-y-2">
                        {Object.entries(checkResult.application.apis).map(([api, working]) => (
                          <div key={api} className="flex items-center gap-2">
                            {working ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm">
                              {api.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations">
              <Card>
                <CardHeader>
                  <CardTitle>External Integrations</CardTitle>
                  <CardDescription>Third-party services and integrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(checkResult.integrations.services).map(([service, connected]) => (
                      <div key={service} className="flex items-center gap-2">
                        {connected ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm">
                          {service.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                        </span>
                      </div>
                    ))}

                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium mb-2">Integration Details</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Primary Database:</span>
                          <span className="font-medium">{checkResult.integrations.details.primaryDatabase}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Auth Provider:</span>
                          <span className="font-medium">{checkResult.integrations.details.authProvider}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>File Storage:</span>
                          <span className="font-medium">{checkResult.integrations.details.fileStorage}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>AI Provider:</span>
                          <span className="font-medium">{checkResult.integrations.details.aiProvider}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Recommendations */}
          {checkResult.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Actions to improve your system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checkResult.recommendations.map((rec, index) => (
                    <Alert key={index} className={getPriorityColor(rec.priority)}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="flex items-center justify-between">
                        <span>
                          [{rec.priority.toUpperCase()}] {rec.category}: {rec.issue}
                        </span>
                        {rec.link && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={rec.link} className="gap-1">
                              Fix <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </AlertTitle>
                      <AlertDescription>{rec.solution}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button variant="outline" asChild>
                  <a href="/auto-repair">Auto Repair</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/one-click-setup">One-Click Setup</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/verify-setup">Test Application</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/signup">Try Signup</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
