"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { useAuth } from "@/components/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Search,
  Filter,
  Calendar,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Analysis {
  id: string
  file_name: string
  file_type: string
  status: "processing" | "completed" | "failed"
  summary?: string
  created_at: string
  updated_at: string
  processing_completed_at?: string
  metadata?: any
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [filteredAnalyses, setFilteredAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchAnalyses()
    }
  }, [user])

  useEffect(() => {
    filterAnalyses()
  }, [analyses, searchTerm, statusFilter])

  const fetchAnalyses = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/ai/list?userId=${user?.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch analyses")
      }

      const data = await response.json()
      setAnalyses(data.analyses || [])
    } catch (error) {
      console.error("Error fetching analyses:", error)
      toast({
        title: "Error",
        description: "Failed to load analysis history. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterAnalyses = () => {
    let filtered = analyses

    if (searchTerm) {
      filtered = filtered.filter((analysis) => analysis.file_name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((analysis) => analysis.status === statusFilter)
    }

    // Sort by most recent first
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setFilteredAnalyses(filtered)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

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

  const handleViewAnalysis = (analysisId: string) => {
    router.push(`/analysis/${analysisId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading your analysis history...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis History</h1>
            <p className="text-lg text-gray-600">View and manage all your data analyses</p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by file name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analysis List */}
          {filteredAnalyses.length > 0 ? (
            <div className="space-y-4">
              {filteredAnalyses.map((analysis) => (
                <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{analysis.file_name}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1">
                              {getStatusIcon(analysis.status)}
                              <Badge variant="secondary" className={getStatusColor(analysis.status)}>
                                {analysis.status.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="h-4 w-4" />
                              {new Date(analysis.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {analysis.status === "completed" && (
                          <Button variant="outline" size="sm" onClick={() => handleViewAnalysis(analysis.id)}>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Results
                          </Button>
                        )}
                        {analysis.status === "processing" && (
                          <Button variant="outline" size="sm" disabled>
                            <Clock className="h-4 w-4 mr-2" />
                            Processing...
                          </Button>
                        )}
                        {analysis.status === "failed" && (
                          <Button variant="outline" size="sm" disabled>
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Failed
                          </Button>
                        )}
                      </div>
                    </div>
                    {analysis.summary && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 line-clamp-2">{analysis.summary}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analysis History</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm || statusFilter !== "all"
                    ? "No analyses match your current filters. Try adjusting your search criteria."
                    : "You haven't analyzed any data files yet. Upload a file to get started with AI-powered insights."}
                </p>
                <Button onClick={() => router.push("/upload")}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Upload Your First File
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Summary Stats */}
          {analyses.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Summary Statistics</CardTitle>
                <CardDescription>Overview of your analysis activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{analyses.length}</div>
                    <div className="text-sm text-gray-600">Total Analyses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analyses.filter((a) => a.status === "completed").length}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {analyses.filter((a) => a.status === "processing").length}
                    </div>
                    <div className="text-sm text-gray-600">Processing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {analyses.filter((a) => a.status === "failed").length}
                    </div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
