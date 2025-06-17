import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Analysis ID is required" }, { status: 400 })
    }

    // Fetch analysis from database
    const { data: analysis, error } = await supabase
      .from("analyses")
      .select(`
        *,
        insights (
          id,
          type,
          title,
          content,
          confidence_score,
          metadata,
          ai_model,
          processing_time_ms,
          created_at
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error("Error fetching analysis:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
