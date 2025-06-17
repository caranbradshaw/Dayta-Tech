import * as crypto from "crypto"

export type AccountType = "trial_pro" | "basic" | "pro" | "team" | "enterprise"
export type UserRole = string // Allow any string for flexibility
export type TrialStatus = "active" | "expired" | "converted" | "none"
export type Region = "nigeria" | "america" | "global" | "europe" | "asia"

export interface TrialSubscription {
  id: string
  userId: string
  accountType: AccountType
  trialStatus: TrialStatus
  region: Region
  trialStartDate: string
  trialEndDate: string
  isTrialActive: boolean
  daysRemaining: number
  features: ProFeatures
  emailVerified: boolean
  loginRules: LoginRules
  createdAt: string
  updatedAt: string
}

export interface ProFeatures {
  maxUploadsPerMonth: number | "unlimited"
  maxFileSize: number // MB
  advancedInsights: boolean
  allFileFormats: boolean
  industrySpecificAnalysis: boolean
  historicalLearning: boolean
  teamCollaboration: boolean
  prioritySupport: boolean
  apiAccess: boolean
  customReports: boolean
  dataExport: boolean
  realTimeAnalytics: boolean
  roleBasedAnalysis: boolean
  goalBasedAnalysis: boolean
  multiRegionSupport: boolean
}

export interface LoginRules {
  requireEmailVerification: boolean
  maxLoginAttempts: number
  lockoutDuration: number // minutes
  requireStrongPassword: boolean
  enableTwoFactor: boolean
  sessionTimeout: number // hours
  allowedRegions: Region[]
}

export interface EmailRules {
  requireVerification: boolean
  verificationExpiry: number // hours
  maxResendAttempts: number
  allowedDomains: string[]
  blockedDomains: string[]
  requireCorporateEmail: boolean
  autoApproveRegions: Region[]
}

export interface UserAIContext {
  region: Region
  industry: string
  role: UserRole
  company: string
  goals?: string[]
  signupDate: string
  preferences?: {
    analysisStyle: "executive" | "technical" | "business"
    reportFormat: "detailed" | "summary" | "visual"
    industryFocus: boolean
  }
}

// Enhanced PRO Trial Features
export const proTrialFeatures: ProFeatures = {
  maxUploadsPerMonth: "unlimited",
  maxFileSize: 500, // 500MB
  advancedInsights: true,
  allFileFormats: true,
  industrySpecificAnalysis: true,
  historicalLearning: true,
  teamCollaboration: false, // Upgrade required
  prioritySupport: true,
  apiAccess: true,
  customReports: true,
  dataExport: true,
  realTimeAnalytics: true,
  roleBasedAnalysis: true, // NEW
  goalBasedAnalysis: true, // NEW
  multiRegionSupport: true, // NEW
}

// Default Login Rules
export const defaultLoginRules: LoginRules = {
  requireEmailVerification: true,
  maxLoginAttempts: 5,
  lockoutDuration: 30, // 30 minutes
  requireStrongPassword: true,
  enableTwoFactor: false, // Optional for trial
  sessionTimeout: 24, // 24 hours
  allowedRegions: ["nigeria", "america", "global", "europe", "asia"],
}

// Enhanced Email Rules by Region
export const emailRulesByRegion: Record<Region, EmailRules> = {
  nigeria: {
    requireVerification: true,
    verificationExpiry: 24,
    maxResendAttempts: 3,
    allowedDomains: [], // Allow all
    blockedDomains: ["tempmail.com", "10minutemail.com"],
    requireCorporateEmail: false,
    autoApproveRegions: ["nigeria"],
  },
  america: {
    requireVerification: true,
    verificationExpiry: 24,
    maxResendAttempts: 3,
    allowedDomains: [], // Allow all
    blockedDomains: ["tempmail.com", "10minutemail.com", "guerrillamail.com"],
    requireCorporateEmail: false,
    autoApproveRegions: ["america"],
  },
  europe: {
    requireVerification: true,
    verificationExpiry: 48,
    maxResendAttempts: 5,
    allowedDomains: [],
    blockedDomains: ["tempmail.com", "10minutemail.com", "guerrillamail.com"],
    requireCorporateEmail: false,
    autoApproveRegions: ["europe"],
  },
  asia: {
    requireVerification: true,
    verificationExpiry: 24,
    maxResendAttempts: 3,
    allowedDomains: [],
    blockedDomains: ["tempmail.com", "10minutemail.com"],
    requireCorporateEmail: false,
    autoApproveRegions: ["asia"],
  },
  global: {
    requireVerification: true,
    verificationExpiry: 48,
    maxResendAttempts: 5,
    allowedDomains: [],
    blockedDomains: ["tempmail.com", "10minutemail.com", "guerrillamail.com"],
    requireCorporateEmail: false,
    autoApproveRegions: ["nigeria", "america", "global", "europe", "asia"],
  },
}

