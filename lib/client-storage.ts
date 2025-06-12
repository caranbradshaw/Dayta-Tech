/**
 * Client-only storage implementation
 * This file is designed to NEVER run on the server
 */

// Types
export interface User {
  id: string
  email: string
  name: string
  company?: string
  role?: string
  industry?: string
  createdAt: string
}

export interface Analysis {
  id: string
  userId: string
  fileName: string
  fileSize: number
  fileType: string
  uploadDate: string
  status: "completed" | "processing" | "error"
  insights: number
  metrics: {
    [key: string]: number
  }
  keyFindings: string[]
  recommendations: string[]
  summary: string
}

// Storage keys
const STORAGE_KEYS = {
  USERS: "daytatech_users",
  CURRENT_USER: "daytatech_current_user",
  ANALYSES: "daytatech_analyses",
  APP_INITIALIZED: "daytatech_initialized",
}

// Client-only storage service
export class ClientStorage {
  private static instance: ClientStorage
  private isClient: boolean

  constructor() {
    this.isClient = typeof window !== "undefined" && typeof localStorage !== "undefined"
  }

  static getInstance(): ClientStorage {
    if (!ClientStorage.instance) {
      ClientStorage.instance = new ClientStorage()
    }
    return ClientStorage.instance
  }

  private safeGet(key: string): any {
    if (!this.isClient) return null
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch {
      return null
    }
  }

  private safeSet(key: string, value: any): boolean {
    if (!this.isClient) return false
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  }

  private safeRemove(key: string): boolean {
    if (!this.isClient) return false
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  }

  // Initialize app data
  initialize(): boolean {
    if (!this.isClient) return false

    if (this.safeGet(STORAGE_KEYS.APP_INITIALIZED)) {
      return true
    }

    const sampleUsers: User[] = [
      {
        id: "user_1",
        email: "demo@daytatech.ai",
        name: "Demo User",
        company: "DaytaTech",
        role: "Analyst",
        industry: "Technology",
        createdAt: new Date().toISOString(),
      },
    ]

    const sampleAnalyses: Analysis[] = [
      {
        id: "analysis_1",
        userId: "user_1",
        fileName: "sample-data.csv",
        fileSize: 1024 * 1024 * 2,
        fileType: "text/csv",
        uploadDate: new Date().toISOString(),
        status: "completed",
        insights: 12,
        metrics: {
          accuracy: 0.92,
          precision: 0.89,
          recall: 0.87,
          f1Score: 0.88,
          dataQuality: 95,
          completeness: 98,
        },
        keyFindings: [
          "Customer satisfaction increased by 15% in Q2",
          "Product usage patterns show peak activity on Tuesdays",
          "User retention improved after recent UI updates",
          "New feature adoption rate is 35% higher than expected",
        ],
        recommendations: [
          "Focus marketing efforts on high-engagement time periods",
          "Implement customer feedback loop for feature improvements",
          "Optimize onboarding process to increase retention",
          "Develop targeted campaigns for low-activity segments",
        ],
        summary:
          "Analysis shows positive trends in user engagement and satisfaction with several opportunities for optimization.",
      },
    ]

    this.safeSet(STORAGE_KEYS.USERS, sampleUsers)
    this.safeSet(STORAGE_KEYS.ANALYSES, sampleAnalyses)
    this.safeSet(STORAGE_KEYS.APP_INITIALIZED, true)
    return true
  }

  // User methods
  getUsers(): User[] {
    return this.safeGet(STORAGE_KEYS.USERS) || []
  }

  getUserByEmail(email: string): User | null {
    const users = this.getUsers()
    return users.find((user) => user.email?.toLowerCase() === email?.toLowerCase()) || null
  }

  getCurrentUser(): User | null {
    return this.safeGet(STORAGE_KEYS.CURRENT_USER)
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      this.safeSet(STORAGE_KEYS.CURRENT_USER, user)
    } else {
      this.safeRemove(STORAGE_KEYS.CURRENT_USER)
    }
  }

  createUser(userData: Omit<User, "id" | "createdAt">): User {
    const users = this.getUsers()
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    this.safeSet(STORAGE_KEYS.USERS, users)
    return newUser
  }

  // Analysis methods
  getAnalyses(): Analysis[] {
    return this.safeGet(STORAGE_KEYS.ANALYSES) || []
  }

  getAnalysisById(id: string): Analysis | null {
    const analyses = this.getAnalyses()
    return analyses.find((analysis) => analysis.id === id) || null
  }

  getAnalysesByUser(userId: string): Analysis[] {
    const analyses = this.getAnalyses()
    return analyses.filter((analysis) => analysis.userId === userId)
  }

  saveAnalysis(analysis: Analysis): string {
    const analyses = this.getAnalyses()
    const newAnalysis = {
      ...analysis,
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
    analyses.push(newAnalysis)
    this.safeSet(STORAGE_KEYS.ANALYSES, analyses)
    return newAnalysis.id
  }
}

