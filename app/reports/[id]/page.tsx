"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Share2,
  Star,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  Target,
  CheckCircle,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { ReportExportDialog } from "@/components/report-export-dialog"

interface Report {
  id: string
  title: string
  description: string
  report_type: string
  status: string
  summary: string
  content: any
  executive_summary: any
  insights: any[]
  recommendations: any[]
  file_name: string
  analysis_role: string
  industry: string
  company_name: string
  tags: string[]
  is_favorite: boolean
  generated_at: string
  last_accessed_at: string
  created_at: string
}

export default function ReportDetailPage() {
  const params = useParams()
  const reportId = params.id as string
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (reportId) {
      fetchReport()
    }
  }, [reportId])

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/reports/${reportId}`)
      const data = await response.json()

      if (data.report) {
        setReport(data.report)
      }
    } catch (error) {
      console.error("Error fetching report:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async () => {
    if (!report) return

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_favorite: !report.is_favorite }),
      })

      if (response.ok) {
        setReport({ ...report, is_favorite: !report.is_favorite })
      }
    } catch (error) {
      console.error("Error updating favorite:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading report...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Report not found</h3>
            <p className="text-gray-600 mb-4">The report you're looking for doesn't exist or has been deleted.</p>
            <Link href="/reports">
              <Button>Back to Reports</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/reports">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{report.title}</h1>
            <p className="text-gray-600 mb-4">{report.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{report.analysis_role?.replace("_", " ") || "Analysis"}</Badge>
              {report.industry && <Badge variant="outline">{report.industry}</Badge>}
              {report.company_name && <Badge variant="outline">{report.company_name}</Badge>}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Created {new Date(report.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Last accessed {new Date(report.last_accessed_at).toLocaleDateString()}
              </div>
              {report.file_name && (
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  {report.file_name}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={toggleFavorite}>
              <Star className={`h-4 w-4 mr-2 ${report.is_favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
              {report.is_favorite ? "Favorited" : "Add to Favorites"}
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <ReportExportDialog reportId={reportId} reportTitle={report.title} />
          </div>
        </div>
      </div>

      {/* Report Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Executive Summary */}
          {report.executive_summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-lg leading-relaxed">{report.executive_summary.overview || report.summary}</p>

                  {report.executive_summary.keyFindings && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Key Findings:</h4>
                      <ul className="space-y-2">
                        {report.executive_summary.keyFindings.map((finding: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {report.executive_summary.businessImpact && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Business Impact:</h4>
                      <p>{report.executive_summary.businessImpact}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          {report.content?.processing_metrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Rows Analyzed</p>
                      <p className="text-2xl font-bold">
                        {report.content.processing_metrics.totalRowsAnalyzed?.toLocaleString() || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Target className="h-8 w-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Data Quality</p>
                      <p className="text-2xl font-bold">
                        {report.content.data_quality_report?.overallQuality || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-purple-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Processing Time</p>
                      <p className="text-2xl font-bold">
                        {report.content.processing_metrics?.processingTimeMs
                          ? `${Math.round(report.content.processing_metrics.processingTimeMs / 1000)}s`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {report.insights && report.insights.length > 0 ? (
            <div className="grid gap-4">
              {report.insights.map((insight: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    {insight.category && (
                      <Badge variant="outline" className="w-fit">
                        {insight.category}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{insight.finding || insight.content}</p>

                    {insight.impact && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 mb-1">Impact:</p>
                        <p className="text-sm text-blue-700">{insight.impact}</p>
                      </div>
                    )}

                    {insight.confidence && (
                      <div className="mt-3 flex items-center">
                        <span className="text-sm text-gray-600 mr-2">Confidence:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${insight.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 ml-2">{Math.round(insight.confidence * 100)}%</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No detailed insights available for this report.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {report.recommendations && report.recommendations.length > 0 ? (
            <div className="grid gap-4">
              {report.recommendations.map((rec: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{rec.title || rec.recommendation}</CardTitle>
                      <div className="flex gap-2">
                        {rec.impact && (
                          <Badge
                            variant={
                              rec.impact === "High" ? "destructive" : rec.impact === "Medium" ? "default" : "secondary"
                            }
                          >
                            {rec.impact} Impact
                          </Badge>
                        )}
                        {rec.effort && <Badge variant="outline">{rec.effort} Effort</Badge>}
                      </div>
                    </div>
                    {rec.category && <CardDescription>{rec.category}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{rec.description || rec.implementation}</p>

                    {rec.actionSteps && rec.actionSteps.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">Action Steps:</h5>
                        <ol className="list-decimal list-inside space-y-1">
                          {rec.actionSteps.map((step: string, stepIndex: number) => (
                            <li key={stepIndex} className="text-sm">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {rec.timeline && (
                      <div className="mt-3 text-sm text-gray-600">
                        <strong>Timeline:</strong> {rec.timeline}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recommendations available for this report.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Report Information</h5>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Report ID:</dt>
                      <dd className="font-mono">{report.id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Status:</dt>
                      <dd>
                        <Badge variant={report.status === "generated" ? "default" : "secondary"}>{report.status}</Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Type:</dt>
                      <dd>{report.report_type}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Analysis Context</h5>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Role:</dt>
                      <dd>{report.analysis_role?.replace("_", " ") || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Industry:</dt>
                      <dd>{report.industry || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Company:</dt>
                      <dd>{report.company_name || "N/A"}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {report.tags && report.tags.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium mb-2">Tags</h5>
                  <div className="flex flex-wrap gap-2">
                    {report.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Raw Data Preview */}
          {report.content?.raw_data && (
            <Card>
              <CardHeader>
                <CardTitle>Raw Data Preview</CardTitle>
                <CardDescription>A snippet of the raw data used to generate this report.</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {JSON.stringify(report.content.raw_data, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
