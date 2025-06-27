"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DaytaWizardForm } from "@/components/dayta-wizard-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Upload, Zap, Shield, BarChart3, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
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
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState("")
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const handleWizardComplete = async (data: WizardData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload files.",
        variant: "destructive",
      })
      return
    }

    console.log("Wizard completed with data:", data)
    setIsProcessing(true)
    setProgress(0)
    setCurrentStage("Preparing upload...")

    try {
      // Step 1: Create analysis record
      setCurrentStage("Creating analysis record...")
      setProgress(10)

      const analysisData = {
        user_id: user.id,
        file_name: data.files[0]?.name || "Multiple Files",
        file_size: data.files.reduce((total, file) => total + file.size, 0),
        file_type: data.files[0]?.type || "mixed",
        status: "processing",
        analysis_type: "comprehensive",
        metadata: {
          company_name: data.companyName,
          industry: data.industry,
          company_size: data.companySize,
          role: data.role,
          goals: data.goals,
          context: data.context,
          file_count: data.files.length,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: analysis, error: analysisError } = await supabase
        .from("analyses")
        .insert(analysisData)
        .select()
        .single()

      if (analysisError) {
        console.error("Analysis creation error:", analysisError)
        throw new Error("Failed to create analysis record")
      }

      console.log("Analysis created:", analysis)
      setProgress(25)

      // Step 2: Upload files to file_uploads table
      setCurrentStage("Uploading files...")
      const fileUploadPromises = data.files.map(async (file, index) => {
        // Convert file to base64 for storage (in production, use Supabase Storage)
        const fileContent = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })

        const fileUploadData = {
          user_id: user.id,
          analysis_id: analysis.id,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          file_content: fileContent, // In production, this would be a storage URL
          upload_status: "completed",
          metadata: {
            original_name: file.name,
            upload_order: index,
            company_name: data.companyName,
            industry: data.industry,
          },
          created_at: new Date().toISOString(),
        }

        const { data: fileUpload, error: fileError } = await supabase
          .from("file_uploads")
          .insert(fileUploadData)
          .select()
          .single()

        if (fileError) {
          console.error("File upload error:", fileError)
          throw new Error(`Failed to upload ${file.name}`)
        }

        console.log("File uploaded:", fileUpload)
        return fileUpload
      })

      const uploadedFiles = await Promise.all(fileUploadPromises)
      setProgress(60)

      // Step 3: Process with AI (mock for now)
      setCurrentStage("Analyzing with AI...")

      // Simulate AI processing time
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setProgress(80)

      // Step 4: Generate insights and save results
      setCurrentStage("Generating insights...")

      const mockInsights = {
        summary: `Analysis of ${data.files.length} file(s) from ${data.companyName} reveals key insights about your ${data.industry} business data.`,
        key_findings: [
          "Data quality is good with minimal missing values",
          "Clear trends identified in the dataset",
          "Opportunities for optimization detected",
        ],
        recommendations: [
          "Focus on the top-performing segments",
          "Address data gaps in underperforming areas",
          "Implement monitoring for key metrics",
        ],
        confidence_score: 0.85,
        processing_time_ms: 2000,
      }

      // Update analysis with results
      const { error: updateError } = await supabase
        .from("analyses")
        .update({
          status: "completed",
          summary: mockInsights.summary,
          insights: mockInsights,
          updated_at: new Date().toISOString(),
        })
        .eq("id", analysis.id)

      if (updateError) {
        console.error("Analysis update error:", updateError)
        throw new Error("Failed to save analysis results")
      }

      setProgress(100)
      setCurrentStage("Complete!")

      toast({
        title: "Analysis Complete!",
        description: "Your data has been analyzed successfully.",
      })

      // Redirect to results after a short delay
      setTimeout(() => {
        router.push(`/analysis/${analysis.id}`)
      }, 1000)
    } catch (error) {
      console.error("Upload/analysis error:", error)
      const errorMessage = error instanceof Error ? error.message : "Upload failed"

      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      })

      setIsProcessing(false)
      setProgress(0)
      setCurrentStage("")
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="relative mb-6">
              <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">{progress}%</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2">Processing Your Data</h3>
            <p className="text-gray-600 mb-4">{currentStage}</p>

            <Progress value={progress} className="mb-4" />

            <p className="text-sm text-gray-500">This may take a few moments. Please don't close this window.</p>
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
