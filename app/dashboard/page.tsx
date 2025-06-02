"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BarChart3, FileUp, Settings, Upload, Download, Sparkles, Cog } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploader } from "@/components/file-uploader"
import { RecentAnalyses } from "@/components/recent-analyses"
import { Badge } from "@/components/ui/badge"

interface UserData {
  name: string
  email: string
  industry: string
  company: string
  role?: string
  accountType?: string
  uploadCredits?: number
  exportCredits?: number
  features?: {
    basicInsights: boolean
    csvSupport: boolean
    excelSupport: boolean
    advancedInsights: boolean
    allFileFormats: boolean
    industrySpecificAnalysis: boolean
    historicalLearning: boolean
    teamCollaboration: boolean
    prioritySupport: boolean
    executiveSummaries: boolean
    pipelineInsights: boolean
    architectureRecommendations: boolean
    dataTransformationInsights: boolean
    governanceAndSecurity: boolean
    performanceOptimization: boolean
    dataCleaningRecommendations: boolean
  }
  createdAt?: string
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

  // Get account type display information
  const accountType = userData.accountType || "basic"
  const userRole = userData.role
  const isDataScientist = userRole === "data-scientist"
  const isDataEngineer = userRole === "data-engineer"

  const accountBadgeColor =
    accountType === "basic"
      ? "bg-green-100 text-green-800"
      : accountType === "pro"
        ? "bg-purple-100 text-purple-800"
        : accountType === "team"
          ? "bg-blue-100 text-blue-800"
          : "bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800"

  const accountLabel =
    accountType === "basic"
      ? isDataScientist
        ? "Basic Plan + Data Science Features"
        : isDataEngineer
          ? "Basic Plan + Data Engineering Features"
          : "Basic Plan"
      : accountType === "pro"
        ? "Pro Plan"
        : accountType === "team"
          ? "Team Plan"
          : "Enterprise Plan"

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
            <div className="text-sm font-medium mr-2">
              Welcome, {userData.name.split(" ")[0]}
              {isDataScientist && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  Data Scientist
                </span>
              )}
              {isDataEngineer && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Data Engineer
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-gray-500">Upload your data files and get AI-powered insights instantly.</p>
            </div>
            <Badge className={accountBadgeColor}>{accountLabel}</Badge>
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
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Upload Data File</CardTitle>
                        <CardDescription>
                          Upload your data file to get started.
                          {isDataScientist
                            ? " As a Data Scientist, you have access to all file formats and advanced analytics."
                            : isDataEngineer
                              ? " As a Data Engineer, you have access to all file formats and engineering insights."
                              : " We support CSV, Excel, and more depending on your plan."}
                        </CardDescription>
                      </div>
                      <div className="text-right space-y-2">
                        {userData.uploadCredits !== undefined && (
                          <div>
                            <span className="text-sm text-gray-500">Uploads remaining this month</span>
                            <div className="text-2xl font-bold">
                              {accountType === "basic" ? `${userData.uploadCredits} / 10` : "Unlimited"}
                            </div>
                          </div>
                        )}
                        {userData.exportCredits !== undefined && (
                          <div>
                            <span className="text-sm text-gray-500">Exports remaining this month</span>
                            <div className="text-2xl font-bold">
                              {accountType === "basic" ? `${userData.exportCredits} / 5` : "Unlimited"}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <FileUploader
                      accountType={accountType}
                      uploadCredits={userData.uploadCredits || 0}
                      exportCredits={userData.exportCredits || 0}
                      userRole={userData.role}
                    />
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

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                <CardTitle className="text-sm font-medium">Uploads This Month</CardTitle>
                <Upload className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {accountType === "basic" ? `${10 - (userData.uploadCredits || 10)} / 10` : "Unlimited"}
                </div>
                <p className="text-xs text-gray-500">
                  {accountType === "basic" ? `${userData.uploadCredits || 10} uploads remaining` : "No limits"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Exports This Month</CardTitle>
                <Download className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {accountType === "basic" ? `${5 - (userData.exportCredits || 5)} / 5` : "Unlimited"}
                </div>
                <p className="text-xs text-gray-500">
                  {accountType === "basic" ? `${userData.exportCredits || 5} exports remaining` : "No limits"}
                </p>
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
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Features</CardTitle>
              <Settings className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold capitalize mb-2">
                {accountType === "basic" ? "Basic Plan - $39/month" : "Premium Plan"}
                {isDataScientist && accountType === "basic" && (
                  <span className="ml-2 text-sm font-normal text-purple-600">+ Data Science Features</span>
                )}
                {isDataEngineer && accountType === "basic" && (
                  <span className="ml-2 text-sm font-normal text-blue-600">+ Data Engineering Features</span>
                )}
              </div>

              {isDataScientist && accountType === "basic" && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-100 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-purple-800">Data Scientist Special Features</span>
                  </div>
                  <ul className="text-sm space-y-1 text-purple-700">
                    <li className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-purple-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>AI industry-specific insights</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-purple-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Advanced data analysis</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-purple-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Universal file format support</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-purple-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Executive summaries</span>
                    </li>
                  </ul>
                </div>
              )}

              {isDataEngineer && accountType === "basic" && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Cog className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Data Engineer Special Features</span>
                  </div>
                  <ul className="text-sm space-y-1 text-blue-700">
                    <li className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-blue-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>AI pipeline development insights</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-blue-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Data architecture recommendations</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-blue-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Data transformation & processing insights</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-blue-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Data governance & security insights</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-blue-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Performance tuning & optimizations</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-blue-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>AI-supported data cleaning recommendations</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-blue-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Universal file format support</span>
                    </li>
                  </ul>
                </div>
              )}

              <ul className="text-sm space-y-1">
                {accountType === "basic" ? (
                  <>
                    <li className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>10 file uploads per month</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>5 data exports per month</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Basic insights</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>CSV and Excel support</span>
                      {(isDataScientist || isDataEngineer) && (
                        <span className="text-xs text-blue-600 ml-1">(+ all formats)</span>
                      )}
                    </li>
                    <li className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Email support</span>
                    </li>
                  </>
                ) : (
                  <li className="text-sm text-gray-500">Premium features available</li>
                )}
              </ul>
              {accountType === "basic" && !isDataScientist && !isDataEngineer && (
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  Upgrade to Pro - $99/month
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
