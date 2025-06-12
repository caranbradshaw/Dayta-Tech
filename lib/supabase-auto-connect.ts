/**
 * Supabase Auto-Connect Utility
 *
 * This utility automatically connects to Supabase and sets up the necessary
 * database tables and configurations when the application starts.
 */

import { createClient } from "@supabase/supabase-js"

interface SetupResult {
  success: boolean
  message: string
  details?: any
}

export class SupabaseAutoConnect {
  private supabase: any
  private isConnected = false
  private setupStatus: Record<string, SetupResult> = {}

  constructor() {
    // Try to initialize Supabase client
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (supabaseUrl && supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey)
        console.log("Supabase client initialized")
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

  // Test connection to Supabase
  public async testConnection(): Promise<SetupResult> {
    if (!this.isSupabaseAvailable()) {
      return {
        success: false,
        message: "Supabase client not initialized. Check your environment variables.",
      }
    }

    try {
      // Simple query to test connection
      const { data, error } = await this.supabase.from("profiles").select("count").limit(1)

      if (error) {
        if (error.code === "42P01") {
          // Table doesn't exist yet, but connection works
          this.isConnected = true
          return {
            success: true,
            message: "Connected to Supabase, but tables are not set up yet.",
          }
        } else {
          console.error("Error testing Supabase connection:", error)
          return {
            success: false,
            message: `Connection error: ${error.message}`,
            details: error,
          }
        }
      }

      // Connection successful
      this.isConnected = true
      return {
        success: true,
        message: "Successfully connected to Supabase!",
        details: data,
      }
    } catch (error) {
      console.error("Error testing Supabase connection:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      }
    }
  }

  // Run the complete database setup
  public async runDatabaseSetup(): Promise<Record<string, SetupResult>> {
    if (!this.isSupabaseAvailable()) {
      return {
        connection: {
          success: false,
          message: "Supabase client not initialized. Check your environment variables.",
        },
      }
    }

    // Test connection first
    const connectionResult = await this.testConnection()
    this.setupStatus.connection = connectionResult

    if (!connectionResult.success) {
      return this.setupStatus
    }

    // Setup tables in sequence
    await this.setupProfilesTable()
    await this.setupOrganizationsTable()
    await this.setupProjectsTable()
    await this.setupAnalysesTable()
    await this.setupInsightsTable()
    await this.setupSubscriptionsTable()
    await this.setupActivityTables()
    await this.setupCustomFieldsTable()

    return this.setupStatus
  }

  // Setup profiles table
  private async setupProfilesTable(): Promise<SetupResult> {
    try {
      const { data, error } = await this.supabase.from("profiles").select("count").limit(1)

      if (error && error.code === "42P01") {
        // Table doesn't exist, create it
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            name TEXT,
            email TEXT UNIQUE,
            company TEXT,
            role TEXT,
            industry TEXT,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `

        const { error: createError } = await this.supabase.rpc("exec_sql", { sql: createTableSQL })

        if (createError) {
          // Try direct SQL if RPC fails
          try {
            await this.supabase.sql(createTableSQL)
            this.setupStatus.profiles = {
              success: true,
              message: "Profiles table created successfully (direct SQL)",
            }
            return this.setupStatus.profiles
          } catch (directError) {
            this.setupStatus.profiles = {
              success: false,
              message: `Failed to create profiles table: ${createError.message}`,
              details: { rpcError: createError, directError },
            }
            return this.setupStatus.profiles
          }
        }

        this.setupStatus.profiles = {
          success: true,
          message: "Profiles table created successfully",
        }
      } else if (error) {
        this.setupStatus.profiles = {
          success: false,
          message: `Error checking profiles table: ${error.message}`,
          details: error,
        }
      } else {
        this.setupStatus.profiles = {
          success: true,
          message: "Profiles table already exists",
        }
      }

      return this.setupStatus.profiles
    } catch (error) {
      this.setupStatus.profiles = {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      }
      return this.setupStatus.profiles
    }
  }

  // Setup organizations table
  private async setupOrganizationsTable(): Promise<SetupResult> {
    try {
      const { data, error } = await this.supabase.from("organizations").select("count").limit(1)

      if (error && error.code === "42P01") {
        // Table doesn't exist, create it
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS organizations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT,
            logo_url TEXT,
            website TEXT,
            industry TEXT,
            size TEXT,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE TABLE IF NOT EXISTS organization_members (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            role TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(organization_id, user_id)
          );
        `

        const { error: createError } = await this.supabase.rpc("exec_sql", { sql: createTableSQL })

        if (createError) {
          // Try direct SQL if RPC fails
          try {
            await this.supabase.sql(createTableSQL)
            this.setupStatus.organizations = {
              success: true,
              message: "Organizations tables created successfully (direct SQL)",
            }
            return this.setupStatus.organizations
          } catch (directError) {
            this.setupStatus.organizations = {
              success: false,
              message: `Failed to create organizations tables: ${createError.message}`,
              details: { rpcError: createError, directError },
            }
            return this.setupStatus.organizations
          }
        }

        this.setupStatus.organizations = {
          success: true,
          message: "Organizations tables created successfully",
        }
      } else if (error) {
        this.setupStatus.organizations = {
          success: false,
          message: `Error checking organizations table: ${error.message}`,
          details: error,
        }
      } else {
        this.setupStatus.organizations = {
          success: true,
          message: "Organizations tables already exist",
        }
      }

      return this.setupStatus.organizations
    } catch (error) {
      this.setupStatus.organizations = {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      }
      return this.setupStatus.organizations
    }
  }

  // Setup projects table
  private async setupProjectsTable(): Promise<SetupResult> {
    try {
      const { data, error } = await this.supabase.from("projects").select("count").limit(1)

      if (error && error.code === "42P01") {
        // Table doesn't exist, create it
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS projects (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT,
            organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
            created_by UUID REFERENCES auth.users(id),
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `

        const { error: createError } = await this.supabase.rpc("exec_sql", { sql: createTableSQL })

        if (createError) {
          // Try direct SQL if RPC fails
          try {
            await this.supabase.sql(createTableSQL)
            this.setupStatus.projects = {
              success: true,
              message: "Projects table created successfully (direct SQL)",
            }
            return this.setupStatus.projects
          } catch (directError) {
            this.setupStatus.projects = {
              success: false,
              message: `Failed to create projects table: ${createError.message}`,
              details: { rpcError: createError, directError },
            }
            return this.setupStatus.projects
          }
        }

        this.setupStatus.projects = {
          success: true,
          message: "Projects table created successfully",
        }
      } else if (error) {
        this.setupStatus.projects = {
          success: false,
          message: `Error checking projects table: ${error.message}`,
          details: error,
        }
      } else {
        this.setupStatus.projects = {
          success: true,
          message: "Projects table already exists",
        }
      }

      return this.setupStatus.projects
    } catch (error) {
      this.setupStatus.projects = {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      }
      return this.setupStatus.projects
    }
  }

  // Setup analyses table
  private async setupAnalysesTable(): Promise<SetupResult> {
    try {
      const { data, error } = await this.supabase.from("analyses").select("count").limit(1)

      if (error && error.code === "42P01") {
        // Table doesn't exist, create it
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS analyses (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            description TEXT,
            project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
            user_id UUID REFERENCES auth.users(id),
            status TEXT DEFAULT 'pending',
            file_name TEXT,
            file_type TEXT,
            file_size BIGINT,
            file_url TEXT,
            results JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            completed_at TIMESTAMP WITH TIME ZONE
          );
        `

        const { error: createError } = await this.supabase.rpc("exec_sql", { sql: createTableSQL })

        if (createError) {
          // Try direct SQL if RPC fails
          try {
            await this.supabase.sql(createTableSQL)
            this.setupStatus.analyses = {
              success: true,
              message: "Analyses table created successfully (direct SQL)",
            }
            return this.setupStatus.analyses
          } catch (directError) {
            this.setupStatus.analyses = {
              success: false,
              message: `Failed to create analyses table: ${createError.message}`,
              details: { rpcError: createError, directError },
            }
            return this.setupStatus.analyses
          }
        }

        this.setupStatus.analyses = {
          success: true,
          message: "Analyses table created successfully",
        }
      } else if (error) {
        this.setupStatus.analyses = {
          success: false,
          message: `Error checking analyses table: ${error.message}`,
          details: error,
        }
      } else {
        this.setupStatus.analyses = {
          success: true,
          message: "Analyses table already exists",
        }
      }

      return this.setupStatus.analyses
    } catch (error) {
      this.setupStatus.analyses = {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      }
      return this.setupStatus.analyses
    }
  }

  // Setup insights table
  private async setupInsightsTable(): Promise<SetupResult> {
    try {
      const { data, error } = await this.supabase.from("insights").select("count").limit(1)

      if (error && error.code === "42P01") {
        // Table doesn't exist, create it
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS insights (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            description TEXT,
            analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
            project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
            user_id UUID REFERENCES auth.users(id),
            category TEXT,
            confidence_score NUMERIC,
            impact_level TEXT,
            status TEXT DEFAULT 'active',
            metadata JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `

        const { error: createError } = await this.supabase.rpc("exec_sql", { sql: createTableSQL })

        if (createError) {
          // Try direct SQL if RPC fails
          try {
            await this.supabase.sql(createTableSQL)
            this.setupStatus.insights = {
              success: true,
              message: "Insights table created successfully (direct SQL)",
            }
            return this.setupStatus.insights
          } catch (directError) {
            this.setupStatus.insights = {
              success: false,
              message: `Failed to create insights table: ${createError.message}`,
              details: { rpcError: createError, directError },
            }
            return this.setupStatus.insights
          }
        }

        this.setupStatus.insights = {
          success: true,
          message: "Insights table created successfully",
        }
      } else if (error) {
        this.setupStatus.insights = {
          success: false,
          message: `Error checking insights table: ${error.message}`,
          details: error,
        }
      } else {
        this.setupStatus.insights = {
          success: true,
          message: "Insights table already exists",
        }
      }

      return this.setupStatus.insights
    } catch (error) {
      this.setupStatus.insights = {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      }
      return this.setupStatus.insights
    }
  }

  // Setup subscriptions table
  private async setupSubscriptionsTable(): Promise<SetupResult> {
    try {
      const { data, error } = await this.supabase.from("subscriptions").select("count").limit(1)

      if (error && error.code === "42P01") {
        // Table doesn't exist, create it
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS subscriptions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
            plan_id TEXT NOT NULL,
            plan_name TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            current_period_start TIMESTAMP WITH TIME ZONE,
            current_period_end TIMESTAMP WITH TIME ZONE,
            cancel_at_period_end BOOLEAN DEFAULT FALSE,
            payment_method TEXT,
            payment_provider TEXT,
            payment_provider_id TEXT,
            features JSONB,
            monthly_reports_limit INTEGER DEFAULT 5,
            monthly_exports_limit INTEGER DEFAULT 5,
            monthly_uploads_limit INTEGER DEFAULT 10,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `

        const { error: createError } = await this.supabase.rpc("exec_sql", { sql: createTableSQL })

        if (createError) {
          // Try direct SQL if RPC fails
          try {
            await this.supabase.sql(createTableSQL)
            this.setupStatus.subscriptions = {
              success: true,
              message: "Subscriptions table created successfully (direct SQL)",
            }
            return this.setupStatus.subscriptions
          } catch (directError) {
            this.setupStatus.subscriptions = {
              success: false,
              message: `Failed to create subscriptions table: ${createError.message}`,
              details: { rpcError: createError, directError },
            }
            return this.setupStatus.subscriptions
          }
        }

        this.setupStatus.subscriptions = {
          success: true,
          message: "Subscriptions table created successfully",
        }
      } else if (error) {
        this.setupStatus.subscriptions = {
          success: false,
          message: `Error checking subscriptions table: ${error.message}`,
          details: error,
        }
      } else {
        this.setupStatus.subscriptions = {
          success: true,
          message: "Subscriptions table already exists",
        }
      }

      return this.setupStatus.subscriptions
    } catch (error) {
      this.setupStatus.subscriptions = {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      }
      return this.setupStatus.subscriptions
    }
  }

  // Setup activity tables
  private async setupActivityTables(): Promise<SetupResult> {
    try {
      const { data, error } = await this.supabase.from("user_activities").select("count").limit(1)

      if (error && error.code === "42P01") {
        // Table doesn't exist, create it
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS user_activities (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            activity_type TEXT NOT NULL,
            activity_description TEXT,
            metadata JSONB,
            ip_address TEXT,
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE TABLE IF NOT EXISTS account_changes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            change_type TEXT NOT NULL,
            old_values JSONB,
            new_values JSONB,
            changed_by UUID REFERENCES auth.users(id),
            reason TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE TABLE IF NOT EXISTS file_activities (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
            activity_type TEXT NOT NULL,
            file_name TEXT,
            file_size BIGINT,
            activity_details JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE TABLE IF NOT EXISTS file_uploads (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            file_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size BIGINT,
            file_type TEXT,
            status TEXT DEFAULT 'uploaded',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `

        const { error: createError } = await this.supabase.rpc("exec_sql", { sql: createTableSQL })

        if (createError) {
          // Try direct SQL if RPC fails
          try {
            await this.supabase.sql(createTableSQL)
            this.setupStatus.activities = {
              success: true,
              message: "Activity tables created successfully (direct SQL)",
            }
            return this.setupStatus.activities
          } catch (directError) {
            this.setupStatus.activities = {
              success: false,
              message: `Failed to create activity tables: ${createError.message}`,
              details: { rpcError: createError, directError },
            }
            return this.setupStatus.activities
          }
        }

        this.setupStatus.activities = {
          success: true,
          message: "Activity tables created successfully",
        }
      } else if (error) {
        this.setupStatus.activities = {
          success: false,
          message: `Error checking activity tables: ${error.message}`,
          details: error,
        }
      } else {
        this.setupStatus.activities = {
          success: true,
          message: "Activity tables already exist",
        }
      }

      return this.setupStatus.activities
    } catch (error) {
      this.setupStatus.activities = {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      }
      return this.setupStatus.activities
    }
  }

  // Setup custom fields table
  private async setupCustomFieldsTable(): Promise<SetupResult> {
    try {
      const { data, error } = await this.supabase.from("custom_fields").select("count").limit(1)

      if (error && error.code === "42P01") {
        // Table doesn't exist, create it
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS custom_fields (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            field_type TEXT NOT NULL,
            field_value TEXT NOT NULL,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(field_type, field_value)
          );
        `

        const { error: createError } = await this.supabase.rpc("exec_sql", { sql: createTableSQL })

        if (createError) {
          // Try direct SQL if RPC fails
          try {
            await this.supabase.sql(createTableSQL)
            this.setupStatus.customFields = {
              success: true,
              message: "Custom fields table created successfully (direct SQL)",
            }
            return this.setupStatus.customFields
          } catch (directError) {
            this.setupStatus.customFields = {
              success: false,
              message: `Failed to create custom fields table: ${createError.message}`,
              details: { rpcError: createError, directError },
            }
            return this.setupStatus.customFields
          }
        }

        this.setupStatus.customFields = {
          success: true,
          message: "Custom fields table created successfully",
        }
      } else if (error) {
        this.setupStatus.customFields = {
          success: false,
          message: `Error checking custom fields table: ${error.message}`,
          details: error,
        }
      } else {
        this.setupStatus.customFields = {
          success: true,
          message: "Custom fields table already exists",
        }
      }

      return this.setupStatus.customFields
    } catch (error) {
      this.setupStatus.customFields = {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      }
      return this.setupStatus.customFields
    }
  }

  // Get setup status
  public getSetupStatus(): Record<string, SetupResult> {
    return this.setupStatus
  }

  // Check if connected
  public isConnected(): boolean {
    return this.isConnected
  }
}

// Create singleton instance
let supabaseAutoConnect: SupabaseAutoConnect | null = null

export function getSupabaseAutoConnect(): SupabaseAutoConnect {
  if (!supabaseAutoConnect) {
    supabaseAutoConnect = new SupabaseAutoConnect()
  }
  return supabaseAutoConnect
}
