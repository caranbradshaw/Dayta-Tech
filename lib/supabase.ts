import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

// Debug environment variables (only in development)
if (process.env.NODE_ENV === "development") {
  console.log("Supabase Environment Check:", {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing",
    urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`Missing Supabase environment variables:
    NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "✅" : "❌"}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? "✅" : "❌"}
  `)
}

// Legacy client for backward compatibility (use sparingly)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
})

// For client components - preferred method
export function createClientSupabase() {
  return createClientComponentClient<Database>()
}

// For server components (to be used with cookies)
export function createServerSupabase(cookies: any) {
  return createServerComponentClient<Database>({ cookies })
}

// For server-side operations with service role
export function createServerClient() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseServiceKey) {
    console.warn("Supabase service role key not found - some server operations may not work")
    return null
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Export for backward compatibility
export { supabase as default }
export type { Database }

// Export createClient function for other modules
export { createClient } from "@supabase/supabase-js"
