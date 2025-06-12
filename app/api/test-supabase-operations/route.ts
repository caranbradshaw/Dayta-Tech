import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        message: "Missing Supabase credentials",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const testResults: Record<string, any> = {}

    // Test 1: Create a test profile
    try {
      const testUserId = `test-${Date.now()}`
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: testUserId,
          email: `test-${Date.now()}@example.com`,
          name: "Test User",
          company: "Test Company",
          role: "Test Role",
          industry: "Technology",
        })
        .select()
        .single()

      if (profileError) {
        testResults.createProfile = {
          success: false,
          message: `Failed to create profile: ${profileError.message}`,
          error: profileError,
        }
      } else {
        testResults.createProfile = {
          success: true,
          message: "Successfully created test profile",
          data: profileData,
        }

        // Test 2: Read the profile back
        try {
          const { data: readData, error: readError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", testUserId)
            .single()

          if (readError) {
            testResults.readProfile = {
              success: false,
              message: `Failed to read profile: ${readError.message}`,
              error: readError,
            }
          } else {
            testResults.readProfile = {
              success: true,
              message: "Successfully read test profile",
              data: readData,
            }
          }
        } catch (readError) {
          testResults.readProfile = {
            success: false,
            message: `Error reading profile: ${readError instanceof Error ? readError.message : "Unknown error"}`,
            error: readError,
          }
        }

        // Test 3: Update the profile
        try {
          const { data: updateData, error: updateError } = await supabase
            .from("profiles")
            .update({ name: "Updated Test User" })
            .eq("id", testUserId)
            .select()
            .single()

          if (updateError) {
            testResults.updateProfile = {
              success: false,
              message: `Failed to update profile: ${updateError.message}`,
              error: updateError,
            }
          } else {
            testResults.updateProfile = {
              success: true,
              message: "Successfully updated test profile",
              data: updateData,
            }
          }
        } catch (updateError) {
          testResults.updateProfile = {
            success: false,
            message: `Error updating profile: ${updateError instanceof Error ? updateError.message : "Unknown error"}`,
            error: updateError,
          }
        }

        // Test 4: Delete the test profile
        try {
          const { error: deleteError } = await supabase.from("profiles").delete().eq("id", testUserId)

          if (deleteError) {
            testResults.deleteProfile = {
              success: false,
              message: `Failed to delete profile: ${deleteError.message}`,
              error: deleteError,
            }
          } else {
            testResults.deleteProfile = {
              success: true,
              message: "Successfully deleted test profile",
            }
          }
        } catch (deleteError) {
          testResults.deleteProfile = {
            success: false,
            message: `Error deleting profile: ${deleteError instanceof Error ? deleteError.message : "Unknown error"}`,
            error: deleteError,
          }
        }
      }
    } catch (profileError) {
      testResults.createProfile = {
        success: false,
        message: `Error creating profile: ${profileError instanceof Error ? profileError.message : "Unknown error"}`,
        error: profileError,
      }
    }

    // Test 5: Test authentication
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession()
      testResults.authentication = {
        success: !authError,
        message: authError ? `Auth error: ${authError.message}` : "Authentication service is accessible",
        data: authError ? null : "Auth service working",
      }
    } catch (authError) {
      testResults.authentication = {
        success: false,
        message: `Auth test error: ${authError instanceof Error ? authError.message : "Unknown error"}`,
        error: authError,
      }
    }

    // Calculate overall success
    const successfulTests = Object.values(testResults).filter((result: any) => result.success).length
    const totalTests = Object.keys(testResults).length
    const overallSuccess = successfulTests === totalTests

    return NextResponse.json({
      success: overallSuccess,
      message: `Supabase operations test completed. ${successfulTests}/${totalTests} tests passed.`,
      summary: {
        totalTests,
        successfulTests,
        failedTests: totalTests - successfulTests,
        overallSuccess,
      },
      testResults,
    })
  } catch (error) {
    console.error("Error in Supabase operations test:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        error,
      },
      { status: 500 },
    )
  }
}
