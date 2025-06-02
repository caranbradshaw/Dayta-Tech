export interface Subscription {
  id: string
  user_id: string
  organization_id?: string
  plan_type: "basic" | "pro" | "enterprise"
  status: "active" | "cancelled" | "past_due" | "trialing" | "paused"
  trial_start_date?: string
  trial_end_date?: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  stripe_subscription_id?: string
  stripe_customer_id?: string
  monthly_reports_limit: number
  monthly_exports_limit: number
  monthly_uploads_limit: number
  storage_limit_gb: number
  features: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  industry?: string
  company_size?: string
  billing_email?: string
  settings: Record<string, any>
  created_at: string
  updated_at: string
  created_by?: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: "owner" | "admin" | "member" | "viewer"
  permissions: Record<string, any>
  invited_by?: string
  invited_at?: string
  joined_at: string
  status: "active" | "invited" | "suspended"
  created_at: string
}

export interface Project {
  id: string
  name: string
  description?: string
  organization_id: string
  created_by?: string
  status: "active" | "archived" | "deleted"
  settings: Record<string, any>
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface Insight {
  id: string
  analysis_id: string
  project_id: string
  type: "summary" | "trend" | "anomaly" | "recommendation" | "prediction" | "correlation"
  title: string
  content: string
  confidence_score?: number
  metadata: Record<string, any>
  ai_model?: string
  processing_time_ms?: number
  created_at: string
  updated_at: string
}

export interface UserActivity {
  id: string
  user_id: string
  activity_type: string
  activity_description: string
  metadata: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface AccountChange {
  id: string
  user_id: string
  change_type: string
  old_values: Record<string, any>
  new_values: Record<string, any>
  changed_by?: string
  reason?: string
  created_at: string
}

export interface FileActivity {
  id: string
  user_id: string
  analysis_id?: string
  activity_type: string
  file_name?: string
  file_size?: number
  activity_details: Record<string, any>
  created_at: string
}

export interface AdminUser {
  id: string
  user_id: string
  admin_level: "support" | "admin" | "super_admin"
  permissions: Record<string, any>
  created_at: string
  created_by?: string
}

export interface Profile {
  id: string
  email: string
  name?: string
  company?: string
  industry?: string
  role?: string
  account_type: string
  trial_status: string
  trial_end_date?: string
  upload_credits: number
  export_credits: number
  features: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Analysis {
  id: string
  user_id: string
  project_id?: string
  file_name: string
  file_type: string
  status: "processing" | "completed" | "failed"
  summary?: string
  insights: Record<string, any>
  recommendations: Record<string, any>
  created_at: string
  updated_at: string
}
