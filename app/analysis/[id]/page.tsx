import Link from "next/link"
import { ArrowLeft, BarChart3, Download, FileText, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalysisSummary } from "@/components/analysis-summary"
import { DataTable } from "@/components/data-table"
import { InsightCards } from "@/components/insight-cards"
import { RecommendationsList } from "@/components/recommendations-list"

export default function AnalysisPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold">DaytaTech</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium hover:underline underline-offset-4">
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
            <Button variant="ghost" size="sm">
              Help
            </Button>
            <Button variant="ghost" size="sm">
              Account
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Analysis Results</h1>
                <p className="text-gray-500">Sample Data Analysis - {params.id}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
              <CardDescription>AI-generated summary of the key insights from your data.</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalysisSummary />
            </CardContent>
          </Card>

          <Tabs defaultValue="insights" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="insights" className="mt-6">
              <InsightCards />
            </TabsContent>
            <TabsContent value="data" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Overview</CardTitle>
                  <CardDescription>Preview of the data used for this analysis.</CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="recommendations" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>AI-generated recommendations based on your data.</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecommendationsList />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analysis History</CardTitle>
                  <CardDescription>Previous versions of this analysis.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 text-lg font-semibold">No Previous Versions</h3>
                    <p className="mt-2 text-sm text-gray-500 max-w-md">
                      This is the first analysis of this data file. Future analyses of the same file will appear here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
