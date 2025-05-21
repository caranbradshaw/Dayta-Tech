"use client"

import type React from "react"

import { useState } from "react"
import { FileUp, Upload } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { uploadFile, createAnalysis } from "@/lib/supabase-utils"
import { supabase } from "@/lib/supabase"

export function FileUploader() {
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
    try {
      setFileName(file.name)
      setIsUploading(true)
      setError(null)

      // Check if user is authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to upload files")
      }

      // Start progress simulation
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += 5
        setUploadProgress(Math.min(progress, 90)) // Cap at 90% until actual upload completes
      }, 100)

      // Generate a unique file path
      const fileExt = file.name.split(".").pop()
      const filePath = `${user.id}/${uuidv4()}.${fileExt}`

      // Upload file to Supabase Storage
      await uploadFile(file, filePath)

      // Create analysis record in database
      const analysis = await createAnalysis({
        user_id: user.id,
        file_name: file.name,
        file_type: file.type,
        status: "processing",
        summary: null,
        insights: null,
        recommendations: null,
      })

      // Complete progress
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Redirect to analysis page after upload completes
      setTimeout(() => {
        window.location.href = `/analysis/${analysis.id}`
      }, 500)
    } catch (err) {
      console.error("Error uploading file:", err)
      setError(err instanceof Error ? err.message : "Failed to upload file")
      setIsUploading(false)
    }
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
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      )}
    </div>
  )
}
