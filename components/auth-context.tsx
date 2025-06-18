"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { getUserProfile } from "@/lib/supabase-utils"

type UserProfile = {
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

  useEffect(() => {
    // Check for current session
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        setUser(session?.user || null)

        if (session?.user) {
          await loadUserProfile(session.user.id)
        }
      } catch (error) {
        console.error("Error checking user session:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)

      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setProfile(null)
      }

      setLoading(false)

      if (event === "SIGNED_IN") {
        router.push("/dashboard")
      } else if (event === "SIGNED_OUT") {
        router.push("/")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const loadUserProfile = async (userId: string) => {
    try {
      const userProfile = await getUserProfile(userId)
      setProfile(userProfile)
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
      await supabase.auth.signOut()
      setProfile(null)
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
