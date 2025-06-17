"use client"

import type React from "react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FileUploaderProps {
  onUploadComplete: () => void
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { toast } = useToast()
  const { user } = useUser()
  const router = useRouter()

  const [selectedIndustry, setSelectedIndustry] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [selectedGoals, setSelectedGoals] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !user) {
      toast({
        title: "Error",
        description: "Please select a file and ensure you're logged in.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Step 1: Create analysis record
      const analysisResponse = await fetch("/api/analyses/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          userId: user.id,
          industry: selectedIndustry,
          role: selectedRole,
          goals: selectedGoals,
        }),
      })

      if (!analysisResponse.ok) {
        throw new Error("Failed to create analysis record")
      }

      const { analysisId } = await analysisResponse.json()
      setUploadProgress(25)

      // Step 2: Upload file to storage
      const formData = new FormData()
      formData.append("file", file)
      formData.append("analysisId", analysisId)
      formData.append("userId", user.id)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file")
      }

      setUploadProgress(50)

      // Step 3: Trigger AI Analysis
      const aiFormData = new FormData()
      aiFormData.append("file", file)
      aiFormData.append("userId", user.id)
      aiFormData.append("analysisId", analysisId)
      aiFormData.append("industry", selectedIndustry)
      aiFormData.append("role", selectedRole)
      aiFormData.append("planType", "pro") // Get from user subscription

      setUploadProgress(75)

      // Call the appropriate AI analysis endpoint
      const aiEndpoint =
        selectedRole === "data_scientist" || selectedRole === "data_engineer"
          ? "/api/ai/analyze-enhanced"
          : "/api/ai/analyze"

      const aiResponse = await fetch(aiEndpoint, {
        method: "POST",
        body: aiFormData,
      })

      if (!aiResponse.ok) {
        throw new Error("AI analysis failed")
      }

      const aiResult = await aiResponse.json()
      setUploadProgress(100)

      toast({
        title: "Analysis Complete!",
        description: `Your ${file.name} has been successfully analyzed with AI insights.`,
      })

      // Redirect to analysis results
      router.push(`/analysis/${analysisId}`)
    } catch (error) {
      console.error("Upload/Analysis error:", error)
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      <Label htmlFor="file">Choose a file to upload:</Label>
      <Input type="file" id="file" onChange={handleFileChange} />

      <Select onValueChange={setSelectedIndustry}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Industry" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="finance">Finance</SelectItem>
          <SelectItem value="healthcare">Healthcare</SelectItem>
          <SelectItem value="technology">Technology</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={setSelectedRole}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="business_analyst">Business Analyst</SelectItem>
          <SelectItem value="data_scientist">Data Scientist</SelectItem>
          <SelectItem value="data_engineer">Data Engineer</SelectItem>
          <SelectItem value="marketing_manager">Marketing Manager</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={setSelectedGoals}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Goals" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="improve_performance">Improve Performance</SelectItem>
          <SelectItem value="reduce_costs">Reduce Costs</SelectItem>
          <SelectItem value="increase_sales">Increase Sales</SelectItem>
          <SelectItem value="enhance_customer_satisfaction">Enhance Customer Satisfaction</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={handleSubmit} disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload"}
      </Button>

      {isUploading && <Progress value={uploadProgress} />}
    </div>
  )
}

export { FileUploader }
export default FileUploader
