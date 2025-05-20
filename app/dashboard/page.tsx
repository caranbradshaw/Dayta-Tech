"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BarChart3, FileUp, History, Settings, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploader } from "@/components/file-uploader"
import { RecentAnalyses } from "@/components/recent-analyses"

interface UserData {
  name: string
  email: string
  industry: string
  company: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const userDataStr = localStorage.getItem("daytaTechUser")

    if (userDataStr) {
      try {
        const parsedUserData = JSON.parse(userDataStr)
        setUserData(parsedUserData)
      } catch (error) {
        console.error("Failed to parse user data:", error)
      }
    } else {
      // Redirect to login if no user data found
      router.push("/login")
    }

    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("daytaTechUser")
    router.push("/")
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (!userData) {
    return null // Will redirect to login
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold">DaytaTech</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-purple-600 hover:underline underline-offset-4">
              Dashboard
            </Link>
            <Link href="/dashboard/history" className="text-sm font-medium hover:underline underline-offset-4">
              History
            </Link>
            <Link href="/dashboard/settings" className="text-sm font-medium hover:underline underline-offset-4">
              Settings
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium mr-2">Welcome, {userData.name.split(" ")[0]}</div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-gray-500">Upload your data files and get AI-powered insights instantly.</p>
          </div>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Upload Data File</CardTitle>
                    <CardDescription>
                      Upload your data file to get started. We support CSV, Excel, Power BI exports, and more.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileUploader />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="recent" className="mt-6">
              <RecentAnalyses />
            </TabsContent>
            <TabsContent value="insights" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>No Insights Yet</CardTitle>
                    <CardDescription>Upload a file to get started with AI-powered insights.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center py-6">
                    <Button asChild>
                      <Link href="/dashboard?tab=upload">
                        <Upload className="mr-2 h-4 w-4" /> Upload File
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
                <FileUp className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-gray-500">Upload your first file to get started</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Industry</CardTitle>
                <Settings className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{userData.industry || "Not Set"}</div>
                <p className="text-xs text-gray-500">
                  <Link href="/dashboard/settings" className="text-purple-600 hover:underline">
                    {userData.industry ? "Update" : "Set"} your industry
                  </Link>{" "}
                  for better insights
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                <History className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">No Activity</div>
                <p className="text-xs text-gray-500">Your recent activity will appear here</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
