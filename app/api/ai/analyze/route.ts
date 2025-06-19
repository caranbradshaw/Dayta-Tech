import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { generateRoleBasedAnalysis } from "@/lib/ai-service-role-based"
import * as XLSX from "xlsx"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string
    const analysisType = formData.get("analysisType") as string
    const userIndustry = formData.get("userIndustry") as string

    if (!file || !userId) {
      return NextResponse.json({ error: "Missing file or user ID" }, { status: 400 })
    }

    // Parse the file based on type
    const fileBuffer = await file.arrayBuffer()
    let parsedData: any[] = []
    let columns: string[] = []

    if (file.name.endsWith(".csv")) {
      const text = new TextDecoder().decode(fileBuffer)
      const lines = text.split("\n").filter((line) => line.trim())
      if (lines.length > 0) {
        columns = lines[0].split(",").map((col) => col.trim().replace(/"/g, ""))
        parsedData = lines.slice(1).map((line) => {
          const values = line.split(",").map((val) => val.trim().replace(/"/g, ""))
          const row: any = {}
          columns.forEach((col, index) => {
            row[col] = values[index] || ""
          })
          return row
        })
      }
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const workbook = XLSX.read(fileBuffer, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      if (jsonData.length > 0) {
        columns = (jsonData[0] as any[]).map((col) => String(col || ""))
        parsedData = (jsonData.slice(1) as any[][]).map((row) => {
          const rowObj: any = {}
          columns.forEach((col, index) => {
            rowObj[col] = row[index] || ""
          })
          return rowObj
        })
      }
    } else if (file.name.endsWith(".json")) {
      const text = new TextDecoder().decode(fileBuffer)
      const jsonData = JSON.parse(text)
      if (Array.isArray(jsonData) && jsonData.length > 0) {
        parsedData = jsonData
        columns = Object.keys(jsonData[0])
      }
    }

    if (parsedData.length === 0) {
      return NextResponse.json({ error: "Could not parse file data" }, { status: 400 })
    }

    // Analyze data types and generate statistics
    const dataTypes: Record<string, string> = {}
    const statistics: Record<string, any> = {}

    columns.forEach((col) => {
      const values = parsedData.map((row) => row[col]).filter((val) => val !== "" && val != null)
      const numericValues = values.filter((val) => !isNaN(Number(val))).map(Number)

      if (numericValues.length > values.length * 0.8) {
        dataTypes[col] = "numeric"
        statistics[col] = {
          count: numericValues.length,
          mean: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
        }
      } else {
        dataTypes[col] = "text"
        statistics[col] = {
          count: values.length,
          unique: new Set(values).size,
          most_common: values.reduce((a, b, _, arr) =>
            arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length ? a : b,
          ),
        }
      }
    })

    // Generate AI analysis based on user role
    const analysisData = {
      fileName: file.name,
      fileSize: file.size,
      rowCount: parsedData.length,
      columnCount: columns.length,
      columns,
      dataTypes,
      sampleData: parsedData.slice(0, 5),
      statistics,
      analysisType: (analysisType as "Data Scientist" | "Data Engineer") || "Data Scientist",
      userIndustry,
    }

    const aiAnalysis = await generateRoleBasedAnalysis(analysisData)

    // Save to database
    const { data: analysisRecord, error: analysisError } = await supabase
      .from("analyses")
      .insert({
        user_id: userId,
        file_name: file.name,
        file_size: file.size,
        row_count: parsedData.length,
        column_count: columns.length,
        columns: columns,
        data_types: dataTypes,
        statistics: statistics,
        ai_analysis: aiAnalysis,
        analysis_type: analysisType,
        status: "completed",
      })
      .select()
      .single()

    if (analysisError) {
      console.error("Database error:", analysisError)
      return NextResponse.json({ error: "Failed to save analysis" }, { status: 500 })
    }

    // Also save to reports table for easy access
    await supabase.from("reports").insert({
      user_id: userId,
      analysis_id: analysisRecord.id,
      title: `Analysis: ${file.name}`,
      content: aiAnalysis,
      report_type: "analysis",
      status: "completed",
    })

    return NextResponse.json({
      success: true,
      analysisId: analysisRecord.id,
      analysis: aiAnalysis,
      metadata: {
        fileName: file.name,
        rowCount: parsedData.length,
        columnCount: columns.length,
        analysisType,
      },
    })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      {
        error: "Analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
