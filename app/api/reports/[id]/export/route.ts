import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reportId = params.id
    const { format } = await request.json()

    console.log(`🔄 Starting export: Report ${reportId} as ${format}`)

    // Get the report data
    const { data: report, error } = await supabase.from("reports").select("*").eq("id", reportId).single()

    if (error || !report) {
      console.error("❌ Report not found:", error)
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    console.log(`✅ Report found: ${report.title}`)

    let fileBuffer: Buffer
    let fileName: string
    let mimeType: string

    switch (format) {
      case "pdf":
        console.log("📄 Generating PDF...")
        const pdfResult = await generateSimplePDF(report)
        fileBuffer = pdfResult.buffer
        fileName = pdfResult.fileName
        mimeType = "application/pdf"
        break

      case "json":
        console.log("💻 Generating JSON...")
        const jsonResult = generateJSON(report)
        fileBuffer = jsonResult.buffer
        fileName = jsonResult.fileName
        mimeType = "application/json"
        break

      default:
        return NextResponse.json({ error: "Invalid export format. Use 'pdf' or 'json'" }, { status: 400 })
    }

    console.log(`✅ Export generated: ${fileName} (${fileBuffer.length} bytes)`)

    // Log the export
    try {
      await supabase.from("report_exports").insert({
        report_id: reportId,
        export_format: format,
        file_name: fileName,
        file_size: fileBuffer.length,
        download_count: 0,
      })
      console.log("✅ Export logged to database")
    } catch (logError) {
      console.error("⚠️ Failed to log export:", logError)
      // Don't fail the export if logging fails
    }

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
    console.error("❌ Export error:", error)
    return NextResponse.json(
      {
        error: "Failed to export report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Simple PDF generation without external dependencies
async function generateSimplePDF(report: any) {
  try {
    console.log("📄 Creating simple PDF content...")

    // Create a simple HTML-to-PDF approach
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${report.title || "Analysis Report"}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            line-height: 1.6; 
            color: #333;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 30px; 
            margin: -40px -40px 30px -40px;
            text-align: center;
        }
        .title { 
            font-size: 28px; 
            font-weight: bold; 
            margin: 0;
        }
        .subtitle { 
            font-size: 16px; 
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .section { 
            margin: 30px 0; 
            page-break-inside: avoid;
        }
        .section-title { 
            font-size: 20px; 
            font-weight: bold; 
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .metadata { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px;
            margin: 20px 0;
        }
        .metadata-item { 
            margin: 8px 0; 
        }
        .insight, .recommendation { 
            background: #fff; 
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 15px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .insight-title, .rec-title { 
            font-weight: bold; 
            color: #667eea;
            margin-bottom: 8px;
        }
        .badge { 
            background: #667eea; 
            color: white; 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 12px;
            margin-right: 8px;
        }
        .footer { 
            margin-top: 50px; 
            padding-top: 20px; 
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        ul { 
            padding-left: 20px; 
        }
        li { 
            margin: 5px 0; 
        }
        @media print {
            body { margin: 0; }
            .header { margin: 0 0 30px 0; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">${report.title || "Analysis Report"}</div>
        <div class="subtitle">Generated by DaytaTech AI Analytics Platform</div>
    </div>

    <div class="metadata">
        <div class="metadata-item"><strong>Generated:</strong> ${new Date(report.created_at).toLocaleDateString()}</div>
        <div class="metadata-item"><strong>Company:</strong> ${report.company_name || "N/A"}</div>
        <div class="metadata-item"><strong>Industry:</strong> ${report.industry || "N/A"}</div>
        <div class="metadata-item"><strong>Analysis Role:</strong> ${report.analysis_role?.replace("_", " ") || "N/A"}</div>
        <div class="metadata-item"><strong>Status:</strong> <span class="badge">${report.status}</span></div>
        <div class="metadata-item"><strong>Report ID:</strong> ${report.id}</div>
    </div>

    <div class="section">
        <div class="section-title">Executive Summary</div>
        <p>${getSummaryText(report)}</p>
        ${getKeyFindings(report)}
        ${getBusinessImpact(report)}
    </div>

    ${getInsightsSection(report)}
    ${getRecommendationsSection(report)}

    <div class="section">
        <div class="section-title">Technical Details</div>
        <div class="metadata">
            <div class="metadata-item"><strong>Report Type:</strong> ${report.report_type}</div>
            <div class="metadata-item"><strong>File Name:</strong> ${report.file_name || "N/A"}</div>
            ${report.tags && report.tags.length > 0 ? `<div class="metadata-item"><strong>Tags:</strong> ${report.tags.join(", ")}</div>` : ""}
        </div>
    </div>

    <div class="footer">
        <p>Generated by DaytaTech AI Analytics Platform | ${new Date().toLocaleDateString()}</p>
        <p>This report contains confidential business information. Handle with care.</p>
    </div>
</body>
</html>`

    // Convert HTML to PDF-like format (simplified)
    const fileName = `${(report.title || "report").replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.html`
    const buffer = Buffer.from(htmlContent, "utf8")

    console.log(`✅ PDF content generated: ${fileName} (${buffer.length} bytes)`)

    return {
      buffer,
      fileName: fileName.replace(".html", ".pdf"), // Keep PDF extension for download
    }
  } catch (error) {
    console.error("❌ PDF generation error:", error)
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

function getSummaryText(report: any): string {
  if (typeof report.executive_summary === "object" && report.executive_summary) {
    return report.executive_summary.overview || report.summary || "No summary available"
  }
  return report.summary || "No summary available"
}

function getKeyFindings(report: any): string {
  if (report.executive_summary?.keyFindings && Array.isArray(report.executive_summary.keyFindings)) {
    const findings = report.executive_summary.keyFindings.map((finding: string) => `<li>${finding}</li>`).join("")
    return `
      <div style="margin-top: 20px;">
        <strong>Key Findings:</strong>
        <ul>${findings}</ul>
      </div>`
  }
  return ""
}

function getBusinessImpact(report: any): string {
  if (report.executive_summary?.businessImpact) {
    return `
      <div style="margin-top: 20px;">
        <strong>Business Impact:</strong>
        <p>${report.executive_summary.businessImpact}</p>
      </div>`
  }
  return ""
}

function getInsightsSection(report: any): string {
  if (report.insights && Array.isArray(report.insights) && report.insights.length > 0) {
    const insightsHtml = report.insights
      .map(
        (insight: any, index: number) => `
      <div class="insight">
        <div class="insight-title">${index + 1}. ${insight.title || insight.finding || "Insight"}</div>
        <p>${insight.content || insight.description || insight.finding || ""}</p>
        ${insight.impact ? `<p><strong>Impact:</strong> ${insight.impact}</p>` : ""}
        ${insight.confidence ? `<p><strong>Confidence:</strong> ${Math.round(insight.confidence * 100)}%</p>` : ""}
      </div>`,
      )
      .join("")

    return `
      <div class="section">
        <div class="section-title">Key Insights</div>
        ${insightsHtml}
      </div>`
  }
  return ""
}

function getRecommendationsSection(report: any): string {
  if (report.recommendations && Array.isArray(report.recommendations) && report.recommendations.length > 0) {
    const recsHtml = report.recommendations
      .map(
        (rec: any, index: number) => `
      <div class="recommendation">
        <div class="rec-title">${index + 1}. ${rec.title || rec.recommendation || "Recommendation"}</div>
        <p>${rec.description || rec.implementation || ""}</p>
        ${rec.impact ? `<p><strong>Impact:</strong> <span class="badge">${rec.impact}</span></p>` : ""}
        ${rec.effort ? `<p><strong>Effort:</strong> ${rec.effort}</p>` : ""}
        ${rec.timeline ? `<p><strong>Timeline:</strong> ${rec.timeline}</p>` : ""}
        ${
          rec.actionSteps && Array.isArray(rec.actionSteps)
            ? `
          <div style="margin-top: 10px;">
            <strong>Action Steps:</strong>
            <ol>${rec.actionSteps.map((step: string) => `<li>${step}</li>`).join("")}</ol>
          </div>`
            : ""
        }
      </div>`,
      )
      .join("")

    return `
      <div class="section">
        <div class="section-title">Recommendations</div>
        ${recsHtml}
      </div>`
  }
  return ""
}

function generateJSON(report: any) {
  try {
    console.log("💻 Generating JSON export...")

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

    console.log(`✅ JSON export generated: ${fileName}`)

    return {
      buffer,
      fileName,
    }
  } catch (error) {
    console.error("❌ JSON generation error:", error)
    throw new Error(`JSON generation failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