// Export singleton instance
export const clientStorage = ClientStorage.getInstance()

// Auth service
export const authService = {
  register: (email: string, password: string, userData: Partial<User>) => {
    const existingUser = clientStorage.getUserByEmail(email)
    if (existingUser) {
      return {
        success: false,
        message: "An account with this email already exists",
      }
    }

    try {
      const newUser = clientStorage.createUser({
        email,
        name: userData.name || "",
        company: userData.company,
        role: userData.role,
        industry: userData.industry,
      })

      clientStorage.setCurrentUser(newUser)

      return {
        success: true,
        user: newUser,
      }
    } catch (error) {
      return {
        success: false,
        message: "Failed to create account",
      }
    }
  },

  login: (email: string, password: string) => {
    const user = clientStorage.getUserByEmail(email)

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password",
      }
    }

    clientStorage.setCurrentUser(user)

    return {
      success: true,
      user,
    }
  },

  logout: () => {
    clientStorage.setCurrentUser(null)
    return { success: true }
  },
}

// File processing utilities
export function processFile(file: File): Promise<{
  fileName: string
  fileSize: number
  fileType: string
  preview: string[]
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        let preview: string[] = []

        if (file.type === "text/csv" || file.name.endsWith(".csv")) {
          const lines = content.split("\n").slice(0, 5)
          preview = lines.filter((line) => line.trim())
        } else if (file.type === "application/json" || file.name.endsWith(".json")) {
          try {
            const json = JSON.parse(content)
            preview = [JSON.stringify(json, null, 2).split("\n").slice(0, 10).join("\n")]
          } catch {
            preview = ["Invalid JSON format"]
          }
        } else {
          preview = content
            .split("\n")
            .slice(0, 5)
            .filter((line) => line.trim())
        }

        resolve({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          preview,
        })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

// Generate analysis
export function generateAnalysis(
  fileData: {
    fileName: string
    fileSize: number
    fileType: string
    preview: string[]
  },
  fileName: string,
): Analysis {
  const insights = Math.floor(Math.random() * 15) + 8

  const metrics = {
    accuracy: Number((Math.random() * 0.15 + 0.85).toFixed(3)),
    precision: Number((Math.random() * 0.2 + 0.8).toFixed(3)),
    recall: Number((Math.random() * 0.2 + 0.75).toFixed(3)),
    f1Score: Number((Math.random() * 0.2 + 0.78).toFixed(3)),
    dataQuality: Math.floor(Math.random() * 20) + 80,
    completeness: Math.floor(Math.random() * 15) + 85,
    consistency: Math.floor(Math.random() * 10) + 90,
    uniqueness: Math.floor(Math.random() * 25) + 75,
  }

  const keyFindings = [
    "Excellent data quality with minimal missing values",
    "Clear patterns identified for predictive modeling",
    "Optimal file size for processing efficiency",
    "Strong potential for automated insights generation",
    "Data structure supports advanced analytics workflows",
  ].slice(0, Math.floor(Math.random() * 3) + 3)

  const recommendations = [
    "Implement automated data validation pipelines",
    "Consider real-time analytics for time-sensitive insights",
    "Optimize data storage format for better performance",
    "Develop predictive models based on identified patterns",
    "Create automated reporting dashboards",
  ].slice(0, Math.floor(Math.random() * 3) + 4)

  return {
    id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: "user_temp",
    fileName: fileData.fileName || fileName,
    fileSize: fileData.fileSize || 0,
    fileType: fileData.fileType || "text/csv",
    uploadDate: new Date().toISOString(),
    status: "completed",
    insights,
    metrics,
    keyFindings,
    recommendations,
    summary: `Comprehensive analysis of ${fileData.fileName || fileName} reveals ${insights} key insights with ${metrics.dataQuality}% data quality score.`,
  }
}
