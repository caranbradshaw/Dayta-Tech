"use client"

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"

export function CustomerMetricsChart() {
  // Sample data for demonstration
  const data = [
    { month: "Jan", cac: 160, retention: 70 },
    { month: "Feb", cac: 155, retention: 71 },
    { month: "Mar", cac: 150, retention: 72 },
    { month: "Apr", cac: 145, retention: 74 },
    { month: "May", cac: 140, retention: 76 },
    { month: "Jun", cac: 135, retention: 78 },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          yAxisId="left"
          orientation="left"
          tickFormatter={(value) => `$${value}`}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickCount={5}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => `${value}%`}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickCount={5}
        />
        <Tooltip
          formatter={(value, name) => {
            if (name === "cac") return [`$${value}`, "Acquisition Cost"]
            if (name === "retention") return [`${value}%`, "Retention Rate"]
            return [value, name]
          }}
          labelStyle={{ color: "#374151" }}
          itemStyle={{ color: "#6b21a8" }}
          cursor={{ fill: "#f3f4f6" }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="cac"
          stroke="#9333ea"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="retention"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
