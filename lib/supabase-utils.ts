import { createClient } from "@/lib/supabase"
import type { Subscription, Organization, OrganizationMember, Project, Insight, Analysis } from "@/types/database"

const supabase = createClient()

// Subscription Management
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .single()

  if (error) throw error
  return data
}

export async function createSubscription(subscription: Partial<Subscription>): Promise<Subscription> {
  const { data, error } = await supabase.from("subscriptions").insert(subscription).select().single()

  if (error) throw error
  return data
}

export async function updateSubscription(id: string, updates: Partial<Subscription>): Promise<Subscription> {
  const { data, error } = await supabase
    .from("subscriptions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Organization Management
export async function getUserOrganizations(userId: string): Promise<Organization[]> {
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
}

export async function createOrganization(organization: Partial<Organization>): Promise<Organization> {
  const { data, error } = await supabase.from("organizations").insert(organization).select().single()

  if (error) throw error
  return data
}

export async function getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
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
}

export async function addOrganizationMember(member: Partial<OrganizationMember>): Promise<OrganizationMember> {
  const { data, error } = await supabase.from("organization_members").insert(member).select().single()

  if (error) throw error
  return data
}

// Project Management
export async function getOrganizationProjects(organizationId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function createProject(project: Partial<Project>): Promise<Project> {
  const { data, error } = await supabase.from("projects").insert(project).select().single()

  if (error) throw error
  return data
}

export async function getProjectAnalyses(projectId: string): Promise<Analysis[]> {
  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

// Insights Management
export async function getProjectInsights(projectId: string): Promise<Insight[]> {
  const { data, error } = await supabase
    .from("insights")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getAnalysisInsights(analysisId: string): Promise<Insight[]> {
  const { data, error } = await supabase
    .from("insights")
    .select("*")
    .eq("analysis_id", analysisId)
    .order("confidence_score", { ascending: false })

  if (error) throw error
  return data || []
}

export async function createInsight(insight: Partial<Insight>): Promise<Insight> {
  const { data, error } = await supabase.from("insights").insert(insight).select().single()

  if (error) throw error
  return data
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
    .gte("created_at", startOfMonth.toISOString())
    .lte("created_at", endOfMonth.toISOString())

  // Calculate storage used (sum of file sizes)
  const { data: storageData } = await supabase
    .from("file_uploads")
    .select("file_size")
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
}

// Feature Access Control
export async function checkFeatureAccess(userId: string, feature: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  if (!subscription) return false

  const features = subscription.features as Record<string, boolean>
  return features[feature] === true
}

export async function checkUsageLimit(
  userId: string,
  limitType: "reports" | "exports" | "uploads",
): Promise<{
  current: number
  limit: number
  canProceed: boolean
}> {
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
}
