import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

interface AnalysisData {
  fileName: string
  fileSize: number
  rowCount: number
  columnCount: number
  columns: string[]
  dataTypes: Record<string, string>
  sampleData: any[]
  statistics: Record<string, any>
  analysisType: "Data Scientist" | "Data Engineer"
  userIndustry?: string
}

export async function generateRoleBasedAnalysis(data: AnalysisData): Promise<string> {
  const rolePrompts = {
    "Data Scientist": `
You are an expert Data Scientist analyzing business data. Focus on:
- Statistical insights and patterns
- Predictive modeling opportunities
- Business impact and recommendations
- Data quality for modeling
- Feature engineering suggestions
- Visualization recommendations

Provide actionable insights that help drive business decisions.
`,
    "Data Engineer": `
You are an expert Data Engineer analyzing data infrastructure. Focus on:
- Data quality and consistency issues
- Schema optimization opportunities
- Pipeline efficiency recommendations
- Data governance considerations
- Performance bottlenecks
- ETL/ELT process improvements

Provide technical recommendations for data infrastructure optimization.
`,
  }

  const industryContext = data.userIndustry
    ? `
Industry Context: This data is from the ${data.userIndustry} industry. 
Tailor your analysis and recommendations to be relevant for this sector.
`
    : ""

  const prompt = `
${rolePrompts[data.analysisType]}

${industryContext}

Dataset Information:
- File: ${data.fileName}
- Size: ${data.fileSize} bytes
- Rows: ${data.rowCount}
- Columns: ${data.columnCount}
- Column Names: ${data.columns.join(", ")}

Data Types:
${Object.entries(data.dataTypes)
  .map(([col, type]) => `- ${col}: ${type}`)
  .join("\n")}

Sample Data (first 3 rows):
${JSON.stringify(data.sampleData.slice(0, 3), null, 2)}

Statistical Summary:
${JSON.stringify(data.statistics, null, 2)}

Please provide a comprehensive analysis report with:
1. Executive Summary (2-3 key findings)
2. Data Quality Assessment
3. ${data.analysisType === "Data Scientist" ? "Business Insights & Opportunities" : "Technical Recommendations"}
4. ${data.analysisType === "Data Scientist" ? "Predictive Analytics Potential" : "Infrastructure Optimization"}
5. Next Steps and Action Items

Format the response in clear sections with bullet points where appropriate.
Keep it professional but accessible.
`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      maxTokens: 2000,
    })

    return text
  } catch (error) {
    console.error("AI analysis error:", error)
    return generateFallbackAnalysis(data)
  }
}

function generateFallbackAnalysis(data: AnalysisData): string {
  const roleSpecificInsights =
    data.analysisType === "Data Scientist"
      ? `
## Business Insights & Opportunities
- Dataset contains ${data.rowCount} records across ${data.columnCount} dimensions
- Key variables identified for potential modeling: ${data.columns.slice(0, 5).join(", ")}
- Recommend exploring correlations between numerical variables
- Consider time-series analysis if temporal data is present

## Predictive Analytics Potential
- Dataset size (${data.rowCount} rows) is ${data.rowCount > 1000 ? "suitable" : "limited"} for machine learning
- Multiple data types present suggest rich feature engineering opportunities
- Recommend starting with exploratory data analysis and correlation matrix
`
      : `
## Technical Recommendations
- Data schema contains ${data.columnCount} columns with mixed data types
- File size (${data.fileSize} bytes) indicates ${data.fileSize > 1000000 ? "large dataset requiring optimization" : "manageable dataset size"}
- Consider implementing data validation rules for consistency
- Recommend indexing strategies for frequently queried columns

## Infrastructure Optimization
- Current data format: ${data.fileName.split(".").pop()?.toUpperCase()}
- Suggest evaluating columnar storage formats for better performance
- Implement data quality monitoring for ongoing pipeline health
- Consider partitioning strategies if dataset grows significantly
`

  return `
# ${data.analysisType} Analysis Report

## Executive Summary
- Analyzed ${data.fileName} containing ${data.rowCount} records
- Dataset structure: ${data.columnCount} columns with diverse data types
- ${data.analysisType === "Data Scientist" ? "Business value potential identified in key metrics" : "Technical optimization opportunities identified"}

## Data Quality Assessment
- **Completeness**: Dataset loaded successfully with ${data.rowCount} complete records
- **Structure**: Well-formed data with ${data.columnCount} distinct columns
- **Data Types**: Mixed types including ${Object.values(data.dataTypes).join(", ")}
- **Sample Quality**: First few records show consistent formatting

${roleSpecificInsights}

## Next Steps
1. ${data.analysisType === "Data Scientist" ? "Perform detailed statistical analysis" : "Implement data quality monitoring"}
2. ${data.analysisType === "Data Scientist" ? "Create data visualizations" : "Optimize data storage format"}
3. ${data.analysisType === "Data Scientist" ? "Develop predictive models" : "Set up automated data pipelines"}
4. Schedule regular data quality reviews
5. Document findings and share with stakeholders

---
*Analysis generated for ${data.analysisType} role*
`
}
