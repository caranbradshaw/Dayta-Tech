import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { updateUserProfile } from "@/lib/supabase-utils"

export async function POST(request: NextRequest) {
  try {
    const { userId, fileName, fileType, fileSize } = await request.json()

    if (!userId || !fileName || !fileType) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Get user profile to check credits
    const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Check if user has upload credits (for basic users)
    if (profile.account_type === "basic" && profile.upload_credits <= 0) {
      return NextResponse.json({ error: "Upload limit reached" }, { status: 403 })
    }

    // Create analysis record
    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .insert({
        user_id: userId,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
        status: "processing",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (analysisError) {
      console.error("Error creating analysis:", analysisError)
      return NextResponse.json({ error: "Failed to create analysis" }, { status: 500 })
    }

    // Deduct upload credit for basic users
    if (profile.account_type === "basic") {
      await updateUserProfile(userId, {
        upload_credits: profile.upload_credits - 1,
      })
    }

    // Log the file activity
    await supabase.from("file_activities").insert({
      user_id: userId,
      analysis_id: analysis.id,
      activity_type: "upload_started",
      file_name: fileName,
      file_size: fileSize,
      activity_details: {
        file_type: fileType,
        account_type: profile.account_type,
      },
    })

    return NextResponse.json({
      success: true,
      analysisId: analysis.id,
    })
  } catch (error) {
    console.error("Analysis creation error:", error)
    return NextResponse.json(
      {
        error: "Failed to create analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
