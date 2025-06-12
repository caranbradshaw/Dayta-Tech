"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Copy, Check, Download } from "lucide-react"

export function EnvTemplateGenerator() {
  const [template, setTemplate] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)

  const generateTemplate = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/generate-env-template")
      const data = await response.json()

      if (data.success && data.template) {
        setTemplate(data.template)
      } else {
        setTemplate("# Error generating template")
      }
    } catch (error) {
      setTemplate("# Error generating template")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(template)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadTemplate = () => {
    const element = document.createElement("a")
    const file = new Blob([template], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = ".env.local.example"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Environment Variables Template</CardTitle>
        <CardDescription>
          Generate a template for your .env.local file with all required Supabase variables
        </CardDescription>
      </CardHeader>
      <CardContent>
        {template ? (
          <Textarea value={template} readOnly className="font-mono text-sm h-64" />
        ) : (
          <div className="bg-gray-100 rounded-md p-4 h-64 flex items-center justify-center">
            <p className="text-gray-500">Click the button below to generate a template for your .env.local file</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={generateTemplate} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            "Generate Template"
          )}
        </Button>

        {template && (
          <div className="space-x-2">
            <Button variant="outline" onClick={copyToClipboard} disabled={copied}>
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </>
              )}
            </Button>

            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
