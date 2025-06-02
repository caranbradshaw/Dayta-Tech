"use client"

import { useState, useEffect } from "react"
import { BarChart3, Upload, Download, TrendingUp, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UsageStatsCardProps {
  userData: any
  onUpgrade: () => void
  detailed?: boolean
}

export function UsageStatsCard({ userData, onUpgrade, detailed = false }: UsageStatsCardProps) {
  const [monthlyStats, setMonthlyStats] = useState({
    reportsCreated: 0,
    reportsExported: 0,
    filesUploaded: 0,
    dataProcessed: 0, // in MB
  })

  useEffect(() => {
    // Get usage stats from localStorage or initialize
    const statsKey = `usage_stats_${new Date().getFullYear()}_${new Date().getMonth()}`
    const savedStats = localStorage.getItem(statsKey)

    if (savedStats) {
      setMonthlyStats(JSON.parse(savedStats))
    } else {
      // Initialize with some sample data for demo
      const initialStats = {
        reportsCreated: Math.floor(Math.random() * 8) + 1, // 1-8 reports
        reportsExported: Math.floor(Math.random() * 4) + 1, // 1-4 exports
        filesUploaded: Math.floor(Math.random() * 6) + 1, // 1-6 uploads
        dataProcessed: Math.floor(Math.random() * 500) + 100, // 100-600 MB
      }
      setMonthlyStats(initialStats)
      localStorage.setItem(statsKey, JSON.stringify(initialStats))
    }
  }, [])

  const accountType = userData.accountType || "basic"
  const isBasicPlan = accountType === "basic"

  // Limits for basic plan
  const limits = {
    reportsCreated: isBasicPlan ? 10 : Number.POSITIVE_INFINITY,
    reportsExported: isBasicPlan ? 5 : Number.POSITIVE_INFINITY,
    filesUploaded: isBasicPlan ? 10 : Number.POSITIVE_INFINITY,
    dataProcessed: isBasicPlan ? 1000 : Number.POSITIVE_INFINITY, // 1GB for basic
  }

  const shouldRecommendUpgrade = monthlyStats.reportsCreated >= 8 && isBasicPlan

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === Number.POSITIVE_INFINITY) return 0
    return Math.min((used / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 75) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Usage Statistics
        </CardTitle>
        <CardDescription>
          Track your monthly usage and limits for{" "}
          {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {shouldRecommendUpgrade && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Upgrade Recommended:</strong> You've created {monthlyStats.reportsCreated} reports this month.
              Upgrade to Pro for unlimited reports and advanced features.
              <Button variant="link" className="p-0 h-auto ml-2 text-orange-600 underline" onClick={onUpgrade}>
                Upgrade Now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Reports Created</div>
              <div
                className={`text-sm font-bold ${getUsageColor(getUsagePercentage(monthlyStats.reportsCreated, limits.reportsCreated))}`}
              >
                {monthlyStats.reportsCreated}
                {isBasicPlan ? ` / ${limits.reportsCreated}` : " (Unlimited)"}
              </div>
            </div>
            {isBasicPlan && (
              <Progress
                value={getUsagePercentage(monthlyStats.reportsCreated, limits.reportsCreated)}
                className="h-2"
              />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Reports Exported</div>
              <div
                className={`text-sm font-bold ${getUsageColor(getUsagePercentage(monthlyStats.reportsExported, limits.reportsExported))}`}
              >
                {monthlyStats.reportsExported}
                {isBasicPlan ? ` / ${limits.reportsExported}` : " (Unlimited)"}
              </div>
            </div>
            {isBasicPlan && (
              <Progress
                value={getUsagePercentage(monthlyStats.reportsExported, limits.reportsExported)}
                className="h-2"
              />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Files Uploaded</div>
              <div
                className={`text-sm font-bold ${getUsageColor(getUsagePercentage(monthlyStats.filesUploaded, limits.filesUploaded))}`}
              >
                {monthlyStats.filesUploaded}
                {isBasicPlan ? ` / ${limits.filesUploaded}` : " (Unlimited)"}
              </div>
            </div>
            {isBasicPlan && (
              <Progress value={getUsagePercentage(monthlyStats.filesUploaded, limits.filesUploaded)} className="h-2" />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Data Processed</div>
              <div
                className={`text-sm font-bold ${getUsageColor(getUsagePercentage(monthlyStats.dataProcessed, limits.dataProcessed))}`}
              >
                {monthlyStats.dataProcessed}MB{isBasicPlan ? ` / ${limits.dataProcessed}MB` : " (Unlimited)"}
              </div>
            </div>
            {isBasicPlan && (
              <Progress value={getUsagePercentage(monthlyStats.dataProcessed, limits.dataProcessed)} className="h-2" />
            )}
          </div>
        </div>

        {detailed && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">Usage Trends</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Reports: +{Math.floor(monthlyStats.reportsCreated / 4)} this week</span>
              </div>
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-blue-500" />
                <span>Uploads: +{Math.floor(monthlyStats.filesUploaded / 4)} this week</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-purple-500" />
                <span>Exports: +{Math.floor(monthlyStats.reportsExported / 4)} this week</span>
              </div>
            </div>
          </div>
        )}

        {isBasicPlan && (
          <div className="pt-4 border-t">
            <Button onClick={onUpgrade} className="w-full">
              Upgrade to Pro for Unlimited Usage
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
