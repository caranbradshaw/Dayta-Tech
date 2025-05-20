import Link from "next/link"
import { FileText } from "lucide-react"

import { Button } from "@/components/ui/button"

export function RecentAnalyses() {
  // This would normally fetch from an API
  const analyses = []

  return (
    <div className="rounded-lg border shadow-sm">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="text-lg font-semibold">Recent Analyses</div>
      </div>
      <div className="p-6">
        {analyses.length > 0 ? (
          <div className="divide-y">
            {analyses.map((analysis) => (
              <div key={analysis.id} className="py-4">
                Analysis item
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold">No Recent Analyses</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md">
              You haven't analyzed any data files recently. Upload a file to get started with AI-powered insights.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/dashboard?tab=upload">Upload Your First File</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
