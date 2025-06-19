import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: "v2.1.0", // Update this when you make changes
    routes: {
      selectRole: "/select-role",
      signup: "/signup",
      dashboard: "/dashboard",
    },
    features: {
      roleBasedOnboarding: true,
      aiAnalysis: true,
      pdfExport: true,
    },
  })
}
