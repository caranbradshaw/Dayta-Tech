"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Upload, Brain, BarChart3, TrendingUp, Lightbulb, User, Lock } from "lucide-react"
import { useRouter } from "next/navigation"

interface DemoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()

  const steps = [
    { title: "Introduction", icon: BarChart3 },
    { title: "Login", icon: User },
    { title: "Upload File", icon: Upload },
    { title: "AI Analysis", icon: Brain },
    { title: "Results", icon: TrendingUp },
  ]

  const analysisSteps = [
    "Processing file structure...",
    "Analyzing data patterns...",
    "Generating business insights...",
    "Creating recommendations...",
    "Finalizing report...",
  ]

  const mockResults = {
    summary:
      "Analysis of Q2 Sales Report reveals strong performance with $2.4M in total revenue across 1,247 transactions. The data shows excellent quality (94% completeness) with clear growth opportunities in the Enterprise segment (+23% potential) and geographic expansion possibilities. Key findings indicate optimal pricing strategies are driving 18% higher margins in premium products, while customer retention metrics suggest successful loyalty program implementation.",
    insights: [
      {
        type: "revenue",
        title: "Revenue Growth Opportunity",
        content:
          "Enterprise segment shows 23% untapped potential with average deal size 3.2x higher than SMB segment. Current conversion rate of 12% could reach 18% with targeted approach.",
        confidence: 92,
        impact: "High",
      },
      {
        type: "efficiency",
        title: "Operational Efficiency Gains",
        content:
          "Analysis reveals 15% cost reduction opportunity through process optimization in fulfillment operations. Peak processing times show 40% variance that could be smoothed.",
        confidence: 87,
        impact: "Medium",
      },
      {
        type: "customer",
        title: "Customer Retention Insights",
        content:
          "Premium customers show 89% retention rate vs 67% for standard tier. Loyalty program correlation indicates 34% higher lifetime value for engaged users.",
        confidence: 94,
        impact: "High",
      },
    ],
    recommendations: [
      {
        title: "Enterprise Sales Focus",
        description:
          "Implement dedicated enterprise sales team and specialized onboarding process to capture the 23% growth opportunity.",
        impact: "High",
        effort: "Medium",
        category: "Sales Strategy",
      },
      {
        title: "Process Automation",
        description:
          "Deploy automated fulfillment workflows to reduce processing variance and achieve 15% cost savings.",
        impact: "Medium",
        effort: "Low",
        category: "Operations",
      },
      {
        title: "Premium Tier Expansion",
        description: "Expand premium features and create upgrade paths to increase customer lifetime value by 34%.",
        impact: "High",
        effort: "Medium",
        category: "Product Strategy",
      },
    ],
  }

  useEffect(() => {
    if (currentStep === 3 && isAnalyzing) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsAnalyzing(false)
            setTimeout(() => setCurrentStep(4), 500)
            return 100
          }
          return prev + 2
        })
      }, 100)
      return () => clearInterval(interval)
    }
  }, [currentStep, isAnalyzing])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      if (currentStep === 2) {
        setCurrentStep(3)
        setIsAnalyzing(true)
        setProgress(0)
      } else {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handleStartTrial = () => {
    onClose()
    router.push("/signup")
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">See DaytaTech in Action</h3>
              <p className="text-gray-600 mb-6">
                Experience how our AI-powered platform transforms your data into actionable business insights in just
                minutes.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <User className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium">Secure Login</p>
                </div>
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-sm font-medium">Upload Data</p>
                </div>
                <div className="text-center">
                  <Brain className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm font-medium">AI Analysis</p>
                </div>
              </div>
            </div>
            <Button onClick={handleNext} size="lg" className="w-full">
              Start Demo
            </Button>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-bold mb-2">DaytaTech Login</h3>
              <p className="text-gray-600">Secure access to your analytics dashboard</p>
            </div>

            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Welcome to DaytaTech</CardTitle>
                <CardDescription>Sign in to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <div className="p-3 border rounded-md bg-gray-50">
                    <span className="text-gray-600">demo@daytatech.ai</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <div className="p-3 border rounded-md bg-gray-50">
                    <span className="text-gray-400">••••••••</span>
                  </div>
                </div>
                <Button onClick={handleNext} className="w-full gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Sign In
                </Button>
              </CardContent>
            </Card>

            <div className="bg-blue-50 p-4 rounded-lg max-w-2xl mx-auto">
              <h4 className="font-medium mb-2">DaytaTech Pricing:</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>
                  • <strong>Basic:</strong> $39/month - 5 analyses, basic insights
                </li>
                <li>
                  • <strong>Pro:</strong> $99/month - 20 analyses, advanced insights
                </li>
                <li>
                  • <strong>Team:</strong> $499/month - Unlimited analyses, team features
                </li>
                <li>
                  • <strong>Enterprise:</strong> Custom pricing - Full platform access
                </li>
              </ul>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-bold mb-2">Upload Your Data</h3>
              <p className="text-gray-600">
                Simply drag and drop your file or click to browse. We support CSV, Excel, and JSON formats.
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Q2_Sales_Report.csv</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>📊 1,247 records • 12 columns • 2.3 MB</p>
                  <p>✅ Data validation complete</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">What we detected:</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Revenue, customer, and transaction data</li>
                <li>• Time series information for trend analysis</li>
                <li>• Geographic and segment classifications</li>
                <li>• High data quality (94% complete)</li>
              </ul>
            </div>

            <Button onClick={handleNext} size="lg" className="w-full">
              Analyze with AI
            </Button>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Brain className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-xl font-bold mb-2">AI Analysis in Progress</h3>
              <p className="text-gray-600">Our advanced AI is analyzing your data to generate actionable insights.</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Analysis Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-3">
              {analysisSteps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  {progress > (index + 1) * 20 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                  )}
                  <span className={progress > (index + 1) * 20 ? "text-green-700" : "text-gray-600"}>{step}</span>
                </div>
              ))}
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">AI Engine Active:</h4>
              <p className="text-sm text-gray-700">
                Using advanced machine learning models to identify patterns, anomalies, and opportunities in your data.
              </p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-xl font-bold mb-2">Analysis Complete!</h3>
              <p className="text-gray-600">Here are your AI-generated insights and recommendations.</p>
            </div>

            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Executive Summary</TabsTrigger>
                <TabsTrigger value="insights">Key Insights</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5" />
                      <span>Executive Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{mockResults.summary}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                {mockResults.insights.map((insight, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant={insight.impact === "High" ? "destructive" : "secondary"}>
                            {insight.impact} Impact
                          </Badge>
                          <Badge variant="outline">{insight.confidence}% Confidence</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{insight.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                {mockResults.recommendations.map((rec, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Lightbulb className="w-5 h-5 text-yellow-600" />
                          <span>{rec.title}</span>
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant={rec.impact === "High" ? "destructive" : "secondary"}>
                            {rec.impact} Impact
                          </Badge>
                          <Badge variant="outline">{rec.effort} Effort</Badge>
                        </div>
                      </div>
                      <CardDescription>{rec.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{rec.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg text-center">
              <h4 className="font-bold text-lg mb-2">Ready to analyze your own data?</h4>
              <p className="text-gray-600 mb-4">
                Get started with your free 30-day trial and unlock the power of AI-driven insights.
              </p>
              <Button onClick={handleStartTrial} size="lg" className="w-full">
                Start Free Trial
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>DaytaTech Live Demo</span>
            <div className="flex items-center space-x-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                    index === currentStep
                      ? "bg-blue-100 text-blue-700"
                      : index < currentStep
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <step.icon className="w-3 h-3" />
                  <span>{step.title}</span>
                </div>
              ))}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">{renderStepContent()}</div>
      </DialogContent>
    </Dialog>
  )
}
