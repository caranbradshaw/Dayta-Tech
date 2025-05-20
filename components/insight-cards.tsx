import { BarChart, LineChart, PieChart, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RegionalPerformanceChart } from "@/components/regional-performance-chart"
import { RevenueGrowthChart } from "@/components/revenue-growth-chart"
import { CustomerMetricsChart } from "@/components/customer-metrics-chart"

export function InsightCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Regional Performance</CardTitle>
          <BarChart className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Northeast +32%</div>
          <p className="text-xs text-gray-500">Highest performing region</p>
          <div className="mt-4 h-[200px]">
            <RegionalPerformanceChart />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Revenue Growth</CardTitle>
          <LineChart className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+24% Overall</div>
          <p className="text-xs text-gray-500">Q1 to Q2 comparison</p>
          <div className="mt-4 h-[200px]">
            <RevenueGrowthChart />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Customer Metrics</CardTitle>
          <PieChart className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">-12% CAC</div>
          <p className="text-xs text-gray-500">Customer acquisition cost reduction</p>
          <div className="mt-4 h-[200px]">
            <CustomerMetricsChart />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Marketing Effectiveness</CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Content +45%</div>
          <p className="text-xs text-gray-500">Content marketing conversion rate</p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center">
              <span className="w-1/3 text-sm">Content</span>
              <div className="w-2/3 bg-gray-100 rounded-full h-2.5">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>
            <div className="flex items-center">
              <span className="w-1/3 text-sm">Social</span>
              <div className="w-2/3 bg-gray-100 rounded-full h-2.5">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>
            <div className="flex items-center">
              <span className="w-1/3 text-sm">Paid Ads</span>
              <div className="w-2/3 bg-gray-100 rounded-full h-2.5">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: "40%" }}></div>
              </div>
            </div>
            <div className="flex items-center">
              <span className="w-1/3 text-sm">Email</span>
              <div className="w-2/3 bg-gray-100 rounded-full h-2.5">
                <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: "70%" }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Anomalies Detected</CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md bg-amber-50 p-3">
              <div className="font-medium text-amber-800">Southwest Region</div>
              <div className="text-sm text-gray-600">
                Marketing spend increased by 30% but revenue growth is only 12%, significantly lower than other regions.
              </div>
            </div>
            <div className="rounded-md bg-green-50 p-3">
              <div className="font-medium text-green-800">Northeast Region</div>
              <div className="text-sm text-gray-600">
                Customer retention is 10% higher than company average while acquisition cost is 15% lower.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Correlations</CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md bg-blue-50 p-3">
              <div className="font-medium text-blue-800">Strong Positive (0.92)</div>
              <div className="text-sm text-gray-600">Content marketing spend and customer retention rate</div>
            </div>
            <div className="rounded-md bg-purple-50 p-3">
              <div className="font-medium text-purple-800">Moderate Positive (0.68)</div>
              <div className="text-sm text-gray-600">
                Customer support response time and customer satisfaction score
              </div>
            </div>
            <div className="rounded-md bg-red-50 p-3">
              <div className="font-medium text-red-800">Negative (-0.54)</div>
              <div className="text-sm text-gray-600">Paid ad spend and ROI in Southwest region</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
