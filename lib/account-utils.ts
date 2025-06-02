// Define account types and their features

export type AccountType = "basic" | "pro" | "team" | "enterprise"
export type UserRole = "data-scientist" | "data-engineer" | undefined

export interface AccountFeatures {
  basicInsights: boolean
  advancedInsights: boolean
  csvSupport: boolean
  excelSupport: boolean
  allFileFormats: boolean
  industrySpecificAnalysis: boolean
  historicalLearning: boolean
  teamCollaboration: boolean
  prioritySupport: boolean
  executiveSummaries: boolean
  pipelineInsights: boolean
  architectureRecommendations: boolean
  dataTransformationInsights: boolean
  governanceAndSecurity: boolean
  performanceOptimization: boolean
  dataCleaningRecommendations: boolean
  maxFileSize: number // in MB
  maxUploadsPerMonth: number | "unlimited"
  maxExportsPerMonth: number | "unlimited"
}

export const accountFeatures: Record<AccountType, AccountFeatures> = {
  basic: {
    basicInsights: true,
    advancedInsights: false,
    csvSupport: true,
    excelSupport: true,
    allFileFormats: false,
    industrySpecificAnalysis: false,
    historicalLearning: false,
    teamCollaboration: false,
    prioritySupport: false,
    executiveSummaries: false,
    pipelineInsights: false,
    architectureRecommendations: false,
    dataTransformationInsights: false,
    governanceAndSecurity: false,
    performanceOptimization: false,
    dataCleaningRecommendations: false,
    maxFileSize: 50,
    maxUploadsPerMonth: 10,
    maxExportsPerMonth: 5,
  },
  pro: {
    basicInsights: true,
    advancedInsights: true,
    csvSupport: true,
    excelSupport: true,
    allFileFormats: true,
    industrySpecificAnalysis: true,
    historicalLearning: true,
    teamCollaboration: false,
    prioritySupport: false,
    executiveSummaries: true,
    pipelineInsights: true,
    architectureRecommendations: true,
    dataTransformationInsights: true,
    governanceAndSecurity: true,
    performanceOptimization: true,
    dataCleaningRecommendations: true,
    maxFileSize: 100,
    maxUploadsPerMonth: "unlimited",
    maxExportsPerMonth: "unlimited",
  },
  team: {
    basicInsights: true,
    advancedInsights: true,
    csvSupport: true,
    excelSupport: true,
    allFileFormats: true,
    industrySpecificAnalysis: true,
    historicalLearning: true,
    teamCollaboration: true,
    prioritySupport: true,
    executiveSummaries: true,
    pipelineInsights: true,
    architectureRecommendations: true,
    dataTransformationInsights: true,
    governanceAndSecurity: true,
    performanceOptimization: true,
    dataCleaningRecommendations: true,
    maxFileSize: 500,
    maxUploadsPerMonth: "unlimited",
    maxExportsPerMonth: "unlimited",
  },
  enterprise: {
    basicInsights: true,
    advancedInsights: true,
    csvSupport: true,
    excelSupport: true,
    allFileFormats: true,
    industrySpecificAnalysis: true,
    historicalLearning: true,
    teamCollaboration: true,
    prioritySupport: true,
    executiveSummaries: true,
    pipelineInsights: true,
    architectureRecommendations: true,
    dataTransformationInsights: true,
    governanceAndSecurity: true,
    performanceOptimization: true,
    dataCleaningRecommendations: true,
    maxFileSize: 1000,
    maxUploadsPerMonth: "unlimited",
    maxExportsPerMonth: "unlimited",
  },
}

export const accountPricing: Record<AccountType, { monthly: number; annual: number }> = {
  basic: { monthly: 39, annual: 390 },
  pro: { monthly: 99, annual: 990 },
  team: { monthly: 499, annual: 4990 },
  enterprise: { monthly: 0, annual: 0 }, // Custom pricing
}

export function getAccountLabel(accountType: AccountType): string {
  return accountType === "basic"
    ? "Basic Plan"
    : accountType === "pro"
      ? "Pro Plan"
      : accountType === "team"
        ? "Team Plan"
        : "Enterprise Plan"
}

export function getAccountBadgeColor(accountType: AccountType): string {
  return accountType === "basic"
    ? "bg-green-100 text-green-800"
    : accountType === "pro"
      ? "bg-purple-100 text-purple-800"
      : accountType === "team"
        ? "bg-blue-100 text-blue-800"
        : "bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800"
}

