"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, TrendingUp, Activity } from "lucide-react"
import { analytics } from "@/lib/simple-analytics"

export function SimpleAnalyticsDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await analytics.getBasicStats()
        setStats(data)
      } catch (error) {
        console.error("Failed to load analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Unable to load analytics data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+{stats.userGrowth.last7Days} this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnalyses}</div>
            <p className="text-xs text-muted-foreground">+{stats.analysisGrowth.last7Days} this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.analysisGrowth.dailyAverage}</div>
            <p className="text-xs text-muted-foreground">analyses per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((stats.userGrowth.last30Days / stats.totalUsers) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">monthly growth</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentActivities.slice(0, 5).map((activity: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">{activity.activity_type?.replace("_", " ") || "Activity"}</Badge>
                  <span className="text-sm text-muted-foreground">
                    User {activity.user_id?.slice(0, 8) || "Unknown"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(activity.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {stats.recentActivities.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No recent activity data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
