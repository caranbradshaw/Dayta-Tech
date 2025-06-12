import { NextResponse } from "next/server"
import { generateEnvTemplate } from "@/lib/supabase-setup-helper"

export async function GET() {
  try {
    const template = generateEnvTemplate()

    return NextResponse.json({
      success: true,
      template,
    })
  } catch (error) {
    console.error("Error generating env template:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        error,
      },
      { status: 500 },
    )
  }
}
