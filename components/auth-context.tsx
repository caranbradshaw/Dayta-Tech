"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { clientStorage, type User } from "@/lib/client-storage"

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Only run on client side
    const initAuth = () => {
      try {
        // Initialize app data
        clientStorage.initialize()

        // Get current user
        const currentUser = clientStorage.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  return <AuthContext.Provider value={{ user, setUser, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