// Enhanced Regional Pricing
export const regionalPricing = {
  nigeria: {
    currency: "NGN",
    symbol: "₦",
    basic: { monthly: 58500, annual: 585000 }, // ~$39 USD
    pro: { monthly: 148500, annual: 1485000 }, // ~$99 USD
    team: { monthly: 748500, annual: 7485000 }, // ~$499 USD
    enterprise: { monthly: 0, annual: 0 }, // Custom pricing
  },
  america: {
    currency: "USD",
    symbol: "$",
    basic: { monthly: 39, annual: 390 },
    pro: { monthly: 99, annual: 990 },
    team: { monthly: 499, annual: 4990 },
    enterprise: { monthly: 0, annual: 0 }, // Custom
  },
  europe: {
    currency: "EUR",
    symbol: "€",
    basic: { monthly: 35, annual: 350 },
    pro: { monthly: 89, annual: 890 },
    team: { monthly: 449, annual: 4490 },
    enterprise: { monthly: 0, annual: 0 }, // Custom
  },
  asia: {
    currency: "USD",
    symbol: "$",
    basic: { monthly: 29, annual: 290 },
    pro: { monthly: 79, annual: 790 },
    team: { monthly: 399, annual: 3990 },
    enterprise: { monthly: 0, annual: 0 }, // Custom
  },
  global: {
    currency: "USD",
    symbol: "$",
    basic: { monthly: 39, annual: 390 },
    pro: { monthly: 99, annual: 990 },
    team: { monthly: 499, annual: 4990 },
    enterprise: { monthly: 0, annual: 0 }, // Custom
  },
}

export function detectUserRegion(email: string, ipAddress?: string): Region {
  // Detect region based on email domain or IP
  const domain = email.split("@")[1]?.toLowerCase()

  // Nigerian domains
  const nigerianDomains = [".ng", "nitel.net", "yahoo.com.ng"]
  if (nigerianDomains.some((d) => domain?.includes(d))) {
    return "nigeria"
  }

  // European domains
  const europeanDomains = [".eu", ".de", ".fr", ".uk", ".it", ".es", ".nl"]
  if (europeanDomains.some((d) => domain?.endsWith(d))) {
    return "europe"
  }

  // Asian domains
  const asianDomains = [".jp", ".cn", ".kr", ".in", ".sg", ".my"]
  if (asianDomains.some((d) => domain?.endsWith(d))) {
    return "asia"
  }

  // American domains
  const americanDomains = [".com", ".us", ".edu", ".gov"]
  if (americanDomains.some((d) => domain?.endsWith(d))) {
    return "america"
  }

  return "global"
}

