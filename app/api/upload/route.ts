import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    console.log("=== File Upload API Called ===")

    const formData = await request.formData()
    const file = formData.get("file") as File
    const analysisId = formData.get("analysisId") as string
    const userId = formData.get("userId") as string

    if (!file || !analysisId || !userId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    console.log("Upload parameters:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      analysisId,
      userId,
    })

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 50MB limit" }, { status: 413 })
    }

    // Convert File to Buffer for reliable storage
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Vercel Blob
    const filename = `${analysisId}/${file.name}`
    const blob = await put(filename, buffer, {
      access: "public",
      contentType: file.type,
    })

    console.log("File uploaded successfully:", {
      url: blob.url,
      size: buffer.length,
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: file.name,
      size: file.size,
      analysisId,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export const runtime = "nodejs"
export const maxDuration = 30
