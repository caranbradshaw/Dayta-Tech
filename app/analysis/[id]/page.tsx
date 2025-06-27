"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { useAuth } from "@/components/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { AnalysisExportDialog } from "@/components/analysis-export-dialog"
import { BarChart3, AlertCircle, CheckCircle, Clock, Lightbulb, Target, Building, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Analysis {
  id: string
  file_name: string
  file_type: string
  status: "processing" | "completed" | "failed"
  summary?: string
  insights: any
  created_at: string
  updated_at: string
  processing_completed_at?: string
  user_id: string
  analysis_role?: string
}

export default function AnalysisPage() {
  const { id: analysisId } = useParams()
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, profile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (analysisId && user) {
      fetchAnalysis()
    }
  }, [analysisId, user])

  const fetchAnalysis = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analysis/${analysisId}`)

      if (!response.ok) {
        throw new Error("Analysis not found")
      }

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (error) {
      console.error("Error fetching analysis:", error)
      toast({
        title: "Error",
        description: "Failed to load analysis. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "processing":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading analysis...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analysis Not Found</h3>
              <p className="text-gray-600 mb-6">
                The analysis you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const insights = analysis.insights || {}
  const executiveSummary = insights.executive_summary || {}
  const detailedInsights = insights.detailed_insights || []
  const roleRecommendations = insights.role_recommendations || []
  const dataQuality = insights.data_quality_report || {}
  const userContext = insights.user_context || {}

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{analysis.file_name}</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(analysis.status)}
                    <Badge className={getStatusColor(analysis.status)}>{analysis.status.toUpperCase()}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </div>
                  {userContext.company && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Building className="h-4 w-4" />
                      {userContext.company}
                    </div>
                  )}
                </div>
              </div>

              {analysis.status === "completed" && (
                <div className="flex gap-2">
                  <AnalysisExportDialog
                    analysisId={analysis.id}
                    fileName={analysis.file_name}
                    analysisData={analysis}
                  />
                </div>
              )}
            </div>
          </div>

          {analysis.status === "processing" && (
            <Alert className="mb-6">
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Your analysis is still processing. This page will automatically update when complete.
              </AlertDescription>
            </Alert>
          )}

          {analysis.status === "failed" && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Analysis failed to complete. Please try uploading your file again or contact support.
              </AlertDescription>
            </Alert>
          )}

          {analysis.status === "completed" && (
            <Tabs defaultValue="summary" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Executive Summary</TabsTrigger>
                <TabsTrigger value="insights">Detailed Insights</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="quality">Data Quality</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Executive Summary
                    </CardTitle>
                    <CardDescription>High-level overview of your data analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="text-lg leading-relaxed">
                        {executiveSummary.overview || analysis.summary || "Analysis summary will appear here."}
                      </p>

                      {executiveSummary.keyFindings && executiveSummary.keyFindings.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-lg font-semibold mb-3">Key Findings</h4>
                          <ul className="space-y-2">
                            {executiveSummary.keyFindings.map((finding: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{finding}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {executiveSummary.businessImpact && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="text-lg font-semibold text-blue-900 mb-2">Business Impact</h4>
                          <p className="text-blue-800">{executiveSummary.businessImpact}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                {detailedInsights.length > 0 ? (
                  detailedInsights.map((insight: any, index: number) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-yellow-600" />
                          {insight.title || `Insight ${index + 1}`}
                        </CardTitle>
                        {insight.confidence && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Confidence:</span>
                            <Progress value={insight.confidence * 100} className="w-24" />
                            <span className="text-sm font-medium">{Math.round(insight.confidence * 100)}%</span>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 leading-relaxed mb-4">{insight.content || insight.finding}</p>
                        {insight.impact && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-900 mb-1">Impact:</p>
                            <p className="text-sm text-gray-700">{insight.impact}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Lightbulb className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Detailed Insights</h3>
                      <p className="text-gray-600">Detailed insights will appear here once analysis is complete.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                {roleRecommendations.length > 0 ? (
                  roleRecommendations.map((rec: any, index: number) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-blue-600" />
                          {rec.title || `Recommendation ${index + 1}`}
                        </CardTitle>
                        {rec.impact && <Badge variant="outline">{rec.impact} Impact</Badge>}
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 leading-relaxed mb-4">{rec.description || rec.recommendation}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {rec.timeline && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-900 mb-1">Timeline:</p>
                              <p className="text-sm text-gray-700">{rec.timeline}</p>
                            </div>
                          )}
                          {rec.resources_required && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-900 mb-1">Resources Required:</p>
                              <p className="text-sm text-gray-700">{rec.resources_required}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recommendations</h3>
                      <p className="text-gray-600">
                        Strategic recommendations will appear here once analysis is complete.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="quality" className="space-y-6">
                {Object.keys(dataQuality).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(dataQuality).map(([key, value]) => (
                      <Card key={key}>
                        <CardContent className="p-6 text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {typeof value === "number" ? Math.round(value) : value}
                            {typeof value === "number" && value <= 100 ? "%" : ""}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Quality Metrics</h3>
                      <p className="text-gray-600">
                        Data quality assessment will appear here once analysis is complete.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  )
}
