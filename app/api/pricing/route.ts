import { type NextRequest, NextResponse } from "next/server"
import { getPricingComparison } from "@/lib/currency-formatter"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const region = (searchParams.get("region") as "nigeria" | "america" | "global") || "global"
    const plan = searchParams.get("plan") as "basic" | "pro" | "team" | "enterprise"
    const billing = (searchParams.get("billing") as "monthly" | "annual") || "monthly"

    if (plan) {
      // Get specific plan pricing
      const pricing = getPricingComparison(region)
      const planData = pricing.plans.find((p) => p.name.toLowerCase() === plan)

      if (!planData) {
        return NextResponse.json({ error: "Plan not found" }, { status: 404 })
      }

      return NextResponse.json({
        plan: planData.name,
        region,
        currency: pricing.currency,
        symbol: pricing.symbol,
        price: billing === "monthly" ? planData.monthly : planData.annual,
        rawPrice: billing === "monthly" ? planData.monthlyRaw : planData.annualRaw,
        billing,
        popular: planData.popular || false,
      })
    }

    // Get all pricing for region
    const allPricing = getPricingComparison(region)

    return NextResponse.json({
      region,
      currency: allPricing.currency,
      symbol: allPricing.symbol,
      plans: allPricing.plans,
      exchangeRate: region === "nigeria" ? 1500 : 1,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Pricing API error:", error)
    return NextResponse.json({ error: "Failed to fetch pricing" }, { status: 500 })
  }
}
