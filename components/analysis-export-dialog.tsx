"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import {
  Download,
  FileText,
  FileSpreadsheet,
  Presentation,
  Code,
  AlertCircle,
  Lock,
  Crown,
  BarChart3,
  Upload,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-context"

interface AnalysisExportDialogProps {
  analysisId: string
  fileName: string
  analysisData?: any
}

interface UserProfile {
  subscription_tier?: string
  region?: string
  subscription_status?: string
}

export function AnalysisExportDialog({ analysisId, fileName, analysisData }: AnalysisExportDialogProps) {
  const [format, setFormat] = useState("pdf")
  const [isExporting, setIsExporting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [includeChart, setIncludeChart] = useState(false)
  const [chartImageBase64, setChartImageBase64] = useState<string>("")
  const [chartPreview, setChartPreview] = useState<string>("")
  const [isGeneratingChart, setIsGeneratingChart] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data.profile)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      setLoading(false)
    }
  }

  // Generate chart from analysis data
  const generateChartFromData = async () => {
    if (!analysisData) {
      toast({
        title: "No Data Available",
        description: "Analysis data is required to generate charts.",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingChart(true)
    try {
      // Create a canvas element to generate chart
      const canvas = document.createElement("canvas")
      canvas.width = 800
      canvas.height = 400
      const ctx = canvas.getContext("2d")

      if (!ctx) throw new Error("Could not get canvas context")

      // Simple bar chart generation (you can enhance this with Chart.js or similar)
      ctx.fillStyle = "#f8f9fa"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw title
      ctx.fillStyle = "#1f2937"
      ctx.font = "bold 24px Arial"
      ctx.textAlign = "center"
      ctx.fillText("Analysis Overview", canvas.width / 2, 40)

      // Draw sample bars (replace with actual data)
      const insights = analysisData?.insights?.detailed_insights || []
      const maxBars = Math.min(insights.length, 5)
      const barWidth = 120
      const barSpacing = 140
      const startX = (canvas.width - maxBars * barSpacing) / 2

      for (let i = 0; i < maxBars; i++) {
        const insight = insights[i]
        const confidence = insight?.confidence || Math.random()
        const barHeight = confidence * 250

        // Draw bar
        ctx.fillStyle = `hsl(${210 + i * 30}, 70%, 50%)`
        ctx.fillRect(startX + i * barSpacing, canvas.height - barHeight - 80, barWidth, barHeight)

        // Draw label
        ctx.fillStyle = "#374151"
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        const label = insight?.title?.substring(0, 15) || `Insight ${i + 1}`
        ctx.fillText(label, startX + i * barSpacing + barWidth / 2, canvas.height - 60)

        // Draw value
        ctx.fillStyle = "#1f2937"
        ctx.font = "bold 14px Arial"
        ctx.fillText(
          `${Math.round(confidence * 100)}%`,
          startX + i * barSpacing + barWidth / 2,
          canvas.height - barHeight - 90,
        )
      }

      // Convert to base64
      const base64Image = canvas.toDataURL("image/png")
      setChartImageBase64(base64Image)
      setChartPreview(base64Image)
      setIncludeChart(true)

      toast({
        title: "Chart Generated",
        description: "Chart has been generated from your analysis data.",
      })
    } catch (error) {
      console.error("Error generating chart:", error)
      toast({
        title: "Chart Generation Failed",
        description: "Could not generate chart from analysis data.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingChart(false)
    }
  }

  // Handle file upload for custom chart
  const handleChartUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      setChartImageBase64(base64)
      setChartPreview(base64)
      setIncludeChart(true)
      toast({
        title: "Chart Uploaded",
        description: "Chart image has been uploaded successfully.",
      })
    }
    reader.readAsDataURL(file)
  }

  // Remove chart
  const removeChart = () => {
    setChartImageBase64("")
    setChartPreview("")
    setIncludeChart(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Check if user can export
  const canExport = () => {
    if (!userProfile) return false
    const tier = userProfile.subscription_tier?.toLowerCase() || "basic"
    const region = userProfile.region?.toLowerCase() || "global"

    if (tier === "basic" && (region === "nigeria" || region === "global")) {
      return false
    }

    if (["pro", "team", "enterprise"].includes(tier)) {
      return true
    }

    if (tier === "basic" && region === "america") {
      return true
    }

    return false
  }

  const getUpgradeMessage = () => {
    const region = userProfile?.region?.toLowerCase() || "global"

    if (region === "nigeria") {
      return {
        title: "Export Available with Pro Plan",
        description: "Upgrade to Pro (₦59,000/month) to export your analysis in multiple formats.",
        cta: "Upgrade to Pro",
      }
    } else if (region === "global") {
      return {
        title: "Export Available with Pro Plan",
        description: "Upgrade to Pro ($99/month) to export your analysis in multiple formats.",
        cta: "Upgrade to Pro",
      }
    } else {
      return {
        title: "Export Available with Pro Plan",
        description: "Upgrade to Pro to export your analysis in multiple formats.",
        cta: "Upgrade to Pro",
      }
    }
  }

  const exportFormats = [
    {
      value: "pdf",
      label: "PDF Document",
      description: "Professional report with DaytaTech branding, watermarks, and page numbers",
      icon: FileText,
      color: "text-red-600",
      supportsChart: true,
    },
    {
      value: "word",
      label: "Word Document",
      description: "Editable document format (.docx)",
      icon: FileText,
      color: "text-blue-600",
      supportsChart: false,
    },
    {
      value: "excel",
      label: "Excel Spreadsheet",
      description: "Data tables with insights and metrics (.xlsx)",
      icon: FileSpreadsheet,
      color: "text-green-600",
      supportsChart: false,
    },
    {
      value: "powerpoint",
      label: "PowerPoint Presentation",
      description: "Executive presentation slides (.pptx)",
      icon: Presentation,
      color: "text-orange-600",
      supportsChart: true,
    },
    {
      value: "json",
      label: "JSON Data",
      description: "Raw structured data for developers",
      icon: Code,
      color: "text-purple-600",
      supportsChart: false,
    },
  ]

  const selectedFormat = exportFormats.find((f) => f.value === format)

  const handleExport = async () => {
    if (!canExport()) {
      toast({
        title: "Export Restricted",
        description: "Please upgrade your plan to export analysis reports.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)

    try {
      console.log(`🔄 Starting export: Analysis ${analysisId} as ${format}`)

      // Prepare request body with enhanced data
      const requestBody = {
        format,
        file_name: fileName,
        content: analysisData?.summary || "Analysis content",
        user_id: user?.id,
        ...(includeChart &&
          chartImageBase64 &&
          selectedFormat?.supportsChart && {
            chartImageBase64: chartImageBase64,
          }),
        // Additional metadata for enhanced PDF
        metadata: {
          company: analysisData?.insights?.user_context?.company || "Your Company",
          industry: analysisData?.insights?.user_context?.industry || "Industry",
          analysisType: analysisData?.analysis_role || "business",
          generatedAt: new Date().toISOString(),
          includesChart: includeChart && chartImageBase64 && selectedFormat?.supportsChart,
        },
      }

      const response = await fetch(`/api/analysis/${analysisId}/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log(`📡 Export response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `Export failed with status ${response.status}`)
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get("content-disposition")
      const downloadFileName = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : `${fileName.replace(/[^a-zA-Z0-9]/g, "_")}_analysis_${Date.now()}.${format === "powerpoint" ? "pptx" : format === "word" ? "docx" : format === "excel" ? "xlsx" : format}`

      console.log(`📥 Downloading file: ${downloadFileName}`)

      // Create blob and download
      const blob = await response.blob()
      console.log(`📦 Blob size: ${blob.size} bytes`)

      if (blob.size === 0) {
        throw new Error("Generated file is empty")
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = downloadFileName
      a.style.display = "none"
      document.body.appendChild(a)
      a.click()

      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)

      toast({
        title: "✅ Export successful",
        description: `Analysis exported as ${format.toUpperCase()} with DaytaTech branding${includeChart && selectedFormat?.supportsChart ? " and chart" : ""}`,
      })

      setIsOpen(false)
    } catch (error) {
      console.error("❌ Export error:", error)
      toast({
        title: "❌ Export failed",
        description:
          error instanceof Error ? error.message : "There was an error exporting your analysis. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleUpgrade = () => {
    window.location.href = "/pricing"
  }

  if (loading) {
    return (
      <Button disabled>
        <Download className="h-4 w-4 mr-2" />
        Export Analysis
      </Button>
    )
  }

  const upgradeInfo = getUpgradeMessage()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={!canExport() ? "relative" : ""}>
          <Download className="h-4 w-4 mr-2" />
          Export Analysis
          {!canExport() && <Lock className="h-3 w-3 ml-1" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {canExport() ? (
              <>
                <Download className="h-5 w-5" />
                Export Analysis with DaytaTech Branding
              </>
            ) : (
              <>
                <Crown className="h-5 w-5 text-yellow-600" />
                {upgradeInfo.title}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {canExport()
              ? `Export your analysis with professional DaytaTech branding, watermarks, and page numbers`
              : upgradeInfo.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!canExport() ? (
            // Upgrade Required UI
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-3">
                  <Crown className="h-6 w-6 text-yellow-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Premium Export Features</h3>
                    <ul className="text-sm text-gray-700 space-y-1 mb-4">
                      <li>• Professional DaytaTech branding and watermarks</li>
                      <li>• Page numbers and formatted layouts</li>
                      <li>• Chart integration support</li>
                      <li>• Export to PDF, Word, Excel, PowerPoint</li>
                      <li>• Unlimited exports</li>
                      <li>• Priority support</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpgrade} className="bg-gradient-to-r from-yellow-600 to-orange-600">
                  <Crown className="h-4 w-4 mr-2" />
                  {upgradeInfo.cta}
                </Button>
              </div>
            </div>
          ) : (
            // Normal Export UI for Pro+ users
            <>
              {/* Format Selection */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Select Export Format</h4>
                <RadioGroup value={format} onValueChange={setFormat}>
                  {exportFormats.map((fmt) => {
                    const Icon = fmt.icon
                    return (
                      <div
                        key={fmt.value}
                        className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <RadioGroupItem value={fmt.value} id={fmt.value} />
                        <Icon className={`h-6 w-6 ${fmt.color}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={fmt.value} className="font-medium cursor-pointer text-base">
                              {fmt.label}
                            </Label>
                            {fmt.supportsChart && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Chart Support</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{fmt.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </RadioGroup>
              </div>

              {/* Chart Options */}
              {selectedFormat?.supportsChart && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Chart Options
                  </h4>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-chart"
                      checked={includeChart}
                      onCheckedChange={(checked) => {
                        setIncludeChart(checked as boolean)
                        if (!checked) {
                          removeChart()
                        }
                      }}
                    />
                    <Label htmlFor="include-chart" className="text-sm font-medium">
                      Include chart in export
                    </Label>
                  </div>

                  {includeChart && (
                    <div className="space-y-4 ml-6">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={generateChartFromData}
                          disabled={isGeneratingChart || !analysisData}
                        >
                          {isGeneratingChart ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Generate from Data
                            </>
                          )}
                        </Button>

                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Chart
                        </Button>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleChartUpload}
                        className="hidden"
                      />

                      {chartPreview && (
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-sm">Chart Preview</h5>
                              <Button type="button" variant="ghost" size="sm" onClick={removeChart}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="border rounded-lg p-2 bg-gray-50">
                              <img
                                src={chartPreview || "/placeholder.svg"}
                                alt="Chart preview"
                                className="max-w-full h-auto max-h-48 mx-auto"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Export Features Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Professional Export includes:</p>
                    <ul className="text-blue-800 mt-1 space-y-1">
                      <li>• DaytaTech branding and watermarks</li>
                      <li>• Professional page numbering</li>
                      <li>• Executive summary and key findings</li>
                      <li>• Detailed insights with confidence scores</li>
                      <li>• Actionable recommendations</li>
                      <li>• Data quality metrics and analysis</li>
                      {includeChart && selectedFormat?.supportsChart && <li>• Integrated chart visualization</li>}
                      {format === "powerpoint" && <li>• Professional presentation slides</li>}
                      {format === "excel" && <li>• Multiple sheets with structured data</li>}
                    </ul>
                  </div>
                </div>
              </div>

              {/* User tier info */}
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Crown className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">
                    {userProfile?.subscription_tier?.toUpperCase() || "PRO"} Plan
                  </span>
                  <span className="text-green-700">• Unlimited Professional Exports</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isExporting}>
                  Cancel
                </Button>
                <Button onClick={handleExport} disabled={isExporting}>
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export {format.toUpperCase()}
                      {includeChart && selectedFormat?.supportsChart && " + Chart"}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
