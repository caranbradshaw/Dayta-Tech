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
    insightType: string
    userGoals: string[]
  }
}

// User insight type configurations
const INSIGHT_TYPE_CONFIGS = {
  "data-scientist": {
    focus: "statistical_analysis",
    priorities: ["correlation_analysis", "predictive_modeling", "feature_importance", "statistical_significance"],
    language: "technical",
    depth: "deep",
    visualizations: ["correlation_matrix", "distribution_plots", "feature_importance"],
    recommendations: "model_development",
  },
  "data-engineer": {
    focus: "data_quality",
    priorities: ["schema_optimization", "data_pipeline", "performance_tuning", "data_governance"],
    language: "technical",
    depth: "infrastructure",
    visualizations: ["data_quality_dashboard", "pipeline_flow", "performance_metrics"],
    recommendations: "infrastructure_optimization",
  },
  "business-analyst": {
    focus: "business_intelligence",
    priorities: ["kpi_analysis", "trend_identification", "performance_metrics", "actionable_insights"],
    language: "business",
    depth: "strategic",
    visualizations: ["kpi_dashboard", "trend_charts", "performance_comparison"],
    recommendations: "business_optimization",
  },
  "marketing-analyst": {
    focus: "customer_insights",
    priorities: ["segmentation", "conversion_analysis", "campaign_performance", "customer_behavior"],
    language: "marketing",
    depth: "customer_focused",
    visualizations: ["customer_segments", "conversion_funnel", "campaign_roi"],
    recommendations: "marketing_optimization",
  },
  "operations-analyst": {
    focus: "operational_efficiency",
    priorities: ["process_optimization", "efficiency_metrics", "bottleneck_identification", "resource_utilization"],
    language: "operational",
    depth: "process_focused",
    visualizations: ["process_flow", "efficiency_metrics", "resource_utilization"],
    recommendations: "operational_improvement",
  },
  "general-insights": {
    focus: "comprehensive_overview",
    priorities: ["key_trends", "summary_insights", "actionable_recommendations", "business_impact"],
    language: "accessible",
    depth: "balanced",
    visualizations: ["summary_dashboard", "key_metrics", "trend_overview"],
    recommendations: "general_business",
  },
}

