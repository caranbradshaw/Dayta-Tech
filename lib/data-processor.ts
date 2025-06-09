import Papa from "papaparse"
import * as XLSX from "xlsx"

export interface ProcessedData {
  sample: any[]
  stats: {
    rowCount: number
    columnCount: number
    columns: string[]
    numericColumns: string[]
    categoricalColumns: string[]
    missingValues: Record<string, number>
    summary: Record<string, any>
  }
  insights: {
    dataQuality: number
    completeness: number
    patterns: string[]
    anomalies: any[]
  }
}

export async function processUploadedFile(file: File): Promise<ProcessedData> {
  const fileExtension = file.name.split(".").pop()?.toLowerCase()

  let rawData: any[] = []

  try {
    // Parse different file types
    switch (fileExtension) {
      case "csv":
        rawData = await parseCSV(file)
        break
      case "xlsx":
      case "xls":
        rawData = await parseExcel(file)
        break
      case "json":
        rawData = await parseJSON(file)
        break
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`)
    }

    // Process and analyze the data
    return analyzeDataStructure(rawData)
  } catch (error) {
    console.error("Error processing file:", error)
    throw new Error(
      `Failed to process ${fileExtension} file: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

async function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing error: ${results.errors[0].message}`))
        } else {
          resolve(results.data)
        }
      },
      error: (error) => reject(error),
    })
  })
}

async function parseExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        // Convert to objects with headers
        const headers = jsonData[0] as string[]
        const rows = jsonData.slice(1) as any[][]

        const objects = rows
          .map((row) => {
            const obj: any = {}
            headers.forEach((header, index) => {
              obj[header] = row[index]
            })
            return obj
          })
          .filter((obj) => Object.values(obj).some((val) => val != null && val !== ""))

        resolve(objects)
      } catch (error) {
        reject(new Error(`Excel parsing error: ${error instanceof Error ? error.message : "Unknown error"}`))
      }
    }
    reader.onerror = () => reject(new Error("Failed to read Excel file"))
    reader.readAsArrayBuffer(file)
  })
}

async function parseJSON(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string)
        // Handle both array of objects and single object
        const data = Array.isArray(jsonData) ? jsonData : [jsonData]
        resolve(data)
      } catch (error) {
        reject(new Error(`JSON parsing error: ${error instanceof Error ? error.message : "Invalid JSON"}`))
      }
    }
    reader.onerror = () => reject(new Error("Failed to read JSON file"))
    reader.readAsText(file)
  })
}

function analyzeDataStructure(data: any[]): ProcessedData {
  if (!data || data.length === 0) {
    throw new Error("No data found in file")
  }

  const sample = data.slice(0, Math.min(100, data.length))
  const columns = Object.keys(data[0] || {})

  // Analyze column types
  const numericColumns: string[] = []
  const categoricalColumns: string[] = []
  const missingValues: Record<string, number> = {}

  columns.forEach((column) => {
    const nonNullValues = data.map((row) => row[column]).filter((val) => val != null && val !== "")
    const missingCount = data.length - nonNullValues.length
    missingValues[column] = missingCount

    // Check if column is numeric
    const numericValues = nonNullValues.filter((val) => !isNaN(Number(val)))
    if (numericValues.length > nonNullValues.length * 0.8) {
      numericColumns.push(column)
    } else {
      categoricalColumns.push(column)
    }
  })

  // Generate basic statistics
  const summary: Record<string, any> = {}
  numericColumns.forEach((column) => {
    const values = data.map((row) => Number(row[column])).filter((val) => !isNaN(val))
    if (values.length > 0) {
      values.sort((a, b) => a - b)
      summary[column] = {
        min: Math.min(...values),
        max: Math.max(...values),
        mean: values.reduce((a, b) => a + b, 0) / values.length,
        median: values[Math.floor(values.length / 2)],
        count: values.length,
      }
    }
  })

  // Calculate data quality metrics
  const totalCells = data.length * columns.length
  const missingCells = Object.values(missingValues).reduce((a, b) => a + b, 0)
  const completeness = ((totalCells - missingCells) / totalCells) * 100
  const dataQuality = Math.min(95, Math.max(60, completeness + (numericColumns.length > 0 ? 10 : 0)))

  // Identify patterns and potential issues
  const patterns: string[] = []
  if (numericColumns.length > categoricalColumns.length) {
    patterns.push("Primarily numerical data detected")
  }
  if (data.length > 1000) {
    patterns.push("Large dataset suitable for statistical analysis")
  }
  if (completeness > 90) {
    patterns.push("High data completeness")
  }

  // Detect anomalies
  const anomalies: any[] = []
  numericColumns.forEach((column) => {
    const values = data.map((row) => Number(row[column])).filter((val) => !isNaN(val))
    if (values.length > 10) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length)
      const outliers = values.filter((val) => Math.abs(val - mean) > 3 * std)
      if (outliers.length > 0) {
        anomalies.push({
          column,
          type: "outliers",
          count: outliers.length,
          values: outliers.slice(0, 5),
        })
      }
    }
  })

  return {
    sample,
    stats: {
      rowCount: data.length,
      columnCount: columns.length,
      columns,
      numericColumns,
      categoricalColumns,
      missingValues,
      summary,
    },
    insights: {
      dataQuality,
      completeness,
      patterns,
      anomalies,
    },
  }
}
