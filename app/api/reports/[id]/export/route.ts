import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { jsPDF } from "jspdf"
import * as XLSX from "xlsx"
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reportId = params.id
    const { format } = await request.json() // 'pdf', 'excel', 'word', 'json'

    // Get the report data
    const { data: report, error } = await supabase.from("reports").select("*").eq("id", reportId).single()

    if (error || !report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    let fileBuffer: Buffer
    let fileName: string
    let mimeType: string

    switch (format) {
      case "pdf":
        const pdfResult = await generatePDF(report)
        fileBuffer = pdfResult.buffer
        fileName = pdfResult.fileName
        mimeType = "application/pdf"
        break

      case "excel":
        const excelResult = await generateExcel(report)
        fileBuffer = excelResult.buffer
        fileName = excelResult.fileName
        mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        break

      case "word":
        const wordResult = await generateWord(report)
        fileBuffer = wordResult.buffer
        fileName = wordResult.fileName
        mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        break

      case "json":
        const jsonResult = generateJSON(report)
        fileBuffer = jsonResult.buffer
        fileName = jsonResult.fileName
        mimeType = "application/json"
        break

      default:
        return NextResponse.json({ error: "Invalid export format" }, { status: 400 })
    }

    // Log the export
    await supabase.from("report_exports").insert({
      report_id: reportId,
      export_format: format,
      file_name: fileName,
      file_size: fileBuffer.length,
      download_count: 0,
    })

    // Return the file
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export report" }, { status: 500 })
  }
}

async function generatePDF(report: any) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const margin = 20
  let yPosition = margin

  // Helper function to add text with word wrapping
  const addText = (text: string, fontSize = 12, isBold = false) => {
    doc.setFontSize(fontSize)
    if (isBold) doc.setFont(undefined, "bold")
    else doc.setFont(undefined, "normal")

    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin)
    doc.text(lines, margin, yPosition)
    yPosition += lines.length * (fontSize * 0.4) + 5

    // Add new page if needed
    if (yPosition > doc.internal.pageSize.height - margin) {
      doc.addPage()
      yPosition = margin
    }
  }

  // Title
  addText(report.title || "Analysis Report", 20, true)
  yPosition += 10

  // Metadata
  addText(`Generated: ${new Date(report.created_at).toLocaleDateString()}`, 10)
  addText(`Company: ${report.company_name || "N/A"}`, 10)
  addText(`Industry: ${report.industry || "N/A"}`, 10)
  addText(`Analysis Role: ${report.analysis_role?.replace("_", " ") || "N/A"}`, 10)
  yPosition += 10

  // Executive Summary
  if (report.summary || report.executive_summary) {
    addText("Executive Summary", 16, true)
    const summary =
      typeof report.executive_summary === "object"
        ? report.executive_summary.overview || report.summary
        : report.summary
    addText(summary || "No summary available", 12)
    yPosition += 10
  }

  // Key Insights
  if (report.insights && report.insights.length > 0) {
    addText("Key Insights", 16, true)
    report.insights.forEach((insight: any, index: number) => {
      addText(`${index + 1}. ${insight.title || insight.finding}`, 12, true)
      addText(insight.content || insight.description || "", 11)
      yPosition += 5
    })
    yPosition += 10
  }

  // Recommendations
  if (report.recommendations && report.recommendations.length > 0) {
    addText("Recommendations", 16, true)
    report.recommendations.forEach((rec: any, index: number) => {
      addText(`${index + 1}. ${rec.title || rec.recommendation}`, 12, true)
      addText(rec.description || rec.implementation || "", 11)
      if (rec.impact) addText(`Impact: ${rec.impact}`, 10)
      if (rec.effort) addText(`Effort: ${rec.effort}`, 10)
      yPosition += 5
    })
  }

  // Technical Details
  if (report.content) {
    addText("Technical Details", 16, true)
    addText(`Report ID: ${report.id}`, 10)
    addText(`Status: ${report.status}`, 10)
    addText(`File Name: ${report.file_name || "N/A"}`, 10)
  }

  const fileName = `${report.title?.replace(/[^a-zA-Z0-9]/g, "_") || "report"}_${Date.now()}.pdf`
  return {
    buffer: Buffer.from(doc.output("arraybuffer")),
    fileName,
  }
}

