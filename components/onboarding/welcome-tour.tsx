"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Upload, BarChart3, Download, Users, Sparkles, ArrowRight, X } from "lucide-react"

interface WelcomeTourProps {
  region: "nigeria" | "america"
  userTier: "basic" | "pro" | "team" | "enterprise"
  onComplete: () => void
  onSkip: () => void
}

const tourSteps = {
  nigeria: [
    {
      id: "welcome",
      title: "Welcome to DaytaTech.ai! 🇳🇬",
      description: "Transform your Nigerian business data into actionable insights with AI-powered analysis.",
      icon: Sparkles,
      color: "bg-green-500",
    },
    {
      id: "upload",
      title: "Upload Your Data",
      description: "Drag & drop Excel, CSV, or JSON files. We support all major Nigerian business formats.",
      icon: Upload,
      color: "bg-blue-500",
    },
    {
      id: "analyze",
      title: "AI-Powered Analysis",
      description: "Our Claude AI understands Nigerian market context and provides localized insights.",
      icon: BarChart3,
      color: "bg-purple-500",
    },
    {
      id: "export",
      title: "Export & Share",
      description: "Download professional reports in PDF, Word, Excel formats for your team.",
      icon: Download,
      color: "bg-orange-500",
    },
    {
      id: "collaborate",
      title: "Team Collaboration",
      description: "Share insights with your Lagos, Abuja, or Port Harcourt teams seamlessly.",
      icon: Users,
      color: "bg-green-600",
    },
  ],
  america: [
    {
      id: "welcome",
      title: "Welcome to DaytaTech.ai! 🇺🇸",
      description: "Enterprise-grade data analysis powered by advanced AI for American businesses.",
      icon: Sparkles,
      color: "bg-blue-600",
    },
    {
      id: "upload",
      title: "Enterprise Data Upload",
      description: "Secure upload for Excel, CSV, JSON, Power BI, and Tableau files up to 1GB.",
      icon: Upload,
      color: "bg-indigo-500",
    },
    {
      id: "analyze",
      title: "Advanced AI Analysis",
      description: "Claude Premium AI with Fortune 500 business intelligence and market insights.",
      icon: BarChart3,
      color: "bg-purple-600",
    },
    {
      id: "export",
      title: "Professional Reports",
      description: "Export to PowerPoint, Word, Excel with executive-ready formatting.",
      icon: Download,
      color: "bg-red-500",
    },
    {
      id: "collaborate",
      title: "Enterprise Collaboration",
      description: "Share across departments with role-based access and team workspaces.",
      icon: Users,
      color: "bg-blue-700",
    },
  ],
}

export function WelcomeTour({ region, userTier, onComplete, onSkip }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const steps = tourSteps[region]
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    setIsVisible(false)
    onComplete()
  }

  const handleSkip = () => {
    setIsVisible(false)
    onSkip()
  }

  if (!isVisible) return null

  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="relative">
          <Button variant="ghost" size="icon" className="absolute right-0 top-0" onClick={handleSkip}>
            <X className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-full ${currentStepData.color} text-white`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
              <Badge variant="outline" className="mt-1">
                Step {currentStep + 1} of {steps.length}
              </Badge>
            </div>
          </div>

          <Progress value={progress} className="w-full" />
        </CardHeader>

        <CardContent className="space-y-6">
          <CardDescription className="text-lg leading-relaxed">{currentStepData.description}</CardDescription>

          {/* Tier-specific benefits */}
          {currentStep === 0 && (
            <div
              className={`p-4 rounded-lg ${region === "nigeria" ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"} border`}
            >
              <h4 className="font-semibold mb-2">Your {userTier.toUpperCase()} Plan Includes:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {userTier === "basic" && (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>5 analyses/month</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Standard insights</span>
                    </div>
                  </>
                )}
                {userTier === "pro" && (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>20 analyses/month</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Claude AI insights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Full export suite</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Priority support</span>
                    </div>
                  </>
                )}
                {(userTier === "team" || userTier === "enterprise") && (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Unlimited analyses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Claude Premium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Team collaboration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Custom reporting</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleSkip}>
                Skip Tour
              </Button>
              <Button onClick={handleNext} className="gap-2">
                {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
