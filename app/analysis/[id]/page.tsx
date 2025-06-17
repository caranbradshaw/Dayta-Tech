"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Share2, TrendingUp, BarChart3, FileText, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { AnalysisExportDialog } from "@/components/analysis-export-dialog"
import { useAuth } from "@/components/auth-context"
import { useToast } from "@/hooks/use-toast"

interface AnalysisData {
  id: string
  file_name: string
  status: "processing" | "completed" | "failed"
  summary?: string
  insights: any
  recommendations: any
  created_at: string
  updated_at: string
  processing_completed_at?: string
  metadata?: any
  error_message?: string
}

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!params.id || !user) return

    fetchAnalysis()
  }, [params.id, user])

  const fetchAnalysis = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analysis/${params.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch analysis")
      }

      const data = await response.json()
      setAnalysis(data.analysis)
    } catch (err) {
      console.error("Error fetching analysis:", err)
      setError(err instanceof Error ? err.message : "Failed to load analysis")
      toast({
        title: "Error",
        description: "Failed to load analysis. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    if (!analysis) return

    const shareUrl = window.location.href
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Link Copied",
        description: "Analysis link has been copied to your clipboard.",
      })
    })
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

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Analysis Not Found</h1>
            <p className="text-gray-600 mb-6">{error || "The requested analysis could not be found."}</p>
            <Button onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    )
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

  // Parse insights and recommendations safely
  const insights = analysis.insights?.ai_insights || analysis.insights?.detailed_insights || []
  const recommendations =
    analysis.recommendations?.recommendations || analysis.recommendations?.strategic_recommendations || []
  const executiveSummary = analysis.insights?.executive_summary || {}
  const dataQuality = analysis.insights?.data_quality_report || analysis.insights?.data_quality || {}

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{analysis.file_name}</h1>
                <p className="text-gray-600">
                  Analyzed on {new Date(analysis.created_at).toLocaleDateString()}
                  {analysis.processing_completed_at && (
                    <span className="ml-2">
                      • Completed {new Date(analysis.processing_completed_at).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              {analysis.status === "completed" && (
                <AnalysisExportDialog analysisId={analysis.id} fileName={analysis.file_name} />
              )}
            </div>
          </div>

          {/* Status Card */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(analysis.status)}
                  <div>
                    <Badge variant="secondary" className={getStatusColor(analysis.status)}>
                      {analysis.status.toUpperCase()}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">Analysis Status</p>
                  </div>
                </div>
                {analysis.status === "processing" && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Processing your data...</p>
                    <Button variant="outline" size="sm" onClick={fetchAnalysis} className="mt-2">
                      Refresh Status
                    </Button>
                  </div>
                )}
                {analysis.status === "failed" && analysis.error_message && (
                  <div className="text-right">
                    <p className="text-sm text-red-600">{analysis.error_message}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results - Only show if completed */}
          {analysis.status === "completed" && (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="quality">Data Quality</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Executive Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Executive Summary</CardTitle>
                    <CardDescription>Key insights from your data analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      {analysis.summary ? (
                        <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
                      ) : executiveSummary.overview ? (
                        <p className="text-gray-700 leading-relaxed">{executiveSummary.overview}</p>
                      ) : (
                        <p className="text-gray-500 italic">
                          Executive summary will appear here once analysis is complete.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics */}
                {executiveSummary.keyFindings && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Findings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {executiveSummary.keyFindings.map((finding: string, index: number) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                <div className="grid gap-6">
                  {insights.length > 0 ? (
                    insights.map((insight: any, index: number) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{insight.title}</CardTitle>
                            {insight.confidence_score && (
                              <Badge variant="outline">{Math.round(insight.confidence_score * 100)}% confidence</Badge>
                            )}
                          </div>
                          {insight.type && (
                            <CardDescription className="capitalize">{insight.type.replace("_", " ")}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700">{insight.content || insight.finding}</p>
                          {insight.impact && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm font-medium text-blue-900">Business Impact:</p>
                              <p className="text-sm text-blue-800">{insight.impact}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Detailed insights will appear here once analysis is complete.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-6">
                <div className="grid gap-6">
                  {recommendations.length > 0 ? (
                    recommendations.map((rec: any, index: number) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{rec.title}</CardTitle>
                            <div className="flex gap-2">
                              {rec.impact && (
                                <Badge
                                  variant={
                                    rec.impact === "High"
                                      ? "destructive"
                                      : rec.impact === "Medium"
                                        ? "default"
                                        : "secondary"
                                  }
                                >
                                  {rec.impact} Impact
                                </Badge>
                              )}
                              {rec.effort && <Badge variant="outline">{rec.effort} Effort</Badge>}
                            </div>
                          </div>
                          {rec.category && (
                            <CardDescription className="capitalize">{rec.category.replace("_", " ")}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 mb-4">{rec.description}</p>
                          {rec.actionSteps && rec.actionSteps.length > 0 && (
                            <div>
                              <p className="font-medium text-gray-900 mb-2">Action Steps:</p>
                              <ul className="space-y-1">
                                {rec.actionSteps.map((step: string, stepIndex: number) => (
                                  <li key={stepIndex} className="flex items-start gap-2">
                                    <span className="text-blue-600 font-medium">{stepIndex + 1}.</span>
                                    <span className="text-gray-700">{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Recommendations will appear here once analysis is complete.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="quality" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Quality Assessment</CardTitle>
                    <CardDescription>Comprehensive evaluation of your data quality</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {typeof dataQuality === "object" && Object.keys(dataQuality).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(dataQuality).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize font-medium">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                              <span className="font-medium">
                                {typeof value === "number"
                                  ? `${value}${value <= 1 ? "%" : value <= 100 ? "%" : ""}`
                                  : String(value)}
                              </span>
                            </div>
                            {typeof value === "number" && value <= 100 && <Progress value={value} className="h-2" />}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Data quality metrics will appear here once analysis is complete.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* Processing State */}
          {analysis.status === "processing" && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis in Progress</h3>
                <p className="text-gray-600 mb-4">
                  We're analyzing your data using advanced AI. This typically takes 2-5 minutes.
                </p>
                <Button variant="outline" onClick={fetchAnalysis}>
                  <Clock className="mr-2 h-4 w-4" />
                  Check Status
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Failed State */}
          {analysis.status === "failed" && (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Failed</h3>
                <p className="text-gray-600 mb-4">
                  {analysis.error_message ||
                    "There was an error processing your analysis. Please try uploading your file again."}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => router.push("/upload")}>
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/dashboard")}>
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
