/**
 * Client-safe environment variable access
 * Only accesses variables that are safe to use on the client side
 */

export interface ClientEnvConfig {
  hasSupabase: boolean
  mode: "demo" | "connected"
  supabaseUrl?: string
}

export function getClientEnvConfig(): ClientEnvConfig {
  // Only access public environment variables on client side
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const hasSupabase = !!(supabaseUrl && supabaseAnonKey)

  return {
    hasSupabase,
    mode: hasSupabase ? "connected" : "demo",
    supabaseUrl: hasSupabase ? supabaseUrl : undefined,
  }
}

export function isClientSide(): boolean {
  return typeof window !== "undefined"
}

export function isServerSide(): boolean {
  return typeof window === "undefined"
}
