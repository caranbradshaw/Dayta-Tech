"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"

export function RevenueGrowthChart() {
  // Sample data for demonstration
  const data = [
    { month: "Jan", revenue: 150 },
    { month: "Feb", revenue: 165 },
    { month: "Mar", revenue: 180 },
    { month: "Apr", revenue: 190 },
    { month: "May", revenue: 210 },
    { month: "Jun", revenue: 235 },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis tickFormatter={(value) => `$${value}k`} fontSize={12} tickLine={false} axisLine={false} tickCount={5} />
        <Tooltip
          formatter={(value) => [`$${value}k`, "Revenue"]}
          labelStyle={{ color: "#374151" }}
          itemStyle={{ color: "#6b21a8" }}
          cursor={{ fill: "#f3f4f6" }}
        />
        <Area type="monotone" dataKey="revenue" stroke="#9333ea" fill="url(#colorRevenue)" strokeWidth={2} />
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
          </linearGradient>
        </defs>
      </AreaChart>
    </ResponsiveContainer>
  )
}
