import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const analysisId = formData.get("analysisId") as string
    const userId = formData.get("userId") as string

    if (!file || !analysisId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Upload file to Vercel Blob
    const blob = await put(`analyses/${analysisId}/${file.name}`, file, {
      access: "public",
    })

    // Update analysis record with file URL
    const { error: updateError } = await supabase
      .from("analyses")
      .update({
        file_url: blob.url,
        file_path: blob.pathname,
        updated_at: new Date().toISOString(),
      })
      .eq("id", analysisId)
      .eq("user_id", userId)

    if (updateError) {
      console.error("Failed to update analysis with file URL:", updateError)
      return NextResponse.json({ error: "Failed to save file reference" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      fileUrl: blob.url,
      filePath: blob.pathname,
      message: "File uploaded successfully",
    })
  } catch (error) {
    console.error("File upload error:", error)
    return NextResponse.json({ error: "File upload failed" }, { status: 500 })
  }
}
