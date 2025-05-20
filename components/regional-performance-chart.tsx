"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"

export function RegionalPerformanceChart() {
  // Sample data for demonstration
  const data = [
    { name: "Northeast", value: 32 },
    { name: "Southeast", value: 24 },
    { name: "Midwest", value: 18 },
    { name: "Southwest", value: 12 },
    { name: "West", value: 28 },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis tickFormatter={(value) => `${value}%`} fontSize={12} tickLine={false} axisLine={false} tickCount={5} />
        <Tooltip
          formatter={(value) => [`${value}%`, "Growth"]}
          labelStyle={{ color: "#374151" }}
          itemStyle={{ color: "#6b21a8" }}
          cursor={{ fill: "#f3f4f6" }}
        />
        <Bar dataKey="value" fill="#9333ea" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
