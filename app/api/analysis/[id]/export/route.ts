import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Force Node.js runtime for file operations
export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const analysisId = params.id
    const { format } = await request.json()

    console.log(`🔄 Starting export: Analysis ${analysisId} as ${format}`)

    // Validate format
    const validFormats = ["pdf", "word", "excel", "powerpoint", "json"]
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { error: "Invalid export format. Use 'pdf', 'word', 'excel', 'powerpoint', or 'json'" },
        { status: 400 },
      )
    }

    // Get the analysis data with all details
    const { data: analysis, error } = await supabase.from("analyses").select("*").eq("id", analysisId).single()

    if (error || !analysis) {
      console.error("❌ Analysis not found:", error)
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    console.log(`✅ Analysis found: ${analysis.file_name}`)

    let fileContent: string
    let fileName: string
    let mimeType: string

    switch (format) {
      case "pdf":
        console.log("📄 Generating PDF...")
        const pdfResult = generateEnhancedHTML(analysis, "pdf")
        fileContent = pdfResult.content
        fileName = pdfResult.fileName
        mimeType = "text/html" // Return as HTML for now, can be converted client-side
        break

      case "word":
        console.log("📝 Generating Word document...")
        const wordResult = generateWordDocument(analysis)
        fileContent = wordResult.content
        fileName = wordResult.fileName
        mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        break

      case "excel":
        console.log("📊 Generating Excel spreadsheet...")
        const excelResult = generateExcelSpreadsheet(analysis)
        fileContent = excelResult.content
        fileName = excelResult.fileName
        mimeType = "text/csv"
        break

      case "powerpoint":
        console.log("📽️ Generating PowerPoint presentation...")
        const pptResult = generatePowerPointPresentation(analysis)
        fileContent = pptResult.content
        fileName = pptResult.fileName
        mimeType = "text/html"
        break

      case "json":
        console.log("💻 Generating JSON...")
        const jsonResult = generateJSON(analysis)
        fileContent = jsonResult.content
        fileName = jsonResult.fileName
        mimeType = "application/json"
        break

      default:
        return NextResponse.json({ error: "Invalid format" }, { status: 400 })
    }

    console.log(`✅ Export generated: ${fileName} (${fileContent.length} characters)`)

    // Log the export attempt
    try {
      await supabase.from("analysis_exports").insert({
        analysis_id: analysisId,
        export_format: format,
        file_name: fileName,
        file_size: fileContent.length,
        download_count: 0,
        created_at: new Date().toISOString(),
      })
      console.log("✅ Export logged to database")
    } catch (logError) {
      console.error("⚠️ Failed to log export:", logError)
    }

    // Create proper buffer
    const buffer = Buffer.from(fileContent, "utf8")

    // Return the file with proper headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("❌ Export error:", error)
    return NextResponse.json(
      {
        error: "Failed to export analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Enhanced HTML generation for PDF-ready content
function generateEnhancedHTML(analysis: any, format: string) {
  const insights = analysis.insights || {}
  const executiveSummary = insights.executive_summary || {}
  const detailedInsights = insights.detailed_insights || []
  const roleRecommendations = insights.role_recommendations || []
  const dataQuality = insights.data_quality_report || {}
  const userContext = insights.user_context || {}
  const userGoals = insights.user_goals || []

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${analysis.file_name || "Analysis Report"}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 40px; 
            text-align: center;
            border-radius: 20px;
            margin-bottom: 40px;
        }
        .title { 
            font-size: 32px; 
            font-weight: bold; 
            margin-bottom: 15px;
        }
        .subtitle { 
            font-size: 18px; 
            opacity: 0.9;
            margin-bottom: 10px;
        }
        .company-info {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
        }
        .section { 
            margin: 40px 0; 
            page-break-inside: avoid;
        }
        .section-title { 
            font-size: 24px; 
            font-weight: bold; 
            color: #667eea;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .metadata { 
            background: #f8f9fa; 
            padding: 25px; 
            border-radius: 12px;
            margin: 25px 0;
            border-left: 5px solid #667eea;
        }
        .metadata-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
        }
        .metadata-item { 
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .metadata-item:last-child { border-bottom: none; }
        .insight, .recommendation { 
            background: #fff; 
            border-left: 5px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border-radius: 8px;
        }
        .insight-title, .rec-title { 
            font-weight: bold; 
            color: #667eea;
            margin-bottom: 12px;
            font-size: 18px;
        }
        .badge { 
            background: #667eea; 
            color: white; 
            padding: 6px 12px; 
            border-radius: 20px; 
            font-size: 12px;
            margin-right: 10px;
            display: inline-block;
        }
        .goals-section {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            margin: 25px 0;
        }
        .goals-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .goal-item {
            background: rgba(255,255,255,0.2);
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            font-weight: 500;
        }
        .data-quality-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .quality-metric {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            border: 2px solid #e9ecef;
        }
        .quality-score {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        .footer { 
            margin-top: 60px; 
            padding-top: 30px; 
            border-top: 2px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        @media print {
            body { margin: 0; padding: 20px; }
            .header { margin-bottom: 30px; }
            .section { page-break-inside: avoid; }
        }
        @media (max-width: 768px) {
            .metadata-grid { grid-template-columns: 1fr; }
            .goals-grid { grid-template-columns: 1fr; }
            .data-quality-grid { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">${analysis.file_name || "Data Analysis Report"}</div>
        <div class="subtitle">Professional ${(analysis.analysis_role || "business").replace("_", " ").toUpperCase()} Analysis</div>
        <div class="subtitle">Generated by DaytaTech.ai Analytics Platform</div>
        ${
          userContext.company
            ? `
        <div class="company-info">
            <h3>${userContext.company}</h3>
            <p>${userContext.industry || "Industry Analysis"} • ${userContext.companySize || "Enterprise"}</p>
        </div>
        `
            : ""
        }
    </div>

    <div class="metadata">
        <div class="metadata-grid">
            <div class="metadata-item"><strong>Generated:</strong> <span>${new Date(analysis.created_at).toLocaleDateString()}</span></div>
            <div class="metadata-item"><strong>Company:</strong> <span>${userContext.company || "N/A"}</span></div>
            <div class="metadata-item"><strong>Industry:</strong> <span>${userContext.industry || "N/A"}</span></div>
            <div class="metadata-item"><strong>Analysis Role:</strong> <span>${(analysis.analysis_role || "N/A").replace("_", " ")}</span></div>
            <div class="metadata-item"><strong>Company Size:</strong> <span>${userContext.companySize || "N/A"}</span></div>
            <div class="metadata-item"><strong>Status:</strong> <span class="badge">${analysis.status}</span></div>
        </div>
    </div>

    ${
      userGoals && userGoals.length > 0
        ? `
    <div class="goals-section">
        <h3 style="margin: 0 0 15px 0;">Analysis Goals & Objectives</h3>
        <div class="goals-grid">
            ${userGoals.map((goal: string) => `<div class="goal-item">${goal}</div>`).join("")}
        </div>
    </div>
    `
        : ""
    }

    <div class="section">
        <div class="section-title">Executive Summary</div>
        <p style="font-size: 16px; margin-bottom: 20px;">${executiveSummary.overview || analysis.summary || "Executive summary will be generated based on your data analysis."}</p>
        
        ${
          executiveSummary.keyFindings && executiveSummary.keyFindings.length > 0
            ? `
        <div style="margin-top: 30px;">
            <h4 style="color: #667eea; margin-bottom: 15px; font-size: 18px;">Key Findings:</h4>
            <ul style="padding-left: 20px;">
                ${executiveSummary.keyFindings.map((finding: string) => `<li style="margin: 10px 0; font-size: 15px;">${finding}</li>`).join("")}
            </ul>
        </div>
        `
            : ""
        }

        ${
          executiveSummary.businessImpact
            ? `
        <div style="margin-top: 30px; padding: 20px; background: #e3f2fd; border-radius: 10px; border-left: 5px solid #1976d2;">
            <h4 style="color: #1976d2; margin: 0 0 10px 0;">Business Impact:</h4>
            <p style="margin: 0; font-size: 15px;">${executiveSummary.businessImpact}</p>
        </div>
        `
            : ""
        }
    </div>

    ${
      detailedInsights && detailedInsights.length > 0
        ? `
    <div class="section">
        <div class="section-title">Detailed Insights</div>
        ${detailedInsights
          .map(
            (insight: any, index: number) => `
        <div class="insight">
            <div class="insight-title">${index + 1}. ${insight.title || insight.finding || "Key Insight"}</div>
            <p style="margin-bottom: 15px;">${insight.content || insight.finding || ""}</p>
            ${insight.impact ? `<p style="margin-bottom: 10px;"><strong>Impact:</strong> ${insight.impact}</p>` : ""}
            ${insight.confidence ? `<p style="margin-bottom: 10px;"><strong>Confidence:</strong> ${Math.round(insight.confidence * 100)}%</p>` : ""}
            ${insight.supporting_data ? `<p><strong>Supporting Data:</strong> ${insight.supporting_data}</p>` : ""}
        </div>
        `,
          )
          .join("")}
    </div>
    `
        : ""
    }

    ${
      roleRecommendations && roleRecommendations.length > 0
        ? `
    <div class="section">
        <div class="section-title">Strategic Recommendations</div>
        ${roleRecommendations
          .map(
            (rec: any, index: number) => `
        <div class="recommendation">
            <div class="rec-title">${index + 1}. ${rec.title || rec.recommendation || "Recommendation"}</div>
            <p style="margin-bottom: 15px;">${rec.description || rec.implementation || ""}</p>
            ${rec.impact ? `<p style="margin-bottom: 10px;"><strong>Impact:</strong> <span class="badge">${rec.impact}</span></p>` : ""}
            ${rec.timeline ? `<p style="margin-bottom: 10px;"><strong>Timeline:</strong> ${rec.timeline}</p>` : ""}
            ${rec.resources_required ? `<p><strong>Resources Required:</strong> ${rec.resources_required}</p>` : ""}
        </div>
        `,
          )
          .join("")}
    </div>
    `
        : ""
    }

    ${
      dataQuality && Object.keys(dataQuality).length > 0
        ? `
    <div class="section">
        <div class="section-title">Data Quality Assessment</div>
        <div class="data-quality-grid">
            ${Object.entries(dataQuality)
              .map(
                ([key, value]) => `
            <div class="quality-metric">
                <div class="quality-score">${typeof value === "number" ? Math.round(value) : value}${typeof value === "number" && value <= 100 ? "%" : ""}</div>
                <div style="font-weight: 500;">${key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}</div>
            </div>
            `,
              )
              .join("")}
        </div>
    </div>
    `
        : ""
    }

    <div class="footer">
        <p><strong>Generated by DaytaTech.ai Analytics Platform</strong> | ${new Date().toLocaleDateString()}</p>
        <p style="margin: 10px 0;">This report contains confidential business information. Handle with care.</p>
        <p>For questions about this analysis, contact support@daytatech.ai</p>
    </div>
</body>
</html>`

  const fileName = `${(userContext.company || analysis.file_name || "analysis").replace(/[^a-zA-Z0-9]/g, "_")}_analysis_${Date.now()}.${format === "pdf" ? "html" : "pdf"}`

  return { content: htmlContent, fileName }
}

// Word document generation (HTML format that can be opened by Word)
function generateWordDocument(analysis: any) {
  const insights = analysis.insights || {}
  const executiveSummary = insights.executive_summary || {}
  const userContext = insights.user_context || {}

  const wordContent = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="UTF-8">
    <title>${analysis.file_name} - Analysis Report</title>
    <!--[if gte mso 9]>
    <xml>
        <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>90</w:Zoom>
            <w:DoNotPromptForConvert/>
            <w:DoNotShowInsertionsAndDeletions/>
        </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
        body { font-family: 'Calibri', sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #2E75B6; font-size: 24pt; margin-bottom: 20px; }
        h2 { color: #2E75B6; font-size: 18pt; margin: 20px 0 10px 0; }
        h3 { color: #2E75B6; font-size: 14pt; margin: 15px 0 8px 0; }
        p { margin: 10px 0; font-size: 11pt; }
        ul { margin: 10px 0; padding-left: 20px; }
        li { margin: 5px 0; font-size: 11pt; }
        .header { text-align: center; margin-bottom: 40px; }
        .metadata { background: #F2F2F2; padding: 20px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${analysis.file_name} - Professional Analysis Report</h1>
        <p><strong>Company:</strong> ${userContext.company || "N/A"}</p>
        <p><strong>Industry:</strong> ${userContext.industry || "N/A"}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="metadata">
        <h3>Analysis Details</h3>
        <p><strong>Analysis Role:</strong> ${(analysis.analysis_role || "N/A").replace("_", " ")}</p>
        <p><strong>Company Size:</strong> ${userContext.companySize || "N/A"}</p>
        <p><strong>Status:</strong> ${analysis.status}</p>
    </div>
    
    <h2>Executive Summary</h2>
    <p>${executiveSummary.overview || analysis.summary || "Analysis summary"}</p>
    
    <h2>Key Findings</h2>
    ${
      executiveSummary.keyFindings
        ? `
    <ul>
        ${executiveSummary.keyFindings.map((finding: string) => `<li>${finding}</li>`).join("")}
    </ul>
    `
        : "<p>Key findings will be listed here.</p>"
    }
    
    <h2>Strategic Recommendations</h2>
    ${
      executiveSummary.strategicRecommendations
        ? `
    <ul>
        ${executiveSummary.strategicRecommendations.map((rec: string) => `<li>${rec}</li>`).join("")}
    </ul>
    `
        : "<p>Strategic recommendations will be listed here.</p>"
    }
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; font-size: 10pt; color: #666;">
        <p><em>Generated by DaytaTech.ai Analytics Platform on ${new Date().toLocaleDateString()}</em></p>
    </div>
</body>
</html>`

  const fileName = `${(userContext.company || analysis.file_name || "analysis").replace(/[^a-zA-Z0-9]/g, "_")}_analysis_${Date.now()}.doc`

  return { content: wordContent, fileName }
}

// Excel spreadsheet generation (CSV format)
function generateExcelSpreadsheet(analysis: any) {
  const insights = analysis.insights || {}
  const detailedInsights = insights.detailed_insights || []
  const userContext = insights.user_context || {}

  let csvContent = "Analysis Report\n\n"
  csvContent += `Company,"${userContext.company || "N/A"}"\n`
  csvContent += `Industry,"${userContext.industry || "N/A"}"\n`
  csvContent += `Analysis Date,"${new Date(analysis.created_at).toLocaleDateString()}"\n`
  csvContent += `Analysis Role,"${(analysis.analysis_role || "N/A").replace("_", " ")}"\n\n`

  csvContent += "Detailed Insights\n"
  csvContent += "Title,Content,Impact,Confidence\n"

  detailedInsights.forEach((insight: any) => {
    const title = (insight.title || insight.finding || "").replace(/"/g, '""')
    const content = (insight.content || insight.finding || "").replace(/"/g, '""')
    const impact = (insight.impact || "").replace(/"/g, '""')
    const confidence = insight.confidence ? Math.round(insight.confidence * 100) + "%" : ""

    csvContent += `"${title}","${content}","${impact}","${confidence}"\n`
  })

  const fileName = `${(userContext.company || analysis.file_name || "analysis").replace(/[^a-zA-Z0-9]/g, "_")}_analysis_${Date.now()}.csv`

  return { content: csvContent, fileName }
}

// PowerPoint presentation generation (HTML format)
function generatePowerPointPresentation(analysis: any) {
  const insights = analysis.insights || {}
  const executiveSummary = insights.executive_summary || {}
  const userContext = insights.user_context || {}

  const pptContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${analysis.file_name} - Analysis Presentation</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; }
        .slide { 
            width: 100vw; 
            height: 100vh; 
            padding: 60px; 
            page-break-after: always; 
            display: flex;
            flex-direction: column;
            justify-content: center;
            box-sizing: border-box;
        }
        .slide h1 { color: #2E75B6; font-size: 48px; margin-bottom: 30px; text-align: center; }
        .slide h2 { color: #333; font-size: 36px; margin-bottom: 20px; text-align: center; }
        .slide h3 { color: #2E75B6; font-size: 28px; margin-bottom: 20px; }
        .slide p { font-size: 20px; line-height: 1.6; margin: 15px 0; }
        .slide ul { font-size: 18px; line-height: 1.8; }
        .slide li { margin: 10px 0; }
        .title-slide { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .content-slide { background: #f8f9fa; }
        .footer { position: absolute; bottom: 30px; right: 60px; font-size: 14px; color: #666; }
    </style>
</head>
<body>
    <div class="slide title-slide">
        <h1>${userContext.company || "Company"} Data Analysis</h1>
        <h2>${userContext.industry || "Industry"} Analysis Report</h2>
        <h3 style="text-align: center; margin-top: 40px;">Generated by DaytaTech.ai</h3>
        <p style="text-align: center; font-size: 18px;">Date: ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="slide content-slide">
        <h1>Executive Summary</h1>
        <p>${executiveSummary.overview || analysis.summary || "Executive summary content"}</p>
        <div class="footer">DaytaTech.ai Analytics Platform</div>
    </div>
    
    <div class="slide content-slide">
        <h1>Key Findings</h1>
        ${
          executiveSummary.keyFindings
            ? `
        <ul>
            ${executiveSummary.keyFindings.map((finding: string) => `<li>${finding}</li>`).join("")}
        </ul>
        `
            : "<p>Key findings will be presented here.</p>"
        }
        <div class="footer">DaytaTech.ai Analytics Platform</div>
    </div>
    
    <div class="slide content-slide">
        <h1>Strategic Recommendations</h1>
        ${
          executiveSummary.strategicRecommendations
            ? `
        <ul>
            ${executiveSummary.strategicRecommendations.map((rec: string) => `<li>${rec}</li>`).join("")}
        </ul>
        `
            : "<p>Strategic recommendations will be presented here.</p>"
        }
        <div class="footer">DaytaTech.ai Analytics Platform</div>
    </div>
    
    <div class="slide content-slide">
        <h1>Next Steps</h1>
        ${
          executiveSummary.nextSteps
            ? `
        <ul>
            ${executiveSummary.nextSteps.map((step: string) => `<li>${step}</li>`).join("")}
        </ul>
        `
            : "<p>Next steps will be outlined here.</p>"
        }
        <div class="footer">DaytaTech.ai Analytics Platform</div>
    </div>
</body>
</html>`

  const fileName = `${(userContext.company || analysis.file_name || "analysis").replace(/[^a-zA-Z0-9]/g, "_")}_presentation_${Date.now()}.html`

  return { content: pptContent, fileName }
}

function generateJSON(analysis: any) {
  const exportData = {
    metadata: {
      id: analysis.id,
      fileName: analysis.file_name,
      generated: analysis.created_at,
      company: analysis.insights?.user_context?.company,
      industry: analysis.insights?.user_context?.industry,
      analysisRole: analysis.analysis_role,
      status: analysis.status,
      exportedAt: new Date().toISOString(),
    },
    summary: analysis.summary,
    executiveSummary: analysis.insights?.executive_summary,
    insights: analysis.insights?.detailed_insights || [],
    recommendations: analysis.insights?.role_recommendations || [],
    dataQuality: analysis.insights?.data_quality_report,
    userContext: analysis.insights?.user_context,
    userGoals: analysis.insights?.user_goals,
    processingMetrics: analysis.insights?.processing_metrics,
  }

  const fileName = `${(analysis.insights?.user_context?.company || analysis.file_name || "analysis").replace(/[^a-zA-Z0-9]/g, "_")}_data_${Date.now()}.json`
  const content = JSON.stringify(exportData, null, 2)

  return { content, fileName }
}
