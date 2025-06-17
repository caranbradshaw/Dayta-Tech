import { NextResponse } from "next/server"

export async function GET() {
  try {
    const startTime = Date.now()

    // Test environment variables
    const envCheck = {
      GROQ_API_KEY: !!process.env.GROQ_API_KEY,
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      CLAUDE_API_KEY: !!process.env.CLAUDE_API_KEY,
      BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }

    // Test AI service imports
    const serviceTests = {
      groq_import: false,
      openai_import: false,
      supabase_import: false,
    }

    try {
      await import("groq-sdk")
      serviceTests.groq_import = true
    } catch (e) {
      console.warn("Groq import failed:", e)
    }

    try {
      await import("openai")
      serviceTests.openai_import = true
    } catch (e) {
      console.warn("OpenAI import failed:", e)
    }

    try {
      await import("@/lib/supabase")
      serviceTests.supabase_import = true
    } catch (e) {
      console.warn("Supabase import failed:", e)
    }

    // Test file processing
    const testBuffer = Buffer.from("test,data,file\n1,2,3\n4,5,6", "utf-8")
    let fileProcessingTest = false
    try {
      const lines = testBuffer.toString("utf-8").split("\n")
      fileProcessingTest = lines.length > 0
    } catch (e) {
      console.warn("File processing test failed:", e)
    }

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      processingTime,
      environment: {
        runtime: "nodejs",
        region: process.env.VERCEL_REGION || "unknown",
        deployment: process.env.VERCEL_ENV || "development",
      },
      checks: {
        environment_variables: envCheck,
        service_imports: serviceTests,
        file_processing: fileProcessingTest,
      },
      recommendations: {
        ai_providers_available: Object.values(envCheck).filter(Boolean).length,
        ready_for_production: envCheck.GROQ_API_KEY || envCheck.OPENAI_API_KEY,
        blob_storage_ready: envCheck.BLOB_READ_WRITE_TOKEN,
        database_ready: envCheck.NEXT_PUBLIC_SUPABASE_URL && envCheck.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Serverless test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export const runtime = "nodejs"
export const maxDuration = 10
