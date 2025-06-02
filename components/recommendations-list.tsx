"use client"

import { useState, useEffect } from "react"
import { ChevronRight, Lightbulb, Loader2 } from "lucide-react"
import { generateRecommendations, type Recommendation } from "@/lib/ai-service"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  TrendingUp,
  Users,
  Package,
  LayoutDashboard,
  HelpCircle,
  Database,
  Settings,
  Zap,
  Shield,
  BarChart3,
  Sparkles,
} from "lucide-react"

interface RecommendationsListProps {
  analysisId: string
  industry?: string
  membershipLevel?: "free" | "pro" | "team" | "enterprise"
  userRole?: "data_scientist" | "data_engineer" | "business_analyst" | "other"
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "pipeline":
      return <Database className="h-4 w-4" />
    case "architecture":
      return <Settings className="h-4 w-4" />
    case "transformation":
      return <Zap className="h-4 w-4" />
    case "governance":
      return <Shield className="h-4 w-4" />
    case "performance":
      return <BarChart3 className="h-4 w-4" />
    case "cleaning":
      return <Sparkles className="h-4 w-4" />
    case "analytics":
      return <TrendingUp className="h-4 w-4" />
    case "management":
      return <Users className="h-4 w-4" />
    case "tools":
      return <Package className="h-4 w-4" />
    case "dashboards":
      return <LayoutDashboard className="h-4 w-4" />
    case "support":
      return <HelpCircle className="h-4 w-4" />
    default:
      return <TrendingUp className="h-4 w-4" />
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "pipeline":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "architecture":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "transformation":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "governance":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "performance":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "cleaning":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "analytics":
      return "bg-green-100 text-green-800 border-green-200"
    case "management":
      return "bg-purple-100 text-purple-800 border-purple-200"
    case "tools":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "dashboards":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "support":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function RecommendationsList({
  analysisId,
  industry = "technology",
  membershipLevel = "free",
  userRole = "other",
}: RecommendationsListProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true)
        setError(null)

        // For demo purposes, we'll use mock data instead of fetching real analysis data
        const mockAnalysisData = {
          metrics: {
            revenue: { q1: 150000, q2: 186000, growth: 0.24 },
            cac: { q1: 153, q2: 135, change: -0.12 },
            retention: { q1: 0.72, q2: 0.78, change: 0.08 },
            regions: {
              northeast: { growth: 0.32, cac: 120, retention: 0.78 },
              southeast: { growth: 0.24, cac: 145, retention: 0.72 },
              midwest: { growth: 0.18, cac: 135, retention: 0.75 },
              southwest: { growth: 0.12, cac: 160, retention: 0.68 },
              west: { growth: 0.28, cac: 130, retention: 0.76 },
            },
          },
          trends: {
            revenue: "increasing",
            cac: "decreasing",
            retention: "increasing",
            contentMarketing: "strong_positive",
            paidAdvertising: "weak_negative",
          },
          anomalies: [
            {
              region: "southwest",
              metric: "marketing_roi",
              expected: 2.5,
              actual: 1.2,
              deviation: -0.52,
            },
          ],
          correlations: [
            {
              factor1: "content_marketing",
              factor2: "retention",
              correlation: 0.92,
              strength: "strong_positive",
            },
            {
              factor1: "support_response_time",
              factor2: "satisfaction",
              correlation: 0.68,
              strength: "moderate_positive",
            },
            {
              factor1: "paid_ads_southwest",
              factor2: "roi",
              correlation: -0.54,
              strength: "moderate_negative",
            },
          ],
        }

        // Generate recommendations using our AI service
        const recs = await generateRecommendations(analysisId, mockAnalysisData, industry, membershipLevel, userRole)

