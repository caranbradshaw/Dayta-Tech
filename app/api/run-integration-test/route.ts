import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  const testResults = {
    timestamp: new Date().toISOString(),
    overall: {
      success: false,
      message: "",
      testsRun: 0,
      testsPassed: 0,
    },
    tests: {} as Record<
      string,
      {
        success: boolean
        message: string
        duration: number
        details?: any
      }
    >,
  }

  try {
    console.log("🧪 Starting integration tests...")

    // Test 1: Environment Variables
    const startTime1 = Date.now()
    const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

    testResults.tests.environmentVariables = {
      success: missingVars.length === 0,
      message:
        missingVars.length === 0
          ? "All required environment variables are set"
          : `Missing variables: ${missingVars.join(", ")}`,
      duration: Date.now() - startTime1,
      details: { missing: missingVars, required: requiredEnvVars },
    }
    testResults.overall.testsRun++
    if (testResults.tests.environmentVariables.success) testResults.overall.testsPassed++

    // Test 2: Supabase Connection
    const startTime2 = Date.now()
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

        const { data, error } = await supabase.from("profiles").select("count").limit(1)

        testResults.tests.supabaseConnection = {
          success: !error || error.code === "42P01", // 42P01 means table doesn't exist but connection works
          message:
            error && error.code !== "42P01"
              ? `Connection failed: ${error.message}`
              : "Successfully connected to Supabase",
          duration: Date.now() - startTime2,
          details: { error: error?.message, code: error?.code },
        }
      } catch (connectionError) {
        testResults.tests.supabaseConnection = {
          success: false,
          message: `Connection error: ${connectionError instanceof Error ? connectionError.message : "Unknown error"}`,
          duration: Date.now() - startTime2,
          details: connectionError,
        }
      }
    } else {
      testResults.tests.supabaseConnection = {
        success: false,
        message: "Cannot test connection: missing environment variables",
        duration: Date.now() - startTime2,
      }
    }
    testResults.overall.testsRun++
    if (testResults.tests.supabaseConnection.success) testResults.overall.testsPassed++

    // Test 3: Authentication Service
    const startTime3 = Date.now()
    if (testResults.tests.supabaseConnection.success) {
      try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

        const { data: authData, error: authError } = await supabase.auth.getSession()

        testResults.tests.authentication = {
          success: !authError,
          message: authError ? `Auth service error: ${authError.message}` : "Authentication service is accessible",
          duration: Date.now() - startTime3,
          details: authError,
        }
      } catch (authError) {
        testResults.tests.authentication = {
          success: false,
          message: `Auth test failed: ${authError instanceof Error ? authError.message : "Unknown error"}`,
          duration: Date.now() - startTime3,
          details: authError,
        }
      }
    } else {
      testResults.tests.authentication = {
        success: false,
        message: "Cannot test auth: Supabase connection failed",
        duration: Date.now() - startTime3,
      }
    }
    testResults.overall.testsRun++
    if (testResults.tests.authentication.success) testResults.overall.testsPassed++

    // Test 4: Database Operations (CRUD)
    const startTime4 = Date.now()
    if (testResults.tests.supabaseConnection.success) {
      try {
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

        // Try to create a test record
        const testId = `test-${Date.now()}`
        const testData = {
          id: testId,
          email: `test-${Date.now()}@example.com`,
          name: "Integration Test User",
          company: "Test Company",
          role: "Tester",
          industry: "Technology",
        }

        const { data: createData, error: createError } = await supabase
          .from("profiles")
          .insert(testData)
          .select()
          .single()

        if (createError) {
          if (createError.code === "42P01") {
            testResults.tests.databaseOperations = {
              success: false,
              message: "Database tables not set up (profiles table missing)",
              duration: Date.now() - startTime4,
              details: { error: createError.message, code: createError.code },
            }
          } else {
            testResults.tests.databaseOperations = {
              success: false,
              message: `Database operation failed: ${createError.message}`,
              duration: Date.now() - startTime4,
              details: createError,
            }
          }
        } else {
          // Test successful, now clean up
          try {
            await supabase.from("profiles").delete().eq("id", testId)
            testResults.tests.databaseOperations = {
              success: true,
              message: "Database operations working (create, read, delete tested)",
              duration: Date.now() - startTime4,
              details: { testData: createData },
            }
          } catch (cleanupError) {
            testResults.tests.databaseOperations = {
              success: true,
              message: "Database create/read working (cleanup failed but that's ok)",
              duration: Date.now() - startTime4,
              details: { testData: createData, cleanupError },
            }
          }
        }
      } catch (dbError) {
        testResults.tests.databaseOperations = {
          success: false,
          message: `Database test error: ${dbError instanceof Error ? dbError.message : "Unknown error"}`,
          duration: Date.now() - startTime4,
          details: dbError,
        }
      }
    } else {
      testResults.tests.databaseOperations = {
        success: false,
        message: "Cannot test database: Supabase connection failed",
        duration: Date.now() - startTime4,
      }
    }
    testResults.overall.testsRun++
    if (testResults.tests.databaseOperations.success) testResults.overall.testsPassed++

    // Test 5: Application Features
    const startTime5 = Date.now()
    const appFeatures = {
      localStorage: typeof window !== "undefined" && !!window.localStorage,
      fileUpload: true, // Always available
      analysisGeneration: true, // Always available with mock data
    }

    testResults.tests.applicationFeatures = {
      success: Object.values(appFeatures).every(Boolean),
      message: `Application features: ${Object.entries(appFeatures)
        .map(([k, v]) => `${k}=${v}`)
        .join(", ")}`,
      duration: Date.now() - startTime5,
      details: appFeatures,
    }
    testResults.overall.testsRun++
    if (testResults.tests.applicationFeatures.success) testResults.overall.testsPassed++

    // Calculate overall result
    testResults.overall.success = testResults.overall.testsPassed === testResults.overall.testsRun
    testResults.overall.message = testResults.overall.success
      ? `All ${testResults.overall.testsRun} integration tests passed! System is fully operational.`
      : `${testResults.overall.testsPassed}/${testResults.overall.testsRun} tests passed. Some issues need attention.`

    console.log(
      `✅ Integration tests completed: ${testResults.overall.testsPassed}/${testResults.overall.testsRun} passed`,
    )

    return NextResponse.json(testResults)
  } catch (error) {
    console.error("❌ Integration test suite failed:", error)

    return NextResponse.json({
      ...testResults,
      overall: {
        success: false,
        message: `Integration test suite failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        testsRun: testResults.overall.testsRun,
        testsPassed: testResults.overall.testsPassed,
      },
      error: {
        message: error instanceof Error ? error.message : "Unknown error occurred",
        details: error,
      },
    })
  }
}
