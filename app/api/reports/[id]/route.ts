import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reportId = params.id

    // Get report with related data
    const { data: report, error } = await supabase
      .from("reports")
      .select(`
        *,
        analyses(file_name, created_at),
        projects(name),
        report_exports(id, export_format, file_name, created_at, download_count)
      `)
      .eq("id", reportId)
      .single()

    if (error) {
      console.error("Error fetching report:", error)
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // Update last accessed time
    await supabase.from("reports").update({ last_accessed_at: new Date().toISOString() }).eq("id", reportId)

    return NextResponse.json({ report })
  } catch (error) {
    console.error("Error fetching report:", error)
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reportId = params.id
    const body = await request.json()
    const { title, description, tags, is_favorite } = body

    const { data: report, error } = await supabase
      .from("reports")
      .update({
        title,
        description,
        tags,
        is_favorite,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId)
      .select()
      .single()

    if (error) {
      console.error("Error updating report:", error)
      return NextResponse.json({ error: "Failed to update report" }, { status: 500 })
    }

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error("Error updating report:", error)
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reportId = params.id

    const { error } = await supabase.from("reports").delete().eq("id", reportId)

    if (error) {
      console.error("Error deleting report:", error)
      return NextResponse.json({ error: "Failed to delete report" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Report deleted successfully" })
  } catch (error) {
    console.error("Error deleting report:", error)
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 })
  }
}