async function generateExcel(report: any) {
  const workbook = XLSX.utils.book_new()

  // Summary Sheet
  const summaryData = [
    ["Report Title", report.title || "Analysis Report"],
    ["Generated", new Date(report.created_at).toLocaleDateString()],
    ["Company", report.company_name || "N/A"],
    ["Industry", report.industry || "N/A"],
    ["Analysis Role", report.analysis_role?.replace("_", " ") || "N/A"],
    ["Status", report.status],
    [""],
    ["Executive Summary"],
    [report.summary || "No summary available"],
  ]

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary")

  // Insights Sheet
  if (report.insights && report.insights.length > 0) {
    const insightsData = [["#", "Title", "Finding", "Category", "Impact", "Confidence"]]

    report.insights.forEach((insight: any, index: number) => {
      insightsData.push([
        index + 1,
        insight.title || "",
        insight.finding || insight.content || "",
        insight.category || "",
        insight.impact || "",
        insight.confidence ? `${Math.round(insight.confidence * 100)}%` : "",
      ])
    })

    const insightsSheet = XLSX.utils.aoa_to_sheet(insightsData)
    XLSX.utils.book_append_sheet(workbook, insightsSheet, "Insights")
  }

  // Recommendations Sheet
  if (report.recommendations && report.recommendations.length > 0) {
    const recsData = [["#", "Title", "Description", "Impact", "Effort", "Timeline", "Category"]]

    report.recommendations.forEach((rec: any, index: number) => {
      recsData.push([
        index + 1,
        rec.title || rec.recommendation || "",
        rec.description || rec.implementation || "",
        rec.impact || "",
        rec.effort || "",
        rec.timeline || "",
        rec.category || "",
      ])
    })

    const recsSheet = XLSX.utils.aoa_to_sheet(recsData)
    XLSX.utils.book_append_sheet(workbook, recsSheet, "Recommendations")
  }

  // Raw Data Sheet (if available)
  if (report.content?.raw_data) {
    try {
      const rawData = Array.isArray(report.content.raw_data) ? report.content.raw_data : [report.content.raw_data]

      const rawSheet = XLSX.utils.json_to_sheet(rawData)
      XLSX.utils.book_append_sheet(workbook, rawSheet, "Raw Data")
    } catch (error) {
      console.log("Could not add raw data sheet:", error)
    }
  }

  const fileName = `${report.title?.replace(/[^a-zA-Z0-9]/g, "_") || "report"}_${Date.now()}.xlsx`
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

  return {
    buffer: Buffer.from(buffer),
    fileName,
  }
}

async function generateWord(report: any) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: report.title || "Analysis Report",
            heading: HeadingLevel.TITLE,
          }),

          // Metadata
          new Paragraph({
            children: [
              new TextRun({ text: `Generated: ${new Date(report.created_at).toLocaleDateString()}`, break: 1 }),
              new TextRun({ text: `Company: ${report.company_name || "N/A"}`, break: 1 }),
              new TextRun({ text: `Industry: ${report.industry || "N/A"}`, break: 1 }),
              new TextRun({ text: `Analysis Role: ${report.analysis_role?.replace("_", " ") || "N/A"}`, break: 1 }),
            ],
          }),

          // Executive Summary
          new Paragraph({
            text: "Executive Summary",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: report.summary || "No summary available",
          }),

          // Insights
          ...(report.insights && report.insights.length > 0
            ? [
                new Paragraph({
                  text: "Key Insights",
                  heading: HeadingLevel.HEADING_1,
                }),
                ...report.insights.flatMap((insight: any, index: number) => [
                  new Paragraph({
                    text: `${index + 1}. ${insight.title || insight.finding}`,
                    heading: HeadingLevel.HEADING_2,
                  }),
                  new Paragraph({
                    text: insight.content || insight.description || "",
                  }),
                ]),
              ]
            : []),

          // Recommendations
          ...(report.recommendations && report.recommendations.length > 0
            ? [
                new Paragraph({
                  text: "Recommendations",
                  heading: HeadingLevel.HEADING_1,
                }),
                ...report.recommendations.flatMap((rec: any, index: number) => [
                  new Paragraph({
                    text: `${index + 1}. ${rec.title || rec.recommendation}`,
                    heading: HeadingLevel.HEADING_2,
                  }),
                  new Paragraph({
                    text: rec.description || rec.implementation || "",
                  }),
                  ...(rec.impact ? [new Paragraph({ text: `Impact: ${rec.impact}` })] : []),
                  ...(rec.effort ? [new Paragraph({ text: `Effort: ${rec.effort}` })] : []),
                ]),
              ]
            : []),
        ],
      },
    ],
  })

  const fileName = `${report.title?.replace(/[^a-zA-Z0-9]/g, "_") || "report"}_${Date.now()}.docx`
  const buffer = await Packer.toBuffer(doc)

  return {
    buffer,
    fileName,
  }
}

function generateJSON(report: any) {
  const exportData = {
    metadata: {
      id: report.id,
      title: report.title,
      generated: report.created_at,
      company: report.company_name,
      industry: report.industry,
      analysisRole: report.analysis_role,
      status: report.status,
    },
    summary: report.summary,
    executiveSummary: report.executive_summary,
    insights: report.insights || [],
    recommendations: report.recommendations || [],
    content: report.content,
    tags: report.tags || [],
  }

  const fileName = `${report.title?.replace(/[^a-zA-Z0-9]/g, "_") || "report"}_${Date.now()}.json`
  const buffer = Buffer.from(JSON.stringify(exportData, null, 2))

  return {
    buffer,
    fileName,
  }
}
