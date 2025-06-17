"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function EmailWorkflowTestPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])

  const [testConfig, setTestConfig] = useState({
    emailType: "",
    region: "america",
    testEmail: "",
    customData: "",
  })

  const handleTest = async (emailType: string) => {
    if (!testConfig.testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/email/test-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailType,
          region: testConfig.region,
          testEmail: testConfig.testEmail,
        }),
      })

      const result = await response.json()

      setTestResults((prev) => [
        {
          timestamp: new Date().toISOString(),
          emailType,
          region: testConfig.region,
          testEmail: testConfig.testEmail,
          ...result,
        },
        ...prev,
      ])

      if (result.success) {
        toast({
          title: "Email Sent! ✅",
          description: `${emailType} email sent successfully to ${testConfig.testEmail}`,
        })
      } else {
        toast({
          title: "Email Failed ❌",
          description: result.error || "Failed to send email",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Test error:", error)
      toast({
        title: "Error",
        description: "Failed to test email workflow",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBulkTest = async () => {
    if (!testConfig.testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const emailTypes = ["welcome", "security", "platform_update"]

    for (const emailType of emailTypes) {
      await handleTest(emailType)
      // Small delay between emails
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📧 Email Workflow Testing</h1>
          <p className="text-gray-600 mt-2">Test the regional email workflows for Nigeria and America</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>🔧 Test Configuration</CardTitle>
              <CardDescription>Configure your email workflow tests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testEmail">Test Email Address</Label>
                <Input
                  id="testEmail"
                  type="email"
                  placeholder="your-email@example.com"
                  value={testConfig.testEmail}
                  onChange={(e) => setTestConfig((prev) => ({ ...prev, testEmail: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select
                  value={testConfig.region}
                  onValueChange={(value) => setTestConfig((prev) => ({ ...prev, region: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nigeria">🇳🇬 Nigeria</SelectItem>
                    <SelectItem value="america">🇺🇸 America</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-4">
                <Button
                  onClick={() => handleTest("welcome")}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  🎉 Test Welcome Email
                </Button>

                <Button
                  onClick={() => handleTest("security")}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  🔐 Test Security Email
                </Button>

                <Button
                  onClick={() => handleTest("platform_update")}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  🔧 Test Platform Update Email
                </Button>

                <Button
                  onClick={handleBulkTest}
                  disabled={loading}
                  variant="outline"
                  className="border-2 border-purple-500 text-purple-700 hover:bg-purple-50"
                >
                  🚀 Test All Email Types
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Email Templates Info */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Email Templates</CardTitle>
              <CardDescription>Regional email template information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-700">🎉 Welcome Email</h4>
                <p className="text-sm text-gray-600">Sent when new users join the platform</p>
                <div className="flex gap-2">
                  <Badge variant="outline">30-day trial info</Badge>
                  <Badge variant="outline">Regional pricing</Badge>
                  <Badge variant="outline">Local examples</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-red-700">🔐 Security Email</h4>
                <p className="text-sm text-gray-600">Sent when users update account information</p>
                <div className="flex gap-2">
                  <Badge variant="outline">IP tracking</Badge>
                  <Badge variant="outline">Change details</Badge>
                  <Badge variant="outline">Security tips</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-blue-700">🔧 Platform Update Email</h4>
                <p className="text-sm text-gray-600">Sent when platform needs maintenance</p>
                <div className="flex gap-2">
                  <Badge variant="outline">Downtime schedule</Badge>
                  <Badge variant="outline">Affected services</Badge>
                  <Badge variant="outline">Status page</Badge>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Regional Differences:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    🇳🇬 <strong>Nigeria:</strong> Green/Gold theme, Naira currency, Lagos context
                  </li>
                  <li>
                    🇺🇸 <strong>America:</strong> Blue/Red theme, Dollar currency, US business context
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>📊 Test Results</CardTitle>
              <CardDescription>Recent email workflow test results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.success ? "✅ Success" : "❌ Failed"}
                        </Badge>
                        <Badge variant="outline">{result.emailType}</Badge>
                        <Badge variant="outline">{result.region === "nigeria" ? "🇳🇬 Nigeria" : "🇺🇸 America"}</Badge>
                      </div>
                      <span className="text-sm text-gray-500">{new Date(result.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      <strong>To:</strong> {result.testEmail}
                    </p>
                    {result.messageId && (
                      <p className="text-sm text-gray-600">
                        <strong>Message ID:</strong> {result.messageId}
                      </p>
                    )}
                    {result.error && (
                      <p className="text-sm text-red-600">
                        <strong>Error:</strong> {result.error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
