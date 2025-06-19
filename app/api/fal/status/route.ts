import { type NextRequest, NextResponse } from "next/server"
import { FALService } from "@/lib/fal-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get("taskId")
    const taskType = searchParams.get("type") as "pdf" | "analysis"

    if (!taskId || !taskType) {
      return NextResponse.json({ error: "Task ID and type are required" }, { status: 400 })
    }

    // Check task status
    const result = await FALService.checkTaskStatus(taskId, taskType)

    return NextResponse.json({
      taskId,
      status: result.status,
      progress: result.progress,
      result: result.result,
      error: result.error,
    })
  } catch (error) {
    console.error("Error checking task status:", error)
    return NextResponse.json({ error: "Failed to check task status" }, { status: 500 })
  }
}
