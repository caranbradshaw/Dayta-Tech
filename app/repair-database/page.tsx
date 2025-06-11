"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, AlertTriangle, Wrench } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface RepairResult {
  name: string
  status: "success" | "error" | "warning" | "loading" | "pending"
  message: string
  details?: any
}

export default function RepairDatabasePage() {
  const [results, setResults] = useState<RepairResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const updateResult = (name: string, status: RepairResult["status"], message: string, details?: any) => {
    setResults((prev) => {
      const existing = prev.find((r) => r.name === name)
      const newResult = { name, status, message, details }

      if (existing) {
        return prev.map((r) => (r.name === name ? newResult : r))
      } else {
        return [...prev, newResult]
      }
    })
  }

  const runRepairs = async () => {
    setIsRunning(true)
    setResults([])

    // 1. Test Basic Connection
    updateResult("Connection Test", "loading", "Testing database connection...")

    try {
      const { data, error } = await supabase.from("profiles").select("count", { count: "exact", head: true })

      if (error) {
        updateResult("Connection Test", "error", `Connection failed: ${error.message}`, error)
        setIsRunning(false)
        return
      } else {
        updateResult("Connection Test", "success", "Database connection successful")
      }
    } catch (error: any) {
      updateResult("Connection Test", "error", `Connection error: ${error.message}`, error)
      setIsRunning(false)
      return
    }

    // 2. Check and Create Missing Tables
    updateResult("Table Creation", "loading", "Checking and creating missing tables...")

    const tables = [
      {
        name: "profiles",
        sql: `
          CREATE TABLE IF NOT EXISTS profiles (
            id UUID REFERENCES auth.users(id) PRIMARY KEY,
            name TEXT,
            email TEXT UNIQUE,
            company TEXT,
            industry TEXT,
            role TEXT,
            avatar_url TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `,
      },
      {
        name: "user_activities",
        sql: `
          CREATE TABLE IF NOT EXISTS user_activities (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id),
            activity_type TEXT NOT NULL,
            activity_description TEXT,
            metadata JSONB DEFAULT '{}',
            ip_address TEXT,
            user_agent TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `,
      },
    ]

    let tablesCreated = 0
    let tableErrors = 0

    for (const table of tables) {
      try {
        const { error } = await supabase.rpc("execute_sql", { sql_query: table.sql })

        if (error) {
          updateResult(`Create ${table.name}`, "error", `Failed to create ${table.name}: ${error.message}`, error)
          tableErrors++
        } else {
          updateResult(`Create ${table.name}`, "success", `Table ${table.name} created/verified`)
          tablesCreated++
        }
      } catch (error: any) {
        updateResult(`Create ${table.name}`, "error", `Error creating ${table.name}: ${error.message}`, error)
        tableErrors++
      }
    }

    if (tableErrors === 0) {
      updateResult("Table Creation", "success", `All ${tablesCreated} tables created/verified successfully`)
    } else {
      updateResult("Table Creation", "warning", `${tablesCreated} tables created, ${tableErrors} errors`)
    }

    // 3. Set up RLS Policies
    updateResult("RLS Policies", "loading", "Setting up Row Level Security policies...")

    const policies = [
      {
        name: "profiles_policy",
        sql: `
          DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
          CREATE POLICY "Users can view own profile" ON profiles
            FOR ALL USING (auth.uid() = id);
          
          ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        `,
      },
      {
        name: "activities_policy",
        sql: `
          DROP POLICY IF EXISTS "Users can view own activities" ON user_activities;
          CREATE POLICY "Users can view own activities" ON user_activities
            FOR ALL USING (auth.uid() = user_id);
          
          ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
        `,
      },
    ]

    let policiesCreated = 0
    let policyErrors = 0

    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc("execute_sql", { sql_query: policy.sql })

        if (error) {
          updateResult(`RLS ${policy.name}`, "error", `Failed to create policy ${policy.name}: ${error.message}`, error)
          policyErrors++
        } else {
          updateResult(`RLS ${policy.name}`, "success", `Policy ${policy.name} created successfully`)
          policiesCreated++
        }
      } catch (error: any) {
        updateResult(`RLS ${policy.name}`, "error", `Error creating policy ${policy.name}: ${error.message}`, error)
        policyErrors++
      }
    }

    if (policyErrors === 0) {
      updateResult("RLS Policies", "success", `All ${policiesCreated} RLS policies created successfully`)
    } else {
      updateResult("RLS Policies", "warning", `${policiesCreated} policies created, ${policyErrors} errors`)
    }

    // 4. Create Database Functions
    updateResult("Database Functions", "loading", "Creating required database functions...")

    const functions = [
      {
        name: "handle_new_user",
        sql: `
          CREATE OR REPLACE FUNCTION handle_new_user()
          RETURNS TRIGGER AS $$
          BEGIN
            INSERT INTO profiles (id, name, email, company, industry, role)
            VALUES (
              NEW.id,
              COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
              NEW.email,
              COALESCE(NEW.raw_user_meta_data->>'company', ''),
              COALESCE(NEW.raw_user_meta_data->>'industry', ''),
              COALESCE(NEW.raw_user_meta_data->>'role', '')
            );
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `,
      },
      {
        name: "user_trigger",
        sql: `
          DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
          CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION handle_new_user();
        `,
      },
    ]

    let functionsCreated = 0
    let functionErrors = 0

    for (const func of functions) {
      try {
        const { error } = await supabase.rpc("execute_sql", { sql_query: func.sql })

        if (error) {
          updateResult(
            `Function ${func.name}`,
            "error",
            `Failed to create function ${func.name}: ${error.message}`,
            error,
          )
          functionErrors++
        } else {
          updateResult(`Function ${func.name}`, "success", `Function ${func.name} created successfully`)
          functionsCreated++
        }
      } catch (error: any) {
        updateResult(`Function ${func.name}`, "error", `Error creating function ${func.name}: ${error.message}`, error)
        functionErrors++
      }
    }

    if (functionErrors === 0) {
      updateResult("Database Functions", "success", `All ${functionsCreated} functions created successfully`)
    } else {
      updateResult("Database Functions", "warning", `${functionsCreated} functions created, ${functionErrors} errors`)
    }

    // 5. Test User Registration
    updateResult("Registration Test", "loading", "Testing user registration flow...")

    try {
      const testEmail = `repair-test-${Date.now()}@example.com`
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: "testpassword123",
        options: {
          data: {
            full_name: "Repair Test User",
            company: "Test Company",
            industry: "technology",
            role: "developer",
          },
        },
      })

      if (error) {
        if (error.message.includes("User already registered")) {
          updateResult("Registration Test", "success", "Registration system is working (user already exists)")
        } else {
          updateResult("Registration Test", "error", `Registration failed: ${error.message}`, error)
        }
      } else {
        updateResult("Registration Test", "success", "Registration system is working correctly", {
          user: data.user?.email,
          needsConfirmation: !data.session,
        })

        // Clean up
        try {
          await supabase.auth.signOut()
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    } catch (error: any) {
      updateResult("Registration Test", "error", `Registration test failed: ${error.message}`, error)
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: RepairResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "loading":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case "pending":
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Wrench className="h-8 w-8" />
            Database Repair Tool
          </h1>
          <p className="text-gray-600">This tool will attempt to fix common database and authentication issues.</p>
        </div>

        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> This tool will make changes to your database structure. Make sure you have proper
            backups before proceeding.
          </AlertDescription>
        </Alert>

        <div className="mb-6">
          <Button onClick={runRepairs} disabled={isRunning} className="w-full sm:w-auto" size="lg">
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Repairs...
              </>
            ) : (
              <>
                <Wrench className="mr-2 h-4 w-4" />
                Start Database Repair
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  {result.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3">{result.message}</p>

                {result.details && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                      View Details
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {results.length > 0 && results.every((r) => r.status !== "loading") && (
          <div className="mt-8">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Repair Complete!</strong>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>
                    Visit{" "}
                    <a href="/debug-env" className="text-blue-600 underline">
                      /debug-env
                    </a>{" "}
                    to verify all systems are working
                  </li>
                  <li>Try registering a new user to test the complete flow</li>
                  <li>Check the signup and login pages for proper functionality</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  )
}
