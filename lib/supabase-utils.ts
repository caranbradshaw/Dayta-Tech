import { supabase } from "@/lib/supabase"
import type { Database } from "@/types/database.types"

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"]
type Organization = Database["public"]["Tables"]["organizations"]["Row"]
type OrganizationMember = Database["public"]["Tables"]["organization_members"]["Row"]
type Project = Database["public"]["Tables"]["projects"]["Row"]
type Insight = Database["public"]["Tables"]["insights"]["Row"]
type Analysis = Database["public"]["Tables"]["analyses"]["Row"]
type Profile = Database["public"]["Tables"]["profiles"]["Row"]

// Subscription Management
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      throw error
    }

    return data || null
  } catch (error) {
    console.error("Error fetching subscription:", error)
    return null
  }
}

export async function createSubscription(
  subscription: Database["public"]["Tables"]["subscriptions"]["Insert"],
): Promise<Subscription | null> {
  try {
    const { data, error } = await supabase.from("subscriptions").insert(subscription).select().single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating subscription:", error)
    return null
  }
}

export async function updateSubscription(
  id: string,
  updates: Database["public"]["Tables"]["subscriptions"]["Update"],
): Promise<Subscription | null> {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error updating subscription:", error)
    return null
  }
}

// Organization Management
export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  try {
    const { data, error } = await supabase
      .from("organizations")
      .select(`
        *,
        organization_members!inner(user_id, role, status)
      `)
      .eq("organization_members.user_id", userId)
      .eq("organization_members.status", "active")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching organizations:", error)
    return []
  }
}

export async function createOrganization(
  organization: Database["public"]["Tables"]["organizations"]["Insert"],
): Promise<Organization | null> {
  try {
    const { data, error } = await supabase.from("organizations").insert(organization).select().single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating organization:", error)
    return null
  }
}

export async function getOrganizationMembers(
  organizationId: string,
): Promise<(OrganizationMember & { profiles: Pick<Profile, "name" | "email"> })[]> {
  try {
    const { data, error } = await supabase
      .from("organization_members")
      .select(`
        *,
        profiles(name, email)
      `)
      .eq("organization_id", organizationId)
      .eq("status", "active")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching organization members:", error)
    return []
  }
}

export async function addOrganizationMember(
  member: Database["public"]["Tables"]["organization_members"]["Insert"],
): Promise<OrganizationMember | null> {
  try {
    const { data, error } = await supabase.from("organization_members").insert(member).select().single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error adding organization member:", error)
    return null
  }
}

// Project Management
export async function getOrganizationProjects(organizationId: string): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching projects:", error)
    return []
  }
}

export async function createProject(
  project: Database["public"]["Tables"]["projects"]["Insert"],
): Promise<Project | null> {
  try {
    const { data, error } = await supabase.from("projects").insert(project).select().single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating project:", error)
    return null
  }
}

export async function getProjectAnalyses(projectId: string): Promise<Analysis[]> {
  try {
    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching project analyses:", error)
    return []
  }
}

// Insights Management
export async function getProjectInsights(projectId: string): Promise<Insight[]> {
  try {
    const { data, error } = await supabase
      .from("insights")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching project insights:", error)
    return []
  }
}

export async function getAnalysisInsights(analysisId: string): Promise<Insight[]> {
  try {
    const { data, error } = await supabase
      .from("insights")
      .select("*")
      .eq("analysis_id", analysisId)
      .order("confidence_score", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching analysis insights:", error)
    return []
  }
}

export async function createInsight(
  insight: Database["public"]["Tables"]["insights"]["Insert"],
): Promise<Insight | null> {
  try {
    const { data, error } = await supabase.from("insights").insert(insight).select().single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating insight:", error)
    return null
  }
}

// Usage Tracking
export async function getUserUsageStats(
  userId: string,
  month?: string,
): Promise<{
  reports_created: number
  reports_exported: number
  files_uploaded: number
  storage_used_mb: number
}> {
  try {
    const startOfMonth = month ? new Date(month) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0)

    // Get reports created this month
    const { count: reportsCreated } = await supabase
      .from("analyses")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString())
      .lte("created_at", endOfMonth.toISOString())

    // Get file activities for exports
    const { count: reportsExported } = await supabase
      .from("file_activities")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("activity_type", "export")
      .gte("created_at", startOfMonth.toISOString())
      .lte("created_at", endOfMonth.toISOString())

    // Get files uploaded
    const { count: filesUploaded } = await supabase
      .from("file_uploads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString())
      .lte("created_at", endOfMonth.toISOString())

    // Calculate storage used (sum of file sizes)
    const { data: storageData } = await supabase
      .from("file_uploads")
      .select("file_size")
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString())
      .lte("created_at", endOfMonth.toISOString())

    const storageUsedBytes = storageData?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0
    const storageUsedMb = Math.round(storageUsedBytes / (1024 * 1024))

    return {
      reports_created: reportsCreated || 0,
      reports_exported: reportsExported || 0,
      files_uploaded: filesUploaded || 0,
      storage_used_mb: storageUsedMb,
    }
  } catch (error) {
    console.error("Error fetching usage stats:", error)
    return {
      reports_created: 0,
      reports_exported: 0,
      files_uploaded: 0,
      storage_used_mb: 0,
    }
  }
}

// Feature Access Control
export async function checkFeatureAccess(userId: string, feature: string): Promise<boolean> {
  try {
    const subscription = await getUserSubscription(userId)
    if (!subscription) return false

    const features = subscription.features as Record<string, boolean>
    return features[feature] === true
  } catch (error) {
    console.error("Error checking feature access:", error)
    return false
  }
}

export async function checkUsageLimit(
  userId: string,
  limitType: "reports" | "exports" | "uploads",
): Promise<{
  current: number
  limit: number
  canProceed: boolean
}> {
  try {
    const subscription = await getUserSubscription(userId)
    if (!subscription) {
      return { current: 0, limit: 0, canProceed: false }
    }

    const usage = await getUserUsageStats(userId)

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
        return { current: 0, limit: 0, canProceed: false }
    }

    return {
      current,
      limit,
      canProceed: current < limit,
    }
  } catch (error) {
    console.error("Error checking usage limit:", error)
    return { current: 0, limit: 0, canProceed: false }
  }
}

// Add this function after the existing functions
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      throw error
    }

    return data || null
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

export async function createUserProfile(
  profile: Database["public"]["Tables"]["profiles"]["Insert"],
): Promise<Profile | null> {
  try {
    const { data, error } = await supabase.from("profiles").insert(profile).select().single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error creating user profile:", error)
    return null
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Database["public"]["Tables"]["profiles"]["Update"],
): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error updating user profile:", error)
    return null
  }
}
