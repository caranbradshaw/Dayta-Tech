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
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (userData: Partial<User> & { password: string }) => Promise<{ success: boolean; error?: string }>
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

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Get existing users
      const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")

      // Find user with matching email and password
      const foundUser = existingUsers.find((u: any) => u.email === email && u.password === password)

      if (!foundUser) {
        return { success: false, error: "Invalid email or password" }
      }

      // Remove password from user object before storing
      const { password: _, ...userWithoutPassword } = foundUser

      localStorage.setItem("user", JSON.stringify(userWithoutPassword))
      localStorage.setItem("isAuthenticated", "true")
      setUser(userWithoutPassword)

      setTimeout(() => {
        router.push("/upload")
      }, 1000)

      return { success: true }
    } catch (error) {
      return { success: false, error: "Login failed. Please try again." }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (
    userData: Partial<User> & { password: string },
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Get existing users
      const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")

      // Check if email already exists
      const emailExists = existingUsers.some((u: any) => u.email === userData.email)

      if (emailExists) {
        return {
          success: false,
          error: "An account with this email already exists. Please use a different email or try logging in.",
        }
      }

      const newUser: User & { password: string } = {
        id: `user_${Date.now()}`,
        email: userData.email || "",
        name: userData.name || "",
        company: userData.company,
        role: userData.role,
        industry: userData.industry,
        plan: userData.plan || "basic",
        createdAt: new Date().toISOString(),
        password: userData.password,
      }

      // Store user in registered users list
      const updatedUsers = [...existingUsers, newUser]
      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers))

      // Remove password from user object before storing as current user
      const { password: _, ...userWithoutPassword } = newUser

      localStorage.setItem("user", JSON.stringify(userWithoutPassword))
      localStorage.setItem("isAuthenticated", "true")
      setUser(userWithoutPassword)

      setTimeout(() => {
        router.push("/upload")
      }, 1000)

      return { success: true }
    } catch (error) {
      return { success: false, error: "Signup failed. Please try again." }
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("isAuthenticated")
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
