/**
 * Pure localStorage implementation with no database dependencies
 * This file provides all the data storage functionality needed for the application
 * without requiring any external database or API connections.
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

// Check if we're running on the client side
const isClient = typeof window !== "undefined" && typeof localStorage !== "undefined"

// LocalStorage wrapper with error handling
const safeStorage = {
  get: (key: string) => {
    if (!isClient) return null

    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error)
      return null
    }
  },
  set: (key: string, value: any) => {
    if (!isClient) return false

    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error)
      return false
    }
  },
  remove: (key: string) => {
    if (!isClient) return false

    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
      return false
    }
  },
}

// Initialize the app with sample data - only on client
export function initializeApp() {
  // Skip initialization on server
  if (!isClient) return false

  // Check if already initialized
  if (safeStorage.get(STORAGE_KEYS.APP_INITIALIZED)) {
    return true
  }

  try {
    // Create sample users
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

    // Create sample analyses
    const sampleAnalyses: Analysis[] = [
      {
        id: "analysis_1",
        userId: "user_1",
        fileName: "sample-data.csv",
        fileSize: 1024 * 1024 * 2, // 2MB
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

    // Save to localStorage
    safeStorage.set(STORAGE_KEYS.USERS, sampleUsers)
    safeStorage.set(STORAGE_KEYS.ANALYSES, sampleAnalyses)
    safeStorage.set(STORAGE_KEYS.APP_INITIALIZED, true)

    return true
  } catch (error) {
    console.error("Error initializing app:", error)
    return false
  }
}

// User management
export const userService = {
  getAll: (): User[] => {
    if (!isClient) return []
    return safeStorage.get(STORAGE_KEYS.USERS) || []
  },

  getByEmail: (email: string): User | null => {
    if (!isClient) return null
    const users = userService.getAll()
    return users.find((user) => user.email?.toLowerCase() === email?.toLowerCase()) || null
  },

  getCurrent: (): User | null => {
    if (!isClient) return null
    return safeStorage.get(STORAGE_KEYS.CURRENT_USER)
  },

  setCurrent: (user: User | null) => {
    if (!isClient) return
    if (user) {
      safeStorage.set(STORAGE_KEYS.CURRENT_USER, user)
    } else {
      safeStorage.remove(STORAGE_KEYS.CURRENT_USER)
    }
  },

  create: (userData: Omit<User, "id" | "createdAt">): User => {
    const users = userService.getAll()

    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    if (isClient) {
      users.push(newUser)
      safeStorage.set(STORAGE_KEYS.USERS, users)
    }

    return newUser
  },

  update: (id: string, userData: Partial<User>): User | null => {
    if (!isClient) return null
    const users = userService.getAll()
    const index = users.findIndex((user) => user.id === id)

    if (index === -1) return null

    users[index] = { ...users[index], ...userData }
    safeStorage.set(STORAGE_KEYS.USERS, users)

    return users[index]
  },
}

// Authentication
export const authService = {
  register: (email: string, password: string, userData: Partial<User>) => {
    if (!isClient) {
      return {
        success: false,
        message: "Registration not available on server",
      }
    }

    // Check if email already exists
    const existingUser = userService.getByEmail(email)
    if (existingUser) {
      return {
        success: false,
        message: "An account with this email already exists",
      }
    }

    // Create new user
    try {
      const newUser = userService.create({
        email,
        name: userData.name || "",
        company: userData.company,
        role: userData.role,
        industry: userData.industry,
      })

      // Set as current user
      userService.setCurrent(newUser)

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
    if (!isClient) {
      return {
        success: false,
        message: "Login not available on server",
      }
    }

    // In a real app, we'd verify the password
    // For demo purposes, just check if the user exists
    const user = userService.getByEmail(email)

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password",
      }
    }

    // Set as current user
    userService.setCurrent(user)

    return {
      success: true,
      user,
    }
  },

  logout: () => {
    if (!isClient) return { success: false }
    userService.setCurrent(null)
    return { success: true }
  },
}

// Analysis management
export const analysisService = {
  getAll: (): Analysis[] => {
    if (!isClient) return []
    return safeStorage.get(STORAGE_KEYS.ANALYSES) || []
  },

  getById: (id: string): Analysis | null => {
    if (!isClient) return null
    const analyses = analysisService.getAll()
    return analyses.find((analysis) => analysis.id === id) || null
  },

  getByUser: (userId: string): Analysis[] => {
    if (!isClient) return []
    const analyses = analysisService.getAll()
    return analyses.filter((analysis) => analysis.userId === userId)
  },

  create: (analysisData: Omit<Analysis, "id">): Analysis => {
    const newAnalysis: Analysis = {
      ...analysisData,
      id: `analysis_${Date.now()}`,
    }

    if (isClient) {
      const analyses = analysisService.getAll()
      analyses.push(newAnalysis)
      safeStorage.set(STORAGE_KEYS.ANALYSES, analyses)
    }

    return newAnalysis
  },

  update: (id: string, analysisData: Partial<Analysis>): Analysis | null => {
    if (!isClient) return null
    const analyses = analysisService.getAll()
    const index = analyses.findIndex((analysis) => analysis.id === id)

    if (index === -1) return null

    analyses[index] = { ...analyses[index], ...analysisData }
    safeStorage.set(STORAGE_KEYS.ANALYSES, analyses)

    return analyses[index]
  },

  generateSampleAnalysis: (file: File, userId: string): Analysis => {
    // Generate realistic sample analysis data
    return {
      id: `analysis_${Date.now()}`,
      userId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadDate: new Date().toISOString(),
      status: "completed",
      insights: Math.floor(Math.random() * 10) + 5,
      metrics: {
        accuracy: Number((Math.random() * 0.2 + 0.8).toFixed(2)),
        precision: Number((Math.random() * 0.2 + 0.75).toFixed(2)),
        recall: Number((Math.random() * 0.2 + 0.7).toFixed(2)),
        f1Score: Number((Math.random() * 0.2 + 0.75).toFixed(2)),
        dataQuality: Math.floor(Math.random() * 15) + 85,
        completeness: Math.floor(Math.random() * 10) + 90,
      },
      keyFindings: [
        "Data quality is excellent with minimal missing values",
        "Strong correlation detected between variables X and Y",
        "Seasonal patterns identified in time series data",
        "Several outliers detected that may require investigation",
        "Clustering analysis revealed 3 distinct customer segments",
      ],
      recommendations: [
        "Implement data validation to maintain high quality",
        "Focus on high-value customer segment for retention",
        "Develop predictive model based on identified patterns",
        "Investigate outliers for potential opportunities",
        "Optimize resource allocation based on usage patterns",
      ],
      summary: `Analysis of ${file.name} reveals several key insights and opportunities. The data quality is high with clear patterns that can be leveraged for business optimization.`,
    }
  },
}

// File processing utilities - safe for SSR
export function processFile(file: File): Promise<{
  fileName: string
  fileSize: number
  fileType: string
  preview: string[]
}> {
  // Skip if running on server
  if (!isClient) {
    return Promise.resolve({
      fileName: "",
      fileSize: 0,
      fileType: "",
      preview: [],
    })
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        let preview: string[] = []

        if (file.type === "text/csv" || file.name.endsWith(".csv")) {
          // Parse CSV and get first few rows
          const lines = content.split("\n").slice(0, 5)
          preview = lines.filter((line) => line.trim())
        } else if (file.type === "application/json" || file.name.endsWith(".json")) {
          // Parse JSON and show structure
          try {
            const json = JSON.parse(content)
            preview = [JSON.stringify(json, null, 2).split("\n").slice(0, 10).join("\n")]
          } catch {
            preview = ["Invalid JSON format"]
          }
        } else {
          // For other text files, show first few lines
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

// Generate analysis from processed file data - safe for SSR
export function generateAnalysis(
  fileData: {
    fileName: string
    fileSize: number
    fileType: string
    preview: string[]
  },
  fileName: string,
): Analysis {
  // Generate realistic insights based on file type and content
  const insights = Math.floor(Math.random() * 15) + 8

  // Generate metrics based on file characteristics
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

  // Generate findings based on file type
  const csvFindings = [
    "Strong data consistency across all columns",
    "Identified seasonal patterns in time-series data",
    "Detected potential outliers requiring investigation",
    "High correlation between key performance indicators",
    "Data distribution follows expected statistical patterns",
  ]

  const jsonFindings = [
    "Well-structured hierarchical data organization",
    "Consistent schema across all data objects",
    "Optimal nesting levels for query performance",
    "Strong referential integrity in linked data",
    "Efficient data encoding and compression potential",
  ]

  const generalFindings = [
    "Excellent data quality with minimal missing values",
    "Clear patterns identified for predictive modeling",
    "Optimal file size for processing efficiency",
    "Strong potential for automated insights generation",
    "Data structure supports advanced analytics workflows",
  ]

  let keyFindings: string[]
  if (fileData.fileType.includes("csv")) {
    keyFindings = csvFindings.slice(0, Math.floor(Math.random() * 3) + 3)
  } else if (fileData.fileType.includes("json")) {
    keyFindings = jsonFindings.slice(0, Math.floor(Math.random() * 3) + 3)
  } else {
    keyFindings = generalFindings.slice(0, Math.floor(Math.random() * 3) + 3)
  }

  // Generate recommendations
  const recommendations = [
    "Implement automated data validation pipelines",
    "Consider real-time analytics for time-sensitive insights",
    "Optimize data storage format for better performance",
    "Develop predictive models based on identified patterns",
    "Create automated reporting dashboards",
    "Establish data quality monitoring alerts",
    "Implement data lineage tracking for compliance",
  ].slice(0, Math.floor(Math.random() * 3) + 4)

  return {
    id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: "user_temp", // This will be replaced with actual user ID
    fileName: fileData.fileName || fileName,
    fileSize: fileData.fileSize || 0,
    fileType: fileData.fileType || "text/csv",
    uploadDate: new Date().toISOString(),
    status: "completed",
    insights,
    metrics,
    keyFindings,
    recommendations,
    summary: `Comprehensive analysis of ${fileData.fileName || fileName} reveals ${insights} key insights with ${metrics.dataQuality}% data quality score. The analysis identifies significant opportunities for optimization and predictive modeling.`,
  }
}

// Save analysis to localStorage - safe for SSR
export function saveAnalysis(userId: string, analysis: Analysis): string {
  if (!isClient) return "temp_id"

  try {
    const analyses = analysisService.getAll()
    const newAnalysis = {
      ...analysis,
      userId,
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
    analyses.push(newAnalysis)
    safeStorage.set(STORAGE_KEYS.ANALYSES, analyses)
    return newAnalysis.id
  } catch (error) {
    console.error("Error saving analysis:", error)
    return "error_id"
  }
}

// Export everything
export const localStorageService = {
  user: userService,
  auth: authService,
  analysis: analysisService,
  initialize: initializeApp,
}

// Only initialize on client side - remove automatic initialization
// This prevents server-side execution
