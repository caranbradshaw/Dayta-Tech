"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Settings, CheckCircle, XCircle, AlertCircle, Send, Key } from "lucide-react"

export default function EmailDashboard() {
  const [envStatus, setEnvStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkEnvironmentStatus()
  }, [])

  const checkEnvironmentStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test-sendgrid")
      const data = await response.json()
      setEnvStatus(data)
    } catch (error) {
      console.error("Failed to check environment status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getOverallStatus = () => {
    if (!envStatus) return "UNKNOWN"
    return envStatus.overall
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PASS":
        return "text-green-600 bg-green-100"
      case "FAIL":
        return "text-red-600 bg-red-100"
      case "PARTIAL":
        return "text-yellow-600 bg-yellow-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PASS":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "FAIL":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "PARTIAL":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📧 Email System Dashboard</h1>
        <p className="text-gray-600">Monitor and manage your SendGrid email configuration and delivery system.</p>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(getOverallStatus())}
                  <Badge className={getStatusColor(getOverallStatus())}>{getOverallStatus()}</Badge>
                </div>
              </div>
              <Settings className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">API Key</p>
                <p className="text-2xl font-bold">
                  {envStatus?.tests?.find((t) => t.name === "Environment Variables")?.details?.hasApiKey ? "✅" : "❌"}
                </p>
              </div>
              <Key className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Email Delivery</p>
                <p className="text-2xl font-bold">
                  {envStatus?.tests?.find((t) => t.name === "Email Delivery")?.status === "PASS" ? "✅" : "❌"}
                </p>
              </div>
              <Send className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Templates</p>
                <p className="text-2xl font-bold">
                  {envStatus?.tests?.find((t) => t.name === "Email Templates")?.status === "PASS" ? "✅" : "⚠️"}
                </p>
              </div>
              <Mail className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList>
          <TabsTrigger value="status">System Status</TabsTrigger>
          <TabsTrigger value="test">Send Test Emails</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Status Overview</CardTitle>
              <CardDescription>Current status of your SendGrid email system configuration</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Checking system status...</p>
                </div>
              ) : envStatus ? (
                <div className="space-y-4">
                  <Alert
                    className={
                      envStatus.overall === "PASS" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    }
                  >
                    <AlertDescription className="font-medium">{envStatus.message}</AlertDescription>
                  </Alert>

                  <div className="grid gap-4">
                    {envStatus.tests?.map((test: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(test.status)}
                              <h4 className="font-medium">{test.name}</h4>
                            </div>
                            <Badge className={getStatusColor(test.status)}>{test.status}</Badge>
                          </div>

                          {test.details && (
                            <div className="bg-gray-50 p-3 rounded text-sm">
                              <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(test.details, null, 2)}</pre>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Failed to load system status. Please try refreshing the page.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick System Test</CardTitle>
                <CardDescription>Run a comprehensive test of your email system</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={checkEnvironmentStatus} disabled={isLoading} className="w-full">
                  {isLoading ? "Testing..." : "Run System Test"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Send Test Email</CardTitle>
                <CardDescription>Send a welcome email to test delivery</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => window.open("/api/send-welcome-email", "_blank")}
                  variant="outline"
                  className="w-full"
                >
                  Send Welcome Email
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Environment Configuration</CardTitle>
              <CardDescription>Required environment variables for SendGrid integration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <code className="text-sm font-mono">SENDGRID_API_KEY</code>
                      <p className="text-xs text-gray-600 mt-1">Your SendGrid API key</p>
                    </div>
                    <Badge
                      className={
                        envStatus?.tests?.find((t: any) => t.name === "Environment Variables")?.details?.hasApiKey
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {envStatus?.tests?.find((t: any) => t.name === "Environment Variables")?.details?.hasApiKey
                        ? "SET"
                        : "MISSING"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <code className="text-sm font-mono">FROM_EMAIL</code>
                      <p className="text-xs text-gray-600 mt-1">Default sender email address</p>
                    </div>
                    <Badge
                      className={
                        envStatus?.tests?.find((t: any) => t.name === "Environment Variables")?.details?.fromEmail !==
                        "NOT_SET"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {envStatus?.tests?.find((t: any) => t.name === "Environment Variables")?.details?.fromEmail !==
                      "NOT_SET"
                        ? "SET"
                        : "MISSING"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <code className="text-sm font-mono">SENDGRID_WELCOME_TEMPLATE_ID</code>
                      <p className="text-xs text-gray-600 mt-1">Welcome email template (optional)</p>
                    </div>
                    <Badge
                      className={
                        envStatus?.tests?.find((t: any) => t.name === "Email Templates")?.details?.welcomeTemplate
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {envStatus?.tests?.find((t: any) => t.name === "Email Templates")?.details?.welcomeTemplate
                        ? "SET"
                        : "OPTIONAL"}
                    </Badge>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Note:</strong> Environment variables are configured in your deployment platform (Vercel,
                    etc.) and cannot be modified from this interface.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
