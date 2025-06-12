"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Download,
  Share2,
  FileText,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Loader2,
  TrendingUp,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { userService, analysisService, initializeApp, type Analysis } from "@/lib/pure-local-storage"

export default function AnalysisPage() {
  const router = useRouter()
  const params = useParams()
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Initialize app
    initializeApp()
    
    // Check authentication
    const currentUser = userService.getCurrent()
    if (!currentUser) {
      router.push("/login")
      return
    }

    // Load analysis
    const analysisId = params.id as string
    if (analysisId) {
      const analysisData = analysisService.getById(analysisId)
      if (analysisData) {
        setAnalysis(analysisData)
      } else {
        setError("Analysis not found")
      }
    } else {
      setError("Invalid analysis ID")
    }

    setIsLoading(false)
  }, [params.id, router])

  const handleDownload = () => {
    if (!analysis) return

    const reportData = {
      analysis: analysis,
      generatedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analysis-report-${analysis.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Report Downloaded",
      description: "Your analysis report has been downloaded successfully.",
    })
  }

  const handleShare = () => {
    if (!analysis) return

    const shareUrl = window.location.href

    if (navigator.share) {
      navigator.share({
        title: `Analysis Report - ${analysis.fileName}`,
        text: "Check out this data analysis report from DaytaTech.ai",
        url: shareUrl,
      })
    } else {
      navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link Copied",
        description: "Analysis link has been copied to your clipboard.",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading analysis...</p>
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error || "Analysis not found"}</AlertDescription>
          </Alert>
          <Button onClick={() => router.push("/upload")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Upload
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/upload")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{analysis.fileName}</h1>
              <p className="text-gray-600">Analyzed on {new Date(analysis.uploadDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{analysis.metrics.dataQuality || 95}%</p>
                <p className="text-sm text-gray-600">Data Quality</p>
                <Progress value={analysis.metrics.dataQuality || 95} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{analysis.insights}</p>
                <p className="text-sm text-gray-600">Insights Found</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold">{(analysis.metrics.accuracy * 100).toFixed(0)}%</p>
                <p className="text-sm text-gray-600">Accuracy</p>
                <Progress value={analysis.metrics.accuracy * 100} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{(analysis.metrics.f1Score * 100).toFixed(0)}%</p>
                <p className="text-sm text-gray-600">F1 Score</p>
                <Progress value={analysis.metrics.f1Score * 100} className="mt-2" />
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

          {/* Summary Tab */}
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Analysis Summary</CardTitle>
                <CardDescription>Overview of the analysis results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
                    <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Key Metrics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(analysis.metrics).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500 capitalize">
                            {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                          </p>
                          <p className="text-xl font-semibold">
                            {typeof value === "number" && key !== "dataQuality" && key !== "completeness"
                              ? `${(value * 100).toFixed(0)}%`
                              : `${value}${typeof value === "number" ? "%" : ""}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">File Information</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">File Name</p>
                        <p className="font-medium truncate">{analysis.fileName}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">File Size</p>
                        <p className="font-medium">{(analysis.fileSize / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">File Type</p>
                        <p className="font-medium">{analysis.fileType || "Unknown"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Key Findings Tab */}
          <TabsContent value="findings">
            <Card>
              <CardHeader>
                <CardTitle>Key Findings</CardTitle>
                <CardDescription>Important discoveries from your data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.keyFindings.map((finding, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-700 font-medium">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-gray-800">{finding}</p>
                          <div className="mt-2">
                            <Badge
                              variant="outline"
                              className={
                                index % 3 === 0
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : index % 3 === 1
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : "bg-green-50 text-green-700 border-green-200"
                              }
                            >
                              {index % 3 === 0 ? "High Impact" : index % 3 === 1 ? "Medium Impact" : "Low Impact"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Actionable insights based on your data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="bg-green-50 border border-green-100 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-800">{recommendation}</p>
                          <div className="mt-2">
                            <Badge
                              variant="outline"
                              className={
                                index % 3 === 0
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : index % 3 === 1
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }
                            >
                              {index % 3 === 0 ? "High Priority" : index % 3 === 1 ? "Medium Priority" : "Low Priority"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Overview Tab */}
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Data Overview</CardTitle>
                <CardDescription>Details about the analyzed data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">File Details</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <tbody>
                          <tr className="border-b">
                            <td className="px-4 py-2 bg-gray-50 font-medium">File Name</td>
                            <td className="px-4 py-2">{analysis.fileName}</td>
                          </tr>
                          <tr className="border-b">
                            <td className="px-4 py-2 bg-gray-50 font-medium">File Size</td>
                            <td className="px-4 py-2">{(analysis.fileSize / (1024 * 1024)).toFixed(2)} MB</td>
                          </tr>
                          <tr className="border-b">
                            <td className="px-4 py-2 bg-gray-50 font-medium">File Type</td>
                            <td className="px-4 py-2">{analysis.fileType || "Unknown"}</td>
                          </tr>
                          <tr className="border-b">
                            <td className="px-4 py-2 bg-gray-50 font-medium">Upload Date</td>
                            <td className="px-4 py-2">{new Date(analysis.uploadDate).toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 bg-gray-50 font-medium">Status</td>
                            <td className="px-4 py-2">
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200"
                              >
                                {analysis.status}
                              </Badge>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Data Quality Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Accuracy</h4>
                        <Progress value={analysis.metrics.accuracy * 100} className="mb-2" />
                        <p className="text-sm text-gray-600">
                          {(analysis.metrics.accuracy * 100).toFixed(1)}% - How accurate the data is compared to real-world values
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Precision</h4>
                        <Progress value={analysis.metrics.precision * 100} className="mb-2" />
                        <p className="text-sm text-gray-600">
                          {(analysis.metrics.precision * 100).toFixed(1)}% - The proportion of positive identifications that were actually correct
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Recall</h4>
                        <Progress value={analysis.metrics.recall * 100} className="mb-2" />
                        <p className="text-sm text-gray-600">
                          {(analysis.metrics.recall * 100).toFixed(1)}% - The proportion of actual positives that were correctly identified
                        </p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">F1 Score</h4>
                        <Progress value={analysis.metrics.f1Score * 100} className="mb-2" />
                        <p className="text-sm text-gray-600">
                          {(analysis.metrics.f1Score * 100).toFixed(1)}% - The harmonic mean of precision and recall
                        </p>
                      </div>
                    </div>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-blue-800">
                      <strong>Demo Mode:</strong> In a production environment, this section would show actual data
                      previews, column statistics, and more detailed metrics from your uploaded file.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
          <Button variant="outline" onClick={() => router.push("/upload")}>
            <ArrowLeft className="mr-2 h-4 w-\
