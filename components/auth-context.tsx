"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  name: string
  company?: string
  role?: string
  industry?: string
  plan?: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  profile: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (userData: Partial<User>) => Promise<void>
  signOut: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session on mount
    checkAuthState()
  }, [])

  const checkAuthState = () => {
    try {
      const isAuthenticated = localStorage.getItem("isAuthenticated")
      const userData = localStorage.getItem("user")

      if (isAuthenticated === "true" && userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      }
    } catch (error) {
      console.error("Error checking auth state:", error)
      // Clear invalid data
      localStorage.removeItem("isAuthenticated")
      localStorage.removeItem("user")
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, accept any email/password
      const userData: User = {
        id: `user_${Date.now()}`,
        email,
        name: email.split("@")[0],
        createdAt: new Date().toISOString(),
        plan: "basic",
      }

      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("isAuthenticated", "true")
      setUser(userData)
    } catch (error) {
      throw new Error("Login failed")
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (userData: Partial<User>) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newUser: User = {
        id: `user_${Date.now()}`,
        email: userData.email || "",
        name: userData.name || "",
        company: userData.company,
        role: userData.role,
        industry: userData.industry,
        plan: userData.plan || "basic",
        createdAt: new Date().toISOString(),
      }

      localStorage.setItem("user", JSON.stringify(newUser))
      localStorage.setItem("isAuthenticated", "true")
      setUser(newUser)
    } catch (error) {
      throw new Error("Signup failed")
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("analyses")
    localStorage.removeItem("currentAnalysis")
    setUser(null)
    router.push("/")
  }

  const value: AuthContextType = {
    user,
    profile: user, // For compatibility with existing code
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
