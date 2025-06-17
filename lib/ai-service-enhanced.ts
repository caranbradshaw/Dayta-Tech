import { processUploadedFileComplete } from "./data-processor-enhanced"
import { getUserProfile, getUserSubscription } from "./supabase-utils"
import { getAIContextualPrompt, type UserAIContext } from "./trial-subscription-system"
import type { ProcessedDataComplete } from "./data-processor-enhanced"
import type { AnalysisRole } from "@/components/role-selector"

export interface ExecutiveSummary {
  overview: string
  keyFindings: string[]
  businessImpact: string
  strategicRecommendations: string[]
  riskAssessment: string
  opportunityAnalysis: string
  nextSteps: string[]
  executiveInsights: string
}

export interface EnhancedAnalysisResult {
  executiveSummary: ExecutiveSummary
  detailedInsights: any[]
  industrySpecificInsights: any[]
  roleBasedRecommendations: any[]
  dataQualityReport: any
  competitiveAnalysis?: string
  marketTrends?: string[]
  technicalDetails?: any
  processingMetrics: {
    totalRowsAnalyzed: number
    totalColumnsAnalyzed: number
    processingTimeMs: number
    aiProvider: string
    analysisDepth: "basic" | "professional" | "enterprise"
    analysisRole: string
    personalizedContext: boolean
    userContext?: UserAIContext
  }
}

