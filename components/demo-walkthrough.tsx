"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Check, FileSpreadsheet, TrendingUp, Lightbulb } from "lucide-react"
import { RegionalPerformanceChart } from "@/components/regional-performance-chart"
import { RevenueGrowthChart } from "@/components/revenue-growth-chart"
import { CustomerMetricsChart } from "@/components/customer-metrics-chart"

// Demo data - completely self-contained, no API calls needed
const DEMO_DATA = {
  summary: {
    title: "Q2 Sales Performance Analysis",
    overview: "Analysis of 1,247 sales records across 12 product categories",
    highlights: [
      "Revenue increased by 23% compared to Q1",
      "Enterprise segment grew by 31%",
      "Customer retention improved to 94%",
      "Average deal size increased by 17%",
    ],
    recommendations: [
      "Focus on enterprise segment expansion",
      "Implement cross-selling strategy for mid-market",
      "Optimize sales cycle for SMB segment",
      "Increase investment in customer success team",
    ],
  },
  insights: [
    {
      id: "insight-1",
      title: "Revenue Growth Opportunities",
      description: "Enterprise customers show 3.4x higher lifetime value than SMB",
      metrics: {
        impact: "High",
        confidence: "92%",
        effort: "Medium",
      },
      details:
        "Analysis shows enterprise customers have significantly higher retention rates and expansion revenue. Increasing enterprise segment by 15% could result in $2.7M additional annual recurring revenue.",
    },
    {
      id: "insight-2",
      title: "Sales Efficiency Optimization",
      description: "Sales cycle can be reduced by 27% through process optimization",
      metrics: {
        impact: "Medium",
        confidence: "87%",
        effort: "Low",
      },
      details:
        "Current sales cycle averages 42 days. Implementing automated qualification and streamlined demo scheduling could reduce this to 31 days, increasing quarterly deal velocity by 35%.",
    },
    {
      id: "insight-3",
      title: "Customer Segmentation Opportunity",
      description: "Creating a premium tier could increase ARPU by 22%",
      metrics: {
        impact: "High",
        confidence: "89%",
        effort: "Medium",
      },
      details:
        "25% of customers consistently utilize advanced features and would benefit from a premium tier. Survey data suggests willingness to pay 30-40% more for enhanced capabilities and priority support.",
    },
  ],
  charts: {
    revenue: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Enterprise",
          data: [120000, 132000, 141000, 160000, 178000, 195000],
        },
        {
          label: "Mid-Market",
          data: [85000, 87000, 92000, 98000, 103000, 110000],
        },
        {
          label: "SMB",
          data: [45000, 47000, 49000, 52000, 54000, 58000],
        },
      ],
    },
    customers: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "New Customers",
          data: [42, 38, 47, 53, 60, 65],
        },
        {
          label: "Churned Customers",
          data: [8, 7, 6, 5, 4, 3],
        },
      ],
    },
    regions: {
      labels: ["North America", "Europe", "Asia Pacific", "Latin America"],
      datasets: [
        {
          label: "Revenue Distribution",
          data: [45, 30, 20, 5],
        },
        {
          label: "Growth Rate",
          data: [18, 22, 35, 12],
        },
      ],
    },
  },
}

// Demo steps
const DEMO_STEPS = [
  { id: "intro", title: "Introduction", description: "See how DaytaTech works" },
  { id: "upload", title: "Upload Data", description: "Upload your data file" },
  { id: "analyze", title: "AI Analysis", description: "Our AI analyzes your data" },
  { id: "results", title: "View Results", description: "Review insights and recommendations" },
]

