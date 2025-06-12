import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  const setupResults = {
    timestamp: new Date().toISOString(),
    steps: {} as Record<string, { success: boolean; message: string; details?: any }>,
    overall: { success: false, message: "", completedSteps: 0, totalSteps: 8 },
  }

  try {
    console.log("🚀 Starting complete DaytaTech setup...")

    // Step 1: Check Environment Variables
    console.log("📋 Step 1: Checking environment variables...")
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      POSTGRES_URL: process.env.POSTGRES_URL,
    }

    const missingVars = Object.entries(envVars)
      .filter(([_, value]) => !value)
      .map(([key, _]) => key)

    if (missingVars.length > 0) {
      setupResults.steps.environment = {
        success: false,
        message: `Missing environment variables: ${missingVars.join(", ")}`,
        details: {
          missing: missingVars,
          present: Object.keys(envVars).filter((k) => envVars[k as keyof typeof envVars]),
        },
      }
    } else {
      setupResults.steps.environment = {
        success: true,
        message: "All required environment variables are set",
        details: { variables: Object.keys(envVars) },
      }
      setupResults.overall.completedSteps++
    }

    // Step 2: Test Supabase Connection
    console.log("🔗 Step 2: Testing Supabase connection...")
    if (!envVars.NEXT_PUBLIC_SUPABASE_URL || !envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setupResults.steps.connection = {
        success: false,
        message: "Cannot test connection without Supabase credentials",
      }
    } else {
      try {
        const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY)
        const { data, error } = await supabase.from("profiles").select("count").limit(1)

        if (error && error.code !== "42P01") {
          setupResults.steps.connection = {
            success: false,
            message: `Connection failed: ${error.message}`,
            details: error,
          }
        } else {
          setupResults.steps.connection = {
            success: true,
            message: "Successfully connected to Supabase",
            details: { status: "Connected", tablesExist: !error },
          }
          setupResults.overall.completedSteps++
        }
      } catch (connectionError) {
        setupResults.steps.connection = {
          success: false,
          message: `Connection error: ${connectionError instanceof Error ? connectionError.message : "Unknown error"}`,
          details: connectionError,
        }
      }
    }

    // Step 3: Enable Extensions
    console.log("🔧 Step 3: Enabling PostgreSQL extensions...")
    if (setupResults.steps.connection?.success && envVars.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const serviceClient = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL!, envVars.SUPABASE_SERVICE_ROLE_KEY)

        const extensionsSQL = `
          CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
          CREATE EXTENSION IF NOT EXISTS "pgcrypto";
        `

        // Try multiple methods to execute SQL
        let extensionsSuccess = false
        let extensionsMessage = ""

        try {
          const { error } = await serviceClient.rpc("exec_sql", { sql: extensionsSQL })
          if (!error) {
            extensionsSuccess = true
            extensionsMessage = "Extensions enabled via RPC"
          }
        } catch (rpcError) {
          console.log("RPC method failed, trying direct SQL...")
        }

        if (!extensionsSuccess) {
          try {
            await serviceClient.sql(extensionsSQL)
            extensionsSuccess = true
            extensionsMessage = "Extensions enabled via direct SQL"
          } catch (directError) {
            extensionsMessage = `Failed to enable extensions: ${directError instanceof Error ? directError.message : "Unknown error"}`
          }
        }

        setupResults.steps.extensions = {
          success: extensionsSuccess,
          message: extensionsMessage,
        }

        if (extensionsSuccess) setupResults.overall.completedSteps++
      } catch (error) {
        setupResults.steps.extensions = {
          success: false,
          message: `Error enabling extensions: ${error instanceof Error ? error.message : "Unknown error"}`,
          details: error,
        }
      }
    } else {
      setupResults.steps.extensions = {
        success: false,
        message: "Cannot enable extensions without service role key or connection",
      }
    }

    // Step 4: Create Core Tables
    console.log("📊 Step 4: Creating core tables...")
    if (setupResults.steps.connection?.success) {
      try {
        const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL!, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY)

        const coreTablesSQL = `
          -- Profiles table
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

          -- Organizations table
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

          -- Organization members table
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

          -- Projects table
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

          -- Analyses table
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

          -- Insights table
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

        let tablesSuccess = false
        let tablesMessage = ""

        // Try with service role first
        if (envVars.SUPABASE_SERVICE_ROLE_KEY) {
          try {
            const serviceClient = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL!, envVars.SUPABASE_SERVICE_ROLE_KEY)
            await serviceClient.sql(coreTablesSQL)
            tablesSuccess = true
            tablesMessage = "Core tables created successfully (service role)"
          } catch (serviceError) {
            console.log("Service role failed, trying RPC...")
            try {
              const { error } = await supabase.rpc("exec_sql", { sql: coreTablesSQL })
              if (!error) {
                tablesSuccess = true
                tablesMessage = "Core tables created successfully (RPC)"
              }
            } catch (rpcError) {
              tablesMessage = `Failed to create core tables: ${serviceError instanceof Error ? serviceError.message : "Unknown error"}`
            }
          }
        } else {
          try {
            const { error } = await supabase.rpc("exec_sql", { sql: coreTablesSQL })
            if (!error) {
              tablesSuccess = true
              tablesMessage = "Core tables created successfully (RPC)"
            } else {
              tablesMessage = `Failed to create core tables: ${error.message}`
            }
          } catch (rpcError) {
            tablesMessage = `Failed to create core tables: ${rpcError instanceof Error ? rpcError.message : "Unknown error"}`
          }
        }

        setupResults.steps.coreTables = {
          success: tablesSuccess,
          message: tablesMessage,
        }

        if (tablesSuccess) setupResults.overall.completedSteps++
      } catch (error) {
        setupResults.steps.coreTables = {
          success: false,
          message: `Error creating core tables: ${error instanceof Error ? error.message : "Unknown error"}`,
          details: error,
        }
      }
    } else {
      setupResults.steps.coreTables = {
        success: false,
        message: "Cannot create tables without database connection",
      }
    }

    // Step 5: Create Activity Tables
    console.log("📈 Step 5: Creating activity tables...")
    if (setupResults.steps.connection?.success) {
      try {
        const activityTablesSQL = `
          -- User activities table
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

          -- Account changes table
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

          -- File activities table
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

          -- File uploads table
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

          -- Subscriptions table
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

          -- Custom fields table
          CREATE TABLE IF NOT EXISTS custom_fields (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            field_type TEXT NOT NULL,
            field_value TEXT NOT NULL,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(field_type, field_value)
          );
        `

        let activitySuccess = false
        let activityMessage = ""

        const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL!, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY)

        // Try with service role first
        if (envVars.SUPABASE_SERVICE_ROLE_KEY) {
          try {
            const serviceClient = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL!, envVars.SUPABASE_SERVICE_ROLE_KEY)
            await serviceClient.sql(activityTablesSQL)
            activitySuccess = true
            activityMessage = "Activity tables created successfully (service role)"
          } catch (serviceError) {
            try {
              const { error } = await supabase.rpc("exec_sql", { sql: activityTablesSQL })
              if (!error) {
                activitySuccess = true
                activityMessage = "Activity tables created successfully (RPC)"
              }
            } catch (rpcError) {
              activityMessage = `Failed to create activity tables: ${serviceError instanceof Error ? serviceError.message : "Unknown error"}`
            }
          }
        } else {
          try {
            const { error } = await supabase.rpc("exec_sql", { sql: activityTablesSQL })
            if (!error) {
              activitySuccess = true
              activityMessage = "Activity tables created successfully (RPC)"
            } else {
              activityMessage = `Failed to create activity tables: ${error.message}`
            }
          } catch (rpcError) {
            activityMessage = `Failed to create activity tables: ${rpcError instanceof Error ? rpcError.message : "Unknown error"}`
          }
        }

        setupResults.steps.activityTables = {
          success: activitySuccess,
          message: activityMessage,
        }

        if (activitySuccess) setupResults.overall.completedSteps++
      } catch (error) {
        setupResults.steps.activityTables = {
          success: false,
          message: `Error creating activity tables: ${error instanceof Error ? error.message : "Unknown error"}`,
          details: error,
        }
      }
    } else {
      setupResults.steps.activityTables = {
        success: false,
        message: "Cannot create activity tables without database connection",
      }
    }

    // Step 6: Create Analytics Tables
    console.log("📊 Step 6: Creating analytics tables...")
    if (setupResults.steps.connection?.success) {
      try {
        const analyticsTablesSQL = `
          -- Analytics events table
          CREATE TABLE IF NOT EXISTS analytics_events (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            session_id TEXT,
            event_type TEXT NOT NULL,
            event_name TEXT NOT NULL,
            properties JSONB,
            page_url TEXT,
            referrer TEXT,
            user_agent TEXT,
            ip_address TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Analytics sessions table
          CREATE TABLE IF NOT EXISTS analytics_sessions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            session_id TEXT UNIQUE NOT NULL,
            user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            ended_at TIMESTAMP WITH TIME ZONE,
            duration_seconds INTEGER,
            page_views INTEGER DEFAULT 0,
            events_count INTEGER DEFAULT 0,
            referrer TEXT,
            landing_page TEXT,
            exit_page TEXT,
            user_agent TEXT,
            ip_address TEXT,
            country TEXT,
            city TEXT,
            device_type TEXT,
            browser TEXT,
            os TEXT
          );

          -- Analytics page views table
          CREATE TABLE IF NOT EXISTS analytics_page_views (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            session_id TEXT,
            user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            page_url TEXT NOT NULL,
            page_title TEXT,
            referrer TEXT,
            duration_seconds INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Business events table
          CREATE TABLE IF NOT EXISTS business_events (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            event_type TEXT NOT NULL,
            event_data JSONB,
            revenue_amount DECIMAL(10,2),
            currency TEXT DEFAULT 'USD',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `

        let analyticsSuccess = false
        let analyticsMessage = ""

        const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL!, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY)

        // Try with service role first
        if (envVars.SUPABASE_SERVICE_ROLE_KEY) {
          try {
            const serviceClient = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL!, envVars.SUPABASE_SERVICE_ROLE_KEY)
            await serviceClient.sql(analyticsTablesSQL)
            analyticsSuccess = true
            analyticsMessage = "Analytics tables created successfully (service role)"
          } catch (serviceError) {
            try {
              const { error } = await supabase.rpc("exec_sql", { sql: analyticsTablesSQL })
              if (!error) {
                analyticsSuccess = true
                analyticsMessage = "Analytics tables created successfully (RPC)"
              }
            } catch (rpcError) {
              analyticsMessage = `Failed to create analytics tables: ${serviceError instanceof Error ? serviceError.message : "Unknown error"}`
            }
          }
        } else {
          try {
            const { error } = await supabase.rpc("exec_sql", { sql: analyticsTablesSQL })
            if (!error) {
              analyticsSuccess = true
              analyticsMessage = "Analytics tables created successfully (RPC)"
            } else {
              analyticsMessage = `Failed to create analytics tables: ${error.message}`
            }
          } catch (rpcError) {
            analyticsMessage = `Failed to create analytics tables: ${rpcError instanceof Error ? rpcError.message : "Unknown error"}`
          }
        }

        setupResults.steps.analyticsTables = {
          success: analyticsSuccess,
          message: analyticsMessage,
        }

        if (analyticsSuccess) setupResults.overall.completedSteps++
      } catch (error) {
        setupResults.steps.analyticsTables = {
          success: false,
          message: `Error creating analytics tables: ${error instanceof Error ? error.message : "Unknown error"}`,
          details: error,
        }
      }
    } else {
      setupResults.steps.analyticsTables = {
        success: false,
        message: "Cannot create analytics tables without database connection",
      }
    }

    // Step 7: Enable Row Level Security
    console.log("🔒 Step 7: Enabling Row Level Security...")
    if (setupResults.steps.connection?.success && envVars.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const serviceClient = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL!, envVars.SUPABASE_SERVICE_ROLE_KEY)

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
          ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
          ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
          ALTER TABLE analytics_page_views ENABLE ROW LEVEL SECURITY;
          ALTER TABLE business_events ENABLE ROW LEVEL SECURITY;

          -- Basic policies for user data
          DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
          CREATE POLICY "Users can view their own profile" ON profiles
            FOR SELECT USING (auth.uid() = id);

          DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
          CREATE POLICY "Users can update their own profile" ON profiles
            FOR UPDATE USING (auth.uid() = id);

          DROP POLICY IF EXISTS "Users can view their own analyses" ON analyses;
          CREATE POLICY "Users can view their own analyses" ON analyses
            FOR SELECT USING (user_id = auth.uid());

          DROP POLICY IF EXISTS "Users can insert their own analyses" ON analyses;
          CREATE POLICY "Users can insert their own analyses" ON analyses
            FOR INSERT WITH CHECK (user_id = auth.uid());

          DROP POLICY IF EXISTS "Users can view their own activities" ON user_activities;
          CREATE POLICY "Users can view their own activities" ON user_activities
            FOR SELECT USING (user_id = auth.uid());

          DROP POLICY IF EXISTS "Users can insert their own activities" ON user_activities;
          CREATE POLICY "Users can insert their own activities" ON user_activities
            FOR INSERT WITH CHECK (user_id = auth.uid());
        `

        let rlsSuccess = false
        let rlsMessage = ""

        try {
          await serviceClient.sql(rlsSQL)
          rlsSuccess = true
          rlsMessage = "Row Level Security enabled successfully"
        } catch (rlsError) {
          rlsMessage = `Failed to enable RLS: ${rlsError instanceof Error ? rlsError.message : "Unknown error"}`
        }

        setupResults.steps.rowLevelSecurity = {
          success: rlsSuccess,
          message: rlsMessage,
        }

        if (rlsSuccess) setupResults.overall.completedSteps++
      } catch (error) {
        setupResults.steps.rowLevelSecurity = {
          success: false,
          message: `Error enabling RLS: ${error instanceof Error ? error.message : "Unknown error"}`,
          details: error,
        }
      }
    } else {
      setupResults.steps.rowLevelSecurity = {
        success: false,
        message: "Cannot enable RLS without service role key",
      }
    }

    // Step 8: Verify Setup
    console.log("✅ Step 8: Verifying setup...")
    if (setupResults.steps.connection?.success) {
      try {
        const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL!, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY)

        const tablesToCheck = [
          "profiles",
          "organizations",
          "projects",
          "analyses",
          "insights",
          "user_activities",
          "analytics_events",
        ]

        const tableResults = {}
        let tablesFound = 0

        for (const tableName of tablesToCheck) {
          try {
            const { data, error } = await supabase.from(tableName).select("count").limit(1)
            if (!error || error.code !== "42P01") {
              tableResults[tableName] = true
              tablesFound++
            } else {
              tableResults[tableName] = false
            }
          } catch {
            tableResults[tableName] = false
          }
        }

        const verificationSuccess = tablesFound >= 5 // At least 5 core tables should exist
        setupResults.steps.verification = {
          success: verificationSuccess,
          message: `Setup verification: ${tablesFound}/${tablesToCheck.length} tables found`,
          details: { tables: tableResults, tablesFound, totalTables: tablesToCheck.length },
        }

        if (verificationSuccess) setupResults.overall.completedSteps++
      } catch (error) {
        setupResults.steps.verification = {
          success: false,
          message: `Error verifying setup: ${error instanceof Error ? error.message : "Unknown error"}`,
          details: error,
        }
      }
    } else {
      setupResults.steps.verification = {
        success: false,
        message: "Cannot verify setup without database connection",
      }
    }

    // Calculate overall success
    setupResults.overall.success = setupResults.overall.completedSteps >= 6 // At least 6 out of 8 steps
    setupResults.overall.message = setupResults.overall.success
      ? `Setup completed successfully! ${setupResults.overall.completedSteps}/${setupResults.overall.totalSteps} steps completed.`
      : `Setup completed with issues. ${setupResults.overall.completedSteps}/${setupResults.overall.totalSteps} steps completed.`

    console.log(`✅ Complete setup finished: ${setupResults.overall.message}`)

    return NextResponse.json(setupResults)
  } catch (error) {
    console.error("❌ Complete setup failed:", error)

    return NextResponse.json(
      {
        ...setupResults,
        overall: {
          success: false,
          message: `Setup failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          completedSteps: setupResults.overall.completedSteps,
          totalSteps: setupResults.overall.totalSteps,
        },
        error: {
          message: error instanceof Error ? error.message : "Unknown error",
          details: error,
        },
      },
      { status: 500 },
    )
  }
}
