import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

// Only access environment variables on the server side or with proper checks
function getSupabaseConfig() {
  // Check if we're on the client side
  if (typeof window !== "undefined") {
    // On client side, only use public environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Missing public Supabase environment variables")
      return null
    }

    return { supabaseUrl, supabaseAnonKey }
  }

  // On server side, we can access all environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Missing Supabase environment variables")
    return null
  }

  return { supabaseUrl, supabaseAnonKey }
}

// Create the main Supabase client with error handling
let supabaseClient: any = null

try {
  const config = getSupabaseConfig()

  if (config) {
    supabaseClient = createClient<Database>(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })

    // Test connection only on client side to avoid server-side issues
    if (typeof window !== "undefined") {
      supabaseClient
        .from("profiles")
        .select("count")
        .limit(1)
        .then(({ error }: { error: any }) => {
          if (error && error.code !== "42P01") {
            console.error("Supabase connection error:", error)
          } else {
            console.log("✅ Supabase connected successfully")
          }
        })
        .catch((error: any) => {
          console.error("Supabase connection failed:", error)
        })
    }
  }
} catch (error) {
  console.error("Failed to initialize Supabase client:", error)
}

export const supabase = supabaseClient
export default supabaseClient
