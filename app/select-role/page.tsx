"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Database, BarChart3, CheckCircle } from "lucide-react"
import { useAuth } from "@/components/auth-context"

const roles = [
  {
    id: "Data Scientist",
    title: "Data Scientist",
    description: "I analyze data to find insights and build predictive models",
    icon: BarChart3,
    features: [
      "Statistical analysis and modeling",
      "Predictive analytics insights",
      "Data visualization recommendations",
      "Machine learning model suggestions",
      "Business impact analysis",
    ],
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
  {
    id: "Data Engineer",
    title: "Data Engineer",
    description: "I build and maintain data pipelines and infrastructure",
    icon: Database,
    features: [
      "Data quality assessment",
      "Pipeline optimization suggestions",
      "Schema analysis and recommendations",
      "Performance bottleneck identification",
      "Data architecture insights",
    ],
    color: "bg-green-50 border-green-200 hover:bg-green-100",
  },
]

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()
  const { user, profile, refreshProfile } = useAuth()

  useEffect(() => {
    // Check if user is authenticated
    if (!user && !isCheckingAuth) {
      router.push("/login")
      return
    }

    // If user already has analysis_type set, redirect to dashboard
    if (profile?.analysis_type) {
      router.push("/dashboard")
      return
    }

    setIsCheckingAuth(false)
  }, [user, profile, router, isCheckingAuth])

  const handleSave = async () => {
    if (!selectedRole) {
      toast({
        title: "Please select a role",
        description: "Choose the role that best describes your work.",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to continue.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          analysis_type: selectedRole,
          role: selectedRole.toLowerCase().replace(" ", "-"),
        })
        .eq("id", user.id)

      if (error) {
        throw error
      }

      // Refresh the profile to get updated data
      await refreshProfile()

      toast({
        title: "Role selected successfully!",
        description: `Welcome ${selectedRole}! Let's get you started.`,
      })

      // Redirect to dashboard or onboarding
      router.push("/dashboard")
    } catch (error) {
      console.error("Error updating role:", error)
      toast({
        title: "Failed to save role",
        description: "Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Role</h1>
          <p className="text-gray-600 text-lg">Help us customize your DaytaTech experience</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {roles.map((role) => {
            const Icon = role.icon
            const isSelected = selectedRole === role.id

            return (
              <Card
                key={role.id}
                className={`cursor-pointer transition-all duration-200 ${role.color} ${
                  isSelected ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${isSelected ? "bg-blue-500 text-white" : "bg-white"}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{role.title}</CardTitle>
                        <CardDescription className="text-sm mt-1">{role.description}</CardDescription>
                      </div>
                    </div>
                    {isSelected && <CheckCircle className="h-6 w-6 text-blue-500" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 mb-3">You'll get specialized insights for:</p>
                    <ul className="space-y-2">
                      {role.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center">
          <Button
            onClick={handleSave}
            disabled={!selectedRole || isLoading}
            className="px-8 py-3 text-lg font-medium"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Setting up your account...
              </>
            ) : (
              "Continue to Dashboard"
            )}
          </Button>

          {selectedRole && (
            <p className="text-sm text-gray-600 mt-3">
              Selected: <Badge variant="secondary">{selectedRole}</Badge>
            </p>
          )}
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">Don't worry, you can change this later in your settings</p>
        </div>
      </div>
    </div>
  )
}
