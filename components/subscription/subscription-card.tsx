"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getUserSubscription, getUserUsageStats } from "@/lib/supabase-utils"
import type { Subscription } from "@/types/database"
import { CreditCard, Calendar, TrendingUp, Upload, Download } from "lucide-react"

interface SubscriptionCardProps {
  userId: string
}

export function SubscriptionCard({ userId }: SubscriptionCardProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState({
    reports_created: 0,
    reports_exported: 0,
    files_uploaded: 0,
    storage_used_mb: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [subData, usageData] = await Promise.all([getUserSubscription(userId), getUserUsageStats(userId)])
        setSubscription(subData)
        setUsage(usageData)
      } catch (error) {
        console.error("Error loading subscription data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [userId])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            No Active Subscription
          </CardTitle>
          <CardDescription>Subscribe to unlock advanced features and higher limits</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Choose a Plan</Button>
        </CardContent>
      </Card>
    )
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "basic":
        return "bg-blue-100 text-blue-800"
      case "pro":
        return "bg-purple-100 text-purple-800"
      case "enterprise":
        return "bg-gold-100 text-gold-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "trialing":
        return "bg-blue-100 text-blue-800"
      case "past_due":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const reportsProgress = (usage.reports_created / subscription.monthly_reports_limit) * 100
  const exportsProgress = (usage.reports_exported / subscription.monthly_exports_limit) * 100
  const uploadsProgress = (usage.files_uploaded / subscription.monthly_uploads_limit) * 100
  const storageProgress = (usage.storage_used_mb / (subscription.storage_limit_gb * 1024)) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <div className="flex gap-2">
            <Badge className={getPlanColor(subscription.plan_type)}>{subscription.plan_type.toUpperCase()}</Badge>
            <Badge className={getStatusColor(subscription.status)}>{subscription.status.toUpperCase()}</Badge>
          </div>
        </div>
        <CardDescription className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Usage Statistics */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Monthly Usage
          </h4>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Reports Created</span>
                <span>
                  {usage.reports_created} / {subscription.monthly_reports_limit}
                </span>
              </div>
              <Progress value={reportsProgress} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Reports Exported</span>
                <span>
                  {usage.reports_exported} / {subscription.monthly_exports_limit}
                </span>
              </div>
              <Progress value={exportsProgress} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-1">
                  <Upload className="h-3 w-3" />
                  Files Uploaded
                </span>
                <span>
                  {usage.files_uploaded} / {subscription.monthly_uploads_limit}
                </span>
              </div>
              <Progress value={uploadsProgress} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  Storage Used
                </span>
                <span>
                  {usage.storage_used_mb} MB / {subscription.storage_limit_gb} GB
                </span>
              </div>
              <Progress value={storageProgress} className="h-2" />
            </div>
          </div>
        </div>

        {/* Upgrade Recommendation */}
        {(reportsProgress > 80 || exportsProgress > 80 || uploadsProgress > 80) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h5 className="font-medium text-yellow-800 mb-2">Approaching Limits</h5>
            <p className="text-sm text-yellow-700 mb-3">
              You're approaching your monthly limits. Consider upgrading for unlimited access.
            </p>
            <Button size="sm" variant="outline">
              Upgrade Plan
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            Manage Billing
          </Button>
          <Button variant="outline" className="flex-1">
            Usage History
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
