"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/dashboard-header"
import { useAuth } from "@/components/auth-context"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Upload, FileText, X, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function UploadPage() {
  const [mounted, setMounted] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const supabase = createClientComponentClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if not logged in
  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, mounted, router])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/json",
    ]

    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV, Excel, or JSON file.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file || !user) return

    setUploading(true)
    setProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Create analysis record
      const analysisData = {
        user_id: user.id,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        status: "processing",
        analysis_type: profile?.analysis_type || "comprehensive",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: analysis, error: analysisError } = await supabase
        .from("analyses")
        .insert(analysisData)
        .select()
        .single()

      if (analysisError) {
        throw new Error("Failed to create analysis record")
      }

      setProgress(100)
      setUploading(false)
      setAnalyzing(true)

      // Simulate AI analysis
      setTimeout(async () => {
        try {
          // Update analysis with mock results
          const mockResults = {
            status: "completed",
            summary: `Analysis of ${file.name} reveals key insights about your data patterns. The dataset contains valuable information that can drive business decisions.`,
            insights_count: Math.floor(Math.random() * 5) + 3,
            recommendations_count: Math.floor(Math.random() * 3) + 2,
            processing_time_ms: Math.floor(Math.random() * 5000) + 2000,
            ai_provider: "mock",
            updated_at: new Date().toISOString(),
          }

          await supabase.from("analyses").update(mockResults).eq("id", analysis.id)

          toast({
            title: "Analysis complete!",
            description: "Your data has been analyzed successfully.",
          })

          router.push(`/analysis/${analysis.id}`)
        } catch (error) {
          console.error("Error completing analysis:", error)
          await supabase
            .from("analyses")
            .update({ status: "failed", updated_at: new Date().toISOString() })
            .eq("id", analysis.id)

          toast({
            title: "Analysis failed",
            description: "Something went wrong during analysis. Please try again.",
            variant: "destructive",
          })
          setAnalyzing(false)
        }
      }, 3000)
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      })
      setUploading(false)
      setProgress(0)
    }
  }

  const removeFile = () => {
    setFile(null)
    setProgress(0)
  }

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Data</h1>
            <p className="text-gray-600">
              Upload a CSV, Excel, or JSON file to get AI-powered insights and recommendations
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Select File</CardTitle>
              <CardDescription>Supported formats: CSV, Excel (.xlsx, .xls), JSON • Max size: 10MB</CardDescription>
            </CardHeader>
            <CardContent>
              {!file ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Drop your file here, or click to browse</h3>
                  <p className="text-gray-500 mb-4">CSV, Excel, or JSON files up to 10MB</p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.json"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button asChild>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      Choose File
                    </label>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{file.name}</h4>
                        <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    {!uploading && !analyzing && (
                      <Button variant="ghost" size="sm" onClick={removeFile}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                  )}

                  {analyzing && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Analyzing your data with AI...</span>
                    </div>
                  )}

                  {!uploading && !analyzing && (
                    <Button onClick={handleUpload} className="w-full" size="lg">
                      Start Analysis
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Credits Info */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Upload Credits</h4>
                  <p className="text-sm text-gray-500">You have {profile?.upload_credits || 0} credits remaining</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{profile?.upload_credits || 0}</div>
                  <p className="text-xs text-gray-500">Credits left</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
