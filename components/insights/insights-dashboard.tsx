"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getProjectInsights, getAnalysisInsights } from "@/lib/supabase-utils"
import type { Insight } from "@/types/database"
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, BarChart3, Clock, Zap } from "lucide-react"

interface InsightsDashboardProps {
  projectId?: string
  analysisId?: string
}

export function InsightsDashboard({ projectId, analysisId }: InsightsDashboardProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>("all")

  useEffect(() => {
    loadInsights()
  }, [projectId, analysisId])

  async function loadInsights() {
    try {
      let insightsData: Insight[] = []

      if (analysisId) {
        insightsData = await getAnalysisInsights(analysisId)
      } else if (projectId) {
        insightsData = await getProjectInsights(projectId)
      }

      setInsights(insightsData)
    } catch (error) {
      console.error("Error loading insights:", error)
    } finally {
      setLoading(false)
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "summary":
        return Brain
      case "trend":
        return TrendingUp
      case "anomaly":
        return AlertTriangle
      case "recommendation":
        return Lightbulb
      case "prediction":
        return Target
      case "correlation":
        return BarChart3
      default:
        return Brain
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "summary":
        return "bg-blue-100 text-blue-800"
      case "trend":
        return "bg-green-100 text-green-800"
      case "anomaly":
        return "bg-red-100 text-red-800"
      case "recommendation":
        return "bg-yellow-100 text-yellow-800"
      case "prediction":
        return "bg-purple-100 text-purple-800"
      case "correlation":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConfidenceColor = (score?: number) => {
    if (!score) return "bg-gray-100 text-gray-800"
    if (score >= 0.8) return "bg-green-100 text-green-800"
    if (score >= 0.6) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const filteredInsights =
    selectedType === "all" ? insights : insights.filter((insight) => insight.type === selectedType)

  const insightTypes = [...new Set(insights.map((insight) => insight.type))]

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Brain className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No insights yet</h3>
          <p className="text-gray-500 text-center">
            {analysisId
              ? "AI insights will appear here once your analysis is complete"
              : "Upload and analyze data to generate AI insights"}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6" />
          AI Insights
        </h2>
        <Badge variant="secondary">
          {insights.length} insight{insights.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList>
          <TabsTrigger value="all">All ({insights.length})</TabsTrigger>
          {insightTypes.map((type) => (
            <TabsTrigger key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)} ({insights.filter((i) => i.type === type).length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedType} className="space-y-4">
          {filteredInsights.map((insight) => {
            const Icon = getInsightIcon(insight.type)

            return (
              <Card key={insight.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getInsightColor(insight.type)}>{insight.type}</Badge>
                      {insight.confidence_score && (
                        <Badge className={getConfidenceColor(insight.confidence_score)}>
                          {Math.round(insight.confidence_score * 100)}% confidence
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(insight.created_at).toLocaleDateString()}
                    </span>
                    {insight.ai_model && (
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {insight.ai_model}
                      </span>
                    )}
                    {insight.processing_time_ms && (
                      <span className="text-gray-500">{insight.processing_time_ms}ms</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{insight.content}</p>
                  </div>

                  {insight.metadata && Object.keys(insight.metadata).length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-sm mb-2">Additional Details</h5>
                      <div className="space-y-1 text-sm">
                        {Object.entries(insight.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
      </Tabs>
    </div>
  )
}
