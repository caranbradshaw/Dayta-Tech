"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, User, TrendingUp, BarChart3, Users } from "lucide-react"
import { useAuth } from "@/components/auth-context"

const roles = [
  {
    id: "business_analyst",
    title: "Business Analyst",
    description: "I analyze business data to identify trends and opportunities",
    icon: TrendingUp,
    analysisType: "business_insights",
  },
  {
    id: "data_analyst",
    title: "Data Analyst",
    description: "I work with data to create reports and visualizations",
    icon: BarChart3,
    analysisType: "technical_analysis",
  },
  {
    id: "executive",
    title: "Executive/Manager",
    description: "I need high-level insights for strategic decision making",
    icon: Users,
    analysisType: "executive_summary",
  },
  {
    id: "other",
    title: "Other",
    description: "I have different needs or wear multiple hats",
    icon: User,
    analysisType: "comprehensive",
  },
]

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { user, loading } = useAuth()
  const supabase = createClientComponentClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if not logged in
  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/login")
    }
  }, [user, loading, mounted, router])

  const handleSubmit = async () => {
    if (!selectedRole || !user) return

    setIsLoading(true)

    try {
      const role = roles.find((r) => r.id === selectedRole)
      if (!role) return

      // Update user profile with selected role and analysis type
      const { error } = await supabase
        .from("profiles")
        .update({
          role: role.title,
          analysis_type: role.analysisType,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        console.error("Error updating profile:", error)
        toast({
          title: "Error",
          description: "Failed to save your preferences. Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Preferences saved!",
        description: "Your account is now set up. Let's start analyzing your data!",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving role:", error)
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Tell us about your role</h1>
          <p className="text-gray-600 text-lg">This helps us customize the analysis and insights to match your needs</p>
        </div>

        <Card className="bg-white shadow-xl">
          <CardHeader>
            <CardTitle>What best describes your role?</CardTitle>
            <CardDescription>Select the option that most closely matches how you'll use DaytaTech</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedRole} onValueChange={setSelectedRole} className="space-y-4">
              {roles.map((role) => {
                const Icon = role.icon
                return (
                  <div key={role.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={role.id} id={role.id} />
                    <div className="flex items-center space-x-3 flex-1">
                      <Icon className="h-6 w-6 text-blue-600" />
                      <div>
                        <Label htmlFor={role.id} className="text-base font-medium cursor-pointer">
                          {role.title}
                        </Label>
                        <p className="text-sm text-gray-500">{role.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </RadioGroup>

            <div className="mt-8 flex justify-center">
              <Button onClick={handleSubmit} disabled={!selectedRole || isLoading} size="lg" className="px-8">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Continue to Dashboard"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
