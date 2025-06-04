"use client"

import type React from "react"
import { useState } from "react"
import { FileUp, Upload, AlertCircle, CheckCircle } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-context"
import { useRouter } from "next/navigation"

interface FileUploaderProps {
  accountType: string
  uploadCredits: number
  exportCredits: number
  userRole?: string
  disabled?: boolean
  onUploadStart?: (fileName: string, fileSize: number) => Promise<void>
  onUploadComplete?: (fileName: string, fileSize: number, analysisId: string) => Promise<void>
  onUploadError?: (fileName: string, error: string) => Promise<void>
}

export function FileUploader({
  accountType,
  uploadCredits,
  exportCredits,
  userRole,
  disabled = false,
  onUploadStart,
  onUploadComplete,
  onUploadError,
}: FileUploaderProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0 && !disabled) {
      handleFileUpload(files[0])
    }
  }

  const getSupportedFileTypes = () => {
    const baseTypes = [".csv", ".xlsx", ".xls"]

    if (userRole === "data-scientist" || userRole === "data-engineer") {
      return [...baseTypes, ".json", ".pbix", ".twb", ".txt", ".xml", ".parquet"]
    }

    switch (accountType) {
      case "basic":
        return baseTypes
      case "pro":
        return [...baseTypes, ".json", ".pbix", ".twb"]
      case "enterprise":
        return [...baseTypes, ".json", ".pbix", ".twb", ".txt", ".xml", ".parquet"]
      default:
        return baseTypes
    }
  }

  const getMaxFileSize = () => {
    switch (accountType) {
      case "basic":
        return 50 * 1024 * 1024 // 50MB
      case "pro":
        return 100 * 1024 * 1024 // 100MB
      case "enterprise":
        return 500 * 1024 * 1024 // 500MB
      default:
        return 50 * 1024 * 1024
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!user) {
      setError("You must be logged in to upload files")
      return
    }

    // Check if user has upload credits (only for basic accounts)
    if (accountType === "basic" && uploadCredits <= 0) {
      setError("You've used all your upload credits for this month. Upgrade to Pro for unlimited uploads.")
      return
    }

    // Check file type
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase()
    const allowedTypes = getSupportedFileTypes()

    if (!allowedTypes.includes(fileExt)) {
      setError(
        `Your ${accountType} account doesn't support ${fileExt.toUpperCase()} files. ${
          accountType === "basic" && !userRole ? "Upgrade to Pro for additional file format support." : ""
        }`,
      )
      return
    }

    // Check file size
    const maxSize = getMaxFileSize()
    if (file.size > maxSize) {
      setError(`File size exceeds the ${Math.round(maxSize / 1024 / 1024)}MB limit for your ${accountType} plan.`)
      return
    }

    try {
      setFileName(file.name)
      setIsUploading(true)
      setError(null)
      setSuccess(null)
      setUploadProgress(0)

      // Call upload start callback
      if (onUploadStart) {
        await onUploadStart(file.name, file.size)
      }

      // Generate unique file path
      const analysisId = uuidv4()
      const fileExtension = file.name.split(".").pop()
      const storagePath = `uploads/${user.id}/${analysisId}.${fileExtension}`

      // Start progress simulation
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15
        setUploadProgress(Math.min(progress, 85))
      }, 200)

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("data-files")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      setUploadProgress(90)

      // Create file upload record
      const { data: fileRecord, error: fileError } = await supabase
        .from("file_uploads")
        .insert({
          user_id: user.id,
          analysis_id: analysisId,
          file_name: file.name,
          file_type: fileExtension || "unknown",
          file_size: file.size,
          storage_path: storagePath,
          upload_status: "completed",
        })
        .select()
        .single()

      if (fileError) {
        throw new Error(`Failed to create file record: ${fileError.message}`)
      }

      // Create analysis record
      const { data: analysisRecord, error: analysisError } = await supabase
        .from("analyses")
        .insert({
          id: analysisId,
          user_id: user.id,
          file_name: file.name,
          file_type: fileExtension || "unknown",
          file_size: file.size,
          status: "processing",
          insights: {},
          recommendations: {},
          processing_started_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (analysisError) {
        throw new Error(`Failed to create analysis record: ${analysisError.message}`)
      }

      // Complete progress
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Call upload complete callback
      if (onUploadComplete) {
        await onUploadComplete(file.name, file.size, analysisId)
      }

      setSuccess("File uploaded successfully! Analysis is starting...")

      // Simulate analysis processing (in real app, this would be handled by a background job)
      setTimeout(async () => {
        try {
          // Update analysis status to completed with mock insights
          await supabase
            .from("analyses")
            .update({
              status: "completed",
              processing_completed_at: new Date().toISOString(),
              summary: `Analysis of ${file.name} completed successfully. The data contains valuable insights about your business metrics.`,
              insights: {
                total_records: Math.floor(Math.random() * 10000) + 1000,
                key_metrics: ["Revenue Growth", "Customer Acquisition", "Market Trends"],
                data_quality: "High",
                completeness: "95%",
              },
              recommendations: {
                immediate_actions: [
                  "Focus on high-performing segments",
                  "Optimize underperforming areas",
                  "Implement data-driven strategies",
                ],
                strategic_insights: [
                  "Market expansion opportunities identified",
                  "Customer retention strategies recommended",
                  "Revenue optimization potential discovered",
                ],
              },
            })
            .eq("id", analysisId)

          // Create sample insights
          const sampleInsights = [
            {
              analysis_id: analysisId,
              project_id: analysisId, // Using analysis ID as project ID for simplicity
              type: "summary",
              title: "Data Overview",
              content: `Your ${file.name} file has been successfully analyzed. The dataset contains comprehensive business metrics with high data quality and 95% completeness.`,
              confidence_score: 0.95,
              metadata: { record_count: Math.floor(Math.random() * 10000) + 1000 },
              ai_model: "DaytaTech AI v2.1",
            },
            {
              analysis_id: analysisId,
              project_id: analysisId,
              type: "trend",
              title: "Growth Trend Identified",
              content:
                "Analysis reveals a positive growth trend in key performance indicators, with a 23% increase in primary metrics over the analyzed period.",
              confidence_score: 0.87,
              metadata: { growth_rate: 23, trend_direction: "positive" },
              ai_model: "DaytaTech AI v2.1",
            },
            {
              analysis_id: analysisId,
              project_id: analysisId,
              type: "recommendation",
              title: "Optimization Opportunity",
              content:
                "Based on the data patterns, implementing targeted strategies in underperforming segments could yield an estimated 15-20% improvement in overall performance.",
              confidence_score: 0.82,
              metadata: { potential_improvement: "15-20%", priority: "high" },
              ai_model: "DaytaTech AI v2.1",
            },
          ]

          // Insert insights
          await supabase.from("insights").insert(sampleInsights)
        } catch (error) {
          console.error("Error updating analysis:", error)
        }
      }, 3000)

      // Redirect to analysis page after a short delay
      setTimeout(() => {
        router.push(`/analysis/${analysisId}`)
      }, 4000)
    } catch (err) {
      console.error("Error uploading file:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to upload file"
      setError(errorMessage)

      if (onUploadError) {
        await onUploadError(file.name, errorMessage)
      }

      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const supportedTypes = getSupportedFileTypes()
  const maxSizeMB = Math.round(getMaxFileSize() / 1024 / 1024)

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          disabled
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : isDragging
              ? "border-purple-500 bg-purple-50"
              : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileUp className="h-5 w-5 text-purple-600" />
              <span className="font-medium">{fileName}</span>
            </div>
            <Progress value={uploadProgress} className="h-2 w-full" />
            <p className="text-sm text-gray-500">
              {uploadProgress < 90
                ? `Uploading... ${Math.round(uploadProgress)}%`
                : uploadProgress < 100
                  ? "Processing file..."
                  : "Upload complete! Starting analysis..."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className={`mb-4 rounded-full p-3 ${disabled ? "bg-gray-100" : "bg-purple-100"}`}>
              <Upload className={`h-6 w-6 ${disabled ? "text-gray-400" : "text-purple-600"}`} />
            </div>
            <h3 className={`mb-2 text-lg font-semibold ${disabled ? "text-gray-400" : "text-gray-900"}`}>
              {disabled ? "Upload Limit Reached" : "Upload your data file"}
            </h3>
            <p className={`mb-4 text-sm max-w-md ${disabled ? "text-gray-400" : "text-gray-500"}`}>
              {disabled
                ? "You have reached your monthly upload limit. Upgrade your plan to continue uploading files."
                : `Drag and drop your file here, or click to browse. Supported formats: ${supportedTypes.join(", ")}`}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button as="label" htmlFor="file-upload" disabled={disabled}>
                <Upload className="mr-2 h-4 w-4" />
                Browse Files
                <input
                  id="file-upload"
                  type="file"
                  className="sr-only"
                  accept={supportedTypes.join(",")}
                  onChange={handleFileChange}
                  disabled={disabled}
                />
              </Button>
            </div>
            <p className={`mt-4 text-xs ${disabled ? "text-gray-400" : "text-gray-500"}`}>
              {accountType === "basic"
                ? `${uploadCredits} upload${uploadCredits !== 1 ? "s" : ""} remaining this month • ${exportCredits} export${exportCredits !== 1 ? "s" : ""} remaining • Maximum file size: ${maxSizeMB}MB`
                : accountType === "pro"
                  ? `Unlimited uploads and exports • All file formats supported • Maximum file size: ${maxSizeMB}MB`
                  : `Unlimited uploads and exports • All file formats supported • Maximum file size: ${maxSizeMB}MB`}
            </p>

            {userRole === "data-scientist" && accountType === "basic" && (
              <div className="mt-4 text-xs text-purple-600 bg-purple-50 p-2 rounded-md border border-purple-100 max-w-md">
                <p className="font-medium">Data Scientist Special Features:</p>
                <p>You have access to all file formats, industry-specific insights, and executive summaries.</p>
              </div>
            )}

            {userRole === "data-engineer" && accountType === "basic" && (
              <div className="mt-4 text-xs text-blue-600 bg-blue-50 p-2 rounded-md border border-blue-100 max-w-md">
                <p className="font-medium">Data Engineer Special Features:</p>
                <p>
                  You have access to all file formats, pipeline insights, architecture recommendations, and performance
                  optimization guidance.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
