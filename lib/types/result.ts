// Unified result type for consistent error handling
export type Result<T> = { success: true; data: T } | { success: false; error: string; code?: string }

// Utility function for consistent error message extraction
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return String(error)
}

// Utility function for structured Supabase error logging
export function logSupabaseError(context: string, error: any) {
  console.error(`${context}:`, {
    message: error.message,
    code: error.code,
    hint: error.hint,
    details: error.details,
    timestamp: new Date().toISOString(),
  })
}

// Custom error classes for better error handling
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any,
  ) {
    super(message)
    this.name = "DatabaseError"
  }
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = "AuthError"
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message)
    this.name = "ValidationError"
  }
}