export function createProTrial(
  name: string,
  email: string,
  industry: string,
  company: string,
  role: UserRole = "business_analyst",
  region?: Region,
): TrialSubscription {
  const detectedRegion = region || detectUserRegion(email)
  const trialStartDate = new Date()
  const trialEndDate = new Date(trialStartDate.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

  return {
    id: `trial_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`,
    userId: `user_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`,
    accountType: "trial_pro",
    trialStatus: "active",
    region: detectedRegion,
    trialStartDate: trialStartDate.toISOString(),
    trialEndDate: trialEndDate.toISOString(),
    isTrialActive: true,
    daysRemaining: 30,
    features: { ...proTrialFeatures },
    emailVerified: false,
    loginRules: { ...defaultLoginRules },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function createUserAIContext(
  region: Region,
  industry: string,
  role: UserRole,
  company: string,
  goals?: string[],
): UserAIContext {
  return {
    region,
    industry,
    role,
    company,
    goals,
    signupDate: new Date().toISOString(),
    preferences: {
      analysisStyle: getAnalysisStyleFromRole(role),
      reportFormat: "detailed",
      industryFocus: true,
    },
  }
}

function getAnalysisStyleFromRole(role: string): "executive" | "technical" | "business" {
  const roleLower = role.toLowerCase()

  // Executive roles
  if (
    roleLower.includes("ceo") ||
    roleLower.includes("cto") ||
    roleLower.includes("cfo") ||
    roleLower.includes("executive") ||
    roleLower.includes("director") ||
    roleLower.includes("vp")
  ) {
    return "executive"
  }

  // Technical roles
  if (
    roleLower.includes("data scientist") ||
    roleLower.includes("data engineer") ||
    roleLower.includes("engineer") ||
    roleLower.includes("developer") ||
    roleLower.includes("analyst")
  ) {
    return "technical"
  }

  // Default to business
  return "business"
}

export function getAIContextualPrompt(context: UserAIContext, fileName: string): string {
  const { region, industry, role, company, goals } = context

  const regionContext = {
    nigeria: "Nigerian market context with focus on local business practices and economic conditions",
    america: "US market context with emphasis on American business standards and regulations",
    europe: "European market context with GDPR compliance and EU business practices",
    asia: "Asian market context with regional business customs and growth patterns",
    global: "Global market context with international best practices",
  }[region]

  const rolePrompt = getRoleSpecificPrompt(role)
  const goalsPrompt =
    goals && goals.length > 0
      ? `\n\nSPECIFIC ANALYSIS GOALS:\n${goals.map((goal, i) => `${i + 1}. ${goal}`).join("\n")}`
      : ""

  return `
ENHANCED CONTEXTUAL ANALYSIS REQUEST
===================================

Company: ${company}
Industry: ${industry}
Role: ${role}
Region: ${regionContext}
File: ${fileName}${goalsPrompt}

ANALYSIS REQUIREMENTS:
1. ${rolePrompt}
2. Tailor insights specifically for ${industry} industry
3. Consider ${regionContext}
4. Provide recommendations suitable for ${company}
5. Use language and examples relevant to a ${role}
${goals && goals.length > 0 ? `6. Address the specific goals outlined above` : ""}

Please provide analysis that demonstrates deep understanding of:
- ${industry} industry dynamics and challenges
- ${regionContext}
- Role-specific needs and priorities for a ${role}
- Company-specific insights for ${company}
${goals && goals.length > 0 ? `- Achievement of the specified analysis goals` : ""}
`
}

function getRoleSpecificPrompt(role: string): string {
  const roleLower = role.toLowerCase()

  // Executive roles
  if (roleLower.includes("ceo") || roleLower.includes("executive") || roleLower.includes("director")) {
    return "Focus on strategic insights, competitive analysis, market positioning, and high-level recommendations for executive decision making"
  }

  // Data roles
  if (roleLower.includes("data scientist")) {
    return "Focus on statistical analysis, machine learning opportunities, and technical insights"
  }

  if (roleLower.includes("data engineer")) {
    return "Emphasize data quality, schema optimization, and technical architecture recommendations"
  }

  // Business roles
  if (roleLower.includes("analyst") || roleLower.includes("business")) {
    return "Provide business insights, KPI analysis, and operational recommendations"
  }

  // Marketing roles
  if (roleLower.includes("marketing")) {
    return "Focus on customer insights, campaign performance, market segmentation, and marketing ROI"
  }

  // Sales roles
  if (roleLower.includes("sales")) {
    return "Emphasize sales performance, lead conversion, customer acquisition, and revenue optimization"
  }

  // Operations roles
  if (roleLower.includes("operations")) {
    return "Focus on process efficiency, resource utilization, workflow optimization, and operational KPIs"
  }

  // Financial roles
  if (roleLower.includes("financial") || roleLower.includes("finance")) {
    return "Provide financial performance analysis, budget insights, cost optimization, and profitability recommendations"
  }

  // HR roles
  if (roleLower.includes("hr") || roleLower.includes("human resources")) {
    return "Focus on employee performance, retention analysis, recruitment metrics, and organizational insights"
  }

  // Default comprehensive analysis
  return `Provide comprehensive analysis tailored to a ${role}, focusing on insights and recommendations relevant to their specific responsibilities and decision-making needs`
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

export function getTrialStatus(subscription: TrialSubscription): {
  status: TrialStatus
  daysRemaining: number
  message: string
  actionRequired: boolean
} {
  const daysRemaining = calculateDaysRemaining(subscription.trialEndDate)
  const isActive = daysRemaining > 0

  if (!isActive) {
    return {
      status: "expired",
      daysRemaining: 0,
      message: "Your 30-day PRO trial has expired. Upgrade to continue using PRO features.",
      actionRequired: true,
    }
  }

  if (daysRemaining <= 3) {
    return {
      status: "active",
      daysRemaining,
      message: `Your PRO trial expires in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}. Upgrade now to continue.`,
      actionRequired: true,
    }
  }

  return {
    status: "active",
    daysRemaining,
    message: `You have ${daysRemaining} days left in your PRO trial.`,
    actionRequired: false,
  }
}

export function validateEmail(
  email: string,
  region: Region,
): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  const rules = emailRulesByRegion[region]

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    errors.push("Invalid email format")
  }

  const domain = email.split("@")[1]?.toLowerCase()

  // Check blocked domains
  if (rules.blockedDomains.some((blocked) => domain?.includes(blocked))) {
    errors.push("Email domain is not allowed")
  }

  // Check allowed domains (if specified)
  if (rules.allowedDomains.length > 0 && !rules.allowedDomains.some((allowed) => domain?.includes(allowed))) {
    errors.push("Email domain is not in the allowed list")
  }

  // Corporate email check
  if (rules.requireCorporateEmail) {
    const personalDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]
    if (personalDomains.some((personal) => domain?.includes(personal))) {
      warnings.push("Consider using a corporate email for better account management")
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
  strength: "weak" | "medium" | "strong"
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  // Determine strength
  let strength: "weak" | "medium" | "strong" = "weak"
  if (errors.length === 0) {
    if (password.length >= 12 && /[!@#$%^&*(),.?":{}|<>].*[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      strength = "strong"
    } else {
      strength = "medium"
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  }
}

export function canUserLogin(
  subscription: TrialSubscription,
  loginAttempts = 0,
): {
  canLogin: boolean
  reason?: string
  requiresAction?: string
} {
  // Check if email is verified
  if (subscription.loginRules.requireEmailVerification && !subscription.emailVerified) {
    return {
      canLogin: false,
      reason: "Email verification required",
      requiresAction: "verify_email",
    }
  }

  // Check login attempts
  if (loginAttempts >= subscription.loginRules.maxLoginAttempts) {
    return {
      canLogin: false,
      reason: `Account locked due to too many failed login attempts. Try again in ${subscription.loginRules.lockoutDuration} minutes.`,
      requiresAction: "wait_lockout",
    }
  }

  // Check if trial is expired
  if (!isTrialActive(subscription.trialEndDate)) {
    return {
      canLogin: true, // Allow login but with limited features
      reason: "Trial expired - limited access",
      requiresAction: "upgrade_account",
    }
  }

  return { canLogin: true }
}

export function getRegionalWelcomeMessage(region: Region): string {
  switch (region) {
    case "nigeria":
      return "Welcome to DaytaTech.ai! 🇳🇬 Start your 30-day PRO trial and transform your business data into actionable insights. Specially designed for Nigerian businesses!"
    case "america":
      return "Welcome to DaytaTech.ai! 🇺🇸 Begin your 30-day PRO trial and unlock the power of AI-driven data analysis for your business."
    case "europe":
      return "Welcome to DaytaTech.ai! 🇪🇺 Start your 30-day PRO trial with GDPR-compliant data processing and European business insights."
    case "asia":
      return "Welcome to DaytaTech.ai! 🌏 Begin your 30-day PRO trial and discover AI-powered insights tailored for Asian markets."
    default:
      return "Welcome to DaytaTech.ai! 🌍 Start your 30-day PRO trial and discover how AI can revolutionize your data analysis workflow."
  }
}

export function getRegionalSupport(region: Region): {
  supportEmail: string
  supportPhone?: string
  supportHours: string
  language: string[]
} {
  switch (region) {
    case "nigeria":
      return {
        supportEmail: "support-ng@daytatech.ai",
        supportPhone: "+234-800-DAYTA-NG",
        supportHours: "9 AM - 6 PM WAT (Monday - Friday)",
        language: ["English", "Pidgin"],
      }
    case "america":
      return {
        supportEmail: "support-us@daytatech.ai",
        supportPhone: "+1-800-DAYTA-US",
        supportHours: "9 AM - 6 PM EST (Monday - Friday)",
        language: ["English", "Spanish"],
      }
    case "europe":
      return {
        supportEmail: "support-eu@daytatech.ai",
        supportPhone: "+44-800-DAYTA-EU",
        supportHours: "9 AM - 6 PM CET (Monday - Friday)",
        language: ["English", "German", "French"],
      }
    case "asia":
      return {
        supportEmail: "support-asia@daytatech.ai",
        supportHours: "9 AM - 6 PM JST (Monday - Friday)",
        language: ["English", "Japanese", "Chinese"],
      }
    default:
      return {
        supportEmail: "support@daytatech.ai",
        supportHours: "24/7 Global Support",
        language: ["English"],
      }
  }
}
