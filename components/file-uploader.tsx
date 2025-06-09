"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Loader2 } from "lucide-react"
import { analytics } from "@/lib/simple-analytics"

export function FileUploader() {
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setUploadedFile(file)

    try {
      // Track file upload event
      await analytics.trackEvent("file_upload", "current-user", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        timestamp: new Date().toISOString(),
      })

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Track analysis start
      await analytics.trackEvent("analysis_started", "current-user", {
        fileName: file.name,
        timestamp: new Date().toISOString(),
      })

      // Redirect to analysis results
      window.location.href = "/dashboard/history"
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/json": [".json"],
    },
    multiple: false,
  })

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />

            {uploading ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">Processing {uploadedFile?.name}</h3>
                  <p className="text-muted-foreground">Analyzing your data with AI...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold">
                    {isDragActive ? "Drop your file here" : "Upload your data file"}
                  </h3>
                  <p className="text-muted-foreground">Drag and drop or click to select CSV, Excel, or JSON files</p>
                </div>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