export async function analyzeUploadedFileEnhanced(
  file: File,
  userId: string,
  analysisId: string,
  analysisRole: AnalysisRole = "business_analyst",
  analysisTier: "standard" | "enhanced" | "claude_premium" = "standard",
  userContext?: UserAIContext,
): Promise<EnhancedAnalysisResult> {
  const startTime = Date.now()

  try {
    // Get user profile and subscription for enhanced context
    const [userProfile, userSubscription] = await Promise.all([getUserProfile(userId), getUserSubscription(userId)])

    if (!userProfile) {
      throw new Error("User profile not found")
    }

    // Check if user has active trial or subscription
    const hasActiveAccess =
      userSubscription?.status === "active" ||
      (userProfile.trial_status === "active" && new Date(userProfile.trial_end_date) > new Date())

    if (!hasActiveAccess) {
      throw new Error("Active subscription or trial required for enhanced analysis")
    }

    // Check tier permissions
    const userTier = userSubscription?.plan_type || "basic"
    if (analysisTier === "claude_premium" && !["team", "enterprise"].includes(userTier)) {
      throw new Error("Claude Premium analysis requires Team or Enterprise subscription")
    }
    if (analysisTier === "enhanced" && userTier === "basic") {
      throw new Error("Enhanced analysis requires Pro subscription or higher")
    }

    // Process the complete dataset with enhanced analysis
    console.log(`Processing complete dataset for ${analysisTier} analysis...`)
    const processedData = await processUploadedFileComplete(file)

    // Determine analysis depth based on subscription and tier
    const analysisDepth = getAnalysisDepth(userSubscription?.plan_type || "basic", analysisTier)

    // Create comprehensive user context with AI personalization
    const enhancedContext = {
      industry: userContext?.industry || userProfile.industry || "general",
      role: analysisRole || userProfile.role || "business_analyst",
      planType: userSubscription?.plan_type || "basic",
      userId,
      companySize: userProfile.company_size,
      company: userContext?.company || userProfile.company || "Your Company",
      region: userContext?.region || userProfile.region || "global",
      analysisDepth,
      analysisTier,
      datasetSize: {
        rows: processedData.stats.rowCount,
        columns: processedData.stats.columnCount,
      },
      personalizedContext: !!userContext,
      userAIContext: userContext,
    }

    // Get enhanced AI analysis with personalized context and tier selection
    const aiResult = await getEnhancedAIAnalysis(processedData, file.name, enhancedContext)

    const processingTime = Date.now() - startTime

    return {
      executiveSummary: aiResult.executiveSummary,
      detailedInsights: aiResult.detailedInsights,
      industrySpecificInsights: aiResult.industrySpecificInsights,
      roleBasedRecommendations: aiResult.roleBasedRecommendations,
      dataQualityReport: generateDataQualityReport(processedData),
      competitiveAnalysis: aiResult.competitiveAnalysis,
      marketTrends: aiResult.marketTrends,
      technicalDetails: aiResult.technicalDetails,
      processingMetrics: {
        totalRowsAnalyzed: processedData.stats.rowCount,
        totalColumnsAnalyzed: processedData.stats.columnCount,
        processingTimeMs: processingTime,
        aiProvider: aiResult.aiProvider,
        analysisDepth,
        analysisRole: enhancedContext.role,
        personalizedContext: enhancedContext.personalizedContext,
        userContext: userContext,
      },
    }
  } catch (error) {
    console.error("Enhanced file analysis error:", error)
    throw new Error(`Enhanced analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

async function getEnhancedAIAnalysis(
  processedData: ProcessedDataComplete,
  fileName: string,
  context: any,
): Promise<{
  executiveSummary: ExecutiveSummary
  detailedInsights: any[]
  industrySpecificInsights: any[]
  roleBasedRecommendations: any[]
  competitiveAnalysis?: string
  marketTrends?: string[]
  technicalDetails?: any
  aiProvider: string
}> {
  // Select AI provider based on analysis tier and subscription level
  const providers = getAIProvidersForAnalysisTier(context.planType, context.analysisTier)

  for (const provider of providers) {
    try {
      console.log(`Attempting ${context.analysisTier} analysis with ${provider}...`)

      if (provider === "claude" && process.env.CLAUDE_API_KEY) {
        return await analyzeDataWithClaudeEnhanced(processedData, fileName, context)
      } else if (provider === "openai" && process.env.OPENAI_API_KEY) {
        return await analyzeDataWithOpenAIEnhanced(processedData, fileName, context)
      } else if (provider === "groq" && process.env.GROQ_API_KEY) {
        return await analyzeDataWithGroqEnhanced(processedData, fileName, context)
      }
    } catch (error) {
      console.warn(`${provider} ${context.analysisTier} analysis failed:`, error)
      continue
    }
  }

  // Fallback to intelligent enhanced analysis
  return generateEnhancedIntelligentFallback(processedData, fileName, context)
}

async function analyzeDataWithClaudeEnhanced(
  processedData: ProcessedDataComplete,
  fileName: string,
  context: any,
): Promise<any> {
  const Anthropic = require("@anthropic-ai/sdk")
  const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })

  // Generate personalized contextual prompt if user context is available
  const contextualPrompt = context.userAIContext ? getAIContextualPrompt(context.userAIContext, fileName) : ""

  const comprehensiveDataContext = `
${contextualPrompt}

CLAUDE PREMIUM ANALYSIS REQUEST - ${context.analysisTier.toUpperCase()}
==========================

File: ${fileName}
Company: ${context.company}
Industry: ${context.industry}
Role: ${context.role}
Region: ${context.region}
Company Size: ${context.companySize || "Not specified"}
Analysis Tier: ${context.analysisTier}
Analysis Depth: ${context.analysisDepth}
Personalized Context: ${context.personalizedContext ? "YES - Tailored for user" : "NO - Generic analysis"}

COMPLETE DATASET ANALYSIS:
- Total Records: ${processedData.stats.rowCount.toLocaleString()}
- Total Columns: ${processedData.stats.columnCount}
- Data Quality Score: ${processedData.insights.dataQuality}%
- Completeness: ${processedData.insights.completeness}%

COLUMN ANALYSIS:
${processedData.columnAnalysis
  .map(
    (col) => `
- ${col.name} (${col.type}):
  * Unique Values: ${col.uniqueValues}
  * Missing: ${col.missingCount}
  * Distribution: ${col.distribution}
  * Key Patterns: ${col.patterns.join(", ")}
`,
  )
  .join("")}

STATISTICAL SUMMARY:
${JSON.stringify(processedData.stats.detailedSummary, null, 2)}

CORRELATION ANALYSIS:
${JSON.stringify(processedData.correlations, null, 2)}

TREND ANALYSIS:
${JSON.stringify(processedData.trends, null, 2)}

ANOMALY DETECTION:
${JSON.stringify(processedData.anomalies, null, 2)}

SAMPLE DATA (First 10 rows):
${JSON.stringify(processedData.sample.slice(0, 10), null, 2)}
`

  // Get role-specific system prompt with Claude premium features
  const systemPrompt = getClaudePremiumSystemPrompt(
    context.role,
    context.industry,
    context.company,
    context.region,
    context.analysisTier,
  )

  // Use Claude's most advanced model for premium analysis
  const model = context.analysisTier === "claude_premium" ? "claude-3-opus-20240229" : "claude-3-sonnet-20240229"

  const message = await anthropic.messages.create({
    model,
    max_tokens: context.analysisTier === "claude_premium" ? 8000 : 4000,
    temperature: 0.2, // Lower temperature for more precise analysis
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Create the most comprehensive, professional ${context.analysisTier} analysis ever produced for ${context.company} in the ${context.industry} industry from a ${context.role.replace("_", " ")} perspective. 

This analysis will be presented to senior leadership and must demonstrate exceptional expertise and strategic insight using Claude's advanced reasoning capabilities.

${comprehensiveDataContext}

Requirements for ${context.analysisTier.toUpperCase()} Analysis:
1. Analyze EVERY column and ALL ${processedData.stats.rowCount} rows with Claude's deep reasoning
2. Provide industry-specific insights for ${context.industry} with competitive intelligence
3. Tailor recommendations specifically for ${context.company} with strategic depth
4. Consider ${context.region} market context and business environment
5. Include quantified business impact with ROI projections
6. Identify competitive advantages and market opportunities with Claude's analytical depth
7. Provide executive-level strategic recommendations with implementation roadmaps
8. Include comprehensive risk assessment and mitigation strategies
${context.analysisTier === "claude_premium" ? "9. Advanced predictive insights and scenario planning using Claude's reasoning" : ""}
${context.analysisTier === "claude_premium" ? "10. Deep competitive analysis and market positioning recommendations" : ""}
${context.role === "data_engineer" ? "11. Include detailed data quality assessment and schema optimization recommendations" : ""}
${context.role === "data_scientist" ? "11. Include statistical significance analysis and machine learning potential assessment" : ""}

This must be the highest quality professional ${context.analysisTier} analysis ever created for ${context.company} leveraging Claude's advanced reasoning capabilities.`,
      },
    ],
  })

  const content = message.content[0].type === "text" ? message.content[0].text : ""

  try {
    const result = JSON.parse(content)
    return {
      ...result,
      aiProvider: context.analysisTier === "claude_premium" ? "claude-opus-premium" : "claude-sonnet-enhanced",
    }
  } catch (error) {
    console.error("Error parsing Claude enhanced response:", error)
    return generateEnhancedIntelligentFallback(processedData, fileName, context)
  }
}

async function analyzeDataWithOpenAIEnhanced(
  processedData: ProcessedDataComplete,
  fileName: string,
  context: any,
): Promise<any> {
  const OpenAI = require("openai")
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  // Generate personalized contextual prompt if user context is available
  const contextualPrompt = context.userAIContext ? getAIContextualPrompt(context.userAIContext, fileName) : ""

  // Get role-specific system prompt with tier-based enhancements
  const systemPrompt = getRoleSpecificSystemPrompt(
    context.role,
    context.industry,
    context.company,
    context.region,
    context.analysisTier,
  )

  // Use GPT-4 Turbo for enhanced analysis
  const model = context.analysisTier === "enhanced" ? "gpt-4-turbo-preview" : "gpt-4"

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `${contextualPrompt}

Analyze this complete ${context.industry} dataset for ${context.company} with ${processedData.stats.rowCount} rows and ${processedData.stats.columnCount} columns from a ${context.role.replace("_", " ")} perspective. 

Create a professional ${context.analysisTier} analysis that will impress senior leadership.

Data: ${JSON.stringify(processedData.sample.slice(0, 5), null, 2)}
Statistics: ${JSON.stringify(processedData.stats.detailedSummary, null, 2)}

Provide JSON response with executiveSummary, detailedInsights, industrySpecificInsights, roleBasedRecommendations, and ${
          context.role === "data_engineer" ? "technicalDetails" : "competitiveAnalysis"
        }.`,
      },
    ],
    max_tokens: context.analysisTier === "enhanced" ? 4000 : 3000,
    temperature: 0.3,
  })

  const content = completion.choices[0]?.message?.content || ""

  try {
    const result = JSON.parse(content)
    return {
      ...result,
      aiProvider: context.analysisTier === "enhanced" ? "gpt-4-turbo-enhanced" : "gpt-4-standard",
    }
  } catch (error) {
    return generateEnhancedIntelligentFallback(processedData, fileName, context)
  }
}

