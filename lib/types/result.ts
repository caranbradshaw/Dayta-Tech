// Enhanced Result type for better error handling
export type Result<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: string
      code?: string
    }

// Database error class
export class DatabaseError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = "DatabaseError"
    this.code = code
  }
}

// Utility functions
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

export function logSupabaseError(context: string, error: any): void {
  console.error(`${context}:`, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  })
}

// Success and error result helpers
export function success<T>(data: T): Result<T> {
  return { success: true, data }
}

export function failure(error: string, code?: string): Result<never> {
  return { success: false, error, code }
}
