import { supabase } from "@/lib/supabase"
import { createUserProfile } from "@/lib/supabase-utils"

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
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          full_name: `${data.firstName} ${data.lastName}`,
        },
      },
    })

    if (authError) {
      console.error("Auth signup error:", authError)
      return {
        success: false,
        error: authError.message,
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Failed to create user account",
      }
    }

    // Create user profile
    const profileData = {
      id: authData.user.id,
      email: data.email,
      name: `${data.firstName} ${data.lastName}`,
      first_name: data.firstName,
      last_name: data.lastName,
      company: data.company || null,
      industry: data.industry,
      role: data.role,
      account_type: "trial_pro",
      trial_status: "active",
      trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      upload_credits: 100, // Pro trial credits
      export_credits: 50,
      features: {
        advanced_insights: true,
        all_file_formats: true,
        priority_support: true,
        api_access: true,
        custom_reports: true,
        data_export: true,
      },
      email_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const profileResult = await createUserProfile(profileData)

    if (!profileResult) {
      console.error("Failed to create user profile")
      // Don't fail the signup if profile creation fails
    }

    return {
      success: true,
      message: "Account created successfully! Please check your email to verify your account.",
      user: authData.user,
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
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (authError) {
      console.error("Auth signin error:", authError)
      return {
        success: false,
        error: authError.message,
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Failed to sign in",
      }
    }

    return {
      success: true,
      message: "Signed in successfully!",
      user: authData.user,
    }
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
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Sign out error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      message: "Signed out successfully",
    }
  } catch (error) {
    console.error("Sign out error:", error)
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
      console.error("Reset password error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      message: "Password reset email sent! Check your inbox.",
    }
  } catch (error) {
    console.error("Reset password error:", error)
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
      console.error("Update password error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      message: "Password updated successfully",
    }
  } catch (error) {
    console.error("Update password error:", error)
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
      console.error("Get current user error:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export async function refreshSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession()

    if (error) {
      console.error("Refresh session error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      session: data.session,
    }
  } catch (error) {
    console.error("Refresh session error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}
