"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface TestResult {
  name: string
  status: "PASS" | "FAIL" | "PARTIAL"
  details: any
}

interface TestResponse {
  overall: "PASS" | "FAIL" | "UNKNOWN"
  tests: TestResult[]
  message: string
  nextSteps?: string[]
  error?: string
}

export default function TestEmailPage() {
  const [isTestingSystem, setIsTestingSystem] = useState(false)
  const [isTestingWelcome, setIsTestingWelcome] = useState(false)
  const [systemResults, setSystemResults] = useState<TestResponse | null>(null)
  const [welcomeResults, setWelcomeResults] = useState<any>(null)

  const runSystemTest = async () => {
    setIsTestingSystem(true)
    setSystemResults(null)

    try {
      const response = await fetch("/api/test-sendgrid")
      const data = await response.json()
      setSystemResults(data)
    } catch (error) {
      setSystemResults({
        overall: "FAIL",
        tests: [],
        message: "Failed to run system test",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsTestingSystem(false)
    }
  }

  const runWelcomeTest = async () => {
    setIsTestingWelcome(true)
    setWelcomeResults(null)

    try {
      const response = await fetch("/api/send-welcome-email")
      const data = await response.json()
      setWelcomeResults(data)
    } catch (error) {
      setWelcomeResults({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsTestingWelcome(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PASS":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "FAIL":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "PARTIAL":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PASS":
        return "bg-green-100 text-green-800"
      case "FAIL":
        return "bg-red-100 text-red-800"
      case "PARTIAL":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">📧 SendGrid Email Testing</h1>
        <p className="text-gray-600">
          Test your SendGrid email configuration and send test emails to verify everything is working properly.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Test Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              System Configuration Test
            </CardTitle>
            <CardDescription>
              Comprehensive test of SendGrid configuration, API key validation, and email delivery capability.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runSystemTest} disabled={isTestingSystem} className="w-full">
              {isTestingSystem ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running System Test...
                </>
              ) : (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Run Full System Test
                </>
              )}
            </Button>

            {systemResults && (
              <div className="space-y-3">
                <Alert
                  className={
                    systemResults.overall === "PASS" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  }
                >
                  <AlertDescription className="font-medium">{systemResults.message}</AlertDescription>
                </Alert>

                <div className="space-y-2">
                  {systemResults.tests.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(test.status)}
                        <span className="font-medium">{test.name}</span>
                      </div>
                      <Badge className={getStatusColor(test.status)}>{test.status}</Badge>
                    </div>
                  ))}
                </div>

                {systemResults.nextSteps && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Next Steps:</h4>
                    <ul className="text-sm space-y-1">
                      {systemResults.nextSteps.map((step, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Welcome Email Test Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Welcome Email Test
            </CardTitle>
            <CardDescription>
              Send a production-ready welcome email to test the complete email delivery system.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runWelcomeTest} disabled={isTestingWelcome} className="w-full" variant="outline">
              {isTestingWelcome ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Welcome Email...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Welcome Email
                </>
              )}
            </Button>

            {welcomeResults && (
              <div className="space-y-3">
                <Alert className={welcomeResults.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription>
                    {welcomeResults.success ? (
                      <div>
                        <div className="font-medium text-green-800 mb-2">✅ Welcome email sent successfully!</div>
                        <div className="text-sm text-green-700">Check your inbox at: {welcomeResults.details?.to}</div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-red-800 mb-2">❌ Failed to send welcome email</div>
                        <div className="text-sm text-red-700">Error: {welcomeResults.error}</div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>

                {welcomeResults.success && welcomeResults.details && (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <strong>To:</strong> {welcomeResults.details.to}
                      </div>
                      <div>
                        <strong>From:</strong> {welcomeResults.details.from}
                      </div>
                      <div className="col-span-2">
                        <strong>Subject:</strong> {welcomeResults.details.subject}
                      </div>
                      {welcomeResults.details.messageId && (
                        <div className="col-span-2">
                          <strong>Message ID:</strong> {welcomeResults.details.messageId}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>📋 Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. System Configuration Test</h4>
              <p className="text-sm text-gray-600 mb-2">
                This test validates your SendGrid setup without sending emails. It checks:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Environment variables (SENDGRID_API_KEY, FROM_EMAIL)</li>
                <li>• API key format and authentication</li>
                <li>• SendGrid service connectivity</li>
                <li>• Template configuration (if available)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">2. Welcome Email Test</h4>
              <p className="text-sm text-gray-600 mb-2">This sends a real email to caranlharris@gmail.com to test:</p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Actual email delivery</li>
                <li>• HTML formatting and styling</li>
                <li>• Professional email templates</li>
                <li>• Production-ready messaging</li>
              </ul>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> Make sure your environment variables are properly configured before running these
                tests. The welcome email will be sent to caranlharris@gmail.com.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