export function DemoWalkthrough() {
  const [currentStep, setCurrentStep] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisSteps, setAnalysisSteps] = useState([
    { name: "Data validation", complete: false },
    { name: "Structure analysis", complete: false },
    { name: "Pattern recognition", complete: false },
    { name: "Insight generation", complete: false },
    { name: "Recommendation creation", complete: false },
  ])
  const [demoData, setDemoData] = useState(DEMO_DATA)
  const [activeTab, setActiveTab] = useState("summary")

  // Handle upload simulation
  useEffect(() => {
    if (currentStep === 1 && uploadProgress < 100) {
      const timer = setTimeout(() => {
        setUploadProgress((prev) => Math.min(prev + 5, 100))
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [currentStep, uploadProgress])

  // Handle analysis simulation
  useEffect(() => {
    if (currentStep === 2 && analysisProgress < 100) {
      const timer = setTimeout(() => {
        setAnalysisProgress((prev) => {
          const newProgress = Math.min(prev + 1, 100)

          // Update analysis steps based on progress
          if (newProgress === 20) {
            setAnalysisSteps((prev) => prev.map((step, i) => (i === 0 ? { ...step, complete: true } : step)))
          } else if (newProgress === 40) {
            setAnalysisSteps((prev) => prev.map((step, i) => (i === 1 ? { ...step, complete: true } : step)))
          } else if (newProgress === 60) {
            setAnalysisSteps((prev) => prev.map((step, i) => (i === 2 ? { ...step, complete: true } : step)))
          } else if (newProgress === 80) {
            setAnalysisSteps((prev) => prev.map((step, i) => (i === 3 ? { ...step, complete: true } : step)))
          } else if (newProgress === 100) {
            setAnalysisSteps((prev) => prev.map((step, i) => (i === 4 ? { ...step, complete: true } : step)))
          }

          return newProgress
        })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [currentStep, analysisProgress])

  // Auto-advance to next step when current step completes
  useEffect(() => {
    if (currentStep === 1 && uploadProgress === 100) {
      const timer = setTimeout(() => setCurrentStep(2), 500)
      return () => clearTimeout(timer)
    }

    if (currentStep === 2 && analysisProgress === 100) {
      const timer = setTimeout(() => setCurrentStep(3), 500)
      return () => clearTimeout(timer)
    }
  }, [currentStep, uploadProgress, analysisProgress])

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 0: // Introduction
        return (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Welcome to DaytaTech Demo</CardTitle>
              <CardDescription>See how our AI-powered data analysis works in 3 simple steps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-4">
                {DEMO_STEPS.map((step, index) => (
                  <div key={step.id} className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setCurrentStep(1)} className="w-full">
                Start Demo
              </Button>
            </CardFooter>
          </Card>
        )

      case 1: // Upload Data
        return (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Upload Your Data</CardTitle>
              <CardDescription>Upload your spreadsheet or CSV file for analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-4 border rounded-md bg-muted/50">
                <FileSpreadsheet className="h-8 w-8 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium">Q2_Sales_Report.xlsx</p>
                  <p className="text-sm text-muted-foreground">1.2 MB • Excel Spreadsheet</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Upload progress</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>

              {uploadProgress === 100 && (
                <div className="rounded-md bg-green-50 p-3 text-green-700 flex items-center space-x-2">
                  <Check className="h-5 w-5" />
                  <span>Upload complete! Preparing for analysis...</span>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case 2: // AI Analysis
        return (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>AI Analysis in Progress</CardTitle>
              <CardDescription>Our AI is analyzing your data to extract insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall progress</span>
                  <span>{analysisProgress}%</span>
                </div>
                <Progress value={analysisProgress} className="h-2" />
              </div>

              <div className="space-y-3 mt-4">
                {analysisSteps.map((step, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center ${step.complete ? "bg-green-100 text-green-700" : "bg-muted"}`}
                      >
                        {step.complete ? <Check className="h-4 w-4" /> : index + 1}
                      </div>
                      <span>{step.name}</span>
                    </div>
                    {step.complete && <Check className="h-4 w-4 text-green-600" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )

      case 3: // Results
        return (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{demoData.summary.title}</CardTitle>
              <CardDescription>{demoData.summary.overview}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="summary">Executive Summary</TabsTrigger>
                  <TabsTrigger value="insights">Key Insights</TabsTrigger>
                  <TabsTrigger value="charts">Data Visualization</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg mb-2 flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
                      Key Highlights
                    </h3>
                    <ul className="space-y-2">
                      {demoData.summary.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start">
                          <div className="h-5 w-5 mr-2 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs">
                            {index + 1}
                          </div>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg mb-2 flex items-center">
                      <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
                      Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {demoData.summary.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <div className="h-5 w-5 mr-2 flex items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs">
                            {index + 1}
                          </div>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="insights" className="space-y-4">
                  {demoData.insights.map((insight) => (
                    <Card key={insight.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <CardDescription>{insight.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex space-x-4 text-sm">
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Impact:</span>
                            <span
                              className={`px-2 py-0.5 rounded-full ${insight.metrics.impact === "High" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                            >
                              {insight.metrics.impact}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium mr-1">Confidence:</span>
                            <span>{insight.metrics.confidence}</span>
                          </div>
                          <div>
                            <span className="font-medium mr-1">Effort:</span>
                            <span>{insight.metrics.effort}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.details}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="charts" className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Revenue by Segment</h3>
                    <div className="h-64">
                      <RevenueGrowthChart
                        data={{
                          labels: demoData.charts.revenue.labels,
                          datasets: demoData.charts.revenue.datasets,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Regional Performance</h3>
                    <div className="h-64">
                      <RegionalPerformanceChart
                        data={{
                          labels: demoData.charts.regions.labels,
                          datasets: demoData.charts.regions.datasets,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Customer Metrics</h3>
                    <div className="h-64">
                      <CustomerMetricsChart
                        data={{
                          labels: demoData.charts.customers.labels,
                          datasets: demoData.charts.customers.datasets,
                        }}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(0)}>
                Restart Demo
              </Button>
              <Button onClick={() => (window.location.href = "/signup")}>Start Free Trial</Button>
            </CardFooter>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">DaytaTech Demo</h2>
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {DEMO_STEPS.length}
          </div>
        </div>

        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-muted" />
          <ol className="relative z-10 flex justify-between">
            {DEMO_STEPS.map((step, index) => (
              <li key={step.id} className="flex items-center justify-center">
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    index <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {renderStep()}
    </div>
  )
}
