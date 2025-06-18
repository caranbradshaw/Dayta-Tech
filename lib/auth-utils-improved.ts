import { supabase } from "@/lib/supabase"
import { createUserProfile } from "@/lib/supabase-utils-improved"
import { type Result, getErrorMessage, logSupabaseError } from "@/lib/types/result"
import type { User } from "@supabase/supabase-js"

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

// Validation utilities
function validateEmail(email: string): Result<void> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, error: "Invalid email format" }
  }
  return { success: true, data: undefined }
}

function validatePassword(password: string): Result<void> {
  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long" }
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return {
      success: false,
      error: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    }
  }
  return { success: true, data: undefined }
}

export async function signUp(data: SignUpData): Promise<Result<{ user: User; message: string }>> {
  try {
    // Validate input data
    if (!data.firstName?.trim()) {
      return { success: false, error: "First name is required" }
    }
    if (!data.lastName?.trim()) {
      return { success: false, error: "Last name is required" }
    }
    if (!data.email?.trim()) {
      return { success: false, error: "Email is required" }
    }
    if (!data.password) {
      return { success: false, error: "Password is required" }
    }
    if (!data.industry?.trim()) {
      return { success: false, error: "Industry is required" }
    }
    if (!data.role?.trim()) {
      return { success: false, error: "Role is required" }
    }

    // Validate email format
    const emailValidation = validateEmail(data.email)
    if (!emailValidation.success) {
      return emailValidation
    }

    // Validate password strength
    const passwordValidation = validatePassword(data.password)
    if (!passwordValidation.success) {
      return passwordValidation
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email.trim().toLowerCase(),
      password: data.password,
      options: {
        data: {
          first_name: data.firstName.trim(),
          last_name: data.lastName.trim(),
          full_name: `${data.firstName.trim()} ${data.lastName.trim()}`,
        },
      },
    })

    if (authError) {
      logSupabaseError("Auth signup error", authError)
      return {
        success: false,
        error: `Failed to create account: ${authError.message}`,
        code: authError.message.includes("already registered") ? "USER_EXISTS" : authError.name,
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Failed to create user account - no user returned",
      }
    }

    // Create user profile
    const profileData = {
      id: authData.user.id,
      email: data.email.trim().toLowerCase(),
      name: `${data.firstName.trim()} ${data.lastName.trim()}`,
      first_name: data.firstName.trim(),
      last_name: data.lastName.trim(),
      company: data.company?.trim() || null,
      industry: data.industry.trim(),
      role: data.role.trim(),
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
    if (!profileResult.success) {
      console.error("Failed to create user profile:", profileResult.error)
      // Don't fail the signup if profile creation fails, but log it
      console.warn("User account created but profile creation failed. User may need to complete profile setup.")
    }

    return {
      success: true,
      data: {
        user: authData.user,
        message:
          "Account created successfully! Please check your email to verify your account and start your 30-day Pro trial.",
      },
    }
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("Unexpected error in signUp:", message)
    return {
      success: false,
      error: `Unexpected error during signup: ${message}`,
    }
  }
}

export async function signIn(data: SignInData): Promise<Result<{ user: User; message: string }>> {
  try {
    // Validate input
    if (!data.email?.trim()) {
      return { success: false, error: "Email is required" }
    }
    if (!data.password) {
      return { success: false, error: "Password is required" }
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email.trim().toLowerCase(),
      password: data.password,
    })

    if (authError) {
      logSupabaseError("Auth signin error", authError)

      // Provide user-friendly error messages
      let userMessage = "Failed to sign in"
      if (authError.message.includes("Invalid login credentials")) {
        userMessage = "Invalid email or password"
      } else if (authError.message.includes("Email not confirmed")) {
        userMessage = "Please verify your email address before signing in"
      } else if (authError.message.includes("Too many requests")) {
        userMessage = "Too many login attempts. Please try again later"
      }

      return {
        success: false,
        error: userMessage,
        code: authError.name,
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Failed to sign in - no user returned",
      }
    }

    return {
      success: true,
      data: {
        user: authData.user,
        message: "Signed in successfully!",
      },
    }
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("Unexpected error in signIn:", message)
    return {
      success: false,
      error: `Unexpected error during signin: ${message}`,
    }
  }
}

export async function signOut(): Promise<Result<{ message: string }>> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      logSupabaseError("Sign out error", error)
      return {
        success: false,
        error: `Failed to sign out: ${error.message}`,
        code: error.name,
      }
    }

    return {
      success: true,
      data: { message: "Signed out successfully" },
    }
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("Unexpected error in signOut:", message)
    return {
      success: false,
      error: `Unexpected error during signout: ${message}`,
    }
  }
}

export async function resetPassword(email: string): Promise<Result<{ message: string }>> {
  try {
    if (!email?.trim()) {
      return { success: false, error: "Email is required" }
    }

    const emailValidation = validateEmail(email)
    if (!emailValidation.success) {
      return emailValidation
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      logSupabaseError("Reset password error", error)
      return {
        success: false,
        error: `Failed to send reset email: ${error.message}`,
        code: error.name,
      }
    }

    return {
      success: true,
      data: { message: "Password reset email sent! Check your inbox and spam folder." },
    }
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("Unexpected error in resetPassword:", message)
    return {
      success: false,
      error: `Unexpected error: ${message}`,
    }
  }
}

export async function getCurrentUser(): Promise<Result<User | null>> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      logSupabaseError("Get current user error", error)
      return {
        success: false,
        error: `Failed to get current user: ${error.message}`,
        code: error.name,
      }
    }

    return { success: true, data: user }
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("Unexpected error in getCurrentUser:", message)
    return {
      success: false,
      error: `Unexpected error: ${message}`,
    }
  }
}
