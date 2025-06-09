import { createClient } from "@supabase/supabase-js"

interface SetupResult {
  success: boolean
  message: string
  details?: any
  error?: string
}

class AutoSetup {
  private supabase: any
  private results: SetupResult[] = []

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials")
    }

    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  private async log(message: string, success = true, details?: any) {
    const result: SetupResult = { success, message, details }
    this.results.push(result)
    console.log(`[AutoSetup] ${success ? "✅" : "❌"} ${message}`, details || "")
    return result
  }

  async testConnection(): Promise<SetupResult> {
    try {
      const { data, error } = await this.supabase.from("_test").select("*").limit(1)

      if (error && error.code === "42P01") {
        // Table doesn't exist - this is expected, connection works
        return this.log("Database connection successful")
      } else if (error) {
        return this.log(`Connection error: ${error.message}`, false, error)
      }

      return this.log("Database connection and query successful", true, data)
    } catch (error) {
      return this.log(`Connection failed: ${error}`, false, error)
    }
  }

  async createAnalyticsTable(): Promise<SetupResult> {
    try {
      // Create the simplest analytics table possible
      const { error } = await this.supabase.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS analytics_events (
            id BIGSERIAL PRIMARY KEY,
            event_name TEXT NOT NULL,
            user_id TEXT,
            properties JSONB DEFAULT '{}',
            created_at TIMESTAMP DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
          CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
          CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at);
        `,
      })

      if (error) {
        // Try alternative method - direct table creation
        const { error: createError } = await this.supabase.from("analytics_events").select("*").limit(1)

        if (createError && createError.code === "42P01") {
          // Table doesn't exist, try to create via SQL
          const createSQL = `
            CREATE TABLE analytics_events (
              id BIGSERIAL PRIMARY KEY,
              event_name TEXT NOT NULL,
              user_id TEXT,
              properties JSONB DEFAULT '{}',
              created_at TIMESTAMP DEFAULT NOW()
            )
          `

          // Use raw SQL execution
          const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
            },
            body: JSON.stringify({ sql: createSQL }),
          })

          if (!response.ok) {
            throw new Error(`Failed to create table: ${await response.text()}`)
          }
        }
      }

      return this.log("Analytics table created successfully")
    } catch (error) {
      return this.log(`Failed to create analytics table: ${error}`, false, error)
    }
  }

  async seedSampleData(): Promise<SetupResult> {
    try {
      const sampleEvents = [
        { event_name: "page_view", user_id: "demo-user-1", properties: { page: "/dashboard" } },
        { event_name: "file_upload", user_id: "demo-user-1", properties: { file_type: "csv", size: 1024 } },
        { event_name: "analysis_complete", user_id: "demo-user-1", properties: { duration: 2.5 } },
        { event_name: "signup", user_id: "demo-user-2", properties: { plan: "pro" } },
        { event_name: "page_view", user_id: "demo-user-2", properties: { page: "/upload" } },
      ]

      const { error } = await this.supabase.from("analytics_events").insert(sampleEvents)

      if (error) {
        return this.log(`Failed to seed sample data: ${error.message}`, false, error)
      }

      return this.log(`Seeded ${sampleEvents.length} sample events`)
    } catch (error) {
      return this.log(`Error seeding data: ${error}`, false, error)
    }
  }

  async createAnalyticsFunctions(): Promise<SetupResult> {
    try {
      // Create a simple analytics function
      const functionSQL = `
        CREATE OR REPLACE FUNCTION get_event_counts()
        RETURNS TABLE(event_name TEXT, count BIGINT) AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            ae.event_name,
            COUNT(*) as count
          FROM analytics_events ae
          GROUP BY ae.event_name
          ORDER BY count DESC;
        END;
        $$ LANGUAGE plpgsql;
      `

      const { error } = await this.supabase.rpc("exec_sql", { sql: functionSQL })

      if (error) {
        return this.log(`Function creation failed: ${error.message}`, false, error)
      }

      return this.log("Analytics functions created")
    } catch (error) {
      return this.log(`Error creating functions: ${error}`, false, error)
    }
  }

  async runFullSetup(): Promise<{ success: boolean; results: SetupResult[] }> {
    console.log("🚀 Starting automated analytics setup...")

    this.results = []

    // Step 1: Test connection
    await this.testConnection()

    // Step 2: Create analytics table
    await this.createAnalyticsTable()

    // Step 3: Seed sample data
    await this.seedSampleData()

    // Step 4: Create functions
    await this.createAnalyticsFunctions()

    const success = this.results.every((r) => r.success)

    console.log(`🎯 Setup ${success ? "completed successfully" : "completed with errors"}`)

    return {
      success,
      results: this.results,
    }
  }
}

export { AutoSetup }
