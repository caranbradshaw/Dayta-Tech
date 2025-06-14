import * as crypto from 'crypto';
export type AccountType = "trial_pro" | "basic" | "pro" | "team" | "enterprise"
export type UserRole = "data-scientist" | "data-engineer" | "business-analyst" | "admin" | "support-admin"
export type TrialStatus = "active" | "expired" | "converted" | "none"
export type Region = "nigeria" | "america" | "global"

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
  teamCollaboration: boolean // REMOVED from trial
  prioritySupport: boolean
  apiAccess: boolean
  customReports: boolean
  dataExport: boolean
  realTimeAnalytics: boolean
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
  signupDate: string
  preferences?: {
    analysisStyle: "executive" | "technical" | "business"
    reportFormat: "detailed" | "summary" | "visual"
    industryFocus: boolean
  }
}

// PRO Trial Features (Full PRO access for 30 days) - REMOVED team collaboration
export const proTrialFeatures: ProFeatures = {
  maxUploadsPerMonth: "unlimited",
  maxFileSize: 500, // 500MB
  advancedInsights: true,
  allFileFormats: true,
  industrySpecificAnalysis: true,
  historicalLearning: true,
  teamCollaboration: false, // REMOVED from trial - upgrade required
  prioritySupport: true,
  apiAccess: true,
  customReports: true,
  dataExport: true,
  realTimeAnalytics: true,
}

// Default Login Rules
export const defaultLoginRules: LoginRules = {
  requireEmailVerification: true,
  maxLoginAttempts: 5,
  lockoutDuration: 30, // 30 minutes
  requireStrongPassword: true,
  enableTwoFactor: false, // Optional for trial
  sessionTimeout: 24, // 24 hours
  allowedRegions: ["nigeria", "america", "global"],
}

// Email Rules by Region
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
  global: {
    requireVerification: true,
    verificationExpiry: 48,
    maxResendAttempts: 5,
    allowedDomains: [],
    blockedDomains: ["tempmail.com", "10minutemail.com", "guerrillamail.com"],
    requireCorporateEmail: false,
    autoApproveRegions: ["nigeria", "america", "global"],
  },
}

// Regional Pricing (in local currency) - Updated Nigerian pricing
export const regionalPricing = {
  nigeria: {
    currency: "NGN",
    symbol: "₦",
    basic: { monthly: 58500, annual: 585000 }, // ~$39 USD (1 USD = 1,500 NGN)
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
  const nigerianDomains = [".ng", "nitel.net", "yahoo.com.ng", "gmail.com"]
  if (nigerianDomains.some((d) => domain?.includes(d))) {
    return "nigeria"
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
  company: string, // Now required
  role: UserRole = "business-analyst",
  region?: Region,
): TrialSubscription {
  const detectedRegion = region || detectUserRegion(email)
  const trialStartDate = new Date()
  const trialEndDate = new Date(trialStartDate.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

  return {
    id: `trial_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`,
    userId: `user_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`,
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

export function createUserAIContext(region: Region, industry: string, role: UserRole, company: string): UserAIContext {
  return {
    region,
    industry,
    role,
    company,
    signupDate: new Date().toISOString(),
    preferences: {
      analysisStyle: role === "data-scientist" ? "technical" : role === "business-analyst" ? "business" : "executive",
      reportFormat: "detailed",
      industryFocus: true,
    },
  }
}

export function getAIContextualPrompt(context: UserAIContext, fileName: string): string {
  const { region, industry, role, company } = context

  const regionContext =
    region === "nigeria"
      ? "Nigerian market context"
      : region === "america"
        ? "US market context"
        : "global market context"

  const rolePrompt =
    {
      "data-scientist": "Focus on statistical analysis, machine learning opportunities, and technical insights",
      "data-engineer": "Emphasize data quality, schema optimization, and technical architecture recommendations",
      "business-analyst": "Provide business insights, KPI analysis, and operational recommendations",
      admin: "Focus on high-level strategic insights and executive decision support",
    }[role] || "Provide comprehensive business analysis"

  return `
CONTEXTUAL ANALYSIS REQUEST
===========================

Company: ${company}
Industry: ${industry}
Role: ${role.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
Region: ${regionContext}
File: ${fileName}

ANALYSIS REQUIREMENTS:
1. ${rolePrompt}
2. Tailor insights specifically for ${industry} industry
3. Consider ${regionContext} and regional business practices
4. Provide recommendations suitable for ${company}
5. Use language and examples relevant to a ${role.replace("-", " ")}

Please provide analysis that demonstrates deep understanding of:
- ${industry} industry dynamics and challenges
- ${region === "nigeria" ? "Nigerian business environment and market conditions" : region === "america" ? "US business environment and market conditions" : "Global business environment"}
- Role-specific needs and priorities for a ${role.replace("-", " ")}
- Company-specific insights for ${company}
`
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
    default:
      return {
        supportEmail: "support@daytatech.ai",
        supportHours: "24/7 Global Support",
        language: ["English"],
      }
  }
}
