import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query params
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    let query = supabase
      .from("analyses")
      .select(`
        id,
        user_id,
        file_name,
        file_type,
        file_size,
        status,
        summary,
        analysis_role,
        industry,
        created_at,
        updated_at,
        processing_completed_at,
        metadata
      `)
      .order("created_at", { ascending: false })

    // If userId is provided, filter by user
    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { data: analyses, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch analyses" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      analyses: analyses || [],
      count: analyses?.length || 0,
    })
  } catch (error) {
    console.error("Error fetching analyses:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch analyses",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
