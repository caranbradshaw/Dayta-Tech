import { type NextRequest, NextResponse } from "next/server"
import { RedisService } from "@/lib/redis-service"

export async function POST(request: NextRequest) {
  try {
    const { reportId } = await request.json()

    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 })
    }

    // Add to PDF generation queue
    await RedisService.addPDFJob(reportId)

    return NextResponse.json({
      message: "PDF generation job queued successfully",
      status: "queued",
    })
  } catch (error) {
    console.error("Error queuing PDF job:", error)
    return NextResponse.json({ error: "Failed to queue PDF job" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get("reportId")

    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 })
    }

    // Get PDF status
    const status = await RedisService.getPDFStatus(reportId)

    return NextResponse.json({
      reportId,
      status: status || "not_found",
    })
  } catch (error) {
    console.error("Error getting PDF status:", error)
    return NextResponse.json({ error: "Failed to get PDF status" }, { status: 500 })
  }
}
