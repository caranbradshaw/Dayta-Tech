import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/database.types"
import { type Result, getErrorMessage, logSupabaseError, DatabaseError } from "@/lib/types/result"

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Analysis = Database["public"]["Tables"]["analyses"]["Row"]

// Helper function to get server supabase client
function getServerSupabase() {
  return createServerComponentClient<Database>({ cookies })
}

// Improved user profile management with Result type
export async function getUserProfile(userId: string): Promise<Result<Profile | null>> {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    const supabase = getServerSupabase()
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      if (error.code === "PGRST116") {
        // Profile doesn't exist - this is not an error, just return null
        return { success: true, data: null }
      }

      logSupabaseError("Error fetching user profile", error)
      return {
        success: false,
        error: `Failed to fetch user profile: ${error.message}`,
        code: error.code,
      }
    }

    return { success: true, data }
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("Unexpected error in getUserProfile:", message)
    return { success: false, error: `Unexpected error: ${message}` }
  }
}

export async function createUserProfile(
  profileData: Database["public"]["Tables"]["profiles"]["Insert"],
): Promise<Result<Profile>> {
  try {
    // Validate required fields
    if (!profileData.id || !profileData.email) {
      return { success: false, error: "User ID and email are required" }
    }

    const supabase = getServerSupabase()
    const { data, error } = await supabase.from("profiles").insert(profileData).select().single()

    if (error) {
      logSupabaseError("Error creating user profile", error)
      return {
        success: false,
        error: `Failed to create user profile: ${error.message}`,
        code: error.code,
      }
    }

    return { success: true, data }
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("Unexpected error in createUserProfile:", message)
    return { success: false, error: `Unexpected error: ${message}` }
  }
}

export async function updateUserProfile(userId: string, updates: Partial<Profile>): Promise<Result<Profile>> {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    const supabase = getServerSupabase()
    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      logSupabaseError("Error updating user profile", error)
      return {
        success: false,
        error: `Failed to update user profile: ${error.message}`,
        code: error.code,
      }
    }

    return { success: true, data }
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("Unexpected error in updateUserProfile:", message)
    return { success: false, error: `Unexpected error: ${message}` }
  }
}

// Improved usage stats with better error handling
export async function getUserUsageStats(
  userId: string,
  month?: string,
): Promise<
  Result<{
    reports_created: number
    reports_exported: number
    files_uploaded: number
    storage_used_mb: number
  }>
> {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    const supabase = getServerSupabase()
    const startOfMonth = month ? new Date(month) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0)

    // Get reports created this month
    const { count: reportsCreated, error: reportsError } = await supabase
      .from("analyses")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString())
      .lte("created_at", endOfMonth.toISOString())

    if (reportsError) {
      logSupabaseError("Error fetching reports count", reportsError)
      throw new DatabaseError(`Failed to fetch reports count: ${reportsError.message}`, reportsError.code)
    }

    // Get file activities for exports
    const { count: reportsExported, error: exportsError } = await supabase
      .from("file_activities")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("activity_type", "export")
      .gte("created_at", startOfMonth.toISOString())
      .lte("created_at", endOfMonth.toISOString())

    if (exportsError) {
      logSupabaseError("Error fetching exports count", exportsError)
      throw new DatabaseError(`Failed to fetch exports count: ${exportsError.message}`, exportsError.code)
    }

    // Get files uploaded
    const { count: filesUploaded, error: uploadsError } = await supabase
      .from("file_uploads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString())
      .lte("created_at", endOfMonth.toISOString())

    if (uploadsError) {
      logSupabaseError("Error fetching uploads count", uploadsError)
      throw new DatabaseError(`Failed to fetch uploads count: ${uploadsError.message}`, uploadsError.code)
    }

    // Calculate storage used (sum of file sizes)
    const { data: storageData, error: storageError } = await supabase
      .from("file_uploads")
      .select("file_size")
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString())
      .lte("created_at", endOfMonth.toISOString())

    if (storageError) {
      logSupabaseError("Error fetching storage data", storageError)
      throw new DatabaseError(`Failed to fetch storage data: ${storageError.message}`, storageError.code)
    }

    let storageUsedMb = 0
    if (!storageData) {
      console.warn("Failed to load file sizes for user storage calculation - storageData is null")
    } else {
      const storageUsedBytes = storageData.reduce((sum, file) => sum + (file.file_size || 0), 0)
      storageUsedMb = Math.round(storageUsedBytes / (1024 * 1024))
    }

    return {
      success: true,
      data: {
        reports_created: reportsCreated || 0,
        reports_exported: reportsExported || 0,
        files_uploaded: filesUploaded || 0,
        storage_used_mb: storageUsedMb,
      },
    }
  } catch (error) {
    if (error instanceof DatabaseError) {
      return { success: false, error: error.message, code: error.code }
    }

    const message = getErrorMessage(error)
    console.error("Unexpected error in getUserUsageStats:", message)
    return { success: false, error: `Failed to fetch usage stats: ${message}` }
  }
}

