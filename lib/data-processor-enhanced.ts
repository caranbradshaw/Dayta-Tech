import Papa from "papaparse"
import * as XLSX from "xlsx"

export interface ColumnAnalysis {
  name: string
  type: "numeric" | "categorical" | "datetime" | "text"
  uniqueValues: number
  missingCount: number
  missingPercentage: number
  distribution: any
  patterns: string[]
  outliers?: number[]
  correlations?: { [key: string]: number }
}

export interface ProcessedDataComplete {
  sample: any[]
  stats: {
    rowCount: number
    columnCount: number
    columns: string[]
    numericColumns: string[]
    categoricalColumns: string[]
    datetimeColumns: string[]
    missingValues: { [key: string]: number }
    summary: any
    detailedSummary: any
  }
  columnAnalysis: ColumnAnalysis[]
  correlations: { [key: string]: { [key: string]: number } }
  trends: any[]
  anomalies: any[]
  insights: {
    dataQuality: number
    completeness: number
    patterns: string[]
    businessMetrics: any
  }
}

export async function processUploadedFileComplete(file: File): Promise<ProcessedDataComplete> {
  try {
    console.log(`Processing complete analysis for ${file.name} (${file.size} bytes)`)

    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    let data: any[] = []

    // Parse file based on type
    if (fileExtension === "csv") {
      data = await parseCSVComplete(file)
    } else if (fileExtension === "xlsx" || fileExtension === "xls") {
      data = await parseExcelComplete(file)
    } else if (fileExtension === "json") {
      data = await parseJSONComplete(file)
    } else {
      throw new Error(`Unsupported file format: ${fileExtension}`)
    }

    if (data.length === 0) {
      throw new Error("No data found in file")
    }

    // Perform comprehensive analysis
    const columns = Object.keys(data[0])
    const columnAnalysis = await analyzeAllColumns(data, columns)
    const correlations = calculateCorrelations(data, columnAnalysis)
    const trends = identifyTrends(data, columnAnalysis)
    const anomalies = detectAnomalies(data, columnAnalysis)
    const insights = generateComprehensiveInsights(data, columnAnalysis, correlations, trends, anomalies)

    const stats = {
      rowCount: data.length,
      columnCount: columns.length,
      columns,
      numericColumns: columnAnalysis.filter((col) => col.type === "numeric").map((col) => col.name),
      categoricalColumns: columnAnalysis.filter((col) => col.type === "categorical").map((col) => col.name),
      datetimeColumns: columnAnalysis.filter((col) => col.type === "datetime").map((col) => col.name),
      missingValues: columnAnalysis.reduce(
        (acc, col) => {
          acc[col.name] = col.missingCount
          return acc
        },
        {} as { [key: string]: number },
      ),
      summary: generateBasicSummary(data, columnAnalysis),
      detailedSummary: generateDetailedSummary(data, columnAnalysis),
    }

    return {
      sample: data.slice(0, 100), // First 100 rows for reference
      stats,
      columnAnalysis,
      correlations,
      trends,
      anomalies,
      insights,
    }
  } catch (error) {
    console.error("Complete file processing error:", error)
    throw new Error(`Failed to process file: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

async function parseCSVComplete(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn("CSV parsing warnings:", results.errors)
        }
        resolve(results.data as any[])
      },
      error: (error) => reject(error),
    })
  })
}

async function parseExcelComplete(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error("Failed to read Excel file"))
    reader.readAsArrayBuffer(file)
  })
}

async function parseJSONComplete(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string)
        const data = Array.isArray(jsonData) ? jsonData : [jsonData]
        resolve(data)
      } catch (error) {
        reject(new Error("Invalid JSON format"))
      }
    }
    reader.onerror = () => reject(new Error("Failed to read JSON file"))
    reader.readAsText(file)
  })
}

async function analyzeAllColumns(data: any[], columns: string[]): Promise<ColumnAnalysis[]> {
  const analysis: ColumnAnalysis[] = []

  for (const column of columns) {
    const values = data.map((row) => row[column]).filter((val) => val !== null && val !== undefined && val !== "")
    const totalCount = data.length
    const validCount = values.length
    const missingCount = totalCount - validCount

    // Determine column type
    const type = determineColumnType(values)

    // Calculate unique values
    const uniqueValues = new Set(values).size

    // Generate distribution based on type
    const distribution = generateDistribution(values, type)

    // Identify patterns
    const patterns = identifyColumnPatterns(values, type)

    // Detect outliers for numeric columns
    const outliers = type === "numeric" ? detectOutliers(values) : undefined

    analysis.push({
      name: column,
      type,
      uniqueValues,
      missingCount,
      missingPercentage: (missingCount / totalCount) * 100,
      distribution,
      patterns,
      outliers,
    })
  }

  return analysis
}

function determineColumnType(values: any[]): "numeric" | "categorical" | "datetime" | "text" {
  if (values.length === 0) return "text"

  const numericCount = values.filter(
    (val) => typeof val === "number" || (!isNaN(Number(val)) && !isNaN(Number.parseFloat(val))),
  ).length
  const dateCount = values.filter((val) => !isNaN(Date.parse(val))).length

  const numericRatio = numericCount / values.length
  const dateRatio = dateCount / values.length

  if (numericRatio > 0.8) return "numeric"
  if (dateRatio > 0.8) return "datetime"

  const uniqueRatio = new Set(values).size / values.length
  if (uniqueRatio < 0.1) return "categorical"

  return "text"
}

function generateDistribution(values: any[], type: string): any {
  switch (type) {
    case "numeric":
      const numValues = values.map((v) => Number(v)).filter((v) => !isNaN(v))
      return {
        min: Math.min(...numValues),
        max: Math.max(...numValues),
        mean: numValues.reduce((a, b) => a + b, 0) / numValues.length,
        median: calculateMedian(numValues),
        std: calculateStandardDeviation(numValues),
        quartiles: calculateQuartiles(numValues),
      }

    case "categorical":
      const counts: { [key: string]: number } = {}
      values.forEach((val) => {
        const key = String(val)
        counts[key] = (counts[key] || 0) + 1
      })
      return counts

    default:
      return {
        sampleValues: values.slice(0, 10),
        totalUnique: new Set(values).size,
      }
  }
}

function identifyColumnPatterns(values: any[], type: string): string[] {
  const patterns: string[] = []

  switch (type) {
    case "numeric":
      const numValues = values.map((v) => Number(v)).filter((v) => !isNaN(v))
      if (numValues.every((v) => v >= 0)) patterns.push("All positive values")
      if (numValues.every((v) => Number.isInteger(v))) patterns.push("Integer values only")
      if (Math.max(...numValues) - Math.min(...numValues) > 1000) patterns.push("Wide value range")
      break

    case "categorical":
      const uniqueCount = new Set(values).size
      if (uniqueCount < 10) patterns.push("Low cardinality")
      if (uniqueCount > 100) patterns.push("High cardinality")
      break

    case "text":
      const avgLength = values.reduce((sum, val) => sum + String(val).length, 0) / values.length
      if (avgLength > 100) patterns.push("Long text content")
      if (avgLength < 10) patterns.push("Short text content")
      break
  }

  return patterns
}

function detectOutliers(values: number[]): number[] {
  const sortedValues = values.sort((a, b) => a - b)
  const q1 = calculatePercentile(sortedValues, 25)
  const q3 = calculatePercentile(sortedValues, 75)
  const iqr = q3 - q1
  const lowerBound = q1 - 1.5 * iqr
  const upperBound = q3 + 1.5 * iqr

  return values.filter((val) => val < lowerBound || val > upperBound)
}

function calculateCorrelations(
  data: any[],
  columnAnalysis: ColumnAnalysis[],
): { [key: string]: { [key: string]: number } } {
  const numericColumns = columnAnalysis.filter((col) => col.type === "numeric").map((col) => col.name)
  const correlations: { [key: string]: { [key: string]: number } } = {}

  for (let i = 0; i < numericColumns.length; i++) {
    const col1 = numericColumns[i]
    correlations[col1] = {}

    for (let j = 0; j < numericColumns.length; j++) {
      const col2 = numericColumns[j]
      if (i === j) {
        correlations[col1][col2] = 1
      } else {
        const correlation = calculatePearsonCorrelation(
          data.map((row) => Number(row[col1])).filter((v) => !isNaN(v)),
          data.map((row) => Number(row[col2])).filter((v) => !isNaN(v)),
        )
        correlations[col1][col2] = correlation
      }
    }
  }

  return correlations
}

function identifyTrends(data: any[], columnAnalysis: ColumnAnalysis[]): any[] {
  const trends: any[] = []

  // Look for time-based trends if datetime columns exist
  const datetimeColumns = columnAnalysis.filter((col) => col.type === "datetime")
  const numericColumns = columnAnalysis.filter((col) => col.type === "numeric")

  if (datetimeColumns.length > 0 && numericColumns.length > 0) {
    const dateCol = datetimeColumns[0].name
    const numCol = numericColumns[0].name

    // Sort by date and analyze trend
    const sortedData = data
      .filter((row) => row[dateCol] && row[numCol])
      .sort((a, b) => new Date(a[dateCol]).getTime() - new Date(b[dateCol]).getTime())

    if (sortedData.length > 2) {
      const values = sortedData.map((row) => Number(row[numCol]))
      const trendDirection = values[values.length - 1] > values[0] ? "increasing" : "decreasing"

      trends.push({
        type: "temporal_trend",
        columns: [dateCol, numCol],
        direction: trendDirection,
        strength: calculateTrendStrength(values),
      })
    }
  }

  return trends
}

function detectAnomalies(data: any[], columnAnalysis: ColumnAnalysis[]): any[] {
  const anomalies: any[] = []

  columnAnalysis.forEach((col) => {
    if (col.type === "numeric" && col.outliers && col.outliers.length > 0) {
      anomalies.push({
        column: col.name,
        type: "statistical_outliers",
        count: col.outliers.length,
        values: col.outliers.slice(0, 5), // First 5 outliers
      })
    }

    if (col.missingPercentage > 20) {
      anomalies.push({
        column: col.name,
        type: "high_missing_data",
        percentage: col.missingPercentage,
      })
    }
  })

  return anomalies
}

function generateComprehensiveInsights(
  data: any[],
  columnAnalysis: ColumnAnalysis[],
  correlations: any,
  trends: any[],
  anomalies: any[],
): any {
  const totalCells = data.length * columnAnalysis.length
  const missingCells = columnAnalysis.reduce((sum, col) => sum + col.missingCount, 0)
  const completeness = ((totalCells - missingCells) / totalCells) * 100

  const dataQuality = calculateDataQuality(columnAnalysis, anomalies)

  const patterns = [
    `Dataset contains ${data.length} records across ${columnAnalysis.length} dimensions`,
    `${columnAnalysis.filter((col) => col.type === "numeric").length} quantitative metrics available for analysis`,
    `${columnAnalysis.filter((col) => col.type === "categorical").length} categorical dimensions for segmentation`,
    `Data completeness: ${completeness.toFixed(1)}%`,
  ]

  const businessMetrics = {
    recordCount: data.length,
    dimensionCount: columnAnalysis.length,
    qualityScore: dataQuality,
    completenessScore: completeness,
    anomalyCount: anomalies.length,
    trendCount: trends.length,
  }

  return {
    dataQuality,
    completeness,
    patterns,
    businessMetrics,
  }
}

function calculateDataQuality(columnAnalysis: ColumnAnalysis[], anomalies: any[]): number {
  let qualityScore = 100

  // Penalize for missing data
  const avgMissingPercentage =
    columnAnalysis.reduce((sum, col) => sum + col.missingPercentage, 0) / columnAnalysis.length
  qualityScore -= avgMissingPercentage * 0.5

  // Penalize for anomalies
  qualityScore -= anomalies.length * 2

  // Bonus for good data distribution
  const numericColumns = columnAnalysis.filter((col) => col.type === "numeric")
  if (numericColumns.length > 0) {
    qualityScore += 5 // Bonus for having numeric data
  }

  return Math.max(0, Math.min(100, qualityScore))
}

// Utility functions
function calculateMedian(values: number[]): number {
  const sorted = values.sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length
  return Math.sqrt(avgSquaredDiff)
}

function calculateQuartiles(values: number[]): { q1: number; q2: number; q3: number } {
  const sorted = values.sort((a, b) => a - b)
  return {
    q1: calculatePercentile(sorted, 25),
    q2: calculatePercentile(sorted, 50),
    q3: calculatePercentile(sorted, 75),
  }
}

function calculatePercentile(sortedValues: number[], percentile: number): number {
  const index = (percentile / 100) * (sortedValues.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const weight = index % 1

  if (upper >= sortedValues.length) return sortedValues[sortedValues.length - 1]
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight
}

function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length)
  if (n === 0) return 0

  const sumX = x.slice(0, n).reduce((a, b) => a + b, 0)
  const sumY = y.slice(0, n).reduce((a, b) => a + b, 0)
  const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0)
  const sumX2 = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0)
  const sumY2 = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

  return denominator === 0 ? 0 : numerator / denominator
}

function calculateTrendStrength(values: number[]): number {
  if (values.length < 2) return 0

  const firstValue = values[0]
  const lastValue = values[values.length - 1]
  const percentChange = Math.abs((lastValue - firstValue) / firstValue) * 100

  return Math.min(100, percentChange) / 100
}

function generateBasicSummary(data: any[], columnAnalysis: ColumnAnalysis[]): any {
  return {
    totalRecords: data.length,
    totalColumns: columnAnalysis.length,
    numericColumns: columnAnalysis.filter((col) => col.type === "numeric").length,
    categoricalColumns: columnAnalysis.filter((col) => col.type === "categorical").length,
    textColumns: columnAnalysis.filter((col) => col.type === "text").length,
    datetimeColumns: columnAnalysis.filter((col) => col.type === "datetime").length,
  }
}

function generateDetailedSummary(data: any[], columnAnalysis: ColumnAnalysis[]): any {
  const summary: any = {}

  columnAnalysis.forEach((col) => {
    summary[col.name] = {
      type: col.type,
      uniqueValues: col.uniqueValues,
      missingCount: col.missingCount,
      missingPercentage: col.missingPercentage,
      distribution: col.distribution,
      patterns: col.patterns,
    }
  })

  return summary
}
