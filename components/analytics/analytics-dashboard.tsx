"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, TrendingDown, Users, Activity, DollarSign, FileText, Clock, Target } from "lucide-react"
import { AnalyticsDashboard, type AnalyticsDashboardData } from "@/lib/analytics-dashboard"

export default function AnalyticsDashboardComponent() {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("30d")

  useEffect(() => {
    loadDashboardData()
  }, [dateRange])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const days = Number.parseInt(dateRange.replace("d", ""))
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const dashboardData = await AnalyticsDashboard.getDashboardData({
        start: startDate.toISOString(),
        end: new Date().toISOString(),
      })

      setData(dashboardData)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <div className="w-32 h-10 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-gray-200 animate-pulse rounded" />
                  <div className="w-16 h-8 bg-gray-200 animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return <div>Failed to load analytics data</div>
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{data.overview.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{data.overview.activeUsers.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+8% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${data.overview.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+15% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{data.overview.conversionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-sm text-red-600">-2% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="growth" className="space-y-6">
        <TabsList>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="files">File Analytics</TabsTrigger>
        </TabsList>

        {/* Growth Tab */}
        <TabsContent value="growth" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Daily new users and total users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.growth.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="users" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="newUsers" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
                <CardDescription>Daily revenue and subscription growth</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.growth.revenueGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="subscriptions" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Retention</CardTitle>
              <CardDescription>Cohort retention rates over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.growth.retentionRate.map((cohort, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{cohort.cohort}</span>
                      <Badge variant="outline">{cohort.day30}% retained</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Day 1</span>
                          <span>{cohort.day1}%</span>
                        </div>
                        <Progress value={cohort.day1} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Day 7</span>
                          <span>{cohort.day7}%</span>
                        </div>
                        <Progress value={cohort.day7} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Day 30</span>
                          <span>{cohort.day30}%</span>
                        </div>
                        <Progress value={cohort.day30} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most visited pages by users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.behavior.topPages.slice(0, 8).map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium truncate">{page.page}</p>
                        <p className="text-sm text-muted-foreground">{page.uniqueUsers} unique users</p>
                      </div>
                      <Badge variant="secondary">{page.views} views</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
                <CardDescription>Most used features by users</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.behavior.topFeatures.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="feature" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usage" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Journey</CardTitle>
              <CardDescription>User flow through key conversion steps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.behavior.userJourney.map((step, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{step.step}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">{step.users} users</span>
                          {step.dropoffRate > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              -{step.dropoffRate}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Progress value={100 - step.dropoffRate} className="h-2 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Monthly Recurring Revenue</p>
                  <p className="text-2xl font-bold">${data.business.subscriptionMetrics.mrr.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Churn Rate</p>
                  <p className="text-2xl font-bold">{data.business.subscriptionMetrics.churn}%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Customer LTV</p>
                  <p className="text-2xl font-bold">${data.business.subscriptionMetrics.ltv}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">Customer CAC</p>
                  <p className="text-2xl font-bold">${data.business.subscriptionMetrics.cac}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* File Analytics Tab */}
        <TabsContent value="files" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Files</p>
                    <p className="text-2xl font-bold">{data.business.fileAnalytics.totalFiles.toLocaleString()}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Analyses</p>
                    <p className="text-2xl font-bold">{data.business.fileAnalytics.totalAnalyses.toLocaleString()}</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Processing Time</p>
                    <p className="text-2xl font-bold">{data.business.fileAnalytics.avgProcessingTime}s</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">94.2%</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>File Types Distribution</CardTitle>
                <CardDescription>Most popular file formats uploaded</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.business.fileAnalytics.topFileTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.business.fileAnalytics.topFileTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>File Upload Trends</CardTitle>
                <CardDescription>File uploads over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.business.fileAnalytics.topFileTypes.map((fileType, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{fileType.type.toUpperCase()}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{fileType.count}</p>
                        <p className="text-sm text-muted-foreground">files</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
