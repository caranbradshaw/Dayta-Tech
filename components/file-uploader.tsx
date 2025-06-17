"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Loader2, X, Info } from "lucide-react"
import { RoleSelector, type AnalysisRole } from "@/components/role-selector"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface FileUploaderProps {
  accountType?: string
  uploadCredits?: number
  exportCredits?: number
  userRole?: string
  disabled?: boolean
  isPremium?: boolean
  onUploadStart?: (fileName: string, fileSize: number) => Promise<void>
  onUploadComplete?: (fileName: string, fileSize: number, analysisId: string) => Promise<void>
  onUploadError?: (fileName: string, error: string) => Promise<void>
}

export function FileUploader({
  accountType = "basic",
  uploadCredits = 10,
  exportCredits = 0,
  userRole,
  disabled = false,
  isPremium = false,
  onUploadStart,
  onUploadComplete,
  onUploadError,
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisRole, setAnalysisRole] = useState<AnalysisRole>("business_analyst")
  const [analysisStage, setAnalysisStage] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      const file = files[0]
      if (!file) return

      // Check file type
      const allowedTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/json",
        "text/plain",
      ]

      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx?|json|txt)$/i)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a CSV, Excel, JSON, or text file.",
          variant: "destructive",
        })
        return
      }

      // Check file size (50MB limit)
      const maxSize = 50 * 1024 * 1024
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 50MB.",
          variant: "destructive",
        })
        return
      }

      setUploading(true)
      setUploadedFile(file)
      setUploadProgress(0)
      setAnalysisProgress(0)
      setAnalysisStage("Preparing upload")

      try {
        // Call upload start callback
        if (onUploadStart) {
          await onUploadStart(file.name, file.size)
        }

        // Step 1: Create analysis record
        setAnalysisStage("Creating analysis record")
        const analysisResponse = await fetch("/api/analyses/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            userId: "current-user", // Replace with actual user ID
            industry: "general",
            role: analysisRole,
            goals: [],
          }),
        })

        if (!analysisResponse.ok) {
          throw new Error("Failed to create analysis record")
        }

        const { analysisId } = await analysisResponse.json()
        setUploadProgress(25)

        // Step 2: Upload file
        setAnalysisStage("Uploading file")
        const uploadFormData = new FormData()
        uploadFormData.append("file", file)
        uploadFormData.append("analysisId", analysisId)
        uploadFormData.append("userId", "current-user")

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        })

        if (!uploadResponse.ok) {
          console.warn("File upload failed, continuing with analysis")
        }

        setUploadProgress(50)

        // Step 3: AI Analysis
        setAnalysisStage("Starting AI analysis")
        const aiFormData = new FormData()
        aiFormData.append("file", file)
        aiFormData.append("userId", "current-user")
        aiFormData.append("analysisId", analysisId)
        aiFormData.append("industry", "general")
        aiFormData.append("role", analysisRole)
        aiFormData.append("planType", isPremium ? "pro" : "basic")

        setUploadProgress(75)
        setAnalysisStage("Processing with AI")

        // Simulate analysis progress
        progressInterval.current = setInterval(() => {
          setAnalysisProgress((prev) => {
            if (prev >= 90) {
              if (progressInterval.current) clearInterval(progressInterval.current)
              return 90
            }
            return prev + 2
          })
        }, 200)

        const aiResponse = await fetch("/api/ai/analyze", {
          method: "POST",
          body: aiFormData,
        })

        if (progressInterval.current) clearInterval(progressInterval.current)

        if (!aiResponse.ok) {
          const errorData = await aiResponse.json()
          throw new Error(errorData.details || "AI analysis failed")
        }

        const aiResult = await aiResponse.json()
        setUploadProgress(100)
        setAnalysisProgress(100)
        setAnalysisStage("Analysis complete")

        // Call upload complete callback
        if (onUploadComplete) {
          await onUploadComplete(file.name, file.size, analysisId)
        }

        toast({
          title: "Analysis Complete!",
          description: `Your ${file.name} has been successfully analyzed.`,
        })

        // Redirect to analysis results
        router.push(`/analysis/${analysisId}`)
      } catch (error) {
        console.error("Upload/Analysis error:", error)
        const errorMessage = error instanceof Error ? error.message : "Upload failed"

        if (onUploadError) {
          await onUploadError(file.name, errorMessage)
        }

        toast({
          title: "Analysis Failed",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        if (progressInterval.current) clearInterval(progressInterval.current)
        setUploading(false)
      }
    },
    [onUploadStart, onUploadComplete, onUploadError, analysisRole, isPremium, toast, router],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (disabled || uploading) return

      handleFiles(e.dataTransfer.files)
    },
    [disabled, uploading, handleFiles],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled && !uploading) {
        setDragActive(true)
      }
    },
    [disabled, uploading],
  )

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
    },
    [handleFiles],
  )

  const handleClick = useCallback(() => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click()
    }
  }, [disabled, uploading])

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-6 space-y-6">
          {isPremium && (
            <RoleSelector selectedRole={analysisRole} onChange={setAnalysisRole} isPremium={true} className="mb-4" />
          )}

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            } ${disabled || uploading ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.json,.txt"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={disabled || uploading}
            />

            {uploading ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="relative h-16 w-16">
                    <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">
                        {uploadProgress === 100 ? analysisProgress : uploadProgress}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Processing {uploadedFile?.name}</h3>
                    <p className="text-gray-500">{analysisStage}</p>
                  </div>
                </div>

                <div className="space-y-2 w-full max-w-md mx-auto">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Upload</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-1" />

                  {uploadProgress === 100 && (
                    <>
                      <div className="flex justify-between text-xs text-gray-500 mt-4">
                        <span>Analysis</span>
                        <span>{analysisProgress}%</span>
                      </div>
                      <Progress value={analysisProgress} className="h-1" />
                    </>
                  )}
                </div>

                {isPremium && (
                  <div className="mt-4 text-sm">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {analysisRole.replace("_", " ")} Analysis
                    </Badge>
                  </div>
                )}
              </div>
            ) : uploadedFile ? (
              <div className="space-y-4">
                <FileText className="h-12 w-12 mx-auto text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold">{uploadedFile.name}</h3>
                  <p className="text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveFile()
                  }}
                  disabled={uploading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove File
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold">
                    {dragActive ? "Drop your file here" : "Upload your data file"}
                  </h3>
                  <p className="text-gray-500">
                    {disabled ? "Upload limit reached" : "Drag and drop or click to select files"}
                  </p>
                </div>
                <Button variant="outline" onClick={handleClick} disabled={disabled || uploading}>
                  <FileText className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            )}
          </div>

          {!disabled && (
            <div className="mt-4 text-sm text-gray-500">
              <div className="flex items-center justify-between">
                <div>
                  <p>Supported formats: CSV, Excel (.xlsx, .xls), JSON, Text</p>
                  <p>Maximum file size: 50MB</p>
                  {uploadCredits !== undefined && <p>Remaining uploads: {uploadCredits}</p>}
                </div>

                {isPremium && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center text-blue-600 cursor-help">
                          <Info className="h-4 w-4 mr-1" />
                          <span className="text-xs">Premium Analysis</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          Your premium membership enables specialized analysis perspectives, deeper insights, and
                          comprehensive reports.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default FileUploader
