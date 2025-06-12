"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "lucide-react"

// Safe import for Chart.js
let Chart: any

interface AnalyticsData {
  events: {
    total: number
    byType: Record<string, number>
    byDay: Array<{ date: string; count: number }>
  }
  users: {
    total: number
    newUsers: Array<{ date: string; count: number }>
    activeUsers: Array<{ date: string; count: number }>
  }
  pages: {
    topPages: Array<{ page: string; views: number }>
  }
}

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartInitialized, setChartInitialized] = useState(false)

  // Load Chart.js dynamically on client side
  useEffect(() => {
    const loadChartJs = async () => {
      try {
        // Dynamic import of Chart.js
        const chartModule = await import("chart.js/auto")
        Chart = chartModule.default
        setChartInitialized(true)
      } catch (err) {
        console.error("Failed to load Chart.js:", err)
        setError("Failed to load charting library")
      }
    }

    loadChartJs()
  }, [])

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // In a real app, this would fetch from an API
        // For now, we'll use mock data
        const mockData: AnalyticsData = {
          events: {
            total: 1250,
            byType: {
              page_view: 850,
              file_upload: 120,
              analysis_complete: 95,
              signup: 45,
              login: 140,
            },
            byDay: Array.from({ length: 14 }, (_, i) => ({
              date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split("T")[0],
              count: Math.floor(Math.random() * 100) + 50,
            })),
          },
          users: {
            total: 320,
            newUsers: Array.from({ length: 14 }, (_, i) => ({
              date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split("T")[0],
              count: Math.floor(Math.random() * 10) + 1,
            })),
            activeUsers: Array.from({ length: 14 }, (_, i) => ({
              date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split("T")[0],
              count: Math.floor(Math.random() * 50) + 20,
            })),
          },
          pages: {
            topPages: [
              { page: "/dashboard", views: 320 },
              { page: "/upload", views: 210 },
              { page: "/analysis", views: 180 },
              { page: "/", views: 150 },
              { page: "/login", views: 120 },
            ],
          },
        }

        setAnalyticsData(mockData)
        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch analytics data:", err)
        setError("Failed to fetch analytics data")
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  // Render charts when data and Chart.js are available
  useEffect(() => {
    if (!chartInitialized || !analyticsData) return

    // Event types chart
    const eventTypesCtx = document.getElementById("eventTypesChart") as HTMLCanvasElement
    if (eventTypesCtx) {
      const eventTypes = Object.keys(analyticsData.events.byType)
      const eventCounts = Object.values(analyticsData.events.byType)

      new Chart(eventTypesCtx, {
        type: "pie",
        data: {
          labels: eventTypes,
          datasets: [
            {
              data: eventCounts,
              backgroundColor: ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom",
            },
          },
        },
      })
    }

    // Events by day chart
    const eventsByDayCtx = document.getElementById("eventsByDayChart") as HTMLCanvasElement
    if (eventsByDayCtx) {
      new Chart(eventsByDayCtx, {
        type: "line",
        data: {
          labels: analyticsData.events.byDay.map((d) => d.date),
          datasets: [
            {
              label: "Events",
              data: analyticsData.events.byDay.map((d) => d.count),
              borderColor: "#4f46e5",
              backgroundColor: "rgba(79, 70, 229, 0.1)",
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      })
    }

    // Users chart
    const usersChartCtx = document.getElementById("usersChart") as HTMLCanvasElement
    if (usersChartCtx) {
      new Chart(usersChartCtx, {
        type: "line",
        data: {
          labels: analyticsData.users.newUsers.map((d) => d.date),
          datasets: [
            {
              label: "New Users",
              data: analyticsData.users.newUsers.map((d) => d.count),
              borderColor: "#10b981",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              fill: true,
              tension: 0.4,
            },
            {
              label: "Active Users",
              data: analyticsData.users.activeUsers.map((d) => d.count),
              borderColor: "#0ea5e9",
              backgroundColor: "rgba(14, 165, 233, 0.1)",
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      })
    }

    // Top pages chart
    const topPagesCtx = document.getElementById("topPagesChart") as HTMLCanvasElement
    if (topPagesCtx) {
      new Chart(topPagesCtx, {
        type: "bar",
        data: {
          labels: analyticsData.pages.topPages.map((p) => p.page),
          datasets: [
            {
              label: "Page Views",
              data: analyticsData.pages.topPages.map((p) => p.views),
              backgroundColor: "#4f46e5",
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      })
    }
  }, [chartInitialized, analyticsData])

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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
        <p className="font-medium">Error loading analytics</p>
        <p>{error}</p>
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
        <p className="font-medium">No analytics data available</p>
        <p>There is no analytics data to display at this time.</p>
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
            <div className="text-3xl font-bold">{analyticsData.events.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analyticsData.users.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analyticsData.users.activeUsers[analyticsData.users.activeUsers.length - 1].count}
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.users.activeUsers[analyticsData.users.activeUsers.length - 1].date}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
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
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Events Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <canvas id="eventsByDayChart"></canvas>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Event Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <canvas id="eventTypesChart"></canvas>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <canvas id="usersChart"></canvas>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <canvas id="topPagesChart"></canvas>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
