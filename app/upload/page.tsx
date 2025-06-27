"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DaytaWizardForm } from "@/components/dayta-wizard-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload, Zap, Shield, BarChart3 } from "lucide-react"
import Link from "next/link"

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
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handleWizardComplete = async (data: WizardData) => {
    console.log("Wizard completed with data:", data)
    setIsProcessing(true)

    try {
      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real app, you would upload files and process them here
      // For now, we'll redirect to a demo analysis page
      router.push("/analysis/demo")
    } catch (error) {
      console.error("Error processing data:", error)
      setIsProcessing(false)
    }
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Processing Your Data</h3>
            <p className="text-gray-600">
              Our AI is analyzing your files and generating insights. This may take a few moments...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload & Analyze Your Data</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Follow our guided wizard to get personalized insights from your business data
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Upload className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Easy Upload</h3>
              <p className="text-sm text-gray-600">Drag & drop your CSV, Excel, or JSON files</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">AI Analysis</h3>
              <p className="text-sm text-gray-600">Advanced AI processes your data for insights</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Actionable Reports</h3>
              <p className="text-sm text-gray-600">Get personalized recommendations and charts</p>
            </CardContent>
          </Card>
        </div>

        {/* Wizard Form */}
        <DaytaWizardForm onComplete={handleWizardComplete} />

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-full">
            <Shield className="h-4 w-4" />
            Your data is encrypted and secure. We never store your files permanently.
          </div>
        </div>
      </div>
    </div>
  )
}
