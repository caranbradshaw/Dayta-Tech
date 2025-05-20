"use client"

import type React from "react"

import { useState } from "react"
import { FileUp, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function FileUploader() {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)

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

  const handleFileUpload = (file: File) => {
    setFileName(file.name)
    setIsUploading(true)

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setUploadProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          // Redirect to analysis page after upload completes
          window.location.href = `/analysis/sample-${Date.now()}`
        }, 500)
      }
    }, 100)
  }

  return (
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
            Drag and drop your file here, or click to browse. We support CSV, Excel, Power BI exports, Tableau exports,
            and more.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button as="label" htmlFor="file-upload">
              <Upload className="mr-2 h-4 w-4" />
              Browse Files
              <input
                id="file-upload"
                type="file"
                className="sr-only"
                accept=".csv,.xlsx,.xls,.json,.pbix,.twb"
                onChange={handleFileChange}
              />
            </Button>
          </div>
          <p className="mt-4 text-xs text-gray-500">Maximum file size: 50MB</p>
        </div>
      )}
    </div>
  )
}
