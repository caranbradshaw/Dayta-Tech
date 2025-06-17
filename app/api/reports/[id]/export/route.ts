import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import jsPDF from "jspdf"
import * as XLSX from "xlsx"
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reportId = params.id
    const { format } = await request.json() // 'pdf', 'excel', 'word', 'json'

    console.log(`Exporting report ${reportId} as ${format}`)

    // Get the report data
    const { data: report, error } = await supabase.from("reports").select("*").eq("id", reportId).single()

    if (error || !report) {
      console.error("Report not found:", error)
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
    try {
      await supabase.from("report_exports").insert({
        report_id: reportId,
        export_format: format,
        file_name: fileName,
        file_size: fileBuffer.length,
        download_count: 0,
      })
    } catch (logError) {
      console.error("Failed to log export:", logError)
      // Don't fail the export if logging fails
    }

    console.log(`Export successful: ${fileName} (${fileBuffer.length} bytes)`)

    // Return the file
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      {
        error: "Failed to export report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function generatePDF(report: any) {
  try {
    console.log("Generating PDF for report:", report.title)

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    let yPosition = margin

    // Helper function to check if we need a new page
    const checkNewPage = (requiredHeight = 10) => {
      if (yPosition + requiredHeight > pageHeight - margin) {
        doc.addPage()
        yPosition = margin
        return true
      }
      return false
    }

    // Helper function to add text with proper wrapping
    const addText = (text: string, fontSize = 12, isBold = false, color = [0, 0, 0]) => {
      if (!text) return

      doc.setFontSize(fontSize)
      doc.setFont("helvetica", isBold ? "bold" : "normal")
      doc.setTextColor(color[0], color[1], color[2])

      const maxWidth = pageWidth - 2 * margin
      const lines = doc.splitTextToSize(text.toString(), maxWidth)

      checkNewPage(lines.length * (fontSize * 0.35) + 5)

      doc.text(lines, margin, yPosition)
      yPosition += lines.length * (fontSize * 0.35) + 5
    }

    // Add a line separator
    const addLine = () => {
      checkNewPage(5)
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10
    }

    // Title Page
    doc.setFillColor(41, 128, 185)
    doc.rect(0, 0, pageWidth, 60, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text(report.title || "Analysis Report", margin, 35)

    yPosition = 80

    // Metadata section
    addText("Report Details", 16, true, [41, 128, 185])
    addText(`Generated: ${new Date(report.created_at).toLocaleDateString()}`, 11)
    addText(`Company: ${report.company_name || "N/A"}`, 11)
    addText(`Industry: ${report.industry || "N/A"}`, 11)
    addText(`Analysis Role: ${report.analysis_role?.replace("_", " ") || "N/A"}`, 11)
    addText(`Status: ${report.status}`, 11)

    yPosition += 10
    addLine()

    // Executive Summary
    if (report.summary || report.executive_summary) {
      addText("Executive Summary", 18, true, [41, 128, 185])

      let summaryText = ""
      if (typeof report.executive_summary === "object" && report.executive_summary) {
        summaryText = report.executive_summary.overview || report.summary || ""
      } else {
        summaryText = report.summary || ""
      }

      addText(summaryText, 12)

      // Key Findings
      if (report.executive_summary?.keyFindings && Array.isArray(report.executive_summary.keyFindings)) {
        yPosition += 5
        addText("Key Findings:", 14, true)
        report.executive_summary.keyFindings.forEach((finding: string, index: number) => {
          addText(`• ${finding}`, 11)
        })
      }

      // Business Impact
      if (report.executive_summary?.businessImpact) {
        yPosition += 5
        addText("Business Impact:", 14, true)
        addText(report.executive_summary.businessImpact, 11)
      }

      yPosition += 10
      addLine()
    }

    // Key Insights
    if (report.insights && Array.isArray(report.insights) && report.insights.length > 0) {
      addText("Key Insights", 18, true, [41, 128, 185])

      report.insights.forEach((insight: any, index: number) => {
        checkNewPage(20)

        addText(`${index + 1}. ${insight.title || insight.finding || "Insight"}`, 14, true)
        addText(insight.content || insight.description || insight.finding || "", 11)

        if (insight.impact) {
          addText(`Impact: ${insight.impact}`, 10, false, [100, 100, 100])
        }

        if (insight.confidence) {
          addText(`Confidence: ${Math.round(insight.confidence * 100)}%`, 10, false, [100, 100, 100])
        }

        yPosition += 5
      })

      addLine()
    }

    // Recommendations
    if (report.recommendations && Array.isArray(report.recommendations) && report.recommendations.length > 0) {
      addText("Recommendations", 18, true, [41, 128, 185])

      report.recommendations.forEach((rec: any, index: number) => {
        checkNewPage(25)

        addText(`${index + 1}. ${rec.title || rec.recommendation || "Recommendation"}`, 14, true)
        addText(rec.description || rec.implementation || "", 11)

        if (rec.impact) {
          addText(`Impact: ${rec.impact}`, 10, false, [100, 100, 100])
        }

        if (rec.effort) {
          addText(`Effort Required: ${rec.effort}`, 10, false, [100, 100, 100])
        }

        if (rec.timeline) {
          addText(`Timeline: ${rec.timeline}`, 10, false, [100, 100, 100])
        }

        if (rec.actionSteps && Array.isArray(rec.actionSteps)) {
          addText("Action Steps:", 12, true)
          rec.actionSteps.forEach((step: string, stepIndex: number) => {
            addText(`   ${stepIndex + 1}. ${step}`, 10)
          })
        }

        yPosition += 8
      })

      addLine()
    }

    // Technical Details
    addText("Technical Details", 18, true, [41, 128, 185])
    addText(`Report ID: ${report.id}`, 10, false, [100, 100, 100])
    addText(`Report Type: ${report.report_type}`, 10, false, [100, 100, 100])
    addText(`File Name: ${report.file_name || "N/A"}`, 10, false, [100, 100, 100])

    if (report.tags && Array.isArray(report.tags) && report.tags.length > 0) {
      addText(`Tags: ${report.tags.join(", ")}`, 10, false, [100, 100, 100])
    }

    // Footer on last page
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(
        `Page ${i} of ${totalPages} | Generated by DaytaTech | ${new Date().toLocaleDateString()}`,
        margin,
        pageHeight - 10,
      )
    }

    const fileName = `${(report.title || "report").replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.pdf`
    const pdfOutput = doc.output("arraybuffer")

    console.log(`PDF generated successfully: ${fileName} (${pdfOutput.byteLength} bytes)`)

    return {
      buffer: Buffer.from(pdfOutput),
      fileName,
    }
  } catch (error) {
    console.error("PDF generation error:", error)
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

async function generateExcel(report: any) {
  try {
    console.log("Generating Excel for report:", report.title)

    const workbook = XLSX.utils.book_new()

    // Summary Sheet
    const summaryData = [
      ["DaytaTech Analysis Report"],
      [""],
      ["Report Title", report.title || "Analysis Report"],
      ["Generated", new Date(report.created_at).toLocaleDateString()],
      ["Company", report.company_name || "N/A"],
      ["Industry", report.industry || "N/A"],
      ["Analysis Role", report.analysis_role?.replace("_", " ") || "N/A"],
      ["Status", report.status],
      ["Report ID", report.id],
      [""],
      ["Executive Summary"],
      [report.summary || "No summary available"],
    ]

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)

    // Style the header
    if (!summarySheet["!merges"]) summarySheet["!merges"] = []
    summarySheet["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } })

    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary")

    // Insights Sheet
    if (report.insights && Array.isArray(report.insights) && report.insights.length > 0) {
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
    if (report.recommendations && Array.isArray(report.recommendations) && report.recommendations.length > 0) {
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

    // Raw Data Sheet (if available and reasonable size)
    if (report.content?.raw_data) {
      try {
        let rawData = report.content.raw_data

        // Handle different data formats
        if (typeof rawData === "string") {
          try {
            rawData = JSON.parse(rawData)
          } catch {
            rawData = [{ data: rawData }]
          }
        }

        if (!Array.isArray(rawData)) {
          rawData = [rawData]
        }

        // Limit to first 1000 rows to prevent huge files
        if (rawData.length > 1000) {
          rawData = rawData.slice(0, 1000)
        }

        const rawSheet = XLSX.utils.json_to_sheet(rawData)
        XLSX.utils.book_append_sheet(workbook, rawSheet, "Raw Data")
      } catch (error) {
        console.log("Could not add raw data sheet:", error)
      }
    }

    const fileName = `${(report.title || "report").replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.xlsx`
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    console.log(`Excel generated successfully: ${fileName}`)

    return {
      buffer: Buffer.from(buffer),
      fileName,
    }
  } catch (error) {
    console.error("Excel generation error:", error)
    throw new Error(`Excel generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

async function generateWord(report: any) {
  try {
    console.log("Generating Word document for report:", report.title)

    const children = []

    // Title
    children.push(
      new Paragraph({
        text: report.title || "Analysis Report",
        heading: HeadingLevel.TITLE,
      }),
    )

    // Metadata
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Generated: ${new Date(report.created_at).toLocaleDateString()}`, break: 1 }),
          new TextRun({ text: `Company: ${report.company_name || "N/A"}`, break: 1 }),
          new TextRun({ text: `Industry: ${report.industry || "N/A"}`, break: 1 }),
          new TextRun({ text: `Analysis Role: ${report.analysis_role?.replace("_", " ") || "N/A"}`, break: 1 }),
          new TextRun({ text: `Status: ${report.status}`, break: 1 }),
        ],
      }),
    )

    // Executive Summary
    children.push(
      new Paragraph({
        text: "Executive Summary",
        heading: HeadingLevel.HEADING_1,
      }),
    )

    const summaryText =
      typeof report.executive_summary === "object"
        ? report.executive_summary?.overview || report.summary
        : report.summary || "No summary available"

    children.push(
      new Paragraph({
        text: summaryText,
      }),
    )

    // Key Findings
    if (report.executive_summary?.keyFindings && Array.isArray(report.executive_summary.keyFindings)) {
      children.push(
        new Paragraph({
          text: "Key Findings",
          heading: HeadingLevel.HEADING_2,
        }),
      )

      report.executive_summary.keyFindings.forEach((finding: string) => {
        children.push(
          new Paragraph({
            text: `• ${finding}`,
          }),
        )
      })
    }

    // Insights
    if (report.insights && Array.isArray(report.insights) && report.insights.length > 0) {
      children.push(
        new Paragraph({
          text: "Key Insights",
          heading: HeadingLevel.HEADING_1,
        }),
      )

      report.insights.forEach((insight: any, index: number) => {
        children.push(
          new Paragraph({
            text: `${index + 1}. ${insight.title || insight.finding}`,
            heading: HeadingLevel.HEADING_2,
          }),
        )

        children.push(
          new Paragraph({
            text: insight.content || insight.description || "",
          }),
        )

        if (insight.impact) {
          children.push(
            new Paragraph({
              text: `Impact: ${insight.impact}`,
            }),
          )
        }
      })
    }

    // Recommendations
    if (report.recommendations && Array.isArray(report.recommendations) && report.recommendations.length > 0) {
      children.push(
        new Paragraph({
          text: "Recommendations",
          heading: HeadingLevel.HEADING_1,
        }),
      )

      report.recommendations.forEach((rec: any, index: number) => {
        children.push(
          new Paragraph({
            text: `${index + 1}. ${rec.title || rec.recommendation}`,
            heading: HeadingLevel.HEADING_2,
          }),
        )

        children.push(
          new Paragraph({
            text: rec.description || rec.implementation || "",
          }),
        )

        if (rec.impact) {
          children.push(new Paragraph({ text: `Impact: ${rec.impact}` }))
        }

        if (rec.effort) {
          children.push(new Paragraph({ text: `Effort: ${rec.effort}` }))
        }

        if (rec.timeline) {
          children.push(new Paragraph({ text: `Timeline: ${rec.timeline}` }))
        }
      })
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children,
        },
      ],
    })

    const fileName = `${(report.title || "report").replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.docx`
    const buffer = await Packer.toBuffer(doc)

    console.log(`Word document generated successfully: ${fileName}`)

    return {
      buffer,
      fileName,
    }
  } catch (error) {
    console.error("Word generation error:", error)
    throw new Error(`Word generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

function generateJSON(report: any) {
  try {
    console.log("Generating JSON export for report:", report.title)

    const exportData = {
      metadata: {
        id: report.id,
        title: report.title,
        generated: report.created_at,
        company: report.company_name,
        industry: report.industry,
        analysisRole: report.analysis_role,
        status: report.status,
        exportedAt: new Date().toISOString(),
      },
      summary: report.summary,
      executiveSummary: report.executive_summary,
      insights: report.insights || [],
      recommendations: report.recommendations || [],
      content: report.content,
      tags: report.tags || [],
    }

    const fileName = `${(report.title || "report").replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.json`
    const buffer = Buffer.from(JSON.stringify(exportData, null, 2))

    console.log(`JSON export generated successfully: ${fileName}`)

    return {
      buffer,
      fileName,
    }
  } catch (error) {
    console.error("JSON generation error:", error)
    throw new Error(`JSON generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
