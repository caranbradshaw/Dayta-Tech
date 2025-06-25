"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, X, ChevronRight, ChevronLeft } from "lucide-react"
import { RoleSelector, type AnalysisRole } from "@/components/role-selector"
import { GoalSelector } from "@/components/goal-selector"
import { useDropzone } from "react-dropzone"
import { useToast } from "@/hooks/use-toast"

interface WizardData {
  companyName: string
  industry: string
  companySize: string
  role: string
  goals: string[]
  files: File[]
  context: string
}

interface DaytaWizardFormProps {
  onComplete: (data: WizardData) => void
}

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Retail",
  "Manufacturing",
  "Education",
  "Real Estate",
  "Consulting",
  "Marketing",
  "Other",
]

const COMPANY_SIZES = ["1-10 employees", "11-50 employees", "51-200 employees", "201-1000 employees", "1000+ employees"]

export function DaytaWizardForm({ onComplete }: DaytaWizardFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<WizardData>({
    companyName: "",
    industry: "",
    companySize: "",
    role: "",
    goals: [],
    files: [],
    context: "",
  })
  const { toast } = useToast()

  const totalSteps = 5

  const onDrop = (acceptedFiles: File[]) => {
    // Validate file types
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/json",
      "text/plain",
    ]

    const validFiles = acceptedFiles.filter((file) => {
      const isValidType = validTypes.includes(file.type) || file.name.match(/\.(csv|xlsx?|json|txt)$/i)

      if (!isValidType) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a supported file type.`,
          variant: "destructive",
        })
        return false
      }

      // Check file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds the 50MB size limit.`,
          variant: "destructive",
        })
        return false
      }

      return true
    })

    if (validFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...validFiles],
      }))

      toast({
        title: "Files Added",
        description: `${validFiles.length} file(s) added successfully.`,
      })
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "application/json": [".json"],
      "text/plain": [".txt"],
    },
    multiple: true,
  })

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }))
  }

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return formData.companyName.trim() !== "" && formData.industry !== "" && formData.companySize !== ""
      case 2:
        return formData.role !== ""
      case 3:
        return formData.goals.length > 0
      case 4:
        return formData.files.length > 0 // This is the key fix!
      case 5:
        return true // Context is optional
      default:
        return false
    }
  }

  const nextStep = () => {
    if (canProceedToNextStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    if (formData.files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please upload at least one file to analyze.",
        variant: "destructive",
      })
      return
    }

    onComplete(formData)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Enter your company name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="industry">Industry *</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => setFormData({ ...formData, industry: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="companySize">Company Size *</Label>
              <Select
                value={formData.companySize}
                onValueChange={(value) => setFormData({ ...formData, companySize: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">What's your role? *</Label>
              <p className="text-sm text-gray-600 mt-1">This helps us tailor the analysis to your perspective.</p>
            </div>
            <RoleSelector
              selectedRole={formData.role as AnalysisRole}
              onRoleChange={(role) => setFormData({ ...formData, role })}
              isPremium={true}
            />
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">What are your main goals? *</Label>
              <p className="text-sm text-gray-600 mt-1">Select all that apply to get more relevant insights.</p>
            </div>
            <GoalSelector selectedGoals={formData.goals} onChange={(goals) => setFormData({ ...formData, goals })} />
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Upload Your Data Files *</Label>
              <p className="text-sm text-gray-600 mt-1">
                Upload CSV, Excel, JSON, or text files. Maximum 50MB per file.
              </p>
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">
                {isDragActive ? "Drop your files here" : "Drag & drop files here"}
              </p>
              <p className="text-gray-500 mb-4">or click to browse</p>
              <Button type="button" variant="outline">
                Choose Files
              </Button>
            </div>

            {formData.files.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selected Files ({formData.files.length})</Label>
                {formData.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="context" className="text-base font-medium">
                Additional Context (Optional)
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Provide any additional context about your data or specific questions you'd like answered.
              </p>
            </div>
            <Textarea
              id="context"
              value={formData.context}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              placeholder="e.g., This data contains sales information from Q4 2023. I'm particularly interested in regional performance trends..."
              rows={6}
              className="mt-1"
            />
          </div>
        )

      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Company Information"
      case 2:
        return "Your Role"
      case 3:
        return "Analysis Goals"
      case 4:
        return "Upload Data"
      case 5:
        return "Additional Context"
      default:
        return ""
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{getStepTitle()}</CardTitle>
          <span className="text-sm text-gray-500">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        <Progress value={(currentStep / totalSteps) * 100} className="mt-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        {renderStep()}

        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep === totalSteps ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={formData.files.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Analysis
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={nextStep}
              disabled={!canProceedToNextStep()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
