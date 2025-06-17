import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("AI Debug Test - Checking environment variables...")

    const envCheck = {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      CLAUDE_API_KEY: !!process.env.CLAUDE_API_KEY,
      GROQ_API_KEY: !!process.env.GROQ_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
    }

    console.log("Environment check:", envCheck)

    // Test basic AI service import
    try {
      const { analyzeUploadedFile } = await import("@/lib/ai-service")
      console.log("AI service imported successfully")
    } catch (importError) {
      console.error("AI service import error:", importError)
      return NextResponse.json({
        success: false,
        error: "AI service import failed",
        details: importError instanceof Error ? importError.message : "Unknown import error",
        envCheck,
      })
    }

    // Test data processor import
    try {
      const { processUploadedFile } = await import("@/lib/data-processor")
      console.log("Data processor imported successfully")
    } catch (importError) {
      console.error("Data processor import error:", importError)
      return NextResponse.json({
        success: false,
        error: "Data processor import failed",
        details: importError instanceof Error ? importError.message : "Unknown import error",
        envCheck,
      })
    }

    return NextResponse.json({
      success: true,
      message: "AI services are properly configured",
      envCheck,
      availableProviders: [
        ...(process.env.OPENAI_API_KEY ? ["openai"] : []),
        ...(process.env.CLAUDE_API_KEY ? ["claude"] : []),
        ...(process.env.GROQ_API_KEY ? ["groq"] : []),
        "fallback",
      ],
    })
  } catch (error) {
    console.error("AI debug test error:", error)
    return NextResponse.json({
      success: false,
      error: "AI debug test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
