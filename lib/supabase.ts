import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

// Export the createClient function from supabase
export { createSupabaseClient as createClient }

// Singleton instance
let supabaseInstance: SupabaseClient | null = null

// Create and export a function to get the Supabase client
export function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // In development, provide helpful error
    if (process.env.NODE_ENV !== "production") {
      console.error("Supabase URL and anon key are required. Please check your environment variables.")
    }

    // Return a mock client for build time or when env vars are missing
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => ({ data: null, error: null }),
      }),
    } as unknown as SupabaseClient
  }

  supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}

// Export the default supabase client instance
export const supabase = getSupabaseClient()

// Server-side client for admin operations
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase URL and service role key are required for server operations")
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey)
}
