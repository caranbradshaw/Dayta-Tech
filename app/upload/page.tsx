"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Logo } from "@/components/ui/logo"
import { useAuth } from "@/components/auth-context"
import {
  Upload,
  FileText,
  Database,
  Brain,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  BarChart3,
  PieChart,
  ArrowRight,
  Zap,
  Shield,
} from "lucide-react"

export default function UploadPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [analysisComplete, setAnalysisComplete] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  // Redirect if not logged in
  if (!user) {
    return null
  }

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
      const newFiles = Array.from(e.dataTransfer.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const startAnalysis = async () => {
    if (files.length === 0) return

    setUploading(true)
    setProgress(0)

    // Simulate upload progress
    const uploadInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval)
          setUploading(false)
          setAnalyzing(true)
          startAIAnalysis()
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const startAIAnalysis = async () => {
    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setAnalyzing(false)
    setAnalysisComplete(true)

    // Redirect to results after a moment
    setTimeout(() => {
      router.push("/analysis/demo-results")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Logo />
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Welcome, {user.name}!
              </Badge>
              <Button variant="ghost" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Upload className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Upload Your Data</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload your data files and let DaytaTech.ai's AI transform them into actionable business insights in
              minutes.
            </p>
          </div>

          {!analysisComplete ? (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Upload Area */}
              <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                <CardContent className="p-8">
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      multiple
                      accept=".csv,.xlsx,.xls,.json,.txt"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Drop files here or click to browse</h3>
                    <p className="text-sm text-gray-500 mb-4">Supports CSV, Excel, JSON, and text files up to 100MB</p>
                    <Button variant="outline" className="mt-2">
                      <Upload className="mr-2 h-4 w-4" />
                      Choose Files
                    </Button>
                  </div>

                  {/* File List */}
                  {files.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Selected Files:</h4>
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">{file.name}</span>
                              <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {(uploading || analyzing) && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {uploading ? "Uploading files..." : "AI analyzing your data..."}
                        </span>
                        <span className="text-sm text-gray-500">{uploading ? `${progress}%` : "Processing..."}</span>
                      </div>
                      {uploading && <Progress value={progress} className="mb-2" />}
                      {analyzing && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">AI is analyzing patterns and generating insights...</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Start Analysis Button */}
                  {files.length > 0 && !uploading && !analyzing && (
                    <Button onClick={startAnalysis} className="w-full mt-6" size="lg">
                      <Brain className="mr-2 h-5 w-5" />
                      Start AI Analysis
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* What You'll Get */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-600" />
                      What You'll Get
                    </CardTitle>
                    <CardDescription>
                      DaytaTech.ai will analyze your data and provide expert-level insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Revenue Opportunities</h4>
                        <p className="text-sm text-gray-600">Identify untapped revenue streams and growth potential</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Performance Insights</h4>
                        <p className="text-sm text-gray-600">Understand what's driving your business metrics</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Risk Alerts</h4>
                        <p className="text-sm text-gray-600">Early warning system for potential issues</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <PieChart className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium">Executive Summary</h4>
                        <p className="text-sm text-gray-600">Clear, actionable recommendations for decision-making</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      Why DaytaTech.ai?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>No technical skills required</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Expert-level analysis in minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Plain English explanations</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Actionable business recommendations</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">Your data is secure and encrypted</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* Analysis Complete */
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-800 mb-2">Analysis Complete!</h2>
                <p className="text-green-700 mb-4">
                  Your data has been analyzed and insights are ready. Redirecting to results...
                </p>
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading your insights...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sample Data Option */}
          {files.length === 0 && !uploading && !analyzing && (
            <Card className="mt-8 border-gray-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Don't have data ready?</h3>
                <p className="text-gray-600 mb-4">Try DaytaTech.ai with our sample business dataset</p>
                <Button variant="outline" onClick={() => router.push("/demo")}>
                  <Database className="mr-2 h-4 w-4" />
                  Use Sample Data
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
