"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Download, Share2, TrendingUp, BarChart3, FileText, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DashboardHeader } from "@/components/dashboard-header"
import { useAuth } from "@/components/auth-context"
import { clientStorage, type Analysis } from "@/lib/client-storage"
import { useToast } from "@/hooks/use-toast"

export default function AnalysisPage() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !params.id) return

    const analysisId = params.id as string
    const foundAnalysis = clientStorage.getAnalysisById(analysisId)

    if (foundAnalysis) {
      setAnalysis(foundAnalysis)
    } else {
      toast({
        title: "Analysis not found",
        description: "The requested analysis could not be found.",
        variant: "destructive",
      })
      router.push("/dashboard")
    }

    setLoading(false)
  }, [mounted, params.id, router, toast])

  const handleDownload = () => {
    if (!analysis) return

    const reportData = {
      fileName: analysis.fileName,
      uploadDate: analysis.uploadDate,
      summary: analysis.summary,
      keyFindings: analysis.keyFindings,
      recommendations: analysis.recommendations,
      metrics: analysis.metrics,
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analysis-report-${analysis.fileName}.json`
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
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: "Link Copied",
        description: "Analysis link has been copied to your clipboard.",
      })
    })
  }

  if (!mounted || loading) {
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
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Analysis Not Found</h1>
            <p className="text-gray-600 mb-6">The requested analysis could not be found.</p>
            <Button onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
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
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{analysis.fileName}</h1>
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

          {/* Status and Overview */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {analysis.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-2">Analysis Status</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold">{analysis.insights}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Key Insights</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span className="text-2xl font-bold">{analysis.metrics.dataQuality}%</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Data Quality</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  <span className="text-2xl font-bold">{(analysis.fileSize / 1024 / 1024).toFixed(1)}MB</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">File Size</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Executive Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
                <CardDescription>Key insights from your data analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
              </CardContent>
            </Card>

            {/* Data Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Data Quality Metrics</CardTitle>
                <CardDescription>Assessment of your data quality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analysis.metrics).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                      <span className="font-medium">
                        {typeof value === "number" && value < 1
                          ? `${(value * 100).toFixed(1)}%`
                          : `${value}${typeof value === "number" && value <= 100 ? "%" : ""}`}
                      </span>
                    </div>
                    <Progress
                      value={
                        typeof value === "number" && value < 1 ? value * 100 : typeof value === "number" ? value : 0
                      }
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Key Findings */}
            <Card>
              <CardHeader>
                <CardTitle>Key Findings</CardTitle>
                <CardDescription>Important discoveries from your data</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.keyFindings.map((finding, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{finding}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Actionable next steps based on your data</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
