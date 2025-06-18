"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-context"
import { useRouter } from "next/navigation"
import { Upload, AlertCircle, CheckCircle, Zap, Crown, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileUploaderProps {
  onUploadStart?: (fileName: string, fileSize: number) => Promise<void>
  onUploadComplete?: (fileName: string, fileSize: number, analysisId: string) => Promise<void>
  onUploadError?: (fileName: string, error: string) => Promise<void>
}

export function FileUploader({ onUploadStart, onUploadComplete, onUploadError }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Check if user can upload based on their plan and usage
  const canUpload = () => {
    if (!profile) return false

    // Check if user has upload credits
    if (profile.account_type === "basic" && profile.upload_credits <= 0) {
      return false
    }

    return true
  }

  const getUploadLimitMessage = () => {
    if (!profile) return "Please log in to upload files"

    if (profile.account_type === "basic") {
      return `${profile.upload_credits} uploads remaining this month`
    }

    return "Unlimited uploads"
  }

  const getSupportedFormats = () => {
    if (!profile) return ["csv", "xlsx", "xls", "json"]

    // Pro and higher get all formats
    if (profile.account_type !== "basic") {
      return ["csv", "xlsx", "xls", "json", "txt", "xml", "parquet"]
    }

    return ["csv", "xlsx", "xls", "json"]
  }

  const getMaxFileSize = () => {
    if (!profile) return 10 // 10MB for non-authenticated

    switch (profile.account_type) {
      case "basic":
        return 10 // 10MB
      case "pro":
        return 100 // 100MB
      case "team":
        return 500 // 500MB
      case "enterprise":
        return 1000 // 1GB
      default:
        return 10
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!user || !profile) {
        toast({
          title: "Authentication Required",
          description: "Please log in to upload files.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      if (!canUpload()) {
        toast({
          title: "Upload Limit Reached",
          description: "You've reached your monthly upload limit. Upgrade to Pro for unlimited uploads.",
          variant: "destructive",
        })
        return
      }

      const file = acceptedFiles[0]
      if (!file) return

      // Check file size
      const maxSize = getMaxFileSize() * 1024 * 1024 // Convert to bytes
      if (file.size > maxSize) {
        setError(`File size exceeds ${getMaxFileSize()}MB limit for your plan`)
        return
      }

      // Check file type
      const supportedFormats = getSupportedFormats()
      const fileExtension = file.name.split(".").pop()?.toLowerCase()
      if (!fileExtension || !supportedFormats.includes(fileExtension)) {
        setError(`File type .${fileExtension} is not supported for your plan`)
        return
      }

      setError(null)
      setUploadedFile(file)
      setUploading(true)
      setProgress(0)

      try {
        await onUploadStart?.(file.name, file.size)

        // Create analysis record first
        const analysisResponse = await fetch("/api/analyses/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            fileName: file.name,
            fileType: fileExtension,
            fileSize: file.size,
          }),
        })

        if (!analysisResponse.ok) {
          throw new Error("Failed to create analysis record")
        }

        const { analysisId } = await analysisResponse.json()
        setProgress(25)

        // Upload file to Vercel Blob
        const formData = new FormData()
        formData.append("file", file)
        formData.append("analysisId", analysisId)
        formData.append("userId", user.id)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("File upload failed")
        }

        const uploadResult = await uploadResponse.json()
        setProgress(50)

        // Start AI analysis
        setUploading(false)
        setAnalyzing(true)

        const analysisResponse2 = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            analysisId,
            fileUrl: uploadResult.url,
            fileName: file.name,
            userId: user.id,
            userContext: {
              company: profile.company,
              industry: profile.industry,
              role: profile.role,
              accountType: profile.account_type,
            },
          }),
        })

        if (!analysisResponse2.ok) {
          throw new Error("Analysis failed")
        }

        setProgress(100)

        // Refresh user profile to update credits
        await refreshProfile()

        await onUploadComplete?.(file.name, file.size, analysisId)

        toast({
          title: "Analysis Complete!",
          description: "Your file has been analyzed successfully.",
        })

        // Redirect to analysis results
        router.push(`/analysis/${analysisId}`)
      } catch (error) {
        console.error("Upload/Analysis error:", error)
        const errorMessage = error instanceof Error ? error.message : "Upload failed"
        setError(errorMessage)
        await onUploadError?.(file.name, errorMessage)

        toast({
          title: "Upload Failed",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setUploading(false)
        setAnalyzing(false)
        setProgress(0)
      }
    },
    [user, profile, onUploadStart, onUploadComplete, onUploadError, router, toast, refreshProfile],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "application/json": [".json"],
      "text/plain": [".txt"],
      "application/xml": [".xml"],
      "application/octet-stream": [".parquet"],
    },
    multiple: false,
    disabled: uploading || analyzing || !canUpload(),
  })

  const getPlanBadge = () => {
    if (!profile) return null

    switch (profile.account_type) {
      case "basic":
        return <Badge variant="secondary">Basic Plan</Badge>
      case "pro":
        return (
          <Badge className="bg-purple-100 text-purple-800">
            <Crown className="h-3 w-3 mr-1" />
            Pro Plan
          </Badge>
        )
      case "team":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Sparkles className="h-3 w-3 mr-1" />
            Team Plan
          </Badge>
        )
      case "enterprise":
        return (
          <Badge className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800">
            <Zap className="h-3 w-3 mr-1" />
            Enterprise
          </Badge>
        )
      default:
        return null
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Upload className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
          <p className="text-gray-600 mb-4">Please sign in to upload and analyze your data files.</p>
          <Button onClick={() => router.push("/login")}>Sign In to Upload</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Plan Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getPlanBadge()}
          <span className="text-sm text-gray-600">{getUploadLimitMessage()}</span>
        </div>
        {profile?.account_type === "basic" && (
          <Button variant="outline" size="sm" onClick={() => router.push("/pricing")}>
            Upgrade Plan
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : canUpload()
                  ? "border-gray-300 hover:border-gray-400"
                  : "border-gray-200 bg-gray-50 cursor-not-allowed"
            }`}
          >
            <input {...getInputProps()} />

            {uploading || analyzing ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <div>
                  <p className="text-lg font-medium">{uploading ? "Uploading..." : "Analyzing with AI..."}</p>
                  <Progress value={progress} className="mt-2" />
                  <p className="text-sm text-gray-500 mt-1">
                    {uploading ? "Uploading your file securely" : "AI is analyzing your data"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive ? "Drop your file here" : "Upload your data file"}
                  </p>
                  <p className="text-gray-500">Drag and drop or click to select • Max {getMaxFileSize()}MB</p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {getSupportedFormats().map((format) => (
                    <Badge key={format} variant="outline" className="text-xs">
                      .{format.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {uploadedFile && !error && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">
                  {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!canUpload() && profile?.account_type === "basic" && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You've reached your monthly upload limit.
            <Button variant="link" className="p-0 h-auto ml-1" onClick={() => router.push("/pricing")}>
              Upgrade to Pro
            </Button>{" "}
            for unlimited uploads.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