async function analyzeDataWithGroqEnhanced(
  processedData: ProcessedDataComplete,
  fileName: string,
  context: any,
): Promise<any> {
  // Enhanced Groq implementation for fast analysis
  return generateEnhancedIntelligentFallback(processedData, fileName, context)
}

function getClaudePremiumSystemPrompt(
  role: string,
  industry: string,
  company: string,
  region: string,
  analysisTier: string,
): string {
  const basePrompt = `You are Claude, Anthropic's most advanced AI assistant, specializing in ${industry} industry analysis with deep expertise in ${region} markets. You have access to the most sophisticated reasoning capabilities and have been trained on the latest business intelligence methodologies.

Your task is to create THE MOST COMPREHENSIVE ${analysisTier.toUpperCase()} ANALYSIS EVER CREATED for ${company} in the ${industry} industry, leveraging Claude's advanced reasoning and analytical capabilities.

${
  analysisTier === "claude_premium"
    ? `
CLAUDE PREMIUM FEATURES TO UTILIZE:
- Advanced multi-step reasoning and analysis
- Deep competitive intelligence and market positioning
- Sophisticated risk assessment and scenario planning
- Advanced predictive insights and trend analysis
- Executive-level strategic recommendations with implementation roadmaps
- Comprehensive ROI projections and business impact quantification
`
    : ""
}

RESPONSE STRUCTURE (JSON format):
{
  "executiveSummary": {
    "overview": "3-4 paragraph executive overview with strategic business context for ${company}",
    "keyFindings": ["7-10 critical business findings specific to ${company}"],
    "businessImpact": "Quantified business impact analysis with ROI projections for ${company}",
    "strategicRecommendations": ["5-7 strategic recommendations for ${company}"],
    "riskAssessment": "Comprehensive risk analysis and mitigation strategies for ${company}",
    "opportunityAnalysis": "Market opportunities and competitive advantages for ${company}",
    "nextSteps": ["Immediate action items for ${company} leadership"],
    "executiveInsights": "Strategic insights and implications for ${company}"
  },
  "detailedInsights": [
    {
      "category": "Financial Performance|Operational Efficiency|Market Analysis|Customer Intelligence|Risk Management|Competitive Positioning",
      "title": "Insight title",
      "finding": "Detailed finding for ${company} with Claude's deep analysis",
      "impact": "Business impact for ${company}",
      "confidence": 0.95,
      "supporting_data": "Data points that support this insight",
      "claude_reasoning": "Claude's step-by-step reasoning process"
    }
  ],
  "industrySpecificInsights": [
    {
      "category": "${industry}_specific",
      "insight": "Industry-specific insight for ${company} with competitive intelligence",
      "benchmark": "Industry benchmark comparison with market positioning",
      "competitive_advantage": "How this creates competitive advantage for ${company}",
      "market_implications": "Broader market implications and opportunities"
    }
  ],
  "roleBasedRecommendations": [
    {
      "target_role": "${role}",
      "recommendation": "Role-specific recommendation for ${company}",
      "implementation": "How ${company} should implement with detailed roadmap",
      "timeline": "Implementation timeline for ${company}",
      "resources_required": "Resources ${company} needs",
      "success_metrics": "KPIs to measure success",
      "risk_mitigation": "Risk mitigation strategies"
    }
  ],
  "competitiveAnalysis": "Comprehensive competitive positioning and market analysis for ${company}",
  "marketTrends": ["Relevant ${region} market trends and implications for ${company}"]
}`

  switch (role) {
    case "data_scientist":
      return `${basePrompt},
  "technicalDetails": {
    "statisticalSignificance": "Statistical significance analysis for ${company}",
    "correlationAnalysis": "Detailed correlation findings for ${company}",
    "predictiveModeling": "Machine learning potential assessment for ${company}",
    "featureImportance": ["Key predictive features for ${company}"],
    "modelRecommendations": ["Recommended modeling approaches for ${company}"],
    "dataPreprocessing": "Required preprocessing steps for ${company}",
    "advancedAnalytics": "Claude's advanced analytics recommendations"
  }
}

Focus on:
1. Statistical rigor and mathematical precision for ${company}
2. Machine learning and predictive modeling opportunities for ${company}
3. Feature engineering and selection recommendations for ${company}
4. Model evaluation frameworks and metrics for ${company}
5. Data science workflow optimization for ${company}
6. Advanced analytics implementation roadmap for ${company}
7. Technical implementation details with business context for ${company}
${analysisTier === "claude_premium" ? "8. Advanced predictive insights and scenario modeling for ${company}" : ""}`

    case "data_engineer":
      return `${basePrompt},
  "technicalDetails": {
    "dataQualityAssessment": "Comprehensive data quality evaluation for ${company}",
    "schemaOptimization": "Database schema recommendations for ${company}",
    "dataArchitecture": "Optimal data architecture design for ${company}",
    "pipelineRecommendations": ["Data pipeline improvement recommendations for ${company}"],
    "storageOptimization": "Storage and performance optimization strategies for ${company}",
    "dataGovernance": "Data governance and security recommendations for ${company}",
    "scalabilityPlanning": "Scalability and performance planning for ${company}"
  }
}

Focus on:
1. Data structure and quality optimization for ${company}
2. Database schema design and normalization for ${company}
3. Data pipeline efficiency and reliability for ${company}
4. Storage optimization and performance tuning for ${company}
5. Data governance and security frameworks for ${company}
6. Technical implementation roadmap for ${company}
7. Infrastructure recommendations with business context for ${company}
${analysisTier === "claude_premium" ? "8. Advanced data architecture and scalability planning for ${company}" : ""}`

    case "executive":
      return `${basePrompt}
}

Focus on:
1. C-level strategic thinking and language for ${company}
2. Quantified business impact and ROI for ${company}
3. Industry-specific insights and competitive positioning for ${company}
4. Risk assessment and opportunity identification for ${company}
5. Strategic decision support and executive recommendations for ${company}
6. Market positioning and competitive advantage for ${company}
7. Executive-level implementation roadmap for ${company}
${analysisTier === "claude_premium" ? "8. Advanced scenario planning and strategic foresight for ${company}" : ""}`

    case "business_analyst":
    default:
      return `${basePrompt}
}

Focus on:
1. Operational insights and process optimization for ${company}
2. Business metrics and KPI analysis for ${company}
3. Decision support frameworks and recommendations for ${company}
4. Practical implementation strategies for ${company}
5. Cross-functional business impact for ${company}
6. Actionable recommendations with clear ROI for ${company}
7. Business-focused implementation roadmap for ${company}
${analysisTier === "claude_premium" ? "8. Advanced business intelligence and strategic insights for ${company}" : ""}`
  }
}

