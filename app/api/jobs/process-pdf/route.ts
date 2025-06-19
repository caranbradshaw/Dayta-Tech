import { type NextRequest, NextResponse } from "next/server"
import { RedisService } from "@/lib/redis-service"
import { generatePDFBuffer } from "@/lib/pdfBuilder"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Process PDF queue
    const jobs = await RedisService.processPDFQueue()

    if (jobs.length === 0) {
      return NextResponse.json({ message: "No jobs to process" })
    }

    const supabase = createServerComponentClient({ cookies })
    const processedJobs = []

    for (const reportId of jobs) {
      try {
        // Update status to processing
        await RedisService.updatePDFStatus(reportId, "processing")

        // Get report data from database
        const { data: report, error } = await supabase.from("analyses").select("*").eq("id", reportId).single()

        if (error || !report) {
          await RedisService.updatePDFStatus(reportId, "failed")
          continue
        }

        // Generate PDF
        const pdfBuffer = await generatePDFBuffer({
          file_name: report.file_name,
          content: report.content,
        })

        // Upload to storage
        const pdfPath = `analyses/${report.user_id}/${report.file_name}-${Date.now()}.pdf`
        const { error: uploadError } = await supabase.storage.from("daytatech-pdfs").upload(pdfPath, pdfBuffer, {
          contentType: "application/pdf",
          upsert: true,
        })

        if (uploadError) {
          await RedisService.updatePDFStatus(reportId, "failed")
          continue
        }

        // Update database with PDF URL
        const publicUrl = supabase.storage.from("daytatech-pdfs").getPublicUrl(pdfPath).data.publicUrl

        await supabase.from("analyses").update({ pdf_url: publicUrl }).eq("id", reportId)

        // Update status to completed
        await RedisService.updatePDFStatus(reportId, "completed")

        processedJobs.push({
          reportId,
          status: "completed",
          pdfUrl: publicUrl,
        })
      } catch (error) {
        console.error(`Error processing PDF job ${reportId}:`, error)
        await RedisService.updatePDFStatus(reportId, "failed")
      }
    }

    return NextResponse.json({
      message: `Processed ${processedJobs.length} PDF jobs`,
      jobs: processedJobs,
    })
  } catch (error) {
    console.error("Error processing PDF jobs:", error)
    return NextResponse.json({ error: "Failed to process PDF jobs" }, { status: 500 })
  }
}
