export type AccountType = "basic" | "pro" | "team" | "enterprise"
export type UserRole = "data-scientist" | "data-engineer" | "support-admin" | undefined
export type TrialStatus = "active" | "expired" | "converted" | "none" | "unlimited"

export const accountFeatures = {
  basic: {
    maxUploadsPerMonth: 10,
    maxFileSize: 10,
    advancedInsights: false,
    allFileFormats: false,
    industrySpecificAnalysis: false,
    historicalLearning: false,
    teamCollaboration: false,
    prioritySupport: false,
  },
  pro: {
    maxUploadsPerMonth: "unlimited",
    maxFileSize: 100,
    advancedInsights: true,
    allFileFormats: true,
    industrySpecificAnalysis: true,
    historicalLearning: true,
    teamCollaboration: false,
    prioritySupport: false,
  },
  team: {
    maxUploadsPerMonth: "unlimited",
    maxFileSize: 500,
    advancedInsights: true,
    allFileFormats: true,
    industrySpecificAnalysis: true,
    historicalLearning: true,
    teamCollaboration: true,
    prioritySupport: true,
  },
  enterprise: {
    maxUploadsPerMonth: "unlimited",
    maxFileSize: 1000,
    advancedInsights: true,
    allFileFormats: true,
    industrySpecificAnalysis: true,
    historicalLearning: true,
    teamCollaboration: true,
    prioritySupport: true,
  },
} as const

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
  if (userRole === "data-scientist" || userRole === "data-engineer" || userRole === "support-admin") {
    return ["csv", "xlsx", "xls", "json", "pbix", "twb", "txt", "xml", "parquet"]
  }

  return accountType === "basic"
    ? ["csv", "xlsx", "xls", "json"]
    : ["csv", "xlsx", "xls", "json", "pbix", "twb", "txt", "xml", "parquet"]
}

export function calculateTrialEndDate(): Date {
  const now = new Date()
  const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  return trialEnd
}

export function calculateDaysRemaining(trialEndDate: string): number {
  const now = new Date()
  const endDate = new Date(trialEndDate)
  const diffTime = endDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

export function isTrialActive(trialEndDate: string): boolean {
  return calculateDaysRemaining(trialEndDate) > 0
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
  const trialEndDate = calculateTrialEndDate()

  // Special features for Data Scientists
  if (role === "data-scientist") {
    features.allFileFormats = true
    features.industrySpecificAnalysis = true
    features.advancedInsights = true
  }

  // Special features for Data Engineers
  if (role === "data-engineer") {
    features.allFileFormats = true
    features.advancedInsights = true
  }

  // Special features for Support Admin
  if (role === "support-admin") {
    features.allFileFormats = true
    features.advancedInsights = true
    features.industrySpecificAnalysis = true
    features.historicalLearning = true
    features.teamCollaboration = true
    features.prioritySupport = true
  }

  return {
    name,
    email,
    industry,
    company,
    role,
    accountType,
    trialStatus: "active" as TrialStatus,
    trialEndDate: trialEndDate.toISOString(),
    isTrialActive: true,
    requiresPayment: false,
    uploadCredits: accountType === "basic" ? 10 : "unlimited",
    exportCredits: accountType === "basic" ? 5 : "unlimited",
    features,
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
  }

  // Preserve special features for Data Engineers
  if (userData.role === "data-engineer") {
    features.allFileFormats = true
    features.advancedInsights = true
  }

  // Preserve special features for Support Admin
  if (userData.role === "support-admin") {
    features.allFileFormats = true
    features.advancedInsights = true
    features.industrySpecificAnalysis = true
    features.historicalLearning = true
    features.teamCollaboration = true
    features.prioritySupport = true
  }

  return {
    ...userData,
    accountType: newAccountType,
    trialStatus: "converted" as TrialStatus,
    isTrialActive: false,
    requiresPayment: true,
    uploadCredits: newAccountType === "basic" ? 10 : "unlimited",
    exportCredits: newAccountType === "basic" ? 5 : "unlimited",
    features,
    upgradedAt: new Date().toISOString(),
  }
}
