"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  BarChart3,
  Upload,
  FileText,
  TrendingUp,
  Calendar,
  Settings,
  LogOut,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getUserUsageStats, getUserSubscription } from "@/lib/supabase-utils"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/database.types"

type Analysis = Database["public"]["Tables"]["analyses"]["Row"]
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"]

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usageStats, setUsageStats] = useState({
    reports_created: 0,
    reports_exported: 0,
    files_uploaded: 0,
    storage_used_mb: 0,
  })
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && profile) {
      loadDashboardData()
    }
  }, [user, profile])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setDataLoading(true)

      // Load recent analyses
      const { data: analysesData, error: analysesError } = await supabase
        .from("analyses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      if (analysesError) {
        console.error("Error fetching analyses:", analysesError)
      } else {
        setRecentAnalyses(analysesData || [])
      }

      // Load subscription data
      const subscriptionData = await getUserSubscription(user.id)
      setSubscription(subscriptionData)

      // Load usage stats
      const usage = await getUserUsageStats(user.id)
      setUsageStats(usage)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setDataLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  const userName = profile.name || user.email?.split("@")[0] || "User"
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()

  const filteredAnalyses = recentAnalyses.filter((analysis) =>
    analysis.file_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">DaytaTech</h1>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-purple-600 font-medium">
                Dashboard
              </Link>
              <Link href="/dashboard/history" className="text-gray-500 hover:text-gray-700">
                History
              </Link>
              <Link href="/dashboard/settings" className="text-gray-500 hover:text-gray-700">
                Settings
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      {subscription && (
                        <Badge
                          className="w-fit mt-1"
                          variant={subscription.status === "active" ? "default" : "secondary"}
                        >
                          {subscription.plan_type} - {subscription.status}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back, {userName.split(" ")[0]}!</h2>
            <p className="mt-1 text-sm text-gray-600">Here's what's happening with your data analyses today.</p>
            {subscription?.trial_status === "active" && subscription.trial_end_date && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  🎉 You're on a free trial until {new Date(subscription.trial_end_date).toLocaleDateString()}.
                  <Link href="/dashboard/settings" className="ml-1 underline font-medium">
                    Upgrade now
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reports Created</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats.reports_created}</div>
                <p className="text-xs text-muted-foreground">
                  {subscription
                    ? `${subscription.monthly_reports_limit - usageStats.reports_created} remaining`
                    : "This month"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Files Uploaded</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats.files_uploaded}</div>
                <p className="text-xs text-muted-foreground">
                  {subscription
                    ? `${subscription.monthly_uploads_limit - usageStats.files_uploaded} remaining`
                    : "This month"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reports Exported</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats.reports_exported}</div>
                <p className="text-xs text-muted-foreground">
                  {subscription
                    ? `${subscription.monthly_exports_limit - usageStats.reports_exported} remaining`
                    : "This month"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats.storage_used_mb} MB</div>
                <p className="text-xs text-muted-foreground">
                  {subscription
                    ? `${subscription.storage_limit_gb * 1024 - usageStats.storage_used_mb} MB remaining`
                    : "Total used"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Button
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => router.push("/upload")}
              >
                <Upload className="h-6 w-6" />
                <span>Upload New File</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => router.push("/dashboard/projects")}
              >
                <Plus className="h-6 w-6" />
                <span>Create Project</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => router.push("/dashboard/insights")}
              >
                <TrendingUp className="h-6 w-6" />
                <span>View Insights</span>
              </Button>
            </div>
          </div>

          {/* Recent Analyses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Analyses</h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search analyses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={loadDashboardData}>
                  <Filter className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {dataLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : filteredAnalyses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses yet</h3>
                  <p className="text-gray-500 text-center mb-4">
                    Upload your first data file to get started with AI-powered insights
                  </p>
                  <Button onClick={() => router.push("/upload")}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {filteredAnalyses.map((analysis) => (
                    <li key={analysis.id}>
                      <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <FileText className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{analysis.file_name}</div>
                            <div className="text-sm text-gray-500">
                              Created on {new Date(analysis.created_at).toLocaleDateString()} • {analysis.file_type}
                              {analysis.file_size && ` • ${Math.round(analysis.file_size / 1024 / 1024)} MB`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={getStatusColor(analysis.status)}>{analysis.status}</Badge>
                          {analysis.status === "completed" && (
                            <Button variant="ghost" size="sm" onClick={() => router.push(`/analysis/${analysis.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
