/**
 * Supabase Auto Repair Utility
 *
 * This utility automatically detects and fixes common Supabase setup issues:
 * - Creates missing tables
 * - Sets up proper relationships
 * - Configures RLS policies
 * - Verifies connection and auth
 */

import { createClient } from "@supabase/supabase-js"

interface RepairResult {
  success: boolean
  message: string
  details?: any
}

export class SupabaseAutoRepair {
  private supabase: any
  private serviceClient: any
  private repairStatus: Record<string, RepairResult> = {}
  private isConnected = false

  constructor() {
    // Try to initialize Supabase client
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (supabaseUrl && supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey)
        console.log("Supabase client initialized")

        if (serviceRoleKey) {
          this.serviceClient = createClient(supabaseUrl, serviceRoleKey)
          console.log("Supabase service client initialized")
        }
      } else {
        console.warn("Missing Supabase credentials, cannot initialize repair tool")
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
  public async testConnection(): Promise<RepairResult> {
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

  // Run the complete database repair
  public async runDatabaseRepair(): Promise<Record<string, RepairResult>> {
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
    this.repairStatus.connection = connectionResult

    if (!connectionResult.success) {
      return this.repairStatus
    }

    // Setup tables in sequence
    await this.enableExtensions()
    await this.setupProfilesTable()
    await this.setupOrganizationsTable()
    await this.setupProjectsTable()
    await this.setupAnalysesTable()
    await this.setupInsightsTable()
    await this.setupSubscriptionsTable()
    await this.setupActivityTables()
    await this.setupCustomFieldsTable()
    await this.setupRlsPolicies()

    return this.repairStatus
  }

  // Enable required PostgreSQL extensions
  private async enableExtensions(): Promise<RepairResult> {
    try {
      // We need to use the service role client for this
      if (!this.serviceClient) {
        this.repairStatus.extensions = {
          success: false,
          message: "Service role key not provided. Cannot enable extensions.",
        }
        return this.repairStatus.extensions
      }

      const extensionsSQL = `
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      `

      // Try using rpc first
      try {
        const { error } = await this.serviceClient.rpc("exec_sql", { sql: extensionsSQL })

        if (error) {
          // If rpc fails, try direct SQL if available
          try {
            await this.serviceClient.sql(extensionsSQL)
            this.repairStatus.extensions = {
              success: true,
              message: "Extensions enabled successfully (direct SQL)",
            }
          } catch (directError) {
            this.repairStatus.extensions = {
              success: false,
              message: `Failed to enable extensions: ${error.message}`,
              details: { rpcError: error, directError },
            }
          }
        } else {
          this.repairStatus.extensions = {
            success: true,
            message: "Extensions enabled successfully",
          }
        }
      } catch (error) {
        this.repairStatus.extensions = {
          success: false,
          message: `Error enabling extensions: ${error instanceof Error ? error.message : "Unknown error"}`,
          details: error,
        }
      }

      return this.repairStatus.extensions
    } catch (error) {
      this.repairStatus.extensions = {
        success: false,
        message: `Error enabling extensions: ${error instanceof Error ? error.message : "Unknown error"}`,
        details: error,
      }
      return this.repairStatus.extensions
    }
  }

  // Setup profiles table
  private async setupProfilesTable(): Promise<RepairResult> {
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

        // Try using rpc first
        try {
          const { error: createError } = await this.supabase.rpc("exec_sql", { sql: createTableSQL })

          if (createError) {
            // If rpc fails, try direct SQL if available
            try {
              await this.supabase.sql(createTableSQL)
              this.repairStatus.profiles = {
                success: true,
                message: "Profiles table created successfully (direct SQL)",
              }
            } catch (directError) {
              // If both fail, try with service role client
              if (this.serviceClient) {
                try {
                  await this.serviceClient.sql(createTableSQL)
                  this.repairStatus.profiles = {
                    success: true,
                    message: "Profiles table created successfully (service role)",
                  }
                } catch (serviceError) {
                  this.repairStatus.profiles = {
                    success: false,
                    message: `Failed to create profiles table: ${createError.message}`,
                    details: { rpcError: createError, directError, serviceError },
                  }
                }
              } else {
                this.repairStatus.profiles = {
                  success: false,
                  message: `Failed to create profiles table: ${createError.message}`,
                  details: { rpcError: createError, directError },
                }
              }
            }
          } else {
            this.repairStatus.profiles = {
              success: true,
              message: "Profiles table created successfully",
            }
          }
        } catch (error) {
          this.repairStatus.profiles = {
            success: false,
            message: `Error creating profiles table: ${error instanceof Error ? error.message : "Unknown error"}`,
            details: error,
          }
        }
      } else if (error) {
        this.repairStatus.profiles = {
          success: false,
          message: `Error checking profiles table: ${error.message}`,
          details: error,
        }
      } else {
        this.repairStatus.profiles = {
          success: true,
          message: "Profiles table already exists",
        }
      }

      return this.repairStatus.profiles
    } catch (error) {
      this.repairStatus.profiles = {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      }
      return this.repairStatus.profiles
    }
  }