export function getSupportedFileTypes(accountType: AccountType, userRole?: UserRole): string[] {
  // Data Scientists and Data Engineers get access to all file formats regardless of plan
  if (userRole === "data-scientist" || userRole === "data-engineer") {
    return ["csv", "xlsx", "xls", "json", "pbix", "twb", "txt", "xml", "parquet"]
  }

  return accountType === "basic"
    ? ["csv", "xlsx", "xls"]
    : ["csv", "xlsx", "xls", "json", "pbix", "twb", "txt", "xml", "parquet"]
}

export function createAccount(
  name: string,
  email: string,
  industry: string,
  company = "Not specified",
  accountType: AccountType = "basic",
  role?: UserRole,
): any {
  const features = { ...accountFeatures[accountType] }

  // Special features for Data Scientists
  if (role === "data-scientist") {
    features.allFileFormats = true
    features.industrySpecificAnalysis = true
    features.advancedInsights = true
    features.executiveSummaries = true
  }

  // Special features for Data Engineers
  if (role === "data-engineer") {
    features.allFileFormats = true
    features.advancedInsights = true
    features.pipelineInsights = true
    features.architectureRecommendations = true
    features.dataTransformationInsights = true
    features.governanceAndSecurity = true
    features.performanceOptimization = true
    features.dataCleaningRecommendations = true
  }

  return {
    name,
    email,
    industry,
    company,
    role,
    accountType,
    uploadCredits: accountType === "basic" ? 10 : "unlimited",
    exportCredits: accountType === "basic" ? 5 : "unlimited",
    features: {
      basicInsights: features.basicInsights,
      advancedInsights: features.advancedInsights,
      csvSupport: features.csvSupport,
      excelSupport: features.excelSupport,
      allFileFormats: features.allFileFormats,
      industrySpecificAnalysis: features.industrySpecificAnalysis,
      historicalLearning: features.historicalLearning,
      teamCollaboration: features.teamCollaboration,
      prioritySupport: features.prioritySupport,
      executiveSummaries: features.executiveSummaries,
      pipelineInsights: features.pipelineInsights,
      architectureRecommendations: features.architectureRecommendations,
      dataTransformationInsights: features.dataTransformationInsights,
      governanceAndSecurity: features.governanceAndSecurity,
      performanceOptimization: features.performanceOptimization,
      dataCleaningRecommendations: features.dataCleaningRecommendations,
    },
    createdAt: new Date().toISOString(),
  }
}

export function upgradeAccount(userData: any, newAccountType: AccountType): any {
  const features = { ...accountFeatures[newAccountType] }

  // Preserve special features for Data Scientists
  if (userData.role === "data-scientist") {
    features.allFileFormats = true
    features.industrySpecificAnalysis = true
    features.advancedInsights = true
    features.executiveSummaries = true
  }

  // Preserve special features for Data Engineers
  if (userData.role === "data-engineer") {
    features.allFileFormats = true
    features.advancedInsights = true
    features.pipelineInsights = true
    features.architectureRecommendations = true
    features.dataTransformationInsights = true
    features.governanceAndSecurity = true
    features.performanceOptimization = true
    features.dataCleaningRecommendations = true
  }

  return {
    ...userData,
    accountType: newAccountType,
    uploadCredits: newAccountType === "basic" ? 10 : "unlimited",
    exportCredits: newAccountType === "basic" ? 5 : "unlimited",
    features: {
      basicInsights: features.basicInsights,
      advancedInsights: features.advancedInsights,
      csvSupport: features.csvSupport,
      excelSupport: features.excelSupport,
      allFileFormats: features.allFileFormats,
      industrySpecificAnalysis: features.industrySpecificAnalysis,
      historicalLearning: features.historicalLearning,
      teamCollaboration: features.teamCollaboration,
      prioritySupport: features.prioritySupport,
      executiveSummaries: features.executiveSummaries,
      pipelineInsights: features.pipelineInsights,
      architectureRecommendations: features.architectureRecommendations,
      dataTransformationInsights: features.dataTransformationInsights,
      governanceAndSecurity: features.governanceAndSecurity,
      performanceOptimization: features.performanceOptimization,
      dataCleaningRecommendations: features.dataCleaningRecommendations,
    },
    upgradedAt: new Date().toISOString(),
  }
}
