import { createClient } from "@supabase/supabase-js"

// Using the provided credentials
const supabaseUrl = "https://iffgjxecggkzfrjliohv.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmZmdqeGVjZ2dremZyamxpb2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3ODIxNzYsImV4cCI6MjA2MzM1ODE3Nn0.vMaIDTfVuy4CMotS6FXrR624M4wU0tE4gLQl9A-hMus"

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
