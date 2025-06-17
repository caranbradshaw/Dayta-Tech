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

      // Add other data
      formData.append("companyName", data.companyName)
      formData.append("industry", data.industry)
      formData.append("companySize", data.companySize)
      formData.append("role", data.role)
      formData.append("goals", JSON.stringify(data.goals))
      formData.append("context", data.context)

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
        description: "Your data has been analyzed successfully.",
      })

      // Redirect to results
      router.push(`/analysis/${result.analysisId}`)
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
