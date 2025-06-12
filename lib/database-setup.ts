// Database setup utility that handles errors gracefully
// This ensures the app works even if database setup fails

import { createClient } from "@supabase/supabase-js"

interface SetupResult {
  success: boolean
  message: string
  details?: any
}

export class DatabaseSetup {
  private supabase: any
  private isSetupComplete = false

  constructor() {
    // Try to initialize Supabase client
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (supabaseUrl && supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey)
      } else {
        console.warn("Missing Supabase credentials, using fallback mode")
      }
    } catch (error) {
      console.error("Error initializing Supabase client:", error)
    }
  }

  // Check if Supabase is available
  public isSupabaseAvailable(): boolean {
    return !!this.supabase
  }

  // Run minimal setup
  public async runMinimalSetup(): Promise<SetupResult> {
    if (!this.isSupabaseAvailable()) {
      return {
        success: false,
        message: "Supabase not available, using fallback mode",
      }
    }

    try {
      // Try to run the ultra minimal setup SQL
      const { data, error } = await this.supabase.from("simple_test").select("*").limit(1)

      if (error && error.code === "42P01") {
        // Table doesn't exist, try to create it
        console.log("Simple test table does not exist, creating it...")

        try {
          // Use the simplest possible SQL that should work
          const createTableSQL = `
            CREATE TABLE IF NOT EXISTS simple_test (
              id SERIAL PRIMARY KEY,
              name TEXT,
              created_at TIMESTAMP DEFAULT NOW()
            );
          `

          await this.supabase.rpc("exec_sql", { sql: createTableSQL })

          this.isSetupComplete = true
          return {
            success: true,
            message: "Minimal setup completed successfully",
          }
        } catch (createError) {
          console.error("Error creating simple test table:", createError)
          return {
            success: false,
            message: "Failed to create simple test table",
            details: createError,
          }
        }
      } else if (error) {
        // Other error
        console.error("Error checking simple test table:", error)
        return {
          success: false,
          message: "Error checking database",
          details: error,
        }
      } else {
        // Table exists
        this.isSetupComplete = true
        return {
          success: true,
          message: "Database already set up",
          details: data,
        }
      }
    } catch (error) {
      console.error("Error running minimal setup:", error)
      return {
        success: false,
        message: "Error running minimal setup",
        details: error,
      }
    }
  }

  // Check if setup is complete
  public isSetupComplete(): boolean {
    return this.isSetupComplete
  }
}

// Create singleton instance
let databaseSetup: DatabaseSetup | null = null

export function getDatabaseSetup(): DatabaseSetup {
  if (!databaseSetup) {
    databaseSetup = new DatabaseSetup()
  }
  return databaseSetup
}
