"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, Share2, BarChart3, TrendingUp, FileText, Lightbulb } from "lucide-react"

interface AnalysisResult {
  id: string
  fileName: string
  fileSize: number
  insights: {
    totalRows: number
    columns: string[]
    keyFindings: string[]
    recommendations: string[]
  }
  summary: string
  createdAt: string
}

export default function AnalysisPage({ params }: { params: { id: string } }) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Try to get analysis from localStorage first
    const currentAnalysis = localStorage.getItem("currentAnalysis")
    if (currentAnalysis) {
      setAnalysis(JSON.parse(currentAnalysis))
      setLoading(false)
      return
    }

    // Fallback: search in stored analyses
    const storedAnalyses = JSON.parse(localStorage.getItem("analyses") || "[]")
    const foundAnalysis = storedAnalyses.find((a: AnalysisResult) => a.id === params.id)

    if (foundAnalysis) {
      setAnalysis(foundAnalysis)
    } else {
      // Generate a mock analysis if not found
      const mockAnalysis: AnalysisResult = {
        id: params.id,
        fileName: "sample-data.csv",
        fileSize: 2048000,
        insights: {
          totalRows: 5420,
          columns: ["Date", "Revenue", "Customers", "Region", "Product", "Sales_Rep"],
          keyFindings: [
            "Revenue increased by 23% compared to last quarter",
            "Customer acquisition rate improved by 15%",
            "North region shows highest growth potential",
            "Product A accounts for 45% of total revenue",
            "Q3 shows seasonal peak in sales performance",
            "Customer retention rate is 87% above industry average",
          ],
          recommendations: [
            "Focus marketing efforts on North region for maximum ROI",
            "Increase inventory for Product A to meet growing demand",
            "Implement customer retention program to maintain high rates",
            "Optimize pricing strategy for underperforming products",
            "Expand sales team in high-performing regions",
            "Develop seasonal marketing campaigns for Q3 peaks",
          ],
        },
        summary:
          "Analysis reveals strong performance indicators with significant growth opportunities. The data shows positive trends across key metrics with actionable insights for business optimization.",
        createdAt: new Date().toISOString(),
      }
      setAnalysis(mockAnalysis)
    }

    setLoading(false)
  }, [params.id])

  const handleDownload = () => {
    if (!analysis) return

    const reportData = {
      fileName: analysis.fileName,
      analysisDate: new Date(analysis.createdAt).toLocaleDateString(),
      summary: analysis.summary,
      keyFindings: analysis.insights.keyFindings,
      recommendations: analysis.insights.recommendations,
      dataOverview: {
        totalRows: analysis.insights.totalRows,
        columns: analysis.insights.columns.length,
        fileSize: `${(analysis.fileSize / 1024).toFixed(1)} KB`,
      },
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analysis-report-${analysis.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Analysis Report - ${analysis?.fileName}`,
          text: analysis?.summary,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href)
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Analysis Not Found</h1>
          <p className="text-gray-600 mb-6">The requested analysis could not be found.</p>
          <Button onClick={() => router.push("/upload")}>Upload New File</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{analysis.fileName}</h1>
              <p className="text-sm text-gray-600">Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Rows</p>
                  <p className="text-xl font-bold">{analysis.insights.totalRows.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Columns</p>
                  <p className="text-xl font-bold">{analysis.insights.columns.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Key Findings</p>
                  <p className="text-xl font-bold">{analysis.insights.keyFindings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Recommendations</p>
                  <p className="text-xl font-bold">{analysis.insights.recommendations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="findings">Key Findings</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="data">Data Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-lg">{analysis.summary}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="findings">
            <Card>
              <CardHeader>
                <CardTitle>Key Findings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.insights.keyFindings.map((finding, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                      <Badge variant="secondary" className="mt-1">
                        {index + 1}
                      </Badge>
                      <p className="text-gray-700">{finding}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>Actionable Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.insights.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                      <Badge variant="secondary" className="mt-1">
                        {index + 1}
                      </Badge>
                      <p className="text-gray-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-3">File Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">File Name:</span>
                          <span>{analysis.fileName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">File Size:</span>
                          <span>{(analysis.fileSize / 1024).toFixed(1)} KB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Rows:</span>
                          <span>{analysis.insights.totalRows.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Columns:</span>
                          <span>{analysis.insights.columns.length}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-3">Column Names</h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.insights.columns.map((column, index) => (
                          <Badge key={index} variant="outline">
                            {column}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={() => router.push("/upload")} size="lg">
            Analyze Another File
          </Button>
          <Button onClick={() => router.push("/dashboard")} variant="outline" size="lg">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
