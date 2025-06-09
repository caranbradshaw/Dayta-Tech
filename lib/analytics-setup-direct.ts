import { createClient } from "@supabase/supabase-js"

export class DirectAnalyticsSetup {
  private supabase: any
  private logs: string[] = []

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials")
    }

    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  private log(message: string) {
    this.logs.push(`${new Date().toISOString()}: ${message}`)
    console.log(message)
  }

  async setup() {
    this.log("🚀 Starting direct analytics setup...")

    try {
      // Test basic connection
      this.log("Testing database connection...")
      const { data: testData, error: testError } = await this.supabase.from("profiles").select("id").limit(1)

      if (testError) {
        this.log(`❌ Connection test failed: ${testError.message}`)
      } else {
        this.log("✅ Database connection successful")
      }

      // Try to create analytics table using raw SQL
      this.log("Creating analytics table...")

      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS analytics_events (
          id BIGSERIAL PRIMARY KEY,
          event_name TEXT NOT NULL,
          user_id TEXT,
          properties JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
        CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
        CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at);
      `

      // Method 1: Try using rpc
      const { data: rpcData, error: rpcError } = await this.supabase.rpc("exec_sql", {
        sql: createTableSQL,
      })

      if (rpcError) {
        this.log(`❌ RPC method failed: ${rpcError.message}`)

        // Method 2: Try direct REST API call
        this.log("Trying direct REST API...")

        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
          },
          body: JSON.stringify({ sql: createTableSQL }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          this.log(`❌ REST API failed: ${errorText}`)

          // Method 3: Try to insert into existing table to test if it exists
          this.log("Testing if table already exists...")

          const { data: insertTest, error: insertError } = await this.supabase.from("analytics_events").insert([
            {
              event_name: "test_event",
              user_id: "test_user",
              properties: { test: true },
            },
          ])

          if (insertError) {
            if (insertError.code === "42P01") {
              this.log("❌ Table does not exist and cannot be created")
              return { success: false, logs: this.logs, error: "Cannot create analytics table" }
            } else {
              this.log(`✅ Table exists! Insert test error: ${insertError.message}`)
            }
          } else {
            this.log("✅ Table exists and working!")

            // Clean up test data
            await this.supabase
              .from("analytics_events")
              .delete()
              .eq("event_name", "test_event")
              .eq("user_id", "test_user")
          }
        } else {
          this.log("✅ Table created via REST API")
        }
      } else {
        this.log("✅ Table created via RPC")
      }

      // Insert sample data
      this.log("Inserting sample analytics data...")

      const sampleEvents = [
        {
          event_name: "page_view",
          user_id: "demo-user-1",
          properties: { page: "/dashboard", timestamp: new Date().toISOString() },
        },
        {
          event_name: "file_upload",
          user_id: "demo-user-1",
          properties: { file_type: "csv", size: 1024, timestamp: new Date().toISOString() },
        },
        {
          event_name: "analysis_complete",
          user_id: "demo-user-1",
          properties: { duration: 2.5, ai_provider: "openai", timestamp: new Date().toISOString() },
        },
        {
          event_name: "signup",
          user_id: "demo-user-2",
          properties: { plan: "pro", source: "landing_page", timestamp: new Date().toISOString() },
        },
        {
          event_name: "subscription_started",
          user_id: "demo-user-2",
          properties: { plan: "pro", amount: 29.99, timestamp: new Date().toISOString() },
        },
      ]

      const { data: insertData, error: insertError } = await this.supabase.from("analytics_events").insert(sampleEvents)

      if (insertError) {
        this.log(`❌ Failed to insert sample data: ${insertError.message}`)
      } else {
        this.log(`✅ Inserted ${sampleEvents.length} sample events`)
      }

      // Test querying the data
      this.log("Testing data retrieval...")

      const { data: queryData, error: queryError } = await this.supabase.from("analytics_events").select("*").limit(10)

      if (queryError) {
        this.log(`❌ Query failed: ${queryError.message}`)
      } else {
        this.log(`✅ Successfully retrieved ${queryData?.length || 0} events`)
      }

      this.log("🎉 Analytics setup completed successfully!")

      return {
        success: true,
        logs: this.logs,
        sampleDataCount: sampleEvents.length,
        retrievedDataCount: queryData?.length || 0,
      }
    } catch (error) {
      this.log(`❌ Setup failed with error: ${error}`)
      return {
        success: false,
        logs: this.logs,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}
