"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Info, Database, Brain, Cloud, Mail } from "lucide-react"

interface EnvStatus {
  hasDatabase: boolean
  hasAI: boolean
  hasStorage: boolean
  hasEmail: boolean
  missingVars: string[]
  mode: "full" | "demo" | "partial"
  message: string
  recommendations: string
}

export default function EnvStatusPage() {
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check environment status
    fetch("/api/env-status")
      .then((res) => res.json())
      .then((data) => {
        setEnvStatus(data)
      })
      .catch((error) => {
        console.error("Failed to check environment:", error)
        // Fallback to demo mode
        setEnvStatus({
          hasDatabase: false,
          hasAI: false,
          hasStorage: false,
          hasEmail: false,
          missingVars: ["All environment variables"],
          mode: "demo",
          message: "Running in demo mode with localStorage",
          recommendations: "Add environment variables to enable full functionality",
        })
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading environment status...</div>
        </div>
      </div>
    )
  }

  if (!envStatus) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to check environment status</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "full":
        return "bg-green-100 text-green-800 border-green-200"
      case "partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "demo":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Environment Status</h1>
          <p className="text-gray-600">Check which services are configured and available</p>
        </div>

        {/* Current Mode */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Current Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Badge className={getModeColor(envStatus.mode)}>{envStatus.mode.toUpperCase()} MODE</Badge>
              <span className="text-gray-600">{envStatus.message}</span>
            </div>

            {envStatus.recommendations && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>{envStatus.recommendations}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Service Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {envStatus.hasDatabase ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={envStatus.hasDatabase ? "text-green-700" : "text-red-700"}>
                  {envStatus.hasDatabase ? "Connected" : "Not configured"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {envStatus.hasDatabase
                  ? "PostgreSQL database is configured and ready"
                  : "Using localStorage for data persistence"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {envStatus.hasAI ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={envStatus.hasAI ? "text-green-700" : "text-red-700"}>
                  {envStatus.hasAI ? "Available" : "Not configured"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {envStatus.hasAI ? "AI analysis services are configured" : "Using mock analysis data"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                File Storage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {envStatus.hasStorage ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={envStatus.hasStorage ? "text-green-700" : "text-red-700"}>
                  {envStatus.hasStorage ? "Connected" : "Not configured"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {envStatus.hasStorage ? "Vercel Blob storage is configured" : "Files processed in memory only"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {envStatus.hasEmail ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={envStatus.hasEmail ? "text-green-700" : "text-red-700"}>
                  {envStatus.hasEmail ? "Connected" : "Not configured"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {envStatus.hasEmail ? "SendGrid email service is configured" : "Email notifications disabled"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Missing Variables */}
        {envStatus.missingVars.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Missing Environment Variables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {envStatus.missingVars.map((varName, index) => (
                  <div key={index} className="bg-orange-50 border border-orange-200 rounded p-2">
                    <code className="text-sm font-mono text-orange-800">{varName}</code>
                  </div>
                ))}
              </div>
              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Add these environment variables to your .env file to enable full functionality. The application will
                  continue to work in demo mode without them.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
