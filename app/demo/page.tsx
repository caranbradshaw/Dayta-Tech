"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, BarChart3, Check, FileUp, Lightbulb, X, ArrowRight, Download, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DemoTooltip } from "@/components/demo-tooltip"
import { RegionalPerformanceChart } from "@/components/regional-performance-chart"
import { RevenueGrowthChart } from "@/components/revenue-growth-chart"
import { CustomerMetricsChart } from "@/components/customer-metrics-chart"
import { DataTable } from "@/components/data-table"
import { RecommendationsList } from "@/components/recommendations-list"

export default function DemoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipTarget, setTooltipTarget] = useState("")
  const [activeTab, setActiveTab] = useState("upload")

  // Get the step from URL or default to 0
  useEffect(() => {
    const step = searchParams.get("step")
    if (step) {
      const stepNumber = Number.parseInt(step)
      setCurrentStep(stepNumber)

      // Set appropriate tab based on step
      if (stepNumber >= 2) {
        setAnalysisComplete(true)
        setActiveTab("insights")
      }
    }

    // Show first tooltip after a delay
    const timer = setTimeout(() => {
      setShowTooltip(true)
      setTooltipTarget("upload-area")
    }, 1000)

    return () => clearTimeout(timer)
  }, [searchParams])

  // Handle file upload simulation
  const handleUpload = () => {
    setTooltipTarget("")
    setShowTooltip(false)

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setUploadProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)

        // Show analysis in progress
        setCurrentStep(1)
        router.push("/demo?step=1")

        // After 3 seconds, show analysis complete
        setTimeout(() => {
          setAnalysisComplete(true)
          setCurrentStep(2)
          router.push("/demo?step=2")
          setActiveTab("insights")

          // Show next tooltip
          setTimeout(() => {
            setShowTooltip(true)
            setTooltipTarget("insights-tab")
          }, 1000)
        }, 3000)
      }
    }, 100)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setTooltipTarget("")
    setShowTooltip(false)

    // Show appropriate tooltip based on tab
    setTimeout(() => {
      setShowTooltip(true)
      if (value === "insights") {
        setTooltipTarget("insights-card")
      } else if (value === "data") {
        setTooltipTarget("data-table")
      } else if (value === "recommendations") {
        setTooltipTarget("recommendations-list")
      }
    }, 500)
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Demo Control Bar */}
      <div className="sticky top-0 z-50 bg-purple-600 text-white px-4 py-2">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">DaytaTech Interactive Demo</span>
            <span className="bg-white text-purple-600 text-xs px-2 py-0.5 rounded-full">Using Sample Data</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button size="sm" variant="outline" className="text-white border-white hover:bg-purple-700">
                <X className="mr-2 h-4 w-4" />
                Exit Demo
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" variant="secondary">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold">DaytaTech</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <span className="text-sm font-medium text-purple-600">Dashboard</span>
            <span className="text-sm font-medium">History</span>
            <span className="text-sm font-medium">Settings</span>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Help
            </Button>
            <Button variant="ghost" size="sm">
              Account
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-6">
        {!analysisComplete ? (
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-gray-500">Upload your data files and get AI-powered insights instantly.</p>
            </div>

            {currentStep === 0 && (
              <div className="grid gap-6">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Upload Data File</CardTitle>
                    <CardDescription>
                      Upload your data file to get started. We support CSV, Excel, Power BI exports, and more.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div id="upload-area" className="border-2 border-dashed rounded-lg p-6 transition-colors relative">
                      {uploadProgress > 0 ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <FileUp className="h-5 w-5 text-purple-600" />
                            <span className="font-medium">SalesData_Q2_2024.csv</span>
                          </div>
                          <Progress value={uploadProgress} className="h-2 w-full" />
                          <p className="text-sm text-gray-500">Uploading and analyzing... {uploadProgress}%</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center py-8">
                          <div className="mb-4 rounded-full bg-purple-100 p-3">
                            <FileUp className="h-6 w-6 text-purple-600" />
                          </div>
                          <h3 className="mb-2 text-lg font-semibold">Upload your data file</h3>
                          <p className="mb-4 text-sm text-gray-500 max-w-md">
                            Drag and drop your file here, or click to browse. We support CSV, Excel, Power BI exports,
                            Tableau exports, and more.
                          </p>
                          <Button onClick={handleUpload}>
                            <FileUp className="mr-2 h-4 w-4" />
                            Upload Sample File
                          </Button>
                          <p className="mt-4 text-xs text-gray-500">Maximum file size: 50MB</p>
                        </div>
                      )}
                      {showTooltip && tooltipTarget === "upload-area" && (
                        <DemoTooltip
                          position="right"
                          title="Start Here"
                          content="Click 'Upload Sample File' to begin the demo with our pre-loaded sample data."
                          onClose={() => setShowTooltip(false)}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {currentStep === 1 && (
              <div className="grid gap-6">
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Analysis in Progress</CardTitle>
                    <CardDescription>
                      Our AI is analyzing your data, identifying patterns, trends, and insights.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-green-100 p-1">
                          <Check className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Data Parsing Complete</h3>
                          <p className="text-sm text-gray-500">Your file has been successfully parsed and validated.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-green-100 p-1">
                          <Check className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Structure Analysis Complete</h3>
                          <p className="text-sm text-gray-500">
                            We've identified the structure and relationships in your data.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="animate-pulse rounded-full bg-purple-100 p-1">
                          <div className="h-5 w-5 text-purple-600 rounded-full border-2 border-purple-600 border-t-transparent animate-spin"></div>
                        </div>
                        <div>
                          <h3 className="font-medium">Generating Insights</h3>
                          <p className="text-sm text-gray-500">
                            Identifying patterns, trends, and anomalies in your data.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 opacity-50">
                        <div className="rounded-full bg-gray-100 p-1">
                          <div className="h-5 w-5"></div>
                        </div>
                        <div>
                          <h3 className="font-medium">Creating Executive Summary</h3>
                          <p className="text-sm text-gray-500">Preparing a concise summary of key findings.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 opacity-50">
                        <div className="rounded-full bg-gray-100 p-1">
                          <div className="h-5 w-5"></div>
                        </div>
                        <div>
                          <h3 className="font-medium">Generating Recommendations</h3>
                          <p className="text-sm text-gray-500">
                            Creating actionable recommendations based on your data.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setCurrentStep(0)
                    router.push("/demo?step=0")
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Analysis Results</h1>
                  <p className="text-gray-500">SalesData_Q2_2024.csv</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
                <CardDescription>AI-generated summary of the key insights from your data.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg bg-purple-50 p-4">
                    <h3 className="mb-2 font-semibold text-purple-800">Key Findings</h3>
                    <p className="text-gray-700">
                      This dataset shows a 24% increase in revenue for Q2 compared to Q1, with the highest growth in the
                      Northeast region (32%). Customer acquisition costs have decreased by 12% over the last 3 months,
                      while customer retention has improved by 8%. The data indicates a strong positive correlation
                      between marketing spend and revenue growth in all regions except the Southwest.
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-4">
                    <h3 className="mb-2 font-semibold text-blue-800">Industry Context</h3>
                    <p className="text-gray-700">
                      Compared to industry benchmarks for SaaS companies of similar size, your revenue growth is above
                      average (industry average: 18%). Your customer acquisition cost is 15% lower than the industry
                      average, suggesting efficient marketing and sales operations. Your product's adoption rate is in
                      line with top-performing companies in your segment.
                    </p>
                  </div>

                  <div className="rounded-lg bg-green-50 p-4">
                    <h3 className="mb-2 font-semibold text-green-800">Opportunities</h3>
                    <p className="text-gray-700">
                      Based on the data patterns, there's significant opportunity to expand in the Southwest region,
                      where your market penetration is lowest but growth potential is high. The data also suggests that
                      increasing investment in content marketing could yield better returns than paid advertising based
                      on current conversion rates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger id="insights-tab" value="insights">
                  Insights
                  {showTooltip && tooltipTarget === "insights-tab" && (
                    <DemoTooltip
                      position="bottom"
                      title="Explore Insights"
                      content="View visual insights extracted from your data. Click through the tabs to see different analysis views."
                      onClose={() => setShowTooltip(false)}
                    />
                  )}
                </TabsTrigger>
                <TabsTrigger value="data">Data</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="insights" className="mt-6">
                <div id="insights-card" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 relative">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium">Regional Performance</CardTitle>
                      <BarChart3 className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Northeast +32%</div>
                      <p className="text-xs text-gray-500">Highest performing region</p>
                      <div className="mt-4 h-[200px]">
                        <RegionalPerformanceChart />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium">Revenue Growth</CardTitle>
                      <BarChart3 className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">+24% Overall</div>
                      <p className="text-xs text-gray-500">Q1 to Q2 comparison</p>
                      <div className="mt-4 h-[200px]">
                        <RevenueGrowthChart />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium">Customer Metrics</CardTitle>
                      <BarChart3 className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">-12% CAC</div>
                      <p className="text-xs text-gray-500">Customer acquisition cost reduction</p>
                      <div className="mt-4 h-[200px]">
                        <CustomerMetricsChart />
                      </div>
                    </CardContent>
                  </Card>

                  {showTooltip && tooltipTarget === "insights-card" && (
                    <DemoTooltip
                      position="right"
                      title="Visual Insights"
                      content="DaytaTech automatically generates visual representations of key metrics and trends in your data."
                      onClose={() => setShowTooltip(false)}
                    />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="data" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Overview</CardTitle>
                    <CardDescription>Preview of the data used for this analysis.</CardDescription>
                  </CardHeader>
                  <CardContent id="data-table" className="relative">
                    <DataTable />

                    {showTooltip && tooltipTarget === "data-table" && (
                      <DemoTooltip
                        position="top"
                        title="Source Data"
                        content="This is the raw data that was analyzed. DaytaTech preserves your original data structure while extracting insights."
                        onClose={() => setShowTooltip(false)}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recommendations" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                    <CardDescription>AI-generated recommendations based on your data.</CardDescription>
                  </CardHeader>
                  <CardContent id="recommendations-list" className="relative">
                    <RecommendationsList />

                    {showTooltip && tooltipTarget === "recommendations-list" && (
                      <DemoTooltip
                        position="left"
                        title="Actionable Insights"
                        content="DaytaTech doesn't just analyze your data—it tells you what to do next with clear, actionable recommendations."
                        onClose={() => setShowTooltip(false)}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      {/* Demo Navigation Footer */}
      <footer className="border-t py-4 bg-gray-50">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">
                This is an interactive demo using sample data. Try clicking around to explore the features.
              </span>
            </div>
            <div className="flex gap-4">
              <Link href="/signup">
                <Button>
                  Try With Your Own Data
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