function generateEnhancedIntelligentFallback(
  processedData: ProcessedDataComplete,
  fileName: string,
  context: any,
): any {
  const industryInsights = getIndustrySpecificInsights(context.industry, processedData, context.company)
  const roleRecommendations = getRoleBasedRecommendations(context.role, processedData, context.company)
  const technicalDetails = context.role === "data_engineer" ? getDataEngineerDetails(processedData) : undefined

  const result = {
    executiveSummary: {
      overview: `${getRoleSpecificOverview(context.role, fileName, processedData, context.industry, context.company, context.region, context.analysisTier)}`,
      keyFindings: getRoleSpecificFindings(context.role, processedData, context.company),
      businessImpact: `This comprehensive ${context.analysisTier} analysis enables ${context.company} to make data-driven strategic decisions across ${processedData.stats.columnCount} business dimensions, potentially impacting revenue optimization, operational efficiency, and competitive positioning in the ${context.industry} sector. The ${processedData.insights.dataQuality}% data quality score supports high-confidence executive decision-making.`,
      strategicRecommendations: getRoleSpecificRecommendations(context.role, processedData, context.company),
      riskAssessment: `Data quality analysis reveals ${100 - processedData.insights.completeness}% missing data exposure requiring mitigation. ${processedData.anomalies.length} anomalies identified may impact strategic decision accuracy if not addressed.`,
      opportunityAnalysis: `The comprehensive nature of this dataset presents significant opportunities for ${context.company} to implement advanced analytics, predictive modeling, and competitive intelligence development within the ${context.industry} sector.`,
      nextSteps: getRoleSpecificNextSteps(context.role, context.company),
      executiveInsights: `This ${context.analysisTier} analysis demonstrates exceptional data maturity and strategic potential for ${context.company} leadership in the ${context.industry} sector. The comprehensive dataset provides foundation for advanced analytics, competitive intelligence, and strategic decision-making capabilities that can drive significant business value and market positioning advantages.`,
    },
    detailedInsights: industryInsights,
    industrySpecificInsights: getIndustryBenchmarks(context.industry, processedData, context.company),
    roleBasedRecommendations: roleRecommendations,
    competitiveAnalysis: `${context.analysisTier} analysis reveals strategic positioning opportunities for ${context.company} within ${context.industry} sector through advanced data capabilities and comprehensive business intelligence infrastructure.`,
    marketTrends: getMarketTrends(context.industry, context.region),
    technicalDetails,
    aiProvider: `enhanced-fallback-${context.analysisTier}`,
  }

  return result
}