        setRecommendations(recs)
      } catch (err) {
        console.error("Error fetching recommendations:", err)
        setError("Failed to load recommendations. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [analysisId, industry, membershipLevel, userRole])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-500">Generating AI recommendations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-red-100 p-3 mb-4">
          <ChevronRight className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Error Loading Recommendations</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-gray-100 p-3 mb-4">
          <ChevronRight className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Recommendations Available</h3>
        <p className="text-gray-500">We couldn't generate recommendations for this dataset.</p>
      </div>
    )
  }

  // Determine if we should show Data Engineer specific UI
  const isDataEngineer = userRole === "data_engineer"
  const themeColor = isDataEngineer ? "blue" : "purple"

  return (
    <div className="space-y-6">
      <div className={`rounded-lg bg-${themeColor}-50 p-4`}>
        <div className="flex items-start gap-3">
          <div className={`rounded-full bg-${themeColor}-100 p-1`}>
            <Lightbulb className={`h-5 w-5 text-${themeColor}-600`} />
          </div>
          <div>
            <h3 className={`font-medium text-${themeColor}-800`}>
              {isDataEngineer ? "AI-Generated Engineering Recommendations" : "AI-Generated Recommendations"}
            </h3>
            <p className="text-sm text-gray-600">
              {isDataEngineer
                ? "These recommendations are based on your data architecture, pipeline performance, and engineering best practices."
                : "These recommendations are based on patterns in your data, industry benchmarks, and historical performance."}
              They're ranked by potential impact and implementation effort.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((recommendation) => (
          <div key={recommendation.id} className="rounded-lg border p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${getCategoryColor(
                      recommendation.category,
                    )}`}
                  >
                    {getCategoryIcon(recommendation.category)}
                    <span className="capitalize">{recommendation.category}</span>
                  </span>
                </div>
                <h3 className="font-medium">{recommendation.title}</h3>
                <p className="text-sm text-gray-500">{recommendation.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Impact:</span>
                <span
                  className={`font-medium ${
                    recommendation.impact === "High"
                      ? "text-green-600"
                      : recommendation.impact === "Medium"
                        ? "text-amber-600"
                        : "text-blue-600"
                  }`}
                >
                  {recommendation.impact}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Effort:</span>
                <span
                  className={`font-medium ${
                    recommendation.effort === "Low"
                      ? "text-green-600"
                      : recommendation.effort === "Medium"
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  {recommendation.effort}
                </span>
              </div>
            </div>

            {/* Show additional details for Pro and Team plans */}
            {recommendation.details && (
              <Accordion type="single" collapsible className="mt-4">
                <AccordionItem value="details">
                  <AccordionTrigger className={`text-sm text-${themeColor}-600`}>View Details</AccordionTrigger>
                  <AccordionContent>
                    <div className="text-sm text-gray-700 mt-2 space-y-4">
                      <p>{recommendation.details}</p>

                      {recommendation.actionSteps && recommendation.actionSteps.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Action Steps:</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {recommendation.actionSteps.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>
        ))}
      </div>

      {/* Upgrade prompt for free tier */}
      {membershipLevel === "free" && (
        <div className={`mt-8 rounded-lg border border-${themeColor}-200 bg-${themeColor}-50 p-4`}>
          <div className="flex items-start gap-3">
            <div className={`rounded-full bg-${themeColor}-100 p-1`}>
              <Lightbulb className={`h-5 w-5 text-${themeColor}-600`} />
            </div>
            <div>
              <h3 className={`font-medium text-${themeColor}-800`}>Unlock More Recommendations</h3>
              <p className="text-sm text-gray-600 mb-3">
                {isDataEngineer
                  ? "Upgrade to Pro or Team plan to access more detailed engineering recommendations with specific implementation steps."
                  : "Upgrade to Pro or Team plan to access more detailed recommendations with specific action steps."}
              </p>
              <Button size="sm" className={`bg-${themeColor}-600 hover:bg-${themeColor}-700`}>
                Upgrade Your Plan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Also export the columns for use in other components
export const columns = [
  {
    id: "category",
    header: () => <div className="text-left">Category</div>,
    cell: ({ row }: { row: any }) => {
      const category: string = row.original.category
      return (
        <div className="flex items-center gap-2">
          {getCategoryIcon(category)}
          <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${getCategoryColor(category)}`}>
            {category}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "title",
    header: () => <div className="text-left">Title</div>,
  },
  {
    accessorKey: "views",
    header: () => <div className="text-left">Views</div>,
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-left">Date</div>,
  },
]
