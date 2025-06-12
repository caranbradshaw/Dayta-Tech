"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2 } from "lucide-react"
import { getPricingComparison } from "@/lib/currency-formatter"

interface PricingDisplayProps {
  region: "nigeria" | "america" | "global"
  onSelectPlan?: (plan: string) => void
  showTrialButton?: boolean
  highlightPlan?: string
}

export function PricingDisplay({
  region = "global",
  onSelectPlan,
  showTrialButton = true,
  highlightPlan = "pro",
}: PricingDisplayProps) {
  const [pricing, setPricing] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const pricingData = getPricingComparison(region)
        setPricing(pricingData)
      } catch (error) {
        console.error("Failed to load pricing:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPricing()
  }, [region])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!pricing) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load pricing information</p>
      </div>
    )
  }

  const getRegionFlag = (region: string) => {
    switch (region) {
      case "nigeria":
        return "🇳🇬"
      case "america":
        return "🇺🇸"
      default:
        return "🌍"
    }
  }

  const getRegionName = (region: string) => {
    switch (region) {
      case "nigeria":
        return "Nigeria"
      case "america":
        return "United States"
      default:
        return "Global"
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <Badge className="mb-4">
          {getRegionFlag(region)} Pricing for {getRegionName(region)}
        </Badge>
        <h2 className="text-3xl font-bold">Choose Your Plan</h2>
        <p className="text-gray-600 mt-2">All prices in {pricing.currency}. Start with a 30-day free PRO trial.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {pricing.plans.map((plan: any, index: number) => (
          <Card
            key={plan.name}
            className={`relative ${
              plan.name.toLowerCase() === highlightPlan
                ? "border-2 border-blue-600 shadow-lg"
                : "border-2 border-gray-200"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white">Most Popular</Badge>
              </div>
            )}

            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold">{plan.monthly}</div>
              <CardDescription>
                {plan.name === "Basic" && "Perfect for small businesses"}
                {plan.name === "Pro" && "For growing businesses"}
                {plan.name === "Team" && "For teams & departments"}
                {plan.name === "Enterprise" && "For large organizations"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.name === "Basic" && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">5 data analyses per month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">AI business insights</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Excel, CSV support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Email support</span>
                    </li>
                  </>
                )}

                {plan.name === "Pro" && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">20 data analyses per month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Advanced AI insights</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">All file formats</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Priority support</span>
                    </li>
                  </>
                )}

                {plan.name === "Team" && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Everything in Pro</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Up to 5 team members</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Team collaboration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Advanced analytics</span>
                    </li>
                  </>
                )}

                {plan.name === "Enterprise" && (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Everything in Team</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Unlimited users</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Custom AI training</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">Dedicated support</span>
                    </li>
                  </>
                )}
              </ul>

              <Button
                className={`w-full ${
                  plan.name.toLowerCase() === highlightPlan
                    ? "bg-blue-600 hover:bg-blue-700"
                    : plan.name === "Enterprise"
                      ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      : ""
                }`}
                onClick={() => onSelectPlan?.(plan.name.toLowerCase())}
              >
                {showTrialButton && plan.name !== "Enterprise"
                  ? "Start 30-Day Free Trial"
                  : plan.name === "Enterprise"
                    ? "Contact Sales"
                    : `Choose ${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8 text-sm text-gray-500">
        <p>All plans include a 30-day free trial. No credit card required.</p>
        <p>Prices shown in {pricing.currency}. Cancel anytime.</p>
      </div>
    </div>
  )
}
