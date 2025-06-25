"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"

type UserProfile = {
  id: string
  email: string
  name?: string
  first_name?: string
  last_name?: string
  company?: string
  industry?: string
  role?: string
  analysis_type?: string
  account_type: string
  trial_status: string
  trial_end_date?: string
  upload_credits: number
  export_credits: number
  features: Record<string, any>
  created_at: string
  updated_at: string
}

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClientComponentClient()

  useEffect(() => {
    let mounted = true

    // Check for current session
    const checkUser = async () => {
      try {
        console.log("Checking current user session...")

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          if (mounted) {
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
          return
        }

        console.log("Session check result:", session ? "Found session" : "No session")

        if (mounted) {
          setUser(session?.user || null)
        }

        if (session?.user && mounted) {
          await loadUserProfile(session.user.id)
        }
      } catch (error) {
        console.error("Error checking user session:", error)
        if (mounted) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    checkUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session ? "with session" : "no session")

      if (!mounted) return

      setUser(session?.user || null)

      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setProfile(null)
      }

      setLoading(false)

      // Handle redirects based on auth state and current path
      if (event === "SIGNED_IN" && session?.user) {
        // Don't redirect if already on auth pages or if on homepage
        const authPages = ["/login", "/signup"]
        const isAuthPage = authPages.includes(pathname)
        const isHomePage = pathname === "/"

        if (!isAuthPage && !isHomePage) {
          return // Stay on current page
        }

        // Check if user needs to complete setup
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("analysis_type")
            .eq("id", session.user.id)
            .single()

          if (profileData?.analysis_type) {
            router.push("/dashboard")
          } else {
            router.push("/select-role")
          }
        } catch (error) {
          console.error("Error checking profile:", error)
          router.push("/select-role")
        }
      } else if (event === "SIGNED_OUT") {
        // Only redirect to home if on protected pages
        const protectedPages = ["/dashboard", "/upload", "/reports", "/settings"]
        const isProtectedPage = protectedPages.some((page) => pathname.startsWith(page))

        if (isProtectedPage) {
          router.push("/")
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router, pathname, supabase.auth])

  const loadUserProfile = async (userId: string) => {
    try {
      console.log("Loading user profile for:", userId)

      const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error loading user profile:", error)
        // Don't throw error, just log it
        return
      }

      console.log("Profile loaded:", profileData ? "success" : "no data")
      setProfile(profileData)
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id)
    }
  }

  const handleSignOut = async () => {
    try {
      console.log("Signing out...")
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error signing out:", error)
      } else {
        console.log("Sign out successful")
        setProfile(null)
        setUser(null)
      }
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
