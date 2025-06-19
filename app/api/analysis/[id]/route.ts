import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const analysisId = params.id

    if (!analysisId) {
      return NextResponse.json({ error: "Analysis ID is required" }, { status: 400 })
    }

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch the analysis
    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .select("*")
      .eq("id", analysisId)
      .eq("user_id", user.id)
      .single()

    if (analysisError) {
      console.error("Error fetching analysis:", analysisError)
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 })
    }

    // Update last accessed timestamp
    await supabase
      .from("analyses")
      .update({ last_accessed_at: new Date().toISOString() })
      .eq("id", analysisId)
      .eq("user_id", user.id)

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error("Error in analysis route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const analysisId = params.id
    const body = await request.json()

    if (!analysisId) {
      return NextResponse.json({ error: "Analysis ID is required" }, { status: 400 })
    }

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update the analysis
    const { data: analysis, error: updateError } = await supabase
      .from("analyses")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", analysisId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating analysis:", updateError)
      return NextResponse.json({ error: "Failed to update analysis" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error("Error in analysis update route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const analysisId = params.id

    if (!analysisId) {
      return NextResponse.json({ error: "Analysis ID is required" }, { status: 400 })
    }

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete the analysis
    const { error: deleteError } = await supabase.from("analyses").delete().eq("id", analysisId).eq("user_id", user.id)

    if (deleteError) {
      console.error("Error deleting analysis:", deleteError)
      return NextResponse.json({ error: "Failed to delete analysis" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Analysis deleted successfully",
    })
  } catch (error) {
    console.error("Error in analysis delete route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
