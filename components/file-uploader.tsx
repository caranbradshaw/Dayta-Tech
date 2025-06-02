"use client"

import type React from "react"

import { useState } from "react"
import { FileUp, Upload } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getSupportedFileTypes } from "@/lib/account-utils"

interface FileUploaderProps {
  accountType: string
  uploadCredits: number
  exportCredits: number
  userRole?: string
}

export function FileUploader({ accountType, uploadCredits, exportCredits, userRole }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    // Check if user has upload credits (only for basic accounts)
    if (accountType === "basic" && uploadCredits <= 0) {
      setError("You've used all your upload credits for this month. Upgrade to Pro for unlimited uploads.")
      return
    }

    // Check file type based on account type and role
    const fileExt = file.name.split(".").pop()?.toLowerCase()
    const allowedTypes = getSupportedFileTypes(accountType as any, userRole as any)

    if (fileExt && !allowedTypes.includes(fileExt)) {
      setError(
        `Your ${accountType} account doesn't support ${fileExt.toUpperCase()} files. ${accountType === "basic" && !userRole ? "Upgrade to Pro for additional file format support." : ""}`,
      )
      return
    }

    try {
      setFileName(file.name)
      setIsUploading(true)
      setError(null)

      // Start progress simulation
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += 5
        setUploadProgress(Math.min(progress, 90)) // Cap at 90% until actual upload completes
      }, 100)

      // In a real app, we would upload the file to storage here
      // For demo purposes, we'll just simulate the upload

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Update user's upload credits in localStorage (only for basic accounts)
      if (accountType === "basic") {
        const userDataStr = localStorage.getItem("daytaTechUser")
        if (userDataStr) {
          const userData = JSON.parse(userDataStr)
          userData.uploadCredits = (userData.uploadCredits || 10) - 1
          localStorage.setItem("daytaTechUser", JSON.stringify(userData))
        }
      }

      // Complete progress
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Redirect to analysis page after upload completes
      setTimeout(() => {
        const analysisId = uuidv4()
        window.location.href = `/analysis/${analysisId}`
      }, 500)
    } catch (err) {
      console.error("Error uploading file:", err)
      setError(err instanceof Error ? err.message : "Failed to upload file")
      setIsUploading(false)
    }
  }

  // Determine if user has access to all file formats
  const hasAllFileFormats = userRole === "data-scientist" || userRole === "data-engineer" || accountType !== "basic"

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragging ? "border-purple-500 bg-purple-50" : "border-gray-300"
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
            <p className="text-sm text-gray-500">Uploading and analyzing... {uploadProgress}%</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="mb-4 rounded-full bg-purple-100 p-3">
              <Upload className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Upload your data file</h3>
            <p className="mb-4 text-sm text-gray-500 max-w-md">
              Drag and drop your file here, or click to browse.
              {userRole === "data-scientist"
                ? " As a Data Scientist, you have access to all file formats."
                : userRole === "data-engineer"
                  ? " As a Data Engineer, you have access to all file formats."
                  : accountType === "basic"
                    ? " Your Basic plan supports CSV and Excel files."
                    : " We support CSV, Excel, Power BI exports, Tableau exports, and more."}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button as="label" htmlFor="file-upload">
                <Upload className="mr-2 h-4 w-4" />
                Browse Files
                <input
                  id="file-upload"
                  type="file"
                  className="sr-only"
                  accept={hasAllFileFormats ? ".csv,.xlsx,.xls,.json,.pbix,.twb,.txt,.xml,.parquet" : ".csv,.xlsx,.xls"}
                  onChange={handleFileChange}
                />
              </Button>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              {accountType === "basic"
                ? `${uploadCredits} upload${uploadCredits !== 1 ? "s" : ""} remaining this month • ${exportCredits} export${exportCredits !== 1 ? "s" : ""} remaining • Maximum file size: 50MB`
                : accountType === "pro"
                  ? "Unlimited uploads and exports • All file formats supported • Maximum file size: 100MB"
                  : "Unlimited uploads and exports • All file formats supported • Maximum file size: 500MB"}
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
