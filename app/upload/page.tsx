"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileText, Database, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DashboardHeader } from "@/components/dashboard-header"
import { useAuth } from "@/components/auth-context"
import { useToast } from "@/hooks/use-toast"
import { processFile, generateAnalysis, saveAnalysis } from "@/lib/pure-local-storage"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      setError(null)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleUpload = async () => {
    if (!file || !user) return

    setIsProcessing(true)
    setProgress(0)
    setError(null)

    try {
      // Simulate processing steps with progress updates
      setProgress(20)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Process the file
      const processedData = await processFile(file)
      setProgress(50)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Generate analysis
      const analysis = await generateAnalysis(processedData, file.name)
      setProgress(80)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Save analysis
      const analysisId = await saveAnalysis(user.id, analysis)
      setProgress(100)

      toast({
        title: "Analysis Complete!",
        description: "Your data has been analyzed successfully. Redirecting to results...",
      })

      // Redirect to analysis page
      setTimeout(() => {
        router.push(`/analysis/${analysisId}`)
      }, 1500)
    } catch (err) {
      console.error("Upload error:", err)
      setError("Failed to process your file. Please try again.")
      toast({
        title: "Upload Failed",
        description: "There was an error processing your file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const supportedFormats = [
    { name: "CSV", description: "Comma-separated values", icon: FileText },
    { name: "Excel", description: "XLSX, XLS files", icon: Database },
    { name: "JSON", description: "JavaScript Object Notation", icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Data for AI Analysis</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload your data file and let DaytaTech.ai's AI provide expert-level insights and recommendations in
              minutes, not hours.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Upload Area */}
            <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Your Data
                </CardTitle>
                <CardDescription>Drag and drop your file here, or click to browse</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  {file ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Drop your file here or click to browse</p>
                      <p className="text-xs text-gray-400">Supports CSV, Excel, JSON files up to 50MB</p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {error && (
                  <Alert className="mt-4" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {isProcessing && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Processing your data...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}

                <Button onClick={handleUpload} disabled={!file || isProcessing} className="w-full mt-4" size="lg">
                  {isProcessing ? "Analyzing..." : "Start AI Analysis"}
                </Button>
              </CardContent>
            </Card>

            {/* Supported Formats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Supported File Formats</CardTitle>
                  <CardDescription>DaytaTech.ai works with your existing data files</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {supportedFormats.map((format) => (
                    <div key={format.name} className="flex items-center gap-3">
                      <format.icon className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{format.name}</p>
                        <p className="text-sm text-gray-500">{format.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    What You'll Get
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Executive Summary</p>
                      <p className="text-sm text-gray-500">Key insights in plain English</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Business Recommendations</p>
                      <p className="text-sm text-gray-500">Actionable next steps</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Data Quality Report</p>
                      <p className="text-sm text-gray-500">Issues and improvements</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Visual Charts</p>
                      <p className="text-sm text-gray-500">Easy-to-understand graphs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
