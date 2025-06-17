"use client"

import { useState, useEffect } from "react"
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
import { Download, FileText, FileSpreadsheet, Presentation, Code, AlertCircle, Lock, Crown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-context"

interface AnalysisExportDialogProps {
  analysisId: string
  fileName: string
}

interface UserProfile {
  subscription_tier?: string
  region?: string
  subscription_status?: string
}

export function AnalysisExportDialog({ analysisId, fileName }: AnalysisExportDialogProps) {
  const [format, setFormat] = useState("pdf")
  const [isExporting, setIsExporting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
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

  // Check if user can export based on subscription tier and region
  const canExport = () => {
    if (!userProfile) return false

    const tier = userProfile.subscription_tier?.toLowerCase() || "basic"
    const region = userProfile.region?.toLowerCase() || "global"
    const status = userProfile.subscription_status?.toLowerCase() || "inactive"

    // Basic users cannot export in Nigeria and Global regions
    if (tier === "basic" && (region === "nigeria" || region === "global")) {
      return false
    }

    // Pro, Team, Enterprise users can always export (regardless of region)
    if (["pro", "team", "enterprise"].includes(tier)) {
      return true
    }

    // Basic users in America can export (different pricing model)
    if (tier === "basic" && region === "america") {
      return true
    }

    // Default to false for safety
    return false
  }

  const getUpgradeMessage = () => {
    const region = userProfile?.region?.toLowerCase() || "global"
    const tier = userProfile?.subscription_tier?.toLowerCase() || "basic"

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
      description: "Professional report format, perfect for sharing",
      icon: FileText,
      color: "text-red-600",
    },
    {
      value: "word",
      label: "Word Document",
      description: "Editable document format (.docx)",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      value: "excel",
      label: "Excel Spreadsheet",
      description: "Data tables with insights and metrics (.xlsx)",
      icon: FileSpreadsheet,
      color: "text-green-600",
    },
    {
      value: "powerpoint",
      label: "PowerPoint Presentation",
      description: "Executive presentation slides (.pptx)",
      icon: Presentation,
      color: "text-orange-600",
    },
    {
      value: "json",
      label: "JSON Data",
      description: "Raw structured data for developers",
      icon: Code,
      color: "text-purple-600",
    },
  ]

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

      const response = await fetch(`/api/analysis/${analysisId}/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ format }),
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
        description: `Analysis exported as ${format.toUpperCase()} - ${downloadFileName}`,
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
    // Redirect to pricing page or upgrade flow
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {canExport() ? (
              <>
                <Download className="h-5 w-5" />
                Export Analysis
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
              ? `Choose a format to export your analysis results for "${fileName}"`
              : upgradeInfo.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!canExport() ? (
            // Upgrade Required UI
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-3">
                  <Crown className="h-6 w-6 text-yellow-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Premium Export Features</h3>
                    <ul className="text-sm text-gray-700 space-y-1 mb-4">
                      <li>• Export to PDF, Word, Excel, PowerPoint</li>
                      <li>• Professional formatting and layouts</li>
                      <li>• Complete analysis data included</li>
                      <li>• Unlimited exports</li>
                      <li>• Priority support</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Show locked export formats */}
              <div className="space-y-3 opacity-60">
                {exportFormats.map((fmt) => {
                  const Icon = fmt.icon
                  return (
                    <div
                      key={fmt.value}
                      className="flex items-center space-x-3 p-4 border rounded-lg bg-gray-50 cursor-not-allowed"
                    >
                      <div className="w-4 h-4 border border-gray-300 rounded-full bg-white"></div>
                      <Icon className={`h-6 w-6 ${fmt.color} opacity-50`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label className="font-medium text-base text-gray-500">{fmt.label}</Label>
                          <Lock className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{fmt.description}</p>
                      </div>
                    </div>
                  )
                })}
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
                        <Label htmlFor={fmt.value} className="font-medium cursor-pointer text-base">
                          {fmt.label}
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">{fmt.description}</p>
                      </div>
                    </div>
                  )
                })}
              </RadioGroup>

              {/* Preview info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Export includes:</p>
                    <ul className="text-blue-800 mt-1 space-y-1">
                      <li>• Executive summary and key findings</li>
                      <li>• Detailed insights with confidence scores</li>
                      <li>• Actionable recommendations</li>
                      <li>• Data quality metrics and analysis</li>
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
                  <span className="text-green-700">• Unlimited Exports</span>
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
