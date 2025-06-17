import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const projectId = searchParams.get("projectId")
    const reportType = searchParams.get("reportType")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    let query = supabase
      .from("reports")
      .select(`
        id,
        title,
        description,
        report_type,
        status,
        summary,
        file_name,
        analysis_role,
        industry,
        company_name,
        tags,
        is_favorite,
        is_shared,
        generated_at,
        last_accessed_at,
        created_at,
        analyses(file_name, status),
        projects(name)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (projectId) {
      query = query.eq("project_id", projectId)
    }

    if (reportType) {
      query = query.eq("report_type", reportType)
    }

    const { data: reports, error } = await query

    if (error) {
      console.error("Error fetching reports:", error)
      return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase.from("reports").select("*", { count: "exact", head: true }).eq("user_id", userId)

    if (projectId) {
      countQuery = countQuery.eq("project_id", projectId)
    }

    if (reportType) {
      countQuery = countQuery.eq("report_type", reportType)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error("Error counting reports:", countError)
    }

    return NextResponse.json({
      reports: reports || [],
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    })
  } catch (error) {
    console.error("Error fetching reports list:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}