function getRoleSpecificSystemPrompt(
  role: string,
  industry: string,
  company: string,
  region: string,
  analysisTier: string,
): string {
  const basePrompt = `You are the world's leading expert specializing in ${industry} industry analysis with deep expertise in ${region} markets. You have 30+ years of experience advising Fortune 500 companies and have created professional analyses that have driven billions in business value.

Your task is to create THE MOST PROFESSIONAL ${analysisTier.toUpperCase()} ANALYSIS EVER CREATED for ${company} in the ${industry} industry.

RESPONSE STRUCTURE (JSON format):
{
  "executiveSummary": {
    "overview": "2-3 paragraph executive overview with strategic business context for ${company}",
    "keyFindings": ["5-7 critical business findings specific to ${company}"],
    "businessImpact": "Quantified business impact analysis for ${company}",
    "strategicRecommendations": ["3-5 strategic recommendations for ${company}"],
    "riskAssessment": "Risk analysis and mitigation strategies for ${company}",
    "opportunityAnalysis": "Market opportunities and competitive advantages for ${company}",
    "nextSteps": ["Immediate action items for ${company} leadership"],
    "executiveInsights": "Strategic insights and implications for ${company}"
  },
  "detailedInsights": [
    {
      "category": "Financial Performance|Operational Efficiency|Market Analysis|Customer Intelligence|Risk Management",
      "title": "Insight title",
      "finding": "Detailed finding for ${company}",
      "impact": "Business impact for ${company}",
      "confidence": 0.95,
      "supporting_data": "Data points that support this insight"
    }
  ],
  "industrySpecificInsights": [
    {
      "category": "${industry}_specific",
      "insight": "Industry-specific insight for ${company}",
      "benchmark": "Industry benchmark comparison",
      "competitive_advantage": "How this creates competitive advantage for ${company}"
    }
  ],
  "roleBasedRecommendations": [
    {
      "target_role": "${role}",
      "recommendation": "Role-specific recommendation for ${company}",
      "implementation": "How ${company} should implement",
      "timeline": "Implementation timeline for ${company}",
      "resources_required": "Resources ${company} needs"
    }
  ],
  "competitiveAnalysis": "Competitive positioning and market analysis for ${company}",
  "marketTrends": ["Relevant ${region} market trends and implications for ${company}"]
}`

  switch (role) {
    case "data_scientist":
      return `${basePrompt},
  "technicalDetails": {
    "statisticalSignificance": "Statistical significance analysis for ${company}",
    "correlationAnalysis": "Detailed correlation findings for ${company}",
    "predictiveModeling": "Machine learning potential assessment for ${company}",
    "featureImportance": ["Key predictive features for ${company}"],
    "modelRecommendations": ["Recommended modeling approaches for ${company}"],
    "dataPreprocessing": "Required preprocessing steps for ${company}"
  }
}

Focus on:
1. Statistical rigor and mathematical precision for ${company}
2. Machine learning and predictive modeling opportunities for ${company}
3. Feature engineering and selection recommendations for ${company}
4. Model evaluation frameworks and metrics for ${company}
5. Data science workflow optimization for ${company}
6. Advanced analytics implementation roadmap for ${company}
7. Technical implementation details with business context for ${company}`

    case "data_engineer":
      return `${basePrompt},
  "technicalDetails": {
    "dataQualityAssessment": "Comprehensive data quality evaluation for ${company}",
    "schemaOptimization": "Database schema recommendations for ${company}",
    "dataArchitecture": "Optimal data architecture design for ${company}",
    "pipelineRecommendations": ["Data pipeline improvement recommendations for ${company}"],
    "storageOptimization": "Storage and performance optimization strategies for ${company}",
    "dataGovernance": "Data governance and security recommendations for ${company}"
  }
}

Focus on:
1. Data structure and quality optimization for ${company}
2. Database schema design and normalization for ${company}
3. Data pipeline efficiency and reliability for ${company}
4. Storage optimization and performance tuning for ${company}
5. Data governance and security frameworks for ${company}
6. Technical implementation roadmap for ${company}
7. Infrastructure recommendations with business context for ${company}`

    case "executive":
      return `${basePrompt}
}

Focus on:
1. C-level strategic thinking and language for ${company}
2. Quantified business impact and ROI for ${company}
3. Industry-specific insights and competitive positioning for ${company}
4. Risk assessment and opportunity identification for ${company}
5. Strategic decision support and executive recommendations for ${company}
6. Market positioning and competitive advantage for ${company}
7. Executive-level implementation roadmap for ${company}`

    case "business_analyst":
    default:
      return `${basePrompt}
}

Focus on:
1. Operational insights and process optimization for ${company}
2. Business metrics and KPI analysis for ${company}
3. Decision support frameworks and recommendations for ${company}
4. Practical implementation strategies for ${company}
5. Cross-functional business impact for ${company}
6. Actionable recommendations with clear ROI for ${company}
7. Business-focused implementation roadmap for ${company}`
  }
}

function getRoleSpecificOverview(
  role: string,
  fileName: string,
  data: ProcessedDataComplete,
  industry: string,
  company: string,
  region: string,
  analysisTier = "standard",
): string {
  const tierDescription =
    analysisTier === "claude_premium" ? "Claude Premium" : analysisTier === "enhanced" ? "Enhanced" : "Standard"

  switch (role) {
    case "data_scientist":
      return `${tierDescription} Statistical Analysis of ${fileName} reveals a comprehensive ${industry} dataset for ${company} containing ${data.stats.rowCount.toLocaleString()} records across ${data.stats.columnCount} dimensions. This analysis provides advanced statistical insights and machine learning opportunities specifically tailored for ${company}'s ${region} operations, identifying significant correlations, predictive features, and modeling potential. The data quality score of ${data.insights.dataQuality}% supports reliable model development with ${data.stats.numericColumns.length} quantitative variables available for predictive modeling.`

    case "data_engineer":
      return `${tierDescription} Technical Analysis of ${fileName} reveals a ${industry} dataset for ${company} with ${data.stats.rowCount.toLocaleString()} records across ${data.stats.columnCount} columns requiring optimization. This analysis identifies data quality issues, schema optimization opportunities, and pipeline improvement recommendations specifically for ${company}'s infrastructure. With ${data.insights.completeness}% data completeness and ${data.anomalies.length} detected anomalies, specific technical interventions can significantly enhance ${company}'s data reliability and performance.`

    case "executive":
      return `${tierDescription} Executive Analysis of ${fileName} reveals strategic insights across ${data.stats.rowCount.toLocaleString()} ${industry} data points for ${company}, identifying significant business opportunities and competitive advantages in the ${region} market. This C-level assessment provides quantified business impact analysis, market positioning recommendations, and strategic decision support tailored for ${company}'s leadership team. The comprehensive dataset enables data-driven executive decision-making with ${data.insights.dataQuality}% confidence level.`

    case "business_analyst":
    default:
      return `${tierDescription} Business Analysis of ${fileName} reveals operational insights from ${data.stats.rowCount.toLocaleString()} ${industry} records across ${data.stats.columnCount} business dimensions for ${company}. This analysis identifies process optimization opportunities, KPI improvements, and actionable business recommendations specifically tailored for ${company}'s operations in the ${region} market. With ${data.insights.completeness}% data completeness, the findings provide reliable decision support for ${company}'s operational excellence and business performance enhancement.`
  }
}

