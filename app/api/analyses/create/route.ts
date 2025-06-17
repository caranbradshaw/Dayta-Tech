import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileSize, fileType, userId, industry, role, goals } = await request.json()

    if (!fileName || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create analysis record
    const { data: analysis, error } = await supabase
      .from("analyses")
      .insert({
        user_id: userId,
        file_name: fileName,
        file_size: fileSize,
        file_type: fileType,
        status: "processing",
        industry: industry || "general",
        role: role || "business_analyst",
        goals: goals || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create analysis" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      analysisId: analysis.id,
      message: "Analysis record created successfully",
    })
  } catch (error) {
    console.error("Create analysis error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
