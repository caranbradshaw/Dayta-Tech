import { NextResponse } from "next/server"
import { debugDatabase } from "@/lib/debug-analytics"

export async function GET() {
  try {
    const result = await debugDatabase()
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        fallbackMode: true,
      },
      { status: 500 },
    )
  }
}