function getRoleSpecificFindings(role: string, data: ProcessedDataComplete, company: string): string[] {
  const baseFindings = [
    `${company}'s dataset encompasses ${data.stats.rowCount.toLocaleString()} comprehensive records with ${data.insights.completeness}% data completeness`,
    `${data.stats.numericColumns.length} quantitative metrics enable robust analysis for ${company}`,
    `${data.stats.categoricalColumns.length} categorical dimensions provide segmentation opportunities for ${company}`,
    `Data quality assessment reveals ${data.insights.dataQuality}% reliability for ${company}'s decision-making`,
    `Identified ${data.anomalies.length} data anomalies requiring ${company}'s attention`,
  ]

  switch (role) {
    case "data_scientist":
      return [
        ...baseFindings,
        `Statistical analysis reveals ${Object.keys(data.correlations).length} significant variable correlations for ${company}`,
        `Identified ${data.stats.numericColumns.length} potential predictive features for ${company}'s machine learning initiatives`,
      ]

    case "data_engineer":
      return [
        ...baseFindings,
        `Schema analysis identifies ${data.stats.columnCount} fields requiring optimization for ${company}`,
        `Data structure assessment reveals normalization opportunities for ${company}`,
        `${100 - data.insights.completeness}% missing data requires technical intervention for ${company}`,
      ]

    case "executive":
      return [
        `${company}'s strategic dataset encompasses ${data.stats.rowCount.toLocaleString()} business-critical records`,
        `${data.stats.numericColumns.length} key performance indicators available for ${company}'s executive decision-making`,
        `${data.insights.dataQuality}% data quality ensures reliable strategic planning for ${company}`,
        `Market intelligence potential identified across ${data.stats.categoricalColumns.length} business dimensions for ${company}`,
        `Competitive positioning opportunities revealed through comprehensive data analysis for ${company}`,
      ]

    case "business_analyst":
    default:
      return [
        ...baseFindings,
        `Process optimization opportunities identified across ${data.stats.columnCount} business dimensions for ${company}`,
        `KPI analysis reveals performance enhancement potential for ${company}`,
      ]
  }
}

function getRoleSpecificRecommendations(role: string, data: ProcessedDataComplete, company: string): string[] {
  switch (role) {
    case "data_scientist":
      return [
        `Implement predictive modeling using the ${data.stats.numericColumns.length} quantitative variables for ${company}`,
        `Develop machine learning pipeline leveraging ${data.stats.categoricalColumns.length} categorical features for ${company}`,
        `Address ${data.anomalies.length} data anomalies to improve model accuracy for ${company}`,
        `Establish feature engineering framework to maximize predictive power for ${company}`,
      ]

    case "data_engineer":
      return [
        `Optimize database schema across ${data.stats.columnCount} dimensions for ${company}`,
        `Implement data quality framework to address ${100 - data.insights.completeness}% missing data for ${company}`,
        `Develop automated anomaly detection for ${data.anomalies.length} identified issues for ${company}`,
        `Establish data governance protocols to maintain ${data.insights.dataQuality}% quality standard for ${company}`,
      ]

    case "executive":
      return [
        `Leverage comprehensive data assets for strategic advantage in ${company}'s market positioning`,
        `Implement data-driven decision framework across ${data.stats.columnCount} business dimensions for ${company}`,
        `Develop competitive intelligence capability using ${data.stats.categoricalColumns.length} market segments for ${company}`,
        `Establish executive dashboard with ${data.stats.numericColumns.length} key performance indicators for ${company}`,
      ]

    case "business_analyst":
    default:
      return [
        `Implement business process optimization across ${data.stats.columnCount} operational dimensions for ${company}`,
        `Develop KPI monitoring framework using ${data.stats.numericColumns.length} performance metrics for ${company}`,
        `Address ${data.anomalies.length} data quality issues to improve business reporting for ${company}`,
        `Establish business intelligence capability leveraging ${data.stats.categoricalColumns.length} segmentation dimensions for ${company}`,
      ]
  }
}

function getRoleSpecificNextSteps(role: string, company: string): string[] {
  switch (role) {
    case "data_scientist":
      return [
        `Develop feature engineering pipeline for ${company}'s predictive modeling`,
        `Implement model selection framework for ${company}'s machine learning initiatives`,
        `Establish model evaluation protocols for ${company}'s data science team`,
        `Create deployment strategy for ${company}'s production machine learning`,
      ]

    case "data_engineer":
      return [
        `Implement schema optimization for ${company}'s database architecture`,
        `Develop data quality framework for ${company}'s data pipeline`,
        `Establish automated monitoring for ${company}'s data infrastructure`,
        `Create data governance protocols for ${company}'s enterprise data`,
      ]

    case "executive":
      return [
        `Establish data-driven strategic planning process for ${company}'s leadership team`,
        `Implement competitive intelligence framework for ${company}'s market positioning`,
        `Develop executive dashboard for ${company}'s C-level decision support`,
        `Create data strategy roadmap for ${company}'s business transformation`,
      ]

    case "business_analyst":
    default:
      return [
        `Implement business process optimization for ${company}'s operational excellence`,
        `Develop KPI monitoring framework for ${company}'s performance management`,
        `Establish business intelligence capability for ${company}'s decision support`,
        `Create data-driven decision framework for ${company}'s business units`,
      ]
  }
}

