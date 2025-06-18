"use client"

import { useState } from "react"
import { DaytaWizardForm } from "@/components/dayta-wizard-form"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle } from "lucide-react"

interface WizardData {
  companyName: string
  industry: string
  companySize: string
  role: string
  goals: string[]
  files: File[]
  context: string
}

export default function UploadPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStage, setAnalysisStage] = useState("")
  const [progress, setProgress] = useState(0)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please sign in to upload and analyze your data.</p>
            <Button onClick={() => router.push("/login")} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleWizardComplete = async (data: WizardData) => {
    if (data.files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please upload at least one file to analyze.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setProgress(0)
    setAnalysisStage("Preparing analysis...")

    try {
      // Step 1: Create analysis record
      setAnalysisStage("Creating analysis record...")
      setProgress(10)

      const analysisResponse = await fetch("/api/analyses/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          fileName: data.files[0].name,
          fileType: data.files[0].type,
          fileSize: data.files[0].size,
          industry: data.industry,
          role: data.role,
          goals: data.goals,
          context: data.context,
          companyName: data.companyName,
          companySize: data.companySize,
        }),
      })

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json()
        throw new Error(errorData.error || "Failed to create analysis record")
      }

      const { analysisId } = await analysisResponse.json()
      setProgress(25)

      // Step 2: Upload files
      setAnalysisStage("Uploading files...")
      const formData = new FormData()

      data.files.forEach((file, index) => {
        formData.append(`file_${index}`, file)
      })

      formData.append("analysisId", analysisId)
      formData.append("userId", user.id)
      formData.append("companyName", data.companyName)
      formData.append("industry", data.industry)
      formData.append("companySize", data.companySize)
      formData.append("role", data.role)
      formData.append("goals", JSON.stringify(data.goals))
      formData.append("context", data.context)

      setProgress(50)

      // Step 3: Start AI analysis
      setAnalysisStage("Starting AI analysis...")
      const analysisApiResponse = await fetch("/api/ai/analyze", {
        method: "POST",
        body: formData,
      })

      if (!analysisApiResponse.ok) {
        const errorData = await analysisApiResponse.json()
        throw new Error(errorData.details || errorData.error || "Analysis failed")
      }

      setProgress(90)
      setAnalysisStage("Finalizing results...")

      const result = await analysisApiResponse.json()
      setProgress(100)

      toast({
        title: "Analysis Complete!",
        description: "Your data has been analyzed successfully.",
      })

      // Redirect to results
      setTimeout(() => {
        router.push(`/analysis/${analysisId}`)
      }, 1000)
    } catch (error) {
      console.error("Analysis error:", error)
      const errorMessage = error instanceof Error ? error.message : "Analysis failed"

      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      })

      setIsAnalyzing(false)
      setProgress(0)
      setAnalysisStage("")
    }
  }

  if (isAnalyzing) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="space-y-6">
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">{progress}%</span>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-2">Analyzing Your Data</h2>
                <p className="text-gray-600 mb-4">{analysisStage}</p>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <p>This may take a few minutes depending on your file size.</p>
                <p>Please don't close this window.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload & Analyze Your Data</h1>
          <p className="text-gray-600">Follow our guided wizard to get personalized insights from your business data</p>
        </div>

        <DaytaWizardForm onComplete={handleWizardComplete} />
      </div>
    </div>
  )
}
