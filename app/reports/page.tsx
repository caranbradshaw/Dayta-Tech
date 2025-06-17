"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Share2, Star, Calendar, Search, Filter } from "lucide-react"
import Link from "next/link"

interface Report {
  id: string
  title: string
  description: string
  report_type: string
  status: string
  summary: string
  file_name: string
  analysis_role: string
  industry: string
  company_name: string
  tags: string[]
  is_favorite: boolean
  is_shared: boolean
  generated_at: string
  last_accessed_at: string
  created_at: string
  analyses: { file_name: string; status: string } | null
  projects: { name: string } | null
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("created_at")

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      // In a real app, get userId from auth context
      const userId = "demo-user-id" // Replace with actual user ID

      const response = await fetch(`/api/reports/list?userId=${userId}&limit=50`)
      const data = await response.json()

      if (data.reports) {
        setReports(data.reports)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.file_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterType === "all" || report.report_type === filterType

    return matchesSearch && matchesFilter
  })

  const sortedReports = [...filteredReports].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title)
      case "created_at":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "last_accessed":
        return new Date(b.last_accessed_at).getTime() - new Date(a.last_accessed_at).getTime()
      default:
        return 0
    }
  })

  const toggleFavorite = async (reportId: string, currentFavorite: boolean) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_favorite: !currentFavorite }),
      })

      if (response.ok) {
        setReports(
          reports.map((report) => (report.id === reportId ? { ...report, is_favorite: !currentFavorite } : report)),
        )
      }
    } catch (error) {
      console.error("Error updating favorite:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading your reports...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Reports</h1>
        <p className="text-gray-600">Manage and access your generated analysis reports</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="analysis_report">Analysis Reports</SelectItem>
            <SelectItem value="executive_summary">Executive Summaries</SelectItem>
            <SelectItem value="technical_report">Technical Reports</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Date Created</SelectItem>
            <SelectItem value="last_accessed">Last Accessed</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports Grid */}
      {sortedReports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reports found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Upload and analyze data to generate your first report"}
            </p>
            <Link href="/upload">
              <Button>Create Your First Report</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedReports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-2">{report.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{report.description || report.summary}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(report.id, report.is_favorite)}
                    className="ml-2"
                  >
                    <Star
                      className={`h-4 w-4 ${report.is_favorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                    />
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{report.analysis_role?.replace("_", " ") || "Analysis"}</Badge>
                    {report.industry && <Badge variant="outline">{report.industry}</Badge>}
                    {report.is_shared && (
                      <Badge variant="outline">
                        <Share2 className="h-3 w-3 mr-1" />
                        Shared
                      </Badge>
                    )}
                  </div>

                  {/* File Info */}
                  {report.file_name && (
                    <div className="text-sm text-gray-600">
                      <FileText className="h-4 w-4 inline mr-1" />
                      {report.file_name}
                    </div>
                  )}

                  {/* Date Info */}
                  <div className="text-sm text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created {new Date(report.created_at).toLocaleDateString()}
                  </div>

                  {/* Tags */}
                  {report.tags && report.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {report.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {report.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{report.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/reports/${report.id}`} className="flex-1">
                      <Button variant="default" size="sm" className="w-full">
                        View Report
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