  // Setup organizations table
  private async setupOrganizationsTable(): Promise<RepairResult> {
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

        // Try using rpc first
        try {
          const { error: createError } = await this.supabase.rpc("exec_sql", { sql: createTableSQL })

          if (createError) {
            // If rpc fails, try direct SQL if available
            try {
              await this.supabase.sql(createTableSQL)
              this.repairStatus.organizations = {
                success: true,
                message: "Organizations tables created successfully (direct SQL)",
              }
            } catch (directError) {
              // If both fail, try with service role client
              if (this.serviceClient) {
                try {
                  await this.serviceClient.sql(createTableSQL)
                  this.repairStatus.organizations = {
                    success: true,
                    message: "Organizations tables created successfully (service role)",
                  }
                } catch (serviceError) {
                  this.repairStatus.organizations = {
                    success: false,
                    message: `Failed to create organizations tables: ${createError.message}`,
                    details: { rpcError: createError, directError, serviceError },
                  }
                }
              } else {
                this.repairStatus.organizations = {
                  success: false,
                  message: `Failed to create organizations tables: ${createError.message}`,
                  details: { rpcError: createError, directError },
                }
              }
            }
          } else {
            this.repairStatus.organizations = {
              success: true,
              message: "Organizations tables created successfully",
            }
          }
        } catch (error) {
          this.repairStatus.organizations = {
            success: false,
            message: `Error creating organizations tables: ${error instanceof Error ? error.message : "Unknown error"}`,
            details: error,
          }
        }
      } else if (error) {
        this.repairStatus.organizations = {
          success: false,
          message: `Error checking organizations table: ${error.message}`,
          details: error,
        }
      } else {
        this.repairStatus.organizations = {
          success: true,
          message: "Organizations tables already exist",
        }
      }

