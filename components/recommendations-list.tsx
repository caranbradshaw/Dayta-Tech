import { ChevronRight, Lightbulb } from "lucide-react"

export function RecommendationsList() {
  const recommendations = [
    {
      id: 1,
      title: "Increase content marketing in Southwest region",
      description:
        "Based on the strong correlation between content marketing and customer retention, allocate 25% more budget to content in the Southwest region to improve growth rates.",
      impact: "High",
      effort: "Medium",
      category: "Marketing",
    },
    {
      id: 2,
      title: "Replicate Northeast customer acquisition strategy",
      description:
        "The Northeast region has 15% lower customer acquisition costs. Document and implement their approach across other regions.",
      impact: "High",
      effort: "Medium",
      category: "Sales",
    },
    {
      id: 3,
      title: "Reduce paid advertising in Southwest",
      description:
        "Paid advertising shows negative ROI in the Southwest region. Reduce spend by 30% and reallocate to content marketing.",
      impact: "Medium",
      effort: "Low",
      category: "Marketing",
    },
    {
      id: 4,
      title: "Improve customer support response time",
      description:
        "Data shows a moderate correlation between support response time and satisfaction. Aim to reduce response time by 20%.",
      impact: "Medium",
      effort: "Medium",
      category: "Customer Success",
    },
    {
      id: 5,
      title: "Develop targeted email campaigns for the West region",
      description:
        "Email marketing shows strong conversion rates in the West region. Increase email campaign frequency by 2x.",
      impact: "Medium",
      effort: "Low",
      category: "Marketing",
    },
  ]

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
                <span className="font-medium">{recommendation.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
