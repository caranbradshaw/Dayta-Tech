import { supabase } from "./supabase"
import type { User, Analysis, FileUpload } from "@/types/database.types"

// User operations
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) throw error
  return data as User
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single()

  if (error) throw error
  return data as User
}

// Analysis operations
export async function getAnalyses(userId: string) {
  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Analysis[]
}

export async function getAnalysis(analysisId: string) {
  const { data, error } = await supabase.from("analyses").select("*, file_uploads(*)").eq("id", analysisId).single()

  if (error) throw error
  return data as Analysis & { file_uploads: FileUpload[] }
}

export async function createAnalysis(analysis: Omit<Analysis, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase.from("analyses").insert(analysis).select().single()

  if (error) throw error
  return data as Analysis
}

// File upload operations
export async function uploadFile(file: File, path: string) {
  const { data, error } = await supabase.storage.from("data_files").upload(path, file)

  if (error) throw error
  return data
}

export async function getFileUrl(path: string) {
  const { data } = await supabase.storage.from("data_files").getPublicUrl(path)

  return data.publicUrl
}
