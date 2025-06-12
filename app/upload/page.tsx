"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth-context"
import { Upload, FileText, CheckCircle, AlertCircle, BarChart3, ArrowLeft, Loader2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UploadedFile {
  file: File
  id: string
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  insights?: number
}

export default function UploadPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }, [])

  const handleFiles = useCallback(
    (files: File[]) => {
      const validFiles = files.filter((file) => {
        const validTypes = [
          "text/csv",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/json",
          "text/plain",
        ]

        const isValidType = validTypes.includes(file.type) || file.name.match(/\.(csv|xlsx?|json|txt)$/i)

        const isValidSize = file.size <= 50 * 1024 * 1024 // 50MB

        if (!isValidType) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a supported file type. Please upload CSV, Excel, JSON, or text files.`,
            variant: "destructive",
          })
          return false
        }

        if (!isValidSize) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 50MB. Please upload a smaller file.`,
            variant: "destructive",
          })
          return false
        }

        return true
      })

      if (validFiles.length === 0) return

      const newFiles = validFiles.map((file) => ({
        file,
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: "uploading" as const,
        progress: 0,
      }))

      setUploadedFiles((prev) => [...prev, ...newFiles])

      // Process each file
      newFiles.forEach((uploadedFile) => {
        simulateFileProcessing(uploadedFile.id)
      })

      toast({
        title: "Files uploaded",
        description: `${validFiles.length} file(s) uploaded successfully and processing started.`,
      })
    },
    [toast],
  )

  const simulateFileProcessing = async (fileId: string) => {
    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200))
        setUploadedFiles((prev) =>
          prev.map((file) =>
            file.id === fileId
              ? {
                  ...file,
                  progress,
                  status: progress === 100 ? "processing" : "uploading",
                }
              : file,
          ),
        )
      }

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Complete processing
      const insights = Math.floor(Math.random() * 15) + 5 // 5-20 insights
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === fileId
            ? {
                ...file,
                status: "completed",
                insights,
              }
            : file,
        ),
      )
    } catch (error) {
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === fileId
            ? {
                ...file,
                status: "error",
              }
            : file,
        ),
      )
    }
  }

  const handleAnalyzeAll = async () => {
    const completedFiles = uploadedFiles.filter((file) => file.status === "completed")

    if (completedFiles.length === 0) {
      toast({
        title: "No files to analyze",
        description: "Please upload and wait for files to complete processing before analyzing.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      // Simulate analysis
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Save analyses to localStorage
      const analyses = completedFiles.map((file) => ({
        id: file.id,
        name: file.file.name,
        type: file.file.name.split(".").pop()?.toUpperCase() || "Unknown",
        uploadDate: new Date().toISOString().split("T")[0],
        status: "completed" as const,
        insights: file.insights || 0,
        fileSize: `${(file.file.size / (1024 * 1024)).toFixed(1)} MB`,
        summary: `Analysis of ${file.file.name} reveals key insights and trends in your data. The analysis identified ${file.insights || 0} significant findings that can help drive business decisions.`,
        keyFindings: [
          "Data quality is excellent with 98% completeness",
          "Identified 3 key trends in the dataset",
          "Found potential optimization opportunities",
          "Detected seasonal patterns in the data",
        ],
        recommendations: [
          "Focus on high-performing segments",
          "Investigate anomalies in Q3 data",
          "Consider expanding successful initiatives",
          "Monitor key performance indicators",
        ],
      }))

      // Get existing analyses and add new ones
      const existingAnalyses = JSON.parse(localStorage.getItem("analyses") || "[]")
      const allAnalyses = [...analyses, ...existingAnalyses]
      localStorage.setItem("analyses", JSON.stringify(allAnalyses))

      // Store current analysis for viewing
      if (analyses.length > 0) {
        localStorage.setItem("currentAnalysis", JSON.stringify(analyses[0]))

        toast({
          title: "Analysis completed!",
          description: `Successfully analyzed ${analyses.length} file(s). Redirecting to results...`,
        })

        setTimeout(() => {
          router.push(`/analysis/${analyses[0].id}`)
        }, 1500)
      }
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
    toast({
      title: "File removed",
      description: "File has been removed from the upload queue.",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    }
  }

  const completedFiles = uploadedFiles.filter((file) => file.status === "completed")
  const hasCompletedFiles = completedFiles.length > 0

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <div className="flex items-center">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">Upload Data</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Data</CardTitle>
              <CardDescription>
                Upload CSV, Excel, JSON, or text files to get AI-powered insights. Maximum file size: 50MB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-300 hover:border-purple-400 hover:bg-gray-50"
                }`}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.xls,.json,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                {dragActive ? (
                  <p className="text-lg text-purple-600">Drop the files here...</p>
                ) : (
                  <div>
                    <p className="text-lg text-gray-600 mb-2">Drag & drop files here, or click to select</p>
                    <p className="text-sm text-gray-500">Supports CSV, Excel, JSON, and text files</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Files ({uploadedFiles.length})</CardTitle>
                <CardDescription>Track the progress of your file uploads and processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uploadedFiles.map((uploadedFile) => (
                    <div
                      key={uploadedFile.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <FileText className="h-8 w-8 text-purple-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{uploadedFile.file.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{(uploadedFile.file.size / (1024 * 1024)).toFixed(1)} MB</span>
                            <span>{uploadedFile.file.type || "Unknown type"}</span>
                            {uploadedFile.insights && <span>{uploadedFile.insights} insights found</span>}
                          </div>
                          {uploadedFile.status !== "completed" && uploadedFile.status !== "error" && (
                            <div className="mt-2">
                              <Progress value={uploadedFile.progress} className="w-full" />
                              <p className="text-xs text-gray-500 mt-1">
                                {uploadedFile.status === "uploading" ? "Uploading..." : "Processing..."}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {getStatusIcon(uploadedFile.status)}
                        <span className="text-sm capitalize text-gray-600">{uploadedFile.status}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(uploadedFile.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Action */}
          {hasCompletedFiles && (
            <Card>
              <CardHeader>
                <CardTitle>Ready for Analysis</CardTitle>
                <CardDescription>
                  Your files have been processed and are ready for AI analysis. Click below to generate insights.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      {completedFiles.length} file(s) processed successfully with{" "}
                      {completedFiles.reduce((sum, file) => sum + (file.insights || 0), 0)} total insights found.
                    </AlertDescription>
                  </Alert>

                  <Button onClick={handleAnalyzeAll} disabled={isAnalyzing} className="w-full" size="lg">
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing Data...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analyze Data & Generate Insights
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Supported File Types:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• CSV files (.csv)</li>
                    <li>• Excel files (.xls, .xlsx)</li>
                    <li>• JSON files (.json)</li>
                    <li>• Text files (.txt)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Tips for Better Results:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Include column headers in your data</li>
                    <li>• Ensure data is clean and consistent</li>
                    <li>• Larger datasets provide better insights</li>
                    <li>• Remove sensitive information before upload</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
