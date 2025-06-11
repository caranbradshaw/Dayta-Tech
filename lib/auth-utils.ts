import { supabase } from "@/lib/supabase"
import { customFieldsService } from "@/lib/custom-fields-service"
import type { Database } from "@/types/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"]

export interface SignUpData {
  firstName: string
  lastName: string
  email: string
  password: string
  company?: string
  industry: string
  role: string
}

export interface SignInData {
  email: string
  password: string
}

export async function signUp(data: SignUpData) {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: `${data.firstName} ${data.lastName}`,
          company: data.company,
          industry: data.industry,
          role: data.role,
        },
      },
    })

    if (authError) {
      return { success: false, error: authError.message }
    }

    if (!authData.user) {
      return { success: false, error: "Failed to create user" }
    }

    // Record custom fields if they're not in predefined lists
    const predefinedIndustries = [
      "technology",
      "finance",
      "healthcare",
      "retail",
      "manufacturing",
      "education",
      "consulting",
      "real-estate",
      "media",
      "transportation",
      "energy",
      "government",
      "nonprofit",
      "agriculture",
    ]

    const predefinedRoles = [
      "business-analyst",
      "data-analyst",
      "data-scientist",
      "data-engineer",
      "product-manager",
      "marketing-manager",
      "operations-manager",
      "financial-analyst",
      "executive",
      "consultant",
      "researcher",
      "student",
    ]

    // Record custom industry if not predefined
    if (!predefinedIndustries.includes(data.industry.toLowerCase())) {
      try {
        await customFieldsService.recordCustomField("industry", data.industry, authData.user.id)
      } catch (error) {
        console.error("Error recording custom industry:", error)
      }
    }

    // Record custom role if not predefined
    if (!predefinedRoles.includes(data.role.toLowerCase())) {
      try {
        await customFieldsService.recordCustomField("role", data.role, authData.user.id)
      } catch (error) {
        console.error("Error recording custom role:", error)
      }
    }

    // Profile will be created automatically by the database trigger
    return {
      success: true,
      user: authData.user,
      message: "Account created successfully! Please check your email to verify your account.",
    }
  } catch (error) {
    console.error("Signup error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function signIn(data: SignInData) {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    // Log the login activity
    if (authData.user) {
      await logUserActivity(authData.user.id, "login", "User logged in successfully")
    }

    return { success: true, user: authData.user }
  } catch (error) {
    console.error("Signin error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function signOut() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await logUserActivity(user.id, "logout", "User logged out")
    }

    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Signout error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: "Password reset email sent!" }
  } catch (error) {
    console.error("Password reset error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: "Password updated successfully!" }
  } catch (error) {
    console.error("Password update error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      return { success: false, error: error.message, user: null }
    }

    return { success: true, user }
  } catch (error) {
    console.error("Get user error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      user: null,
    }
  }
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Get profile error:", error)
    return null
  }
}

export async function updateUserProfile(userId: string, updates: Partial<Profile>) {
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

    if (error) {
      return { success: false, error: error.message }
    }

    // Log the profile update
    await logAccountChange(userId, "profile_update", {}, updates, userId)

    return { success: true, profile: data }
  } catch (error) {
    console.error("Update profile error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

// Activity logging functions
export async function logUserActivity(
  userId: string,
  activityType: string,
  description: string,
  metadata: Record<string, any> = {},
) {
  try {
    await supabase.from("user_activities").insert({
      user_id: userId,
      activity_type: activityType,
      activity_description: description,
      metadata,
      ip_address: await getClientIP(),
      user_agent: navigator.userAgent,
    })
  } catch (error) {
    console.error("Error logging user activity:", error)
  }
}

export async function logAccountChange(
  userId: string,
  changeType: string,
  oldValues: Record<string, any>,
  newValues: Record<string, any>,
  changedBy?: string,
  reason?: string,
) {
  try {
    await supabase.from("account_changes").insert({
      user_id: userId,
      change_type: changeType,
      old_values: oldValues,
      new_values: newValues,
      changed_by: changedBy,
      reason,
    })
  } catch (error) {
    console.error("Error logging account change:", error)
  }
}

export async function logFileActivity(
  userId: string,
  activityType: string,
  fileName?: string,
  fileSize?: number,
  analysisId?: string,
  details: Record<string, any> = {},
) {
  try {
    await supabase.from("file_activities").insert({
      user_id: userId,
      analysis_id: analysisId,
      activity_type: activityType,
      file_name: fileName,
      file_size: fileSize,
      activity_details: details,
    })
  } catch (error) {
    console.error("Error logging file activity:", error)
  }
}

// Helper function to get client IP (simplified)
async function getClientIP(): Promise<string | null> {
  try {
    const response = await fetch("https://api.ipify.org?format=json")
    const data = await response.json()
    return data.ip
  } catch {
    return null
  }
}
