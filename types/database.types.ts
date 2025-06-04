export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          company: string | null
          industry: string | null
          role: string | null
          account_type: string
          trial_status: string
          trial_end_date: string | null
          upload_credits: number
          export_credits: number
          features: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          company?: string | null
          industry?: string | null
          role?: string | null
          account_type?: string
          trial_status?: string
          trial_end_date?: string | null
          upload_credits?: number
          export_credits?: number
          features?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          company?: string | null
          industry?: string | null
          role?: string | null
          account_type?: string
          trial_status?: string
          trial_end_date?: string | null
          upload_credits?: number
          export_credits?: number
          features?: Json
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          industry: string | null
          company_size: string | null
          billing_email: string | null
          settings: Json
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          industry?: string | null
          company_size?: string | null
          billing_email?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          industry?: string | null
          company_size?: string | null
          billing_email?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: string
          permissions: Json
          invited_by: string | null
          invited_at: string | null
          joined_at: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: string
          permissions?: Json
          invited_by?: string | null
          invited_at?: string | null
          joined_at?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: string
          permissions?: Json
          invited_by?: string | null
          invited_at?: string | null
          joined_at?: string
          status?: string
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          organization_id: string
          created_by: string | null
          status: string
          settings: Json
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          organization_id: string
          created_by?: string | null
          status?: string
          settings?: Json
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          organization_id?: string
          created_by?: string | null
          status?: string
          settings?: Json
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      analyses: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          file_name: string
          file_type: string
          file_size: number | null
          status: string
          summary: string | null
          insights: Json
          recommendations: Json
          processing_started_at: string | null
          processing_completed_at: string | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          file_name: string
          file_type: string
          file_size?: number | null
          status?: string
          summary?: string | null
          insights?: Json
          recommendations?: Json
          processing_started_at?: string | null
          processing_completed_at?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          file_name?: string
          file_type?: string
          file_size?: number | null
          status?: string
          summary?: string | null
          insights?: Json
          recommendations?: Json
          processing_started_at?: string | null
          processing_completed_at?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      file_uploads: {
        Row: {
          id: string
          user_id: string
          analysis_id: string | null
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          upload_status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          analysis_id?: string | null
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          upload_status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          analysis_id?: string | null
          file_name?: string
          file_type?: string
          file_size?: number
          storage_path?: string
          upload_status?: string
          created_at?: string
        }
      }
      insights: {
        Row: {
          id: string
          analysis_id: string
          project_id: string
          type: string
          title: string
          content: string
          confidence_score: number | null
          metadata: Json
          ai_model: string | null
          processing_time_ms: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          analysis_id: string
          project_id: string
          type: string
          title: string
          content: string
          confidence_score?: number | null
          metadata?: Json
          ai_model?: string | null
          processing_time_ms?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          analysis_id?: string
          project_id?: string
          type?: string
          title?: string
          content?: string
          confidence_score?: number | null
          metadata?: Json
          ai_model?: string | null
          processing_time_ms?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          plan_type: string
          status: string
          trial_start_date: string | null
          trial_end_date: string | null
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          monthly_reports_limit: number
          monthly_exports_limit: number
          monthly_uploads_limit: number
          storage_limit_gb: number
          features: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          plan_type?: string
          status?: string
          trial_start_date?: string | null
          trial_end_date?: string | null
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          monthly_reports_limit?: number
          monthly_exports_limit?: number
          monthly_uploads_limit?: number
          storage_limit_gb?: number
          features?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          plan_type?: string
          status?: string
          trial_start_date?: string | null
          trial_end_date?: string | null
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          monthly_reports_limit?: number
          monthly_exports_limit?: number
          monthly_uploads_limit?: number
          storage_limit_gb?: number
          features?: Json
          created_at?: string
          updated_at?: string
        }
      }
      user_activities: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          activity_description: string
          metadata: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          activity_description: string
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          activity_description?: string
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      account_changes: {
        Row: {
          id: string
          user_id: string
          change_type: string
          old_values: Json
          new_values: Json
          changed_by: string | null
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          change_type: string
          old_values: Json
          new_values: Json
          changed_by?: string | null
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          change_type?: string
          old_values?: Json
          new_values?: Json
          changed_by?: string | null
          reason?: string | null
          created_at?: string
        }
      }
      file_activities: {
        Row: {
          id: string
          user_id: string
          analysis_id: string | null
          activity_type: string
          file_name: string | null
          file_size: number | null
          activity_details: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          analysis_id?: string | null
          activity_type: string
          file_name?: string | null
          file_size?: number | null
          activity_details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          analysis_id?: string | null
          activity_type?: string
          file_name?: string | null
          file_size?: number | null
          activity_details?: Json
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          user_id: string
          admin_level: string
          permissions: Json
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          user_id: string
          admin_level: string
          permissions?: Json
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          admin_level?: string
          permissions?: Json
          created_at?: string
          created_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