// Improved subscription management
export async function getUserSubscription(userId: string): Promise<Result<Subscription | null>> {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    const supabase = getServerSupabase()
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No active subscription found - this is not an error
        return { success: true, data: null }
      }

      logSupabaseError("Error fetching user subscription", error)
      return {
        success: false,
        error: `Failed to fetch subscription: ${error.message}`,
        code: error.code,
      }
    }

    return { success: true, data }
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("Unexpected error in getUserSubscription:", message)
    return { success: false, error: `Unexpected error: ${message}` }
  }
}

// Improved usage limit checking
export async function checkUsageLimit(
  userId: string,
  limitType: "reports" | "exports" | "uploads",
): Promise<
  Result<{
    current: number
    limit: number
    canProceed: boolean
  }>
> {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    const subscriptionResult = await getUserSubscription(userId)
    if (!subscriptionResult.success) {
      return { success: false, error: `Failed to check subscription: ${subscriptionResult.error}` }
    }

    const subscription = subscriptionResult.data
    if (!subscription) {
      return {
        success: true,
        data: { current: 0, limit: 0, canProceed: false },
      }
    }

    const usageResult = await getUserUsageStats(userId)
    if (!usageResult.success) {
      return { success: false, error: `Failed to check usage: ${usageResult.error}` }
    }

    const usage = usageResult.data

    let current: number
    let limit: number

    switch (limitType) {
      case "reports":
        current = usage.reports_created
        limit = subscription.monthly_reports_limit
        break
      case "exports":
        current = usage.reports_exported
        limit = subscription.monthly_exports_limit
        break
      case "uploads":
        current = usage.files_uploaded
        limit = subscription.monthly_uploads_limit
        break
      default:
        return { success: false, error: `Invalid limit type: ${limitType}` }
    }

    return {
      success: true,
      data: {
        current,
        limit,
        canProceed: current < limit,
      },
    }
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("Unexpected error in checkUsageLimit:", message)
    return { success: false, error: `Failed to check usage limit: ${message}` }
  }
}

// Improved credits management
export async function checkUserCredits(userId: string): Promise<
  Result<{
    upload_credits: number
    export_credits: number
    account_type: string
  } | null>
> {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    const supabase = getServerSupabase()
    const { data, error } = await supabase
      .from("profiles")
      .select("upload_credits, export_credits, account_type")
      .eq("id", userId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return { success: true, data: null }
      }

      logSupabaseError("Error checking user credits", error)
      return {
        success: false,
        error: `Failed to check credits: ${error.message}`,
        code: error.code,
      }
    }

    return { success: true, data }
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("Unexpected error in checkUserCredits:", message)
    return { success: false, error: `Unexpected error: ${message}` }
  }
}

export async function deductCredits(userId: string, uploadCredits = 0, exportCredits = 0): Promise<Result<any>> {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    if (uploadCredits < 0 || exportCredits < 0) {
      return { success: false, error: "Credit amounts must be non-negative" }
    }

    const supabase = getServerSupabase()
    const { data, error } = await supabase.rpc("deduct_user_credits", {
      user_id: userId,
      upload_credits: uploadCredits,
      export_credits: exportCredits,
    })

    if (error) {
      logSupabaseError("Error deducting user credits", error)
      return {
        success: false,
        error: `Failed to deduct credits: ${error.message}`,
        code: error.code,
      }
    }

    return { success: true, data }
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("Unexpected error in deductCredits:", message)
    return { success: false, error: `Unexpected error: ${message}` }
  }
}
