export type User = {
  id: string
  email: string
  name: string | null
  company: string | null
  industry: string | null
  created_at: string
}

export type Analysis = {
  id: string
  user_id: string
  file_name: string
  file_type: string
  status: "processing" | "completed" | "failed"
  created_at: string
  updated_at: string
  summary: string | null
  insights: any | null
  recommendations: any | null
}

export type FileUpload = {
  id: string
  analysis_id: string
  file_name: string
  file_path: string
  file_size: number
  file_type: string
  created_at: string
}
