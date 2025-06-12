/**
 * Environment variable checker and fallback configuration
 * This helps identify what's missing and provides fallbacks
 */

export interface EnvConfig {
  hasDatabase: boolean
  hasAI: boolean
  hasStorage: boolean
  hasEmail: boolean
  missingVars: string[]
  mode: "full" | "demo" | "partial"
}

export function checkEnvironment(): EnvConfig {
  // Only check server-side environment variables when running on server
  if (typeof window !== "undefined") {
    // Client-side fallback - return demo mode
    return {
      hasDatabase: false,
      hasAI: false,
      hasStorage: false,
      hasEmail: false,
      missingVars: ["Client-side check - use server API"],
      mode: "demo",
    }
  }

  const requiredForDatabase = ["POSTGRES_URL", "POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_HOST"]
  const requiredForAI = ["OPENAI_API_KEY", "CLAUDE_API_KEY", "GROQ_API_KEY"]
  const requiredForStorage = ["BLOB_READ_WRITE_TOKEN"]
  const requiredForEmail = ["SENDGRID_API_KEY", "FROM_EMAIL"]

  const missingVars: string[] = []

  // Check database vars
  const hasDatabase = requiredForDatabase.every((varName) => {
    const exists = !!process.env[varName]
    if (!exists) missingVars.push(varName)
    return exists
  })

  // Check AI vars (at least one should exist)
  const hasAI = requiredForAI.some((varName) => !!process.env[varName])
  if (!hasAI) {
    missingVars.push("At least one AI API key (OPENAI_API_KEY, CLAUDE_API_KEY, or GROQ_API_KEY)")
  }

  // Check storage vars
  const hasStorage = requiredForStorage.every((varName) => {
    const exists = !!process.env[varName]
    if (!exists) missingVars.push(varName)
    return exists
  })

  // Check email vars
  const hasEmail = requiredForEmail.every((varName) => {
    const exists = !!process.env[varName]
    if (!exists) missingVars.push(varName)
    return exists
  })

  // Determine mode
  let mode: "full" | "demo" | "partial" = "demo"
  if (hasDatabase && hasAI && hasStorage) {
    mode = "full"
  } else if (hasDatabase || hasAI) {
    mode = "partial"
  }

  return {
    hasDatabase,
    hasAI,
    hasStorage,
    hasEmail,
    missingVars,
    mode,
  }
}

export function getEnvironmentStatus() {
  const config = checkEnvironment()

  return {
    ...config,
    message:
      config.mode === "full"
        ? "All services configured - running in full mode"
        : config.mode === "partial"
          ? "Some services configured - running in partial mode"
          : "No external services configured - running in demo mode",
    recommendations:
      config.missingVars.length > 0
        ? `Consider adding: ${config.missingVars.join(", ")}`
        : "All required environment variables are set",
  }
}
