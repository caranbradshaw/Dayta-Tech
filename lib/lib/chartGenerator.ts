export interface ChartData {
  labels: string[]
  values: number[]
  title: string
  type: "bar" | "line" | "pie"
}

export class ChartGenerator {
  static generateChartFromAnalysis(analysisData: any): ChartData | null {
    // ...
  }

  static generateCanvas(chartData: ChartData, width = 800, height = 400): string {
    // ...
  }

  private static drawBarChart(ctx: CanvasRenderingContext2D, data: ChartData, width: number, height: number) {
    // ...
  }
}
