// Fallback authentication system that works without Supabase
// This ensures the app works even if database setup fails

import { v4 as uuidv4 } from "uuid"

// Types
export interface User {
  id: string
  email: string
  name?: string
  role?: string
  created_at: string
}

export interface AuthState {
  user: User | null
  session: any | null
  loading: boolean
}

// Local storage keys
const USERS_KEY = "daytatech_users"
const CURRENT_USER_KEY = "daytatech_current_user"

// Get users from localStorage
export const getUsers = (): User[] => {
  if (typeof window === "undefined") return []

  try {
    const usersJson = localStorage.getItem(USERS_KEY)
    return usersJson ? JSON.parse(usersJson) : []
  } catch (error) {
    console.error("Error getting users from localStorage:", error)
    return []
  }
}

// Save users to localStorage
export const saveUsers = (users: User[]): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch (error) {
    console.error("Error saving users to localStorage:", error)
  }
}

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null

  try {
    const userJson = localStorage.getItem(CURRENT_USER_KEY)
    return userJson ? JSON.parse(userJson) : null
  } catch (error) {
    console.error("Error getting current user from localStorage:", error)
    return null
  }
}

// Save current user to localStorage
export const saveCurrentUser = (user: User | null): void => {
  if (typeof window === "undefined") return

  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(CURRENT_USER_KEY)
    }
  } catch (error) {
    console.error("Error saving current user to localStorage:", error)
  }
}

// Sign up a new user
export const signUp = async (
  email: string,
  password: string,
  name?: string,
): Promise<{ user: User | null; error: string | null }> => {
  try {
    const users = getUsers()

    // Check if user already exists
    if (users.some((user) => user.email === email)) {
      return { user: null, error: "User with this email already exists" }
    }

    // Create new user
    const newUser: User = {
      id: uuidv4(),
      email,
      name: name || "",
      role: "user",
      created_at: new Date().toISOString(),
    }

    // Save user
    saveUsers([...users, newUser])
    saveCurrentUser(newUser)

    return { user: newUser, error: null }
  } catch (error) {
    console.error("Error signing up:", error)
    return { user: null, error: "An error occurred during sign up" }
  }
}

// Sign in a user
export const signIn = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
  try {
    const users = getUsers()
    const user = users.find((user) => user.email === email)

    if (!user) {
      return { user: null, error: "Invalid email or password" }
    }

    // In a real app, we would check the password here
    // For this demo, we're just checking the email

    saveCurrentUser(user)
    return { user, error: null }
  } catch (error) {
    console.error("Error signing in:", error)
    return { user: null, error: "An error occurred during sign in" }
  }
}

// Sign out
export const signOut = async (): Promise<{ error: string | null }> => {
  try {
    saveCurrentUser(null)
    return { error: null }
  } catch (error) {
    console.error("Error signing out:", error)
    return { error: "An error occurred during sign out" }
  }
}

// Initialize with demo user if needed
export const initializeDemoUser = (): void => {
  const users = getUsers()

  // Add demo user if no users exist
  if (users.length === 0) {
    const demoUser: User = {
      id: "demo-user-id",
      email: "demo@daytatech.ai",
      name: "Demo User",
      role: "user",
      created_at: new Date().toISOString(),
    }

    saveUsers([demoUser])
  }
}
