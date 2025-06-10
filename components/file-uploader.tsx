"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Loader2, X } from "lucide-react"
import { analytics } from "@/lib/simple-analytics"

interface FileUploaderProps {
  accountType?: string
  uploadCredits?: number
  exportCredits?: number
  userRole?: string
  disabled?: boolean
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
  onUploadStart,
  onUploadComplete,
  onUploadError,
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      ]

      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx?|json)$/i)) {
        alert("Please upload a CSV, Excel, or JSON file.")
        return
      }

      // Check file size (50MB limit)
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (file.size > maxSize) {
        alert("File size must be less than 50MB.")
        return
      }

      setUploading(true)
      setUploadedFile(file)

      try {
        // Call upload start callback
        if (onUploadStart) {
          await onUploadStart(file.name, file.size)
        }

        // Track file upload event
        await analytics.trackEvent("file_upload", "current-user", {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          timestamp: new Date().toISOString(),
        })

        // Simulate upload delay
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Generate mock analysis ID
        const analysisId = `analysis_${Date.now()}`

        // Track analysis start
        await analytics.trackEvent("analysis_started", "current-user", {
          fileName: file.name,
          analysisId,
          timestamp: new Date().toISOString(),
        })

        // Call upload complete callback
        if (onUploadComplete) {
          await onUploadComplete(file.name, file.size, analysisId)
        }

        // Redirect to analysis results
        window.location.href = "/dashboard/history"
      } catch (error) {
        console.error("Upload failed:", error)
        const errorMessage = error instanceof Error ? error.message : "Upload failed"

        if (onUploadError) {
          await onUploadError(file.name, errorMessage)
        }

        alert(`Upload failed: ${errorMessage}`)
      } finally {
        setUploading(false)
      }
    },
    [onUploadStart, onUploadComplete, onUploadError],
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
    if (disabled || uploading) return
    fileInputRef.current?.click()
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
        <CardContent className="p-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : disabled
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                  : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.json"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={disabled || uploading}
            />

            {uploading ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold">Processing {uploadedFile?.name}</h3>
                  <p className="text-gray-500">Analyzing your data with AI...</p>
                </div>
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
                    {disabled ? "Upload limit reached" : "Drag and drop or click to select CSV, Excel, or JSON files"}
                  </p>
                </div>
                {!disabled && (
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                )}
              </div>
            )}
          </div>

          {!disabled && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              <p>Supported formats: CSV, Excel (.xlsx, .xls), JSON</p>
              <p>Maximum file size: 50MB</p>
              {uploadCredits !== undefined && <p>Remaining uploads: {uploadCredits}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
