import { type NextRequest, NextResponse } from "next/server"
import { customFieldsService } from "@/lib/custom-fields-service"
import { createClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { fieldType, fieldValue } = await request.json()

    // Get current user
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    // Validate input
    if (!fieldType || !fieldValue) {
      return NextResponse.json({ success: false, error: "Field type and value are required" }, { status: 400 })
    }

    if (!["industry", "role"].includes(fieldType)) {
      return NextResponse.json({ success: false, error: "Invalid field type" }, { status: 400 })
    }

    // Record the custom field
    const result = await customFieldsService.recordCustomField(fieldType as "industry" | "role", fieldValue, user.id)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in custom fields API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fieldType = searchParams.get("type") as "industry" | "role"
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!fieldType || !["industry", "role"].includes(fieldType)) {
      return NextResponse.json({ success: false, error: "Valid field type required" }, { status: 400 })
    }

    const result = await customFieldsService.getPopularCustomFields(fieldType, limit)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error("Error in custom fields GET API:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
