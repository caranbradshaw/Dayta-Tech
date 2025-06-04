"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BarChart3, ArrowLeft, FileText, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { FileUploader } from "@/components/file-uploader"
import { getUserSubscription, checkUsageLimit } from "@/lib/supabase-utils"
import { logFileActivity } from "@/lib/auth-utils"
import type { Database } from "@/types/database.types"

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"]

export default function UploadPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [uploadLimit, setUploadLimit] = useState({ current: 0, limit: 0, canProceed: true })
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && profile) {
      loadUploadData()
    }
  }, [user, profile])

  const loadUploadData = async () => {
    if (!user) return

    try {
      setDataLoading(true)

      // Load subscription data
      const subscriptionData = await getUserSubscription(user.id)
      setSubscription(subscriptionData)

      // Check upload limits
      const uploadLimitData = await checkUsageLimit(user.id, "uploads")
      setUploadLimit(uploadLimitData)
    } catch (error) {
      console.error("Error loading upload data:", error)
    } finally {
      setDataLoading(false)
    }
  }

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  const getSupportedFormats = () => {
    if (!subscription) return ["CSV", "Excel"]

    switch (subscription.plan_type) {
      case "basic":
        return ["CSV", "Excel (.xlsx, .xls)"]
      case "pro":
        return ["CSV", "Excel", "JSON", "Power BI (.pbix)", "Tableau (.twb)"]
      case "enterprise":
        return ["CSV", "Excel", "JSON", "Power BI", "Tableau", "Parquet", "XML", "Custom formats"]
      default:
        return ["CSV", "Excel"]
    }
  }

  const getMaxFileSize = () => {
    if (!subscription) return "50MB"

    switch (subscription.plan_type) {
      case "basic":
        return "50MB"
      case "pro":
        return "100MB"
      case "enterprise":
        return "500MB"
      default:
        return "50MB"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-gray-500 hover:text-gray-700 mr-4">
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Dashboard
              </Link>
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Upload Data</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Upload Limits Alert */}
          {!uploadLimit.canProceed && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You've reached your monthly upload limit ({uploadLimit.limit} files).
                <Link href="/dashboard/settings" className="ml-1 underline font-medium">
                  Upgrade your plan
                </Link>{" "}
                for unlimited uploads.
              </AlertDescription>
            </Alert>
          )}

          {/* Plan Info */}
          <div className="mb-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Upload Information
                  </CardTitle>
                  {subscription && (
                    <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                      {subscription.plan_type} Plan
                    </Badge>
                  )}
                </div>
                <CardDescription>Upload your data files for AI-powered analysis and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 mb-2">Supported Formats</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {getSupportedFormats().map((format, index) => (
                        <li key={index}>• {format}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 mb-2">Upload Limits</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        Monthly: {uploadLimit.current} / {uploadLimit.limit} files
                      </p>
                      <p>Max file size: {getMaxFileSize()}</p>
                    </div>
                    <div className="mt-2">
                      <Progress value={(uploadLimit.current / uploadLimit.limit) * 100} className="h-2" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 mb-2">What You Get</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• AI-powered insights</li>
                      <li>• Executive summaries</li>
                      <li>• Trend analysis</li>
                      <li>• Actionable recommendations</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* File Uploader */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Data File</CardTitle>
              <CardDescription>
                Drag and drop your file or click to browse. Our AI will analyze your data and provide insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader
                accountType={subscription?.plan_type || "basic"}
                uploadCredits={uploadLimit.limit - uploadLimit.current}
                exportCredits={0} // Will be fetched separately
                userRole={profile?.role || undefined}
                disabled={!uploadLimit.canProceed}
                onUploadStart={async (fileName: string, fileSize: number) => {
                  if (user) {
                    await logFileActivity(user.id, "upload_start", fileName, fileSize)
                  }
                }}
                onUploadComplete={async (fileName: string, fileSize: number, analysisId: string) => {
                  if (user) {
                    await logFileActivity(user.id, "upload_complete", fileName, fileSize, analysisId)
                    // Refresh the upload limits
                    loadUploadData()
                  }
                }}
                onUploadError={async (fileName: string, error: string) => {
                  if (user) {
                    await logFileActivity(user.id, "upload_error", fileName, undefined, undefined, { error })
                  }
                }}
              />
            </CardContent>
          </Card>

          {/* Help Section */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 mb-2">Preparing Your Data</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Ensure your data has clear column headers</li>
                      <li>• Remove any sensitive information</li>
                      <li>• Use consistent date formats</li>
                      <li>• Clean up any obvious errors</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 mb-2">Best Results</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Include at least 100 rows of data</li>
                      <li>• Add context in file names</li>
                      <li>• Include time-series data when possible</li>
                      <li>• Provide multiple data dimensions</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Still have questions?{" "}
                    <Link href="/support" className="text-purple-600 hover:underline">
                      Contact our support team
                    </Link>{" "}
                    for help.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
