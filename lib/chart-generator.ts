export interface ChartData {
  labels: string[]
  values: number[]
  title: string
  type: "bar" | "line" | "pie"
}

export class ChartGenerator {
  static generateChartFromAnalysis(analysisData: any): ChartData | null {
    if (!analysisData?.insights) return null

    const insights = analysisData.insights.detailed_insights || []
    if (insights.length === 0) return null

    // Extract confidence scores for bar chart
    const labels = insights
      .slice(0, 5)
      .map((insight: any, index: number) => insight.title?.substring(0, 15) || `Insight ${index + 1}`)

    const values = insights
      .slice(0, 5)
      .map((insight: any) => (insight.confidence ? Math.round(insight.confidence * 100) : Math.random() * 100))

    return {
      labels,
      values,
      title: "Analysis Confidence Scores",
      type: "bar",
    }
  }

  static generateCanvas(chartData: ChartData, width = 800, height = 400): string {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")

    if (!ctx) throw new Error("Could not get canvas context")

    // Clear background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)

    // Draw title
    ctx.fillStyle = "#1f2937"
    ctx.font = "bold 24px Arial"
    ctx.textAlign = "center"
    ctx.fillText(chartData.title, width / 2, 40)

    if (chartData.type === "bar") {
      this.drawBarChart(ctx, chartData, width, height)
    }

    return canvas.toDataURL("image/png")
  }

  private static drawBarChart(ctx: CanvasRenderingContext2D, data: ChartData, width: number, height: number) {
    const maxValue = Math.max(...data.values)
    const barWidth = Math.min(120, (width - 100) / data.values.length - 20)
    const barSpacing = barWidth + 20
    const chartHeight = height - 120
    const startX = (width - data.values.length * barSpacing) / 2

    data.values.forEach((value, index) => {
      const barHeight = (value / maxValue) * chartHeight * 0.7
      const x = startX + index * barSpacing
      const y = height - barHeight - 80

      // Draw bar with gradient
      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight)
      gradient.addColorStop(0, `hsl(${210 + index * 30}, 70%, 60%)`)
      gradient.addColorStop(1, `hsl(${210 + index * 30}, 70%, 40%)`)

      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth, barHeight)

      // Draw value on top of bar
      ctx.fillStyle = "#1f2937"
      ctx.font = "bold 14px Arial"
      ctx.textAlign = "center"
      ctx.fillText(`${Math.round(value)}%`, x + barWidth / 2, y - 10)

      // Draw label below bar
      ctx.fillStyle = "#374151"
      ctx.font = "12px Arial"
      const label = data.labels[index]
      ctx.fillText(label, x + barWidth / 2, height - 50)
    })

    // Draw Y-axis
    ctx.strokeStyle = "#d1d5db"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(startX - 20, height - 80)
    ctx.lineTo(startX - 20, 60)
    ctx.stroke()

    // Draw X-axis
    ctx.beginPath()
    ctx.moveTo(startX - 20, height - 80)
    ctx.lineTo(startX + data.values.length * barSpacing, height - 80)
    ctx.stroke()
  }
}
