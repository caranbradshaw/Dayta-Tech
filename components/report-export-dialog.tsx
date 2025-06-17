"use client"

import { useState } from "react"
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
import { Download, FileText, FileSpreadsheet, Code, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ReportExportDialogProps {
  reportId: string
  reportTitle: string
}

export function ReportExportDialog({ reportId, reportTitle }: ReportExportDialogProps) {
  const [format, setFormat] = useState("pdf")
  const [isExporting, setIsExporting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const exportFormats = [
    {
      value: "pdf",
      label: "PDF Document",
      description: "Professional report format, great for sharing",
      icon: FileText,
    },
    {
      value: "excel",
      label: "Excel Spreadsheet",
      description: "Data tables with insights and recommendations",
      icon: FileSpreadsheet,
    },
    {
      value: "word",
      label: "Word Document",
      description: "Editable document format",
      icon: FileText,
    },
    {
      value: "json",
      label: "JSON Data",
      description: "Raw data for developers and integrations",
      icon: Code,
    },
  ]

  const handleExport = async () => {
    setIsExporting(true)

    try {
      console.log(`Starting export of report ${reportId} as ${format}`)

      const response = await fetch(`/api/reports/${reportId}/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ format }),
      })

      console.log(`Export response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `Export failed with status ${response.status}`)
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get("content-disposition")
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : `${reportTitle.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.${format}`

      console.log(`Downloading file: ${filename}`)

      // Create blob and download
      const blob = await response.blob()
      console.log(`Blob size: ${blob.size} bytes`)

      if (blob.size === 0) {
        throw new Error("Generated file is empty")
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.style.display = "none"
      document.body.appendChild(a)
      a.click()

      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }, 100)

      toast({
        title: "Export successful",
        description: `Report exported as ${format.toUpperCase()} - ${filename}`,
      })

      setIsOpen(false)
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description:
          error instanceof Error ? error.message : "There was an error exporting your report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>Choose a format to download "{reportTitle}"</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup value={format} onValueChange={setFormat}>
            {exportFormats.map((fmt) => {
              const Icon = fmt.icon
              return (
                <div key={fmt.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={fmt.value} id={fmt.value} />
                  <Icon className="h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <Label htmlFor={fmt.value} className="font-medium cursor-pointer">
                      {fmt.label}
                    </Label>
                    <p className="text-sm text-gray-500">{fmt.description}</p>
                  </div>
                </div>
              )
            })}
          </RadioGroup>

          {/* Debug info in development */}
          {process.env.NODE_ENV === "development" && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <div className="flex items-center gap-1 mb-1">
                <AlertCircle className="h-3 w-3" />
                Debug Info
              </div>
              <div>Report ID: {reportId}</div>
              <div>Selected Format: {format}</div>
            </div>
          )}

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
        </div>
      </DialogContent>
    </Dialog>
  )
}
