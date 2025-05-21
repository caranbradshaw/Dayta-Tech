"use client"

import { useState, useEffect } from "react"
import { ChevronRight, Lightbulb, Loader2 } from "lucide-react"
import { generateRecommendations, type Recommendation } from "@/lib/ai-service"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface RecommendationsListProps {
  analysisId: string
  industry?: string
  membershipLevel?: "free" | "pro" | "team"
}

export function RecommendationsList({
  analysisId,
  industry = "technology",
  membershipLevel = "free",
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
        const recs = await generateRecommendations(analysisId, mockAnalysisData, industry, membershipLevel)

        setRecommendations(recs)
      } catch (err) {
        console.error("Error fetching recommendations:", err)
        setError("Failed to load recommendations. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [analysisId, industry, membershipLevel])

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

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-purple-50 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-purple-100 p-1">
            <Lightbulb className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-medium text-purple-800">AI-Generated Recommendations</h3>
            <p className="text-sm text-gray-600">
              These recommendations are based on patterns in your data, industry benchmarks, and historical performance.
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
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Category:</span>
                <span className="font-medium capitalize">{recommendation.category}</span>
              </div>
            </div>

            {/* Show additional details for Pro and Team plans */}
            {recommendation.details && (
              <Accordion type="single" collapsible className="mt-4">
                <AccordionItem value="details">
                  <AccordionTrigger className="text-sm text-purple-600">View Details</AccordionTrigger>
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
        <div className="mt-8 rounded-lg border border-purple-200 bg-purple-50 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-purple-100 p-1">
              <Lightbulb className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-purple-800">Unlock More Recommendations</h3>
              <p className="text-sm text-gray-600 mb-3">
                Upgrade to Pro or Team plan to access more detailed recommendations with specific action steps.
              </p>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                Upgrade Your Plan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