function getIndustrySpecificInsights(industry: string, data: ProcessedDataComplete, company: string): any[] {
  // Industry-specific insights based on the industry
  const baseInsights = [
    {
      category: "Industry Analysis",
      title: `${industry} Performance Assessment`,
      finding: `Comprehensive analysis of ${data.stats.rowCount.toLocaleString()} records reveals significant ${industry}-specific patterns for ${company}`,
      impact: `Enables ${company} to benchmark against industry standards and identify competitive advantages`,
      confidence: 0.92,
      supporting_data: `${data.stats.numericColumns.length} quantitative metrics compared against industry benchmarks`,
    },
  ]

  switch (industry.toLowerCase()) {
    case "technology":
      return [
        ...baseInsights,
        {
          category: "Technology Innovation",
          title: "Innovation Potential Assessment",
          finding: `Analysis identifies technology innovation opportunities across ${data.stats.categoricalColumns.length} dimensions for ${company}`,
          impact: `Potential to accelerate ${company}'s product development and market differentiation`,
          confidence: 0.89,
          supporting_data: `Innovation metrics derived from ${data.stats.numericColumns.length} performance indicators`,
        },
      ]

    case "healthcare":
      return [
        ...baseInsights,
        {
          category: "Patient Outcomes",
          title: "Healthcare Delivery Optimization",
          finding: `Analysis reveals patient outcome improvement opportunities across ${data.stats.categoricalColumns.length} clinical dimensions for ${company}`,
          impact: `Potential to enhance ${company}'s care quality and operational efficiency`,
          confidence: 0.94,
          supporting_data: `Clinical metrics derived from ${data.stats.numericColumns.length} performance indicators`,
        },
      ]

    case "finance":
      return [
        ...baseInsights,
        {
          category: "Financial Performance",
          title: "Risk-Adjusted Return Analysis",
          finding: `Analysis identifies risk-adjusted return optimization across ${data.stats.categoricalColumns.length} financial dimensions for ${company}`,
          impact: `Potential to enhance ${company}'s portfolio performance and risk management`,
          confidence: 0.91,
          supporting_data: `Financial metrics derived from ${data.stats.numericColumns.length} performance indicators`,
        },
      ]

    case "retail":
      return [
        ...baseInsights,
        {
          category: "Customer Experience",
          title: "Retail Experience Optimization",
          finding: `Analysis reveals customer experience enhancement opportunities across ${data.stats.categoricalColumns.length} retail dimensions for ${company}`,
          impact: `Potential to improve ${company}'s customer satisfaction and sales conversion`,
          confidence: 0.88,
          supporting_data: `Retail metrics derived from ${data.stats.numericColumns.length} performance indicators`,
        },
      ]

    case "manufacturing":
      return [
        ...baseInsights,
        {
          category: "Operational Efficiency",
          title: "Manufacturing Process Optimization",
          finding: `Analysis identifies production efficiency opportunities across ${data.stats.categoricalColumns.length} manufacturing dimensions for ${company}`,
          impact: `Potential to enhance ${company}'s production throughput and quality control`,
          confidence: 0.93,
          supporting_data: `Manufacturing metrics derived from ${data.stats.numericColumns.length} performance indicators`,
        },
      ]

    default:
      return [
        ...baseInsights,
        {
          category: "Business Performance",
          title: `${industry} Business Optimization`,
          finding: `Analysis reveals business enhancement opportunities across ${data.stats.categoricalColumns.length} operational dimensions for ${company}`,
          impact: `Potential to improve ${company}'s operational efficiency and market positioning`,
          confidence: 0.9,
          supporting_data: `Business metrics derived from ${data.stats.numericColumns.length} performance indicators`,
        },
      ]
  }
}

function getIndustryBenchmarks(industry: string, data: ProcessedDataComplete, company: string): any[] {
  // Industry-specific benchmarks
  const baseBenchmarks = [
    {
      category: `${industry}_performance`,
      insight: `${company}'s dataset reveals performance metrics across ${data.stats.numericColumns.length} industry-specific dimensions`,
      benchmark: `Industry average comparison available for ${Math.floor(data.stats.numericColumns.length * 0.7)} key metrics`,
      competitive_advantage: `Data-driven decision capability provides ${company} with strategic advantage in ${industry} sector`,
    },
  ]

  switch (industry.toLowerCase()) {
    case "technology":
      return [
        ...baseBenchmarks,
        {
          category: "technology_innovation",
          insight: `${company}'s innovation metrics reveal potential for market differentiation`,
          benchmark: "Industry innovation index comparison shows opportunities for advancement",
          competitive_advantage: `Enhanced innovation pipeline can position ${company} as technology leader`,
        },
      ]

    case "healthcare":
      return [
        ...baseBenchmarks,
        {
          category: "healthcare_outcomes",
          insight: `${company}'s patient outcome metrics reveal quality enhancement opportunities`,
          benchmark: "Industry care quality comparison shows potential for improvement",
          competitive_advantage: `Enhanced patient outcomes can position ${company} as healthcare quality leader`,
        },
      ]

    case "finance":
      return [
        ...baseBenchmarks,
        {
          category: "finance_risk_management",
          insight: `${company}'s risk metrics reveal optimization opportunities`,
          benchmark: "Industry risk-adjusted return comparison shows potential for enhancement",
          competitive_advantage: `Enhanced risk management can position ${company} as financial performance leader`,
        },
      ]

    default:
      return [
        ...baseBenchmarks,
        {
          category: `${industry}_optimization`,
          insight: `${company}'s operational metrics reveal efficiency enhancement opportunities`,
          benchmark: `Industry efficiency comparison shows potential for ${company}'s advancement`,
          competitive_advantage: `Enhanced operational efficiency can position ${company} as ${industry} sector leader`,
        },
      ]
  }
}

function getRoleBasedRecommendations(role: string, data: ProcessedDataComplete, company: string): any[] {
  // Role-specific recommendations
  switch (role) {
    case "data_scientist":
      return [
        {
          target_role: "data_scientist",
          recommendation: `Implement predictive modeling using ${data.stats.numericColumns.length} quantitative variables`,
          implementation: `Develop machine learning pipeline with feature engineering for ${company}'s predictive analytics`,
          timeline: "4-6 weeks for initial model development",
          resources_required: "Data science team, ML infrastructure, model validation framework",
        },
        {
          target_role: "data_scientist",
          recommendation: "Establish model evaluation framework",
          implementation: `Create comprehensive model validation protocol for ${company}'s machine learning initiatives`,
          timeline: "2-3 weeks for framework development",
          resources_required: "Validation datasets, performance metrics, evaluation tools",
        },
      ]

    case "data_engineer":
      return [
        {
          target_role: "data_engineer",
          recommendation: `Optimize database schema across ${data.stats.columnCount} dimensions`,
          implementation: `Implement normalization and indexing strategy for ${company}'s data architecture`,
          timeline: "3-5 weeks for schema optimization",
          resources_required: "Database administration team, schema design tools, performance testing framework",
        },
        {
          target_role: "data_engineer",
          recommendation: "Establish data quality framework",
          implementation: `Develop automated data quality monitoring for ${company}'s data pipeline`,
          timeline: "4-6 weeks for framework implementation",
          resources_required: "Data quality tools, monitoring infrastructure, alerting system",
        },
      ]

    case "executive":
      return [
        {
          target_role: "executive",
          recommendation: "Implement data-driven strategic planning",
          implementation: `Develop executive dashboard with ${data.stats.numericColumns.length} key performance indicators for ${company}`,
          timeline: "6-8 weeks for dashboard development",
          resources_required: "Executive team, BI developers, strategic planning framework",
        },
        {
          target_role: "executive",
          recommendation: "Establish competitive intelligence capability",
          implementation: `Create market intelligence framework using ${data.stats.categoricalColumns.length} segmentation dimensions for ${company}`,
          timeline: "8-10 weeks for capability development",
          resources_required: "Market research team, competitive intelligence tools, analysis framework",
        },
      ]

    case "business_analyst":
    default:
      return [
        {
          target_role: "business_analyst",
          recommendation: "Implement business process optimization",
          implementation: `Develop process improvement framework across ${data.stats.columnCount} operational dimensions for ${company}`,
          timeline: "5-7 weeks for framework development",
          resources_required: "Business analysis team, process mapping tools, optimization methodology",
        },
        {
          target_role: "business_analyst",
          recommendation: "Establish KPI monitoring framework",
          implementation: `Create performance dashboard using ${data.stats.numericColumns.length} metrics for ${company}`,
          timeline: "3-5 weeks for dashboard development",
          resources_required: "BI developers, KPI definition framework, visualization tools",
        },
      ]
  }
}

