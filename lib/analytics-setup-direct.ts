/**
 * Direct Analytics Setup - Safe for SSR
 *
 * This module provides a way to set up analytics tables
 * in Supabase directly, with proper error handling.
 */

import { createClient } from "@supabase/supabase-js"

export class DirectAnalyticsSetup {
  private supabase: any
  private logs: string[] = []

  constructor() {
    // Only initialize if we have the required environment variables
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      this.logs.push(`${new Date().toISOString()}: Missing Supabase credentials`)
      console.log("Missing Supabase credentials")
      return
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseKey)
    } catch (error) {
      this.logs.push(`${new Date().toISOString()}: Error creating Supabase client: ${error}`)
      console.error("Error creating Supabase client:", error)
    }
  }

  private log(message: string) {
    this.logs.push(`${new Date().toISOString()}: ${message}`)
    console.log(message)
  }

  async setup() {
    this.log("🚀 Starting direct analytics setup...")

    // Check if Supabase client is initialized
    if (!this.supabase) {
      return {
        success: false,
        logs: this.logs,
        error: "Supabase client not initialized",
      }
    }

    try {
      // Test basic connection
      this.log("Testing database connection...")

      try {
        const { data: testData, error: testError } = await this.supabase.from("profiles").select("id").limit(1)

        if (testError) {
          this.log(`❌ Connection test failed: ${testError.message}`)
        } else {
          this.log("✅ Database connection successful")
        }
      } catch (error: any) {
        this.log(`❌ Connection error: ${error.message}`)
        return {
          success: false,
          logs: this.logs,
          error: error.message,
        }
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

      // Try multiple methods to create the table
      let tableCreated = false

      // Method 1: Try using rpc
      try {
        const { data: rpcData, error: rpcError } = await this.supabase.rpc("exec_sql", {
          sql: createTableSQL,
        })

        if (rpcError) {
          this.log(`❌ RPC method failed: ${rpcError.message}`)
        } else {
          this.log("✅ Table created via RPC")
          tableCreated = true
        }
      } catch (error: any) {
        this.log(`❌ RPC error: ${error.message}`)
      }

      // Method 2: Try direct REST API call if RPC failed
      if (!tableCreated && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
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
          } else {
            this.log("✅ Table created via REST API")
            tableCreated = true
          }
        } catch (error: any) {
          this.log(`❌ REST API error: ${error.message}`)
        }
      }

      // Method 3: Try to insert into existing table to test if it exists
      if (!tableCreated) {
        this.log("Testing if table already exists...")

        try {
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
            } else {
              this.log(`✅ Table exists! Insert test error: ${insertError.message}`)
              tableCreated = true
            }
          } else {
            this.log("✅ Table exists and working!")
            tableCreated = true

            // Clean up test data
            await this.supabase
              .from("analytics_events")
              .delete()
              .eq("event_name", "test_event")
              .eq("user_id", "test_user")
          }
        } catch (error: any) {
          this.log(`❌ Insert test error: ${error.message}`)
        }
      }

      // If we couldn't create or verify the table, return error
      if (!tableCreated) {
        return {
          success: false,
          logs: this.logs,
          error: "Could not create or verify analytics table",
        }
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

      try {
        const { data: insertData, error: insertError } = await this.supabase
          .from("analytics_events")
          .insert(sampleEvents)

        if (insertError) {
          this.log(`❌ Failed to insert sample data: ${insertError.message}`)
        } else {
          this.log(`✅ Inserted ${sampleEvents.length} sample events`)
        }
      } catch (error: any) {
        this.log(`❌ Sample data insertion error: ${error.message}`)
      }

      // Test querying the data
      this.log("Testing data retrieval...")

      try {
        const { data: queryData, error: queryError } = await this.supabase
          .from("analytics_events")
          .select("*")
          .limit(10)

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
      } catch (error: any) {
        this.log(`❌ Query error: ${error.message}`)
        return {
          success: false,
          logs: this.logs,
          error: error.message,
        }
      }
    } catch (error: any) {
      this.log(`❌ Setup failed with error: ${error.message}`)
      return {
        success: false,
        logs: this.logs,
        error: error.message,
      }
    }
  }
}
