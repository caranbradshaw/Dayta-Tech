import { SimpleAnalyticsDashboard } from "@/components/analytics/simple-analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Track user engagement and business metrics for DaytaTech</p>
      </div>

      <SimpleAnalyticsDashboard />
    </div>
  )
}