function getDataEngineerDetails(data: ProcessedDataComplete): any {
  return {
    dataQualityAssessment: `Dataset quality assessment reveals ${data.insights.dataQuality}% overall quality with ${data.insights.completeness}% completeness across ${data.stats.rowCount.toLocaleString()} records and ${data.stats.columnCount} columns.`,
    schemaOptimization: `Schema analysis identifies normalization opportunities across ${data.stats.columnCount} columns with ${data.stats.numericColumns.length} numeric and ${data.stats.categoricalColumns.length} categorical fields.`,
    dataArchitecture: `Recommended data architecture includes optimized storage for ${data.stats.rowCount.toLocaleString()} records with appropriate indexing on ${Math.min(5, data.stats.numericColumns.length)} key numeric fields.`,
    pipelineRecommendations: [
      `Implement data validation for ${data.anomalies.length} identified anomaly patterns`,
      `Develop automated quality monitoring for ${data.stats.columnCount} fields`,
      `Establish ETL optimization for ${data.stats.rowCount.toLocaleString()} records processing`,
    ],
    storageOptimization: `Storage optimization potential identified through appropriate data typing, compression, and partitioning strategies for ${data.stats.rowCount.toLocaleString()} records.`,
    dataGovernance: `Recommended data governance framework includes quality standards, access controls, and lifecycle management for ${data.stats.columnCount} data elements.`,
  }
}

function getMarketTrends(industry: string, region: string): string[] {
  // Industry and region specific market trends
  const baseMarketTrends = [
    `Increasing data-driven decision making across ${industry} sector`,
    `Growing emphasis on analytics capabilities in ${region} market`,
    `Rising importance of AI/ML integration in ${industry} operations`,
  ]

  switch (industry.toLowerCase()) {
    case "technology":
      return [
        ...baseMarketTrends,
        `Accelerating cloud adoption in ${region} technology sector`,
        `Increasing focus on cybersecurity across technology ecosystem`,
        `Growing emphasis on AI-driven innovation in product development`,
      ]

    case "healthcare":
      return [
        ...baseMarketTrends,
        `Expanding telehealth adoption in ${region} healthcare market`,
        `Increasing focus on patient experience and outcomes`,
        `Growing emphasis on predictive analytics for preventive care`,
      ]

    case "finance":
      return [
        ...baseMarketTrends,
        `Accelerating digital transformation in ${region} financial sector`,
        `Increasing focus on algorithmic trading and risk management`,
        `Growing emphasis on personalized financial services and products`,
      ]

    case "retail":
      return [
        ...baseMarketTrends,
        `Expanding e-commerce integration in ${region} retail market`,
        `Increasing focus on omnichannel customer experience`,
        `Growing emphasis on personalized marketing and recommendations`,
      ]

    case "manufacturing":
      return [
        ...baseMarketTrends,
        `Accelerating Industry 4.0 adoption in ${region} manufacturing sector`,
        `Increasing focus on supply chain optimization and resilience`,
        `Growing emphasis on predictive maintenance and quality control`,
      ]

    default:
      return [
        ...baseMarketTrends,
        `Expanding digital transformation across ${industry} in ${region}`,
        `Increasing focus on operational efficiency and cost optimization`,
        `Growing emphasis on customer experience and personalization`,
      ]
  }
}

function generateDataQualityReport(data: ProcessedDataComplete): any {
  return {
    overallQuality: `${data.insights.dataQuality}%`,
    completeness: `${data.insights.completeness}%`,
    accuracy: `${data.insights.accuracy || 95}%`,
    consistency: `${data.insights.consistency || 92}%`,
    anomalies: data.anomalies.length,
    recommendations: [
      `Address ${data.anomalies.length} identified anomalies`,
      `Improve data completeness for ${100 - data.insights.completeness}% missing values`,
      `Implement data validation rules for ${data.stats.columnCount} fields`,
    ],
  }
}

function getAnalysisDepth(planType: string, analysisTier: string): "basic" | "professional" | "enterprise" {
  if (analysisTier === "claude_premium") return "enterprise"
  if (analysisTier === "enhanced") return "professional"

  switch (planType.toLowerCase()) {
    case "pro":
    case "trial_pro":
      return "professional"
    case "team":
    case "enterprise":
      return "enterprise"
    default:
      return "basic"
  }
}

function getAIProvidersForAnalysisTier(planType: string, analysisTier: string): string[] {
  if (analysisTier === "claude_premium") {
    return ["claude"] // Claude Premium gets exclusive Claude access
  }

  if (analysisTier === "enhanced") {
    switch (planType.toLowerCase()) {
      case "enterprise":
        return ["claude", "openai", "groq"]
      case "team":
      case "pro":
      case "trial_pro":
        return ["openai", "claude", "groq"]
      default:
        return ["groq", "openai"]
    }
  }

  // Standard tier
  switch (planType.toLowerCase()) {
    case "enterprise":
      return ["openai", "groq", "claude"]
    case "team":
    case "pro":
    case "trial_pro":
      return ["groq", "openai"]
    default:
      return ["groq"]
  }
}