      return this.repairStatus.organizations
    } catch (error) {
      this.repairStatus.organizations = {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      }
      return this.repairStatus.organizations
    }
  }

  // Setup projects table
  private async setupProjectsTable(): Promise<RepairResult> {
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

        // Try using rpc first
        try {
          const { error: createError } = await this.supabase.rpc("exec_sql", { sql: createTableSQL })

          if (createError) {
            // If rpc fails, try direct SQL if available
            try {
              await this.supabase.sql(createTableSQL)
              this.repairStatus.projects = {
                success: true,
                message: "Projects table created successfully (direct SQL)",
              }
            } catch (directError) {
              // If both fail, try with service role client
              if (this.serviceClient) {
                try {
                  await this.serviceClient.sql(createTableSQL)
                  this.repairStatus.projects = {
                    success: true,
                    message: "Projects table created successfully (service role)",
                  }
                } catch (serviceError) {
                  this.repairStatus.projects = {
                    success: false,
                    message: `Failed to create projects table: ${createError.message}`,
                    details: { rpcError: createError, directError, serviceError },
                  }
                }
              } else {
                this.repairStatus.projects = {
                  success: false,
                  message: `Failed to create projects table: ${createError.message}`,
                  details: { rpcError: createError, directError },
                }
              }
            }
          } else {
            this.repairStatus.projects = {
              success: true,
              message: "Projects table created successfully",
            }
          }
        } catch (error) {
          this.repairStatus.projects = {
            success: false,
            message: `Error creating projects table: ${error instanceof Error ? error.message : "Unknown error"}`,
            details: error,
          }
        }
      } else if (error) {
        this.repairStatus.projects = {
          success: false,
          message: `Error checking projects table: ${error.message}`,
          details: error,
        }
      } else {
        this.repairStatus.projects = {
          success: true,
          message: "Projects table already exists",
        }
      }

      return this.repairStatus.projects
    } catch (error) {
      this.repairStatus.projects = {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      }
      return this.repairStatus.projects
    }
  }

  // Setup analyses table
  private async setupAnalysesTable(): Promise<RepairResult> {
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

        // Try using rpc first
        try {
          const { error: createError } = await this.supabase.rpc("exec_sql", { sql: createTableSQL })

          if (createError) {
            // If rpc fails, try direct SQL if available
            try {
              await this.supabase.sql(createTableSQL)
              this.repairStatus.analyses = {
                success: true,
                message: "Analyses table created successfully (direct SQL)",
              }
            } catch (directError) {
              // If both fail, try with service role client
              if (this.serviceClient) {
                try {
                  await this.serviceClient.sql(createTableSQL)
                  this.repairStatus.analyses = {
                    success: true,
                    message: "Analyses table created successfully (service role)",
                  }
                } catch (serviceError) {
                  this.repairStatus.analyses = {
                    success: false,
                    message: `Failed to create analyses table: ${createError.message}`,
                    details: { rpcError: createError, directError, serviceError },
                  }
                }
              } else {
                this.repairStatus.analyses = {
                  success: false,
                  message: `Failed to create analyses table: ${createError.message}`,
                  details: { rpcError: createError, directError },
                }
              }
            }
          } else {
            this.repairStatus.analyses = {
              success: true,
              message: "Analyses table created successfully",
            }
          }
        } catch (error) {
          this.repairStatus.analyses = {
            success: false,
            message: `Error creating analyses table: ${error instanceof Error ? error.message : "Unknown error"}`,
            details: error,
          }
        }
      } else if (error) {
        this.repairStatus.analyses = {
          success: false,
          message: `Error checking analyses table: ${error.message}`,
          details: error,
        }
      } else {
        this.repairStatus.analyses = {
          success: true,
          message: "Analyses table already exists",
        }
      }

      return this.repairStatus.analyses
    } catch (error) {
      this.repairStatus.analyses = {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      }
      return this.repairStatus.analyses
    }
  }

  // Setup insights table
  private async setupInsightsTable(): Promise<RepairResult> {
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

        // Try using rpc first
        try {
          const { error: createError } = await this.supabase.rpc("exec_sql", { sql: createTableSQL })

          if (createError) {
            // If rpc fails, try direct SQL if available
            try {
              await this.supabase.sql(createTableSQL)
              this.repairStatus.insights = {
                success: true,
                message: "Insights table created successfully (direct SQL)",
              }
            } catch (directError) {
              // If both fail, try with service role client
              if (this.serviceClient) {
                try {
                  await this.serviceClient.sql(createTableSQL)
                  this.repairStatus.insights = {
                    success: true,
                    message: "Insights table created successfully (service role)",
                  }
                } catch (serviceError) {
                  this.repairStatus.insights = {
                    success: false,
                    message: `Failed to create insights table: ${createError.message}`,
                    details: { rpcError: createError, directError, serviceError },
                  }
                }
              } else {
                this.repairStatus.insights = {
                  success: false,
                  message: `Failed to create insights table: ${createError.message}`,
                  details: { rpcError: createError, directError },
                }
              }
            }
          } else {
            this.repairStatus.insights = {
              success: true,
              message: "Insights table created successfully",
            }
          }
        } catch (error) {
          this.repairStatus.insights = {
            success: false,
            message: `Error creating insights table: ${error instanceof Error ? error.message : "Unknown error"}`,
            details: error,
          }
        }
      } else if (error) {
        this.repairStatus.insights = {
          success: false,
          message: `Error checking insights table: ${error.message}`,
          details: error,
        }
      } else {
        this.repairStatus.insights = {
          success: true,
          message: "Insights table already exists",
        }
      }

      return this.repairStatus.insights
    } catch (error) {
      this.repairStatus.insights = {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      }
      return this.repairStatus.insights
    }
  }

  // Setup subscriptions table
  private async setupSubscriptionsTable(): Promise<RepairResult> {
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

        // Try using rpc first
        try {
          const { error: createError } = await this.supabase.rpc("exec_sql", { sql: createTableSQL })

          if (createError) {
            // If rpc fails, try direct SQL if available
            try {
              await this.supabase.sql(createTableSQL)
              this.repairStatus.subscriptions = {
                success: true,
                message: "Subscriptions table created successfully (direct SQL)",
              }
            } catch (directError) {
              // If both fail, try with service role client
              if (this.serviceClient) {
                try {
                  await this.serviceClient.sql(createTableSQL)
                  this.repairStatus.subscriptions = {
                    success: true,
                    message: "Subscriptions table created successfully (service role)",
                  }
                } catch (serviceError) {
                  this.repairStatus.subscriptions = {
                    success: false,
                    message: `Failed to create subscriptions table: ${createError.message}`,
                    details: { rpcError: createError, directError, serviceError },
                  }
                }
              } else {
                this.repairStatus.subscriptions = {
                  success: false,
                  message: `Failed to create subscriptions table: ${createError.message}`,
                  details: { rpcError: createError, directError },
                }
              }
            }
          } else {
            this.repairStatus.subscriptions = {
              success: true,
              message: "Subscriptions table created successfully",
            }
          }
        } catch (error) {
          this.repairStatus.subscriptions = {
            success: false,
            message: `Error creating subscriptions table: ${error instanceof Error ? error.message : "Unknown error"}`,
            details: error,
          }
        }
      } else if (error) {
        this.repairStatus.subscriptions = {
          success: false,
          message: `Error checking subscriptions table: ${error.message}`,
          details: error,
        }
      } else {
        this.repairStatus.subscriptions = {
          success: true,
          message: "Subscriptions table already exists",
        }
      }

      return this.repairStatus.subscriptions
    } catch (error) {
      this.repairStatus.subscriptions = {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      }
      return this.repairStatus.subscriptions
    }
  }

  // Setup activity tables
  private async setupActivityTables(): Promise<RepairResult> {
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

        // Try using rpc first
        try {
          const { error: createError } = await this.supabase.rpc("exec_sql", { sql: createTableSQL })

          if (createError) {
            // If rpc fails, try direct SQL if available
            try {
              await this.supabase.sql(createTableSQL)
              this.repairStatus.activities = {
                success: true,
                message: "Activity tables created successfully (direct SQL)",
              }
            } catch (directError) {
              // If both fail, try with service role client
              if (this.serviceClient) {
                try {
                  await this.serviceClient.sql(createTableSQL)
                  this.repairStatus.activities = {
                    success: true,
                    message: "Activity tables created successfully (service role)",
                  }
                } catch (serviceError) {
                  this.repairStatus.activities = {
                    success: false,
                    message: `Failed to create activity tables: ${createError.message}`,
                    details: { rpcError: createError, directError, serviceError },
                  }
                }
              } else {
                this.repairStatus.activities = {
                  success: false,
                  message: `Failed to create activity tables: ${createError.message}`,
                  details: { rpcError: createError, directError },
                }
              }
            }
          } else {
            this.repairStatus.activities = {
              success: true,
              message: "Activity tables created successfully",
            }
          }
        } catch (error) {
          this.repairStatus.activities = {
            success: false,
            message: `Error creating activity tables: ${error instanceof Error ? error.message : "Unknown error"}`,
            details: error,
          }
        }
      } else if (error) {
        this.repairStatus.activities = {
          success: false,
          message: `Error checking activity tables: ${error.message}`,
          details: error,
        }
      } else {
        this.repairStatus.activities = {
          success: true,
          message: "Activity tables already exist",
        }
      }

      return this.repairStatus.activities
    } catch (error) {
      this.repairStatus.activities = {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      }
      return this.repairStatus.activities
    }
  }

  // Setup custom fields table
  private async setupCustomFieldsTable(): Promise<RepairResult> {
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

        // Try using rpc first
        try {
          const { error: createError } = await this.supabase.rpc("exec_sql", { sql: createTableSQL })

          if (createError) {
            // If rpc fails, try direct SQL if available
            try {
              await this.supabase.sql(createTableSQL)
              this.repairStatus.customFields = {
                success: true,
                message: "Custom fields table created successfully (direct SQL)",
              }
            } catch (directError) {
              // If both fail, try with service role client
              if (this.serviceClient) {
                try {
                  await this.serviceClient.sql(createTableSQL)
                  this.repairStatus.customFields = {
                    success: true,
                    message: "Custom fields table created successfully (service role)",
                  }
                } catch (serviceError) {
                  this.repairStatus.customFields = {
                    success: false,
                    message: `Failed to create custom fields table: ${createError.message}`,
                    details: { rpcError: createError, directError, serviceError },
                  }
                }
              } else {
                this.repairStatus.customFields = {
                  success: false,
                  message: `Failed to create custom fields table: ${createError.message}`,
                  details: { rpcError: createError, directError },
                }
              }
            }
          } else {
            this.repairStatus.customFields = {
              success: true,
              message: "Custom fields table created successfully",
            }
          }
        } catch (error) {
          this.repairStatus.customFields = {
            success: false,
            message: `Error creating custom fields table: ${error instanceof Error ? error.message : "Unknown error"}`,
            details: error,
          }
        }
      } else if (error) {
        this.repairStatus.customFields = {
          success: false,
          message: `Error checking custom fields table: ${error.message}`,
          details: error,
        }
      } else {
        this.repairStatus.customFields = {
          success: true,
          message: "Custom fields table already exists",
        }
      }

      return this.repairStatus.customFields
    } catch (error) {
      this.repairStatus.customFields = {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      }
      return this.repairStatus.customFields
    }
  }

  // Setup RLS policies
  private async setupRlsPolicies(): Promise<RepairResult> {
    try {
      // We need service role for this
      if (!this.serviceClient) {
        this.repairStatus.rlsPolicies = {
          success: false,
          message: "Service role key not provided. Cannot set up RLS policies.",
        }
        return this.repairStatus.rlsPolicies
      }

      const rlsSQL = `
        -- Enable RLS on all tables
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
        ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
        ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
        ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
        ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
        ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
        ALTER TABLE account_changes ENABLE ROW LEVEL SECURITY;
        ALTER TABLE file_activities ENABLE ROW LEVEL SECURITY;
        ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
        ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;

        -- Profiles policies
        DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
        CREATE POLICY "Users can view their own profile" ON profiles
          FOR SELECT USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
        CREATE POLICY "Users can update their own profile" ON profiles
          FOR UPDATE USING (auth.uid() = id);

        -- Organizations policies
        DROP POLICY IF EXISTS "Organization members can view their organizations" ON organizations;
        CREATE POLICY "Organization members can view their organizations" ON organizations
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM organization_members
              WHERE organization_members.organization_id = organizations.id
              AND organization_members.user_id = auth.uid()
            )
          );

        -- Organization members policies
        DROP POLICY IF EXISTS "Users can view their own memberships" ON organization_members;
        CREATE POLICY "Users can view their own memberships" ON organization_members
          FOR SELECT USING (user_id = auth.uid());

        -- Projects policies
        DROP POLICY IF EXISTS "Users can view projects in their organizations" ON projects;
        CREATE POLICY "Users can view projects in their organizations" ON projects
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM organization_members
              WHERE organization_members.organization_id = projects.organization_id
              AND organization_members.user_id = auth.uid()
            )
          );

        -- Analyses policies
        DROP POLICY IF EXISTS "Users can view their own analyses" ON analyses;
        CREATE POLICY "Users can view their own analyses" ON analyses
          FOR SELECT USING (user_id = auth.uid());

        DROP POLICY IF EXISTS "Users can view analyses in their projects" ON analyses;
        CREATE POLICY "Users can view analyses in their projects" ON analyses
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM projects
              JOIN organization_members ON organization_members.organization_id = projects.organization_id
              WHERE projects.id = analyses.project_id
              AND organization_members.user_id = auth.uid()
            )
          );

        -- Insights policies
        DROP POLICY IF EXISTS "Users can view their own insights" ON insights;
        CREATE POLICY "Users can view their own insights" ON insights
          FOR SELECT USING (user_id = auth.uid());

        -- Subscriptions policies
        DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
        CREATE POLICY "Users can view their own subscriptions" ON subscriptions
          FOR SELECT USING (user_id = auth.uid());

        -- User activities policies
        DROP POLICY IF EXISTS "Users can view their own activities" ON user_activities;
        CREATE POLICY "Users can view their own activities" ON user_activities
          FOR SELECT USING (user_id = auth.uid());

        -- Account changes policies
        DROP POLICY IF EXISTS "Users can view their own account changes" ON account_changes;
        CREATE POLICY "Users can view their own account changes" ON account_changes
          FOR SELECT USING (user_id = auth.uid());

        -- File activities policies
        DROP POLICY IF EXISTS "Users can view their own file activities" ON file_activities;
        CREATE POLICY "Users can view their own file activities" ON file_activities
          FOR SELECT USING (user_id = auth.uid());

        -- File uploads policies
        DROP POLICY IF EXISTS "Users can view their own file uploads" ON file_uploads;
        CREATE POLICY "Users can view their own file uploads" ON file_uploads
          FOR SELECT USING (user_id = auth.uid());

        -- Custom fields policies
        DROP POLICY IF EXISTS "Users can view custom fields" ON custom_fields;
        CREATE POLICY "Users can view custom fields" ON custom_fields
          FOR SELECT USING (true);

        DROP POLICY IF EXISTS "Users can insert their own custom fields" ON custom_fields;
        CREATE POLICY "Users can insert their own custom fields" ON custom_fields
          FOR INSERT WITH CHECK (user_id = auth.uid());
      `

      try {
        // Try direct SQL first for RLS policies
        try {
          await this.serviceClient.sql(rlsSQL)
          this.repairStatus.rlsPolicies = {
            success: true,
            message: "RLS policies set up successfully",
          }
        } catch (directError) {
          // If direct SQL fails, try using rpc
          const { error: rpcError } = await this.serviceClient.rpc("exec_sql", { sql: rlsSQL })

          if (rpcError) {
            this.repairStatus.rlsPolicies = {
              success: false,
              message: `Failed to set up RLS policies: ${rpcError.message}`,
              details: { directError, rpcError },
            }
          } else {
            this.repairStatus.rlsPolicies = {
              success: true,
              message: "RLS policies set up successfully (via RPC)",
            }
          }
        }
      } catch (error) {
        this.repairStatus.rlsPolicies = {
          success: false,
          message: `Error setting up RLS policies: ${error instanceof Error ? error.message : "Unknown error"}`,
          details: error,
        }
      }

      return this.repairStatus.rlsPolicies
    } catch (error) {
      this.repairStatus.rlsPolicies = {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      }
      return this.repairStatus.rlsPolicies
    }
  }

  // Get repair status
  public getRepairStatus(): Record<string, RepairResult> {
    return this.repairStatus
  }

  // Check if connected
  public isConnected(): boolean {
    return this.isConnected
  }
}

// Create singleton instance
let supabaseAutoRepair: SupabaseAutoRepair | null = null

export function getSupabaseAutoRepair(): SupabaseAutoRepair {
  if (!supabaseAutoRepair) {
    supabaseAutoRepair = new SupabaseAutoRepair()
  }
  return supabaseAutoRepair
}
