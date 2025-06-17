"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { RoleSelector } from "@/components/role-selector"
import { GoalSelector } from "@/components/goal-selector"
import { FileUploader } from "@/components/file-uploader"
import { Building2, User, Upload, MessageSquare } from "lucide-react"

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
  className?: string
}

export function DaytaWizardForm({ onComplete, className }: DaytaWizardFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<WizardData>({
    companyName: "",
    industry: "",
    companySize: "",
    role: "",
    goals: [],
    files: [],
    context: "",
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const updateData = (updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    onComplete(data)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.companyName && data.industry
      case 2:
        return data.role
      case 3:
        return data.files.length > 0
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Data Analysis Wizard</CardTitle>
        <CardDescription>
          Step {currentStep} of {totalSteps} - Let's set up your analysis
        </CardDescription>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent>
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Company Information</h3>
            </div>

            <div>
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                value={data.companyName}
                onChange={(e) => updateData({ companyName: e.target.value })}
                placeholder="Enter your company name"
              />
            </div>

            <div>
              <Label htmlFor="industry">Industry *</Label>
              <Input
                id="industry"
                value={data.industry}
                onChange={(e) => updateData({ industry: e.target.value })}
                placeholder="e.g., Technology, Healthcare, Finance"
              />
            </div>

            <div>
              <Label htmlFor="company-size">Company Size</Label>
              <Input
                id="company-size"
                value={data.companySize}
                onChange={(e) => updateData({ companySize: e.target.value })}
                placeholder="e.g., 1-10, 11-50, 51-200, 200+"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Role & Goals</h3>
            </div>

            <RoleSelector selectedRole={data.role} onRoleChange={(role) => updateData({ role })} />

            <GoalSelector selectedGoals={data.goals} onGoalsChange={(goals) => updateData({ goals })} />
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Upload Your Data</h3>
            </div>

            <FileUploader
              onFilesChange={(files) => updateData({ files })}
              maxFiles={5}
              acceptedTypes={[".csv", ".xlsx", ".json"]}
            />
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Additional Context</h3>
            </div>

            <div>
              <Label htmlFor="context">Additional Context (Optional)</Label>
              <Textarea
                id="context"
                value={data.context}
                onChange={(e) => updateData({ context: e.target.value })}
                placeholder="Any specific questions or context about your data that would help with the analysis..."
                rows={4}
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Analysis Summary:</h4>
              <ul className="text-sm space-y-1">
                <li>• Company: {data.companyName}</li>
                <li>• Industry: {data.industry}</li>
                <li>• Role: {data.role}</li>
                <li>• Goals: {data.goals.length} selected</li>
                <li>• Files: {data.files.length} uploaded</li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
            Previous
          </Button>

          {currentStep === totalSteps ? (
            <Button onClick={handleComplete} disabled={!canProceed()}>
              Start Analysis
            </Button>
          ) : (
            <Button onClick={nextStep} disabled={!canProceed()}>
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
