import { type NextRequest, NextResponse } from "next/server"
import { FALService } from "@/lib/fal-service"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get("taskId")
    const taskType = searchParams.get("type") as "pdf" | "analysis"

    if (!taskId || !taskType) {
      return NextResponse.json({ error: "Task ID and type are required" }, { status: 400 })
    }

    // Get task result
    const result = await FALService.getTaskResult(taskId, taskType)

    // Update database with result
    if (taskType === "pdf") {
      await supabase
        .from("analyses")
        .update({
          pdf_url: result.pdfUrl,
          pdf_status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("pdf_task_id", taskId)
    } else {
      await supabase
        .from("analyses")
        .update({
          summary: result.summary,
          insights: result.insights,
          recommendations: result.recommendations,
          analysis_status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("analysis_task_id", taskId)
    }

    return NextResponse.json({
      success: true,
      taskId,
      result,
    })
  } catch (error) {
    console.error("Error getting task result:", error)
    return NextResponse.json({ error: "Failed to get task result" }, { status: 500 })
  }
}
