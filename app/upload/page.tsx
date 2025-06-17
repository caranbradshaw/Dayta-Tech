"use client"

import { useState } from "react"
import { DaytaWizardForm } from "@/components/dayta-wizard-form"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

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
  const router = useRouter()
  const { toast } = useToast()

  const handleWizardComplete = async (data: WizardData) => {
    setIsAnalyzing(true)

    try {
      // Create FormData for file upload
      const formData = new FormData()

      // Add files
      data.files.forEach((file, index) => {
        formData.append(`file_${index}`, file)
      })

      // Add all wizard data
      formData.append("companyName", data.companyName)
      formData.append("industry", data.industry)
      formData.append("companySize", data.companySize)
      formData.append("role", data.role)
      formData.append("goals", JSON.stringify(data.goals))
      formData.append("context", data.context)

      // Add analysis configuration
      formData.append("analysisRole", data.role === "data_engineer" ? "data_engineer" : "data_scientist")
      formData.append("analysisTier", "enhanced") // Use enhanced tier for premium analysis
      formData.append("userId", "temp-user-id") // This should come from auth context

      // Create analysis record first
      const analysisResponse = await fetch("/api/analyses/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: data.files[0]?.name || "analysis",
          fileSize: data.files[0]?.size || 0,
          industry: data.industry,
          role: data.role,
          goals: data.goals,
          context: data.context,
          companyName: data.companyName,
          companySize: data.companySize,
        }),
      })

      if (!analysisResponse.ok) {
        throw new Error("Failed to create analysis record")
      }

      const { analysisId } = await analysisResponse.json()
      formData.append("analysisId", analysisId)

      // Start the enhanced analysis
      const response = await fetch("/api/ai/analyze-enhanced", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const result = await response.json()

      toast({
        title: "Analysis Complete!",
        description: "Your data has been analyzed successfully with premium AI insights.",
      })

      // Redirect to results
      router.push(`/analysis/${analysisId}`)
    } catch (error) {
      console.error("Analysis error:", error)
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (isAnalyzing) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Analyzing Your Data</h2>
          <p className="text-muted-foreground">Please wait while we process your files and generate insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload & Analyze Your Data</h1>
          <p className="text-muted-foreground">
            Follow our guided wizard to get personalized insights from your business data
          </p>
        </div>

        <DaytaWizardForm onComplete={handleWizardComplete} />
      </div>
    </div>
  )
}
