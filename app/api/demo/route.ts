import { NextResponse } from "next/server"

// Mock data for demo
const DEMO_DATA = {
  summary: {
    title: "Q2 Sales Performance Analysis",
    overview: "Analysis of 1,247 sales records across 12 product categories",
    highlights: [
      "Revenue increased by 23% compared to Q1",
      "Enterprise segment grew by 31%",
      "Customer retention improved to 94%",
      "Average deal size increased by 17%",
    ],
    recommendations: [
      "Focus on enterprise segment expansion",
      "Implement cross-selling strategy for mid-market",
      "Optimize sales cycle for SMB segment",
      "Increase investment in customer success team",
    ],
  },
  insights: [
    {
      id: "insight-1",
      title: "Revenue Growth Opportunities",
      description: "Enterprise customers show 3.4x higher lifetime value than SMB",
      metrics: {
        impact: "High",
        confidence: "92%",
        effort: "Medium",
      },
      details:
        "Analysis shows enterprise customers have significantly higher retention rates and expansion revenue. Increasing enterprise segment by 15% could result in $2.7M additional annual recurring revenue.",
    },
    {
      id: "insight-2",
      title: "Sales Efficiency Optimization",
      description: "Sales cycle can be reduced by 27% through process optimization",
      metrics: {
        impact: "Medium",
        confidence: "87%",
        effort: "Low",
      },
      details:
        "Current sales cycle averages 42 days. Implementing automated qualification and streamlined demo scheduling could reduce this to 31 days, increasing quarterly deal velocity by 35%.",
    },
    {
      id: "insight-3",
      title: "Customer Segmentation Opportunity",
      description: "Creating a premium tier could increase ARPU by 22%",
      metrics: {
        impact: "High",
        confidence: "89%",
        effort: "Medium",
      },
      details:
        "25% of customers consistently utilize advanced features and would benefit from a premium tier. Survey data suggests willingness to pay 30-40% more for enhanced capabilities and priority support.",
    },
  ],
  charts: {
    revenue: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Enterprise",
          data: [120000, 132000, 141000, 160000, 178000, 195000],
        },
        {
          label: "Mid-Market",
          data: [85000, 87000, 92000, 98000, 103000, 110000],
        },
        {
          label: "SMB",
          data: [45000, 47000, 49000, 52000, 54000, 58000],
        },
      ],
    },
    customers: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "New Customers",
          data: [42, 38, 47, 53, 60, 65],
        },
        {
          label: "Churned Customers",
          data: [8, 7, 6, 5, 4, 3],
        },
      ],
    },
    regions: {
      labels: ["North America", "Europe", "Asia Pacific", "Latin America"],
      datasets: [
        {
          label: "Revenue Distribution",
          data: [45, 30, 20, 5],
        },
        {
          label: "Growth Rate",
          data: [18, 22, 35, 12],
        },
      ],
    },
  },
}

export async function GET() {
  // Simulate a slight delay to make it feel like real data loading
  await new Promise((resolve) => setTimeout(resolve, 800))

  return NextResponse.json({
    success: true,
    data: DEMO_DATA,
  })
}
