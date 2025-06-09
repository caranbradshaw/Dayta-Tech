import { NextResponse } from "next/server"
import { debugDatabase } from "@/lib/debug-analytics"

export async function GET() {
  try {
    const result = await debugDatabase()
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
