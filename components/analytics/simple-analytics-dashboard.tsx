"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "lucide-react"

export function SimpleAnalyticsDashboard() {
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<any>(null)

  // Simulate loading analytics data
  useEffect(() => {
    const timer = setTimeout(() => {
      // Mock data
      setAnalyticsData({
        events: 1250,
        users: 320,
        activeUsers: 45,
        topPages: [
          { page: "/dashboard", views: 320 },
          { page: "/upload", views: 210 },
          { page: "/analysis", views: 180 },
          { page: "/", views: 150 },
          { page: "/login", views: 120 },
        ],
      })
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.events.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.users.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.activeUsers}</div>
            <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Simplified Charts (no actual charts, just placeholders) */}
      <Tabs defaultValue="events">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Pages
          </TabsTrigger>
        </TabsList>
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Events Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gray-100 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <BarChart className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-500">Event data visualization</p>
                  <p className="text-sm text-gray-400">(Chart visualization requires Chart.js)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gray-100 rounded-md flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-500">User growth visualization</p>
                  <p className="text-sm text-gray-400">(Chart visualization requires Chart.js)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topPages.map((page: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-mono text-sm">{page.page}</span>
                    <span className="font-medium">{page.views.toLocaleString()} views</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