// Goal-based analysis modifiers
const GOAL_MODIFIERS = {
  "increase-revenue": {
    focus_areas: ["revenue_drivers", "pricing_optimization", "customer_value"],
    metrics: ["revenue_per_customer", "conversion_rates", "pricing_elasticity"],
    recommendations: "revenue_growth",
  },
  "reduce-costs": {
    focus_areas: ["cost_optimization", "efficiency_improvement", "waste_reduction"],
    metrics: ["cost_per_unit", "operational_efficiency", "resource_utilization"],
    recommendations: "cost_reduction",
  },
  "improve-efficiency": {
    focus_areas: ["process_optimization", "automation_opportunities", "bottleneck_removal"],
    metrics: ["throughput", "cycle_time", "resource_efficiency"],
    recommendations: "efficiency_improvement",
  },
  "understand-customers": {
    focus_areas: ["customer_segmentation", "behavior_analysis", "satisfaction_drivers"],
    metrics: ["customer_lifetime_value", "churn_rate", "satisfaction_scores"],
    recommendations: "customer_experience",
  },
  "market-analysis": {
    focus_areas: ["market_trends", "competitive_positioning", "opportunity_identification"],
    metrics: ["market_share", "growth_rates", "competitive_metrics"],
    recommendations: "market_strategy",
  },
  "risk-assessment": {
    focus_areas: ["risk_identification", "vulnerability_analysis", "mitigation_strategies"],
    metrics: ["risk_scores", "exposure_levels", "mitigation_effectiveness"],
    recommendations: "risk_management",
  },
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

    // Get user's insight type preference from their profile
    const userInsightType = userProfile.role || "general-insights" // This is their signup insight preference
    const insightConfig = INSIGHT_TYPE_CONFIGS[userInsightType as keyof typeof INSIGHT_TYPE_CONFIGS]

    // Process the complete dataset with enhanced analysis
    console.log(`Processing dataset with ${userInsightType} insights for ${userProfile.company || "user"}...`)
    const processedData = await processUploadedFileComplete(file)

    // Determine analysis depth based on subscription and tier
    const analysisDepth = getAnalysisDepth(userSubscription?.plan_type || "basic", analysisTier)

    // Create comprehensive user context with AI personalization
    const enhancedContext = {
      // User profile data
      industry: userContext?.industry || userProfile.industry || "general",
      role: analysisRole || userProfile.role || "business_analyst",
      planType: userSubscription?.plan_type || "basic",
      userId,
      companySize: userProfile.company_size,
      company: userContext?.company || userProfile.company || "Your Company",
      region: userContext?.region || userProfile.region || "global",

      // Analysis configuration
      analysisDepth,
      analysisTier,
      datasetSize: {
        rows: processedData.stats.rowCount,
        columns: processedData.stats.columnCount,
      },
      personalizedContext: !!userContext,
      userAIContext: userContext,

      // NEW: Insight type configuration
      insightType: userInsightType,
      insightConfig: insightConfig,
      userGoals: userContext?.goals || [],
      goalModifiers: (userContext?.goals || [])
        .map((goal) => GOAL_MODIFIERS[goal as keyof typeof GOAL_MODIFIERS])
        .filter(Boolean),

      // User preferences from signup
      firstName: userProfile.first_name,
      lastName: userProfile.last_name,
      email: userProfile.email,
    }

    // Get enhanced AI analysis with personalized context and insight type
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
        insightType: userInsightType,
        userGoals: userContext?.goals || [],
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
      console.log(`Attempting ${context.analysisTier} analysis with ${provider} for ${context.insightType} insights...`)

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

  // Generate personalized contextual prompt based on user's insight type and goals
  const personalizedPrompt = generatePersonalizedPrompt(context, fileName)

  // Get insight-type specific system prompt
  const systemPrompt = getInsightTypeSystemPrompt(context)

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
        content: `${personalizedPrompt}

COMPLETE DATASET FOR ANALYSIS:
File: ${fileName}
Total Records: ${processedData.stats.rowCount.toLocaleString()}
Total Columns: ${processedData.stats.columnCount}
Data Quality: ${processedData.insights.dataQuality}%

COLUMN ANALYSIS:
${processedData.columnAnalysis
  .map(
    (col) => `
- ${col.name} (${col.type}):
  * Unique Values: ${col.uniqueValues}
  * Missing: ${col.missingCount}
  * Key Patterns: ${col.patterns.join(", ")}
`,
  )
  .join("")}

STATISTICAL SUMMARY:
${JSON.stringify(processedData.stats.detailedSummary, null, 2)}

SAMPLE DATA (First 10 rows):
${JSON.stringify(processedData.sample.slice(0, 10), null, 2)}

CORRELATIONS:
${JSON.stringify(processedData.correlations, null, 2)}

TRENDS:
${JSON.stringify(processedData.trends, null, 2)}

ANOMALIES DETECTED:
${JSON.stringify(processedData.anomalies, null, 2)}

Please provide a comprehensive JSON response following the structure specified in the system prompt.`,
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

function generatePersonalizedPrompt(context: any, fileName: string): string {
  const insightConfig = context.insightConfig
  const goalModifiers = context.goalModifiers || []

  let prompt = `
PERSONALIZED ANALYSIS REQUEST FOR ${context.firstName} ${context.lastName}
================================================================

Hello! I'm analyzing ${fileName} specifically for ${context.firstName} at ${context.company} in the ${context.industry} industry.

USER PROFILE:
- Name: ${context.firstName} ${context.lastName}
- Company: ${context.company}
- Industry: ${context.industry}
- Company Size: ${context.companySize}
- Region: ${context.region}
- Preferred Insight Type: ${context.insightType.replace("-", " ").toUpperCase()}

INSIGHT TYPE CONFIGURATION:
- Analysis Focus: ${insightConfig.focus.replace("_", " ")}
- Language Style: ${insightConfig.language}
- Analysis Depth: ${insightConfig.depth}
- Key Priorities: ${insightConfig.priorities.join(", ")}
- Recommendation Type: ${insightConfig.recommendations.replace("_", " ")}
`

  if (context.userGoals && context.userGoals.length > 0) {
    prompt += `
SPECIFIC USER GOALS:
${context.userGoals.map((goal: string, i: number) => `${i + 1}. ${goal.replace("-", " ").toUpperCase()}`).join("\n")}
`

    if (goalModifiers.length > 0) {
      prompt += `
GOAL-SPECIFIC FOCUS AREAS:
${goalModifiers
  .map(
    (modifier: any) => `
- ${modifier.focus_areas.join(", ")}
- Key Metrics: ${modifier.metrics.join(", ")}
- Recommendation Style: ${modifier.recommendations.replace("_", " ")}
`,
  )
  .join("")}
`
    }
  }

  prompt += `
ANALYSIS REQUIREMENTS:
1. Tailor ALL insights specifically for ${context.firstName}'s ${context.insightType.replace("-", " ")} perspective
2. Focus on ${insightConfig.focus.replace("_", " ")} as the primary analysis approach
3. Use ${insightConfig.language} language appropriate for ${context.firstName}'s role
4. Prioritize: ${insightConfig.priorities.join(", ")}
5. Provide ${insightConfig.recommendations.replace("_", " ")} recommendations
6. Consider ${context.industry} industry context and ${context.region} market dynamics
7. Address ${context.firstName}'s specific goals: ${(context.userGoals || []).join(", ")}
8. Make recommendations actionable for ${context.company}

This analysis should feel like it was created specifically for ${context.firstName} by an expert ${context.insightType.replace("-", " ")} consultant.
`

  return prompt
}

function getInsightTypeSystemPrompt(context: any): string {
  const insightConfig = context.insightConfig
  const insightType = context.insightType

  const basePrompt = `You are an expert ${insightType.replace("-", " ")} consultant with 15+ years of experience in ${context.industry} industry analysis. You specialize in ${insightConfig.focus.replace("_", " ")} and have helped hundreds of companies like ${context.company} achieve their goals.

Your task is to create a comprehensive analysis specifically tailored for ${context.firstName} ${context.lastName} at ${context.company}, focusing on ${insightConfig.focus.replace("_", " ")} insights.

RESPONSE STRUCTURE (JSON format):
{
  "executiveSummary": {
    "overview": "2-3 paragraph overview written specifically for ${context.firstName} at ${context.company}",
    "keyFindings": ["5-7 findings focused on ${insightConfig.focus.replace("_", " ")}"],
    "businessImpact": "Quantified impact analysis for ${context.company}",
    "strategicRecommendations": ["3-5 ${insightConfig.recommendations.replace("_", " ")} recommendations"],
    "riskAssessment": "Risk analysis from ${insightType.replace("-", " ")} perspective",
    "opportunityAnalysis": "Opportunities specific to ${context.firstName}'s goals",
    "nextSteps": ["Immediate action items for ${context.firstName}"],
    "executiveInsights": "Strategic insights for ${context.company} leadership"
  },
  "detailedInsights": [
    {
      "category": "Primary focus area from: ${insightConfig.priorities.join(" | ")}",
      "title": "Insight title",
      "finding": "Detailed finding for ${context.company}",
      "impact": "Business impact for ${context.firstName}'s goals",
      "confidence": 0.95,
      "supporting_data": "Data points that support this insight",
      "actionable_recommendation": "Specific action ${context.firstName} can take"
    }
  ],
  "industrySpecificInsights": [
    {
      "category": "${context.industry}_${insightType.replace("-", "_")}",
      "insight": "Industry-specific insight for ${context.company}",
      "benchmark": "${context.industry} industry benchmark comparison",
      "competitive_advantage": "How this creates advantage for ${context.company}"
    }
  ],
  "roleBasedRecommendations": [
    {
      "target_role": "${context.firstName} (${insightType.replace("-", " ")})",
      "recommendation": "Specific recommendation for ${context.firstName}",
      "implementation": "How ${context.company} should implement this",
      "timeline": "Implementation timeline",
      "resources_required": "Resources ${context.company} needs",
      "success_metrics": "KPIs to measure success",
      "goal_alignment": "How this addresses ${context.firstName}'s goals"
    }
  ],
  "competitiveAnalysis": "Competitive analysis from ${insightType.replace("-", " ")} perspective for ${context.company}",
  "marketTrends": ["${context.region} market trends relevant to ${context.firstName}'s goals"]`

  // Add insight-type specific sections
  switch (insightType) {
    case "data-scientist":
      return `${basePrompt},
  "technicalDetails": {
    "statisticalSignificance": "Statistical analysis for ${context.company}",
    "correlationAnalysis": "Key correlations for ${context.firstName}'s goals",
    "predictiveModeling": "ML opportunities for ${context.company}",
    "featureImportance": ["Most predictive features"],
    "modelRecommendations": ["Recommended models for ${context.firstName}"],
    "dataPreprocessing": "Required preprocessing for ${context.company}",
    "validationStrategy": "Model validation approach"
  }
}

ANALYSIS FOCUS: Statistical rigor, predictive modeling, feature engineering, and machine learning opportunities specifically for ${context.firstName}'s data science needs at ${context.company}.`

    case "data-engineer":
      return `${basePrompt},
  "technicalDetails": {
    "dataQualityAssessment": "Comprehensive data quality evaluation for ${context.company}",
    "schemaOptimization": "Database schema recommendations for ${context.firstName}",
    "dataArchitecture": "Optimal architecture for ${context.company}",
    "pipelineRecommendations": ["Pipeline improvements for ${context.firstName}"],
    "storageOptimization": "Storage strategies for ${context.company}",
    "dataGovernance": "Governance framework for ${context.firstName}",
    "scalabilityPlanning": "Scalability roadmap for ${context.company}"
  }
}

ANALYSIS FOCUS: Data infrastructure, pipeline optimization, schema design, and data governance specifically for ${context.firstName}'s engineering needs at ${context.company}.`

    case "marketing-analyst":
      return `${basePrompt},
  "marketingInsights": {
    "customerSegmentation": "Customer segments for ${context.company}",
    "conversionAnalysis": "Conversion optimization for ${context.firstName}",
    "campaignPerformance": "Campaign insights for ${context.company}",
    "customerBehavior": "Behavior patterns for ${context.firstName}'s campaigns",
    "roiAnalysis": "Marketing ROI for ${context.company}",
    "channelOptimization": "Channel recommendations for ${context.firstName}",
    "personalizationOpportunities": "Personalization strategies for ${context.company}"
  }
}

ANALYSIS FOCUS: Customer insights, campaign optimization, segmentation, and marketing ROI specifically for ${context.firstName}'s marketing needs at ${context.company}.`

    default:
      return `${basePrompt}
}

ANALYSIS FOCUS: ${insightConfig.focus.replace("_", " ")} with emphasis on ${insightConfig.priorities.join(", ")} specifically for ${context.firstName}'s needs at ${context.company}.`
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
  const insightConfig = context.insightConfig
  const industryInsights = getIndustrySpecificInsights(context.industry, processedData, context.company)
  const roleRecommendations = getRoleBasedRecommendations(context.role, processedData, context.company)
  const insightTypeRecommendations = getInsightTypeRecommendations(context.insightType, processedData, context)

  const result = {
    executiveSummary: {
      overview: `${getPersonalizedOverview(context, fileName, processedData)}`,
      keyFindings: getInsightTypeFindings(context.insightType, processedData, context),
      businessImpact: `This ${context.insightType.replace("-", " ")} analysis enables ${context.firstName} at ${context.company} to make data-driven decisions focused on ${insightConfig.focus.replace("_", " ")}. The analysis addresses ${context.firstName}'s specific goals: ${(context.userGoals || []).join(", ")}.`,
      strategicRecommendations: insightTypeRecommendations,
      riskAssessment: `From a ${context.insightType.replace("-", " ")} perspective, key risks include data quality issues (${100 - processedData.insights.completeness}% missing data) and ${processedData.anomalies.length} anomalies that could impact ${context.firstName}'s analysis accuracy.`,
      opportunityAnalysis: `The comprehensive dataset presents significant ${context.insightType.replace("-", " ")} opportunities for ${context.firstName} to achieve their goals at ${context.company}.`,
      nextSteps: getInsightTypeNextSteps(context.insightType, context),
      executiveInsights: `This personalized ${context.insightType.replace("-", " ")} analysis provides ${context.firstName} with actionable insights tailored to ${context.company}'s ${context.industry} operations and specific business goals.`,
    },
    detailedInsights: getInsightTypeDetailedInsights(context.insightType, processedData, context),
    industrySpecificInsights: getIndustryBenchmarks(context.industry, processedData, context.company),
    roleBasedRecommendations: insightTypeRecommendations,
    competitiveAnalysis: `${context.insightType.replace("-", " ")} analysis reveals strategic positioning opportunities for ${context.company} within ${context.industry} sector.`,
    marketTrends: getMarketTrends(context.industry, context.region),
    technicalDetails: context.insightType.includes("data")
      ? getInsightTypeTechnicalDetails(context.insightType, processedData)
      : undefined,
    aiProvider: `enhanced-fallback-${context.analysisTier}-${context.insightType}`,
  }

  return result
}

function getPersonalizedOverview(context: any, fileName: string, data: ProcessedDataComplete): string {
  const insightConfig = context.insightConfig

  return `Hello ${context.firstName}! This ${context.insightType.replace("-", " ")} analysis of ${fileName} has been specifically tailored for your role at ${context.company}. 

The dataset contains ${data.stats.rowCount.toLocaleString()} records across ${data.stats.columnCount} dimensions, providing excellent foundation for ${insightConfig.focus.replace("_", " ")} insights. With ${data.insights.dataQuality}% data quality, this analysis focuses on your priorities: ${insightConfig.priorities.join(", ")}.

Based on your goals (${(context.userGoals || []).join(", ")}), I've identified key opportunities for ${context.company} in the ${context.industry} sector. This analysis uses ${insightConfig.language} language and ${insightConfig.depth} analysis depth to match your ${context.insightType.replace("-", " ")} perspective.`
}

function getInsightTypeFindings(insightType: string, data: ProcessedDataComplete, context: any): string[] {
  const baseFindings = [
    `Dataset encompasses ${data.stats.rowCount.toLocaleString()} records with ${data.insights.completeness}% completeness for ${context.firstName}'s analysis`,
    `${data.stats.numericColumns.length} quantitative metrics available for ${insightType.replace("-", " ")} analysis`,
    `Data quality score of ${data.insights.dataQuality}% supports reliable ${insightType.replace("-", " ")} insights`,
  ]

  switch (insightType) {
    case "data-scientist":
      return [
        ...baseFindings,
        `${Object.keys(data.correlations).length} significant correlations identified for predictive modeling`,
        `${data.stats.numericColumns.length} potential features available for machine learning`,
        `Statistical analysis reveals ${data.anomalies.length} anomalies requiring investigation`,
      ]

    case "data-engineer":
      return [
        ...baseFindings,
        `Schema analysis identifies optimization opportunities across ${data.stats.columnCount} fields`,
        `${100 - data.insights.completeness}% missing data requires pipeline improvements`,
        `Data architecture assessment reveals ${data.anomalies.length} quality issues to address`,
      ]

    case "marketing-analyst":
      return [
        ...baseFindings,
        `Customer segmentation opportunities identified across ${data.stats.categoricalColumns.length} dimensions`,
        `Conversion analysis potential with ${data.stats.numericColumns.length} performance metrics`,
        `Campaign optimization insights available from comprehensive dataset`,
      ]

    case "operations-analyst":
      return [
        ...baseFindings,
        `Process optimization opportunities across ${data.stats.columnCount} operational dimensions`,
        `Efficiency metrics analysis reveals improvement potential`,
        `Resource utilization insights available for operational excellence`,
      ]

    default:
      return [
        ...baseFindings,
        `Business intelligence opportunities across ${data.stats.categoricalColumns.length} dimensions`,
        `Performance analysis potential with comprehensive metrics`,
      ]
  }
}

function getInsightTypeRecommendations(insightType: string, data: ProcessedDataComplete, context: any): any[] {
  switch (insightType) {
    case "data-scientist":
      return [
        {
          target_role: `${context.firstName} (Data Scientist)`,
          recommendation: `Develop predictive models using ${data.stats.numericColumns.length} quantitative features`,
          implementation: `Create ML pipeline for ${context.company} with feature engineering`,
          timeline: "4-6 weeks for initial models",
          resources_required: "ML infrastructure, validation datasets",
          goal_alignment: `Addresses ${context.firstName}'s predictive modeling goals`,
        },
      ]

    case "data-engineer":
      return [
        {
          target_role: `${context.firstName} (Data Engineer)`,
          recommendation: `Optimize data pipeline and schema for ${context.company}`,
          implementation: `Implement data quality framework and schema optimization`,
          timeline: "3-5 weeks for infrastructure improvements",
          resources_required: "Database admin tools, monitoring systems",
          goal_alignment: `Addresses ${context.firstName}'s data quality goals`,
        },
      ]

    case "marketing-analyst":
      return [
        {
          target_role: `${context.firstName} (Marketing Analyst)`,
          recommendation: `Implement customer segmentation and campaign optimization`,
          implementation: `Develop customer analytics framework for ${context.company}`,
          timeline: "2-4 weeks for segmentation analysis",
          resources_required: "Marketing analytics tools, customer data",
          goal_alignment: `Addresses ${context.firstName}'s customer insight goals`,
        },
      ]

    default:
      return [
        {
          target_role: `${context.firstName} (Business Analyst)`,
          recommendation: `Implement business intelligence dashboard for ${context.company}`,
          implementation: `Create KPI monitoring and reporting framework`,
          timeline: "3-5 weeks for dashboard development",
          resources_required: "BI tools, data visualization platform",
          goal_alignment: `Addresses ${context.firstName}'s business intelligence goals`,
        },
      ]
  }
}

function getInsightTypeNextSteps(insightType: string, context: any): string[] {
  switch (insightType) {
    case "data-scientist":
      return [
        `${context.firstName}: Start feature engineering pipeline development`,
        `${context.firstName}: Implement model validation framework`,
        `${context.firstName}: Create predictive model deployment strategy`,
      ]

    case "data-engineer":
      return [
        `${context.firstName}: Implement data quality monitoring system`,
        `${context.firstName}: Optimize database schema and indexing`,
        `${context.firstName}: Develop automated data pipeline`,
      ]

    case "marketing-analyst":
      return [
        `${context.firstName}: Develop customer segmentation framework`,
        `${context.firstName}: Implement campaign performance tracking`,
        `${context.firstName}: Create conversion optimization dashboard`,
      ]

    default:
      return [
        `${context.firstName}: Implement business intelligence dashboard`,
        `${context.firstName}: Develop KPI monitoring framework`,
        `${context.firstName}: Create automated reporting system`,
      ]
  }
}

function getInsightTypeDetailedInsights(insightType: string, data: ProcessedDataComplete, context: any): any[] {
  const insightConfig = context.insightConfig

  return [
    {
      category: insightConfig.focus.replace("_", " "),
      title: `${insightType.replace("-", " ")} Analysis for ${context.firstName}`,
      finding: `Comprehensive ${insightType.replace("-", " ")} analysis reveals key opportunities for ${context.company}`,
      impact: `Enables ${context.firstName} to achieve their specific goals: ${(context.userGoals || []).join(", ")}`,
      confidence: 0.92,
      supporting_data: `Analysis based on ${data.stats.rowCount.toLocaleString()} records`,
      actionable_recommendation: `${context.firstName} should focus on ${insightConfig.priorities[0].replace("_", " ")} as the primary next step`,
    },
  ]
}

function getInsightTypeTechnicalDetails(insightType: string, data: ProcessedDataComplete): any {
  switch (insightType) {
    case "data-scientist":
      return {
        statisticalSignificance: `Statistical analysis of ${data.stats.numericColumns.length} variables`,
        correlationAnalysis: `${Object.keys(data.correlations).length} significant correlations identified`,
        predictiveModeling: `${data.stats.numericColumns.length} features available for modeling`,
        featureImportance: data.stats.numericColumns.slice(0, 5),
        modelRecommendations: ["Random Forest", "Gradient Boosting", "Linear Regression"],
        dataPreprocessing: `Address ${data.anomalies.length} anomalies and missing values`,
      }

    case "data-engineer":
      return {
        dataQualityAssessment: `${data.insights.dataQuality}% overall quality across ${data.stats.columnCount} columns`,
        schemaOptimization: `Normalization opportunities for ${data.stats.columnCount} fields`,
        dataArchitecture: `Optimized storage for ${data.stats.rowCount.toLocaleString()} records`,
        pipelineRecommendations: [
          `Address ${data.anomalies.length} data quality issues`,
          "Implement automated validation",
        ],
        storageOptimization: "Compression and partitioning strategies recommended",
        dataGovernance: "Quality standards and access controls needed",
      }

    default:
      return undefined
  }
}

// Keep existing helper functions...
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
    return ["claude"]
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

// Keep existing helper functions for industry insights, market trends, etc.
function getIndustrySpecificInsights(industry: string, data: ProcessedDataComplete, company: string): any[] {
  return [
    {
      category: "Industry Analysis",
      title: `${industry} Performance Assessment`,
      finding: `Comprehensive analysis reveals ${industry}-specific patterns for ${company}`,
      impact: `Enables competitive benchmarking and advantage identification`,
      confidence: 0.92,
      supporting_data: `${data.stats.numericColumns.length} metrics analyzed`,
    },
  ]
}

function getIndustryBenchmarks(industry: string, data: ProcessedDataComplete, company: string): any[] {
  return [
    {
      category: `${industry}_performance`,
      insight: `${company}'s performance metrics across ${data.stats.numericColumns.length} dimensions`,
      benchmark: `Industry average comparison for key metrics`,
      competitive_advantage: `Data-driven capability provides strategic advantage`,
    },
  ]
}

function getRoleBasedRecommendations(role: string, data: ProcessedDataComplete, company: string): any[] {
  return [
    {
      target_role: role,
      recommendation: `Implement data-driven decision framework for ${company}`,
      implementation: `Develop analytics capability using ${data.stats.numericColumns.length} metrics`,
      timeline: "4-6 weeks for implementation",
      resources_required: "Analytics team and tools",
    },
  ]
}

function getMarketTrends(industry: string, region: string): string[] {
  return [
    `Increasing data-driven decision making in ${industry}`,
    `Growing analytics adoption in ${region} market`,
    `Rising AI/ML integration in ${industry} operations`,
  ]
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
      `Improve completeness for ${100 - data.insights.completeness}% missing values`,
    ],
  }
}
