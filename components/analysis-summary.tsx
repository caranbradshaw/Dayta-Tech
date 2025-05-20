export function AnalysisSummary() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-purple-50 p-4">
        <h3 className="mb-2 font-semibold text-purple-800">Key Findings</h3>
        <p className="text-gray-700">
          This sample dataset shows a 24% increase in revenue for Q2 compared to Q1, with the highest growth in the
          Northeast region (32%). Customer acquisition costs have decreased by 12% over the last 3 months, while
          customer retention has improved by 8%. The data indicates a strong positive correlation between marketing
          spend and revenue growth in all regions except the Southwest.
        </p>
      </div>

      <div className="rounded-lg bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold text-blue-800">Industry Context</h3>
        <p className="text-gray-700">
          Compared to industry benchmarks for SaaS companies of similar size, your revenue growth is above average
          (industry average: 18%). Your customer acquisition cost is 15% lower than the industry average, suggesting
          efficient marketing and sales operations. Your product's adoption rate is in line with top-performing
          companies in your segment.
        </p>
      </div>

      <div className="rounded-lg bg-green-50 p-4">
        <h3 className="mb-2 font-semibold text-green-800">Opportunities</h3>
        <p className="text-gray-700">
          Based on the data patterns, there's significant opportunity to expand in the Southwest region, where your
          market penetration is lowest but growth potential is high. The data also suggests that increasing investment
          in content marketing could yield better returns than paid advertising based on current conversion rates.
        </p>
      </div>
    </div>
  )
}
