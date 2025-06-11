import { NextResponse } from "next/server"

export async function GET() {
  // List of environment variables to check
  const envVarsToCheck = [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "POSTGRES_URL",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL_NON_POOLING",
    "POSTGRES_USER",
    "POSTGRES_HOST",
    "POSTGRES_PASSWORD",
    "POSTGRES_DATABASE",
  ]

  // Check which environment variables are set
  const envStatus: Record<string, boolean> = {}

  for (const envVar of envVarsToCheck) {
    envStatus[envVar] = !!process.env[envVar]
  }

  // Return the status
  return NextResponse.json({
    envStatus,
    timestamp: new Date().toISOString(),
  })
}
