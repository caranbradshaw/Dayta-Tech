"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { useAuth } from "@/components/auth-context"
import { FileUploader } from "@/components/file-uploader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, BarChart3, FileText, TrendingUp } from 'lucide-react'
import { clientStorage } from "@/lib/client-storage"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [recentAnalyses, setRecentAnalyses] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (user) {
      fetchRecentAnalyses()
    }
  }, [user])

  const fetchRecentAnalyses = async () => {
    try {
      const response = await fetch(`/api/analyses/list?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setRecentAnalyses(data.analyses.slice(0, 3)) // Show last 3
      }
    } catch (error) {
      console.error("Error fetching analyses:", error)
      // Fallback to client storage if database fails
      const analyses = clientStorage.getAnalysesByUser(user.id)
      setRecentAnalyses(analyses.slice(0, 3))
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading your dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name || "User"}!</h1>
            <p className="text-lg text-gray-600">Upload your data to get AI-powered insights in minutes</p>
          </div>

          {/* Quick Upload Section */}
          <div className="mb-8">
            <FileUploader
              accountType="premium"
              uploadCredits={10}
              exportCredits={5}
              userRole={user?.role}
              isPremium={true}
              onUploadStart={async (fileName, fileSize) => {
                console.log(`Starting upload: ${fileName} (${fileSize} bytes)`)
              }}
              onUploadComplete={async (fileName, fileSize, analysisId) => {
                console.log(`Upload complete: ${fileName}, Analysis ID: ${analysisId}`)
                // Refresh recent analyses
                if (user) {
                  fetchRecentAnalyses()
                }
              }}
              onUploadError={async (fileName, error) => {
                console.error(`Upload error for ${fileName}:`, error)
              }}
            />
          </div>

          {/* Dashboard Stats */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentAnalyses.length}</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Insights Generated</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {recentAnalyses.reduce((sum, analysis) => sum + (analysis.insights || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">Across all analyses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {recentAnalyses.length > 0
                    ? Math.round(
                        recentAnalyses.reduce((sum, analysis) => sum + (analysis.metrics?.dataQuality || 0), 0) /
                          recentAnalyses.length,
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Average across files</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Analyses */}
          {recentAnalyses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Analyses</CardTitle>
                <CardDescription>Your latest data analysis results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAnalyses.map((analysis) => (
                    <div key={analysis.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium">{analysis.file_name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(analysis.created_at).toLocaleDateString()} •
                            <span className={`ml-1 px-2 py-1 rounded text-xs ${
                              analysis.status === 'completed' ? 'bg-green-100 text-green-800' :
                              analysis.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {analysis.status.toUpperCase()}
                            </span>
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => router.push(`/analysis/${analysis.id}`)}
                        disabled={analysis.status !== 'completed'}
                      >
                        {analysis.status === 'completed' ? 'View Results' : 
                         analysis.status === 'processing' ? 'Processing...' : 'Failed'}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <Button variant="outline" onClick={() => router.push("/dashboard/history")}>
                    View All Analyses
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Getting Started */}
          {recentAnalyses.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Get Started with Your First Analysis
                </CardTitle>
                <CardDescription>Upload a data file above to see the power of AI-driven insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">What you'll get:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Executive summary of your data</li>
                      <li>• Key business insights and patterns</li>
                      <li>• Actionable recommendations</li>
                      <li>• Data quality assessment</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Supported formats:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• CSV files</li>
                      <li>• Excel spreadsheets (.xlsx, .xls)</li>
                      <li>• JSON data files</li>
                      <li>• Up to 50MB file size</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
