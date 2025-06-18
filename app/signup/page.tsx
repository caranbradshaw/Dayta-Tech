"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { signUp } from "@/lib/auth-utils"
import { Eye, EyeOff, Loader2, Brain, Database, BarChart3, TrendingUp, Users, Zap } from "lucide-react"
import Link from "next/link"

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  company: z.string().optional(),
  industry: z.string().min(1, "Please select an industry"),
  role: z.string().min(1, "Please select what type of insights you want"),
})

const industries = [
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance & Banking" },
  { value: "healthcare", label: "Healthcare" },
  { value: "retail", label: "Retail & E-commerce" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "education", label: "Education" },
  { value: "consulting", label: "Consulting" },
  { value: "real-estate", label: "Real Estate" },
  { value: "media", label: "Media & Entertainment" },
  { value: "transportation", label: "Transportation & Logistics" },
  { value: "energy", label: "Energy & Utilities" },
  { value: "government", label: "Government & Public Sector" },
  { value: "nonprofit", label: "Non-profit" },
  { value: "agriculture", label: "Agriculture" },
  { value: "other", label: "Other" },
]

// Updated roles focused on the type of insights they want
const insightRoles = [
  {
    value: "data-scientist",
    label: "Data Scientist Insights",
    description: "Advanced statistical analysis, ML patterns, predictive modeling",
    icon: Brain,
  },
  {
    value: "data-engineer",
    label: "Data Engineer Insights",
    description: "Data quality, pipeline optimization, schema analysis",
    icon: Database,
  },
  {
    value: "business-analyst",
    label: "Business Analyst Insights",
    description: "KPI tracking, performance metrics, business intelligence",
    icon: BarChart3,
  },
  {
    value: "marketing-analyst",
    label: "Marketing Analyst Insights",
    description: "Customer segmentation, campaign performance, conversion analysis",
    icon: TrendingUp,
  },
  {
    value: "operations-analyst",
    label: "Operations Analyst Insights",
    description: "Process optimization, efficiency metrics, operational KPIs",
    icon: Users,
  },
  {
    value: "general-insights",
    label: "General Business Insights",
    description: "Overall trends, summaries, and actionable recommendations",
    icon: Zap,
  },
]

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      company: "",
      industry: "",
      role: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const result = await signUp({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        company: values.company,
        industry: values.industry,
        role: values.role, // This is now the insight type they want
      })

      if (result.success) {
        toast({
          title: "Account created successfully!",
          description: result.message || "Please check your email to verify your account.",
        })

        // Redirect to verification page
        router.push("/verify-email")
      } else {
        toast({
          title: "Sign up failed",
          description: result.error || "Please try again with different credentials.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Signup error:", error)
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedRole = insightRoles.find((role) => role.value === form.watch("role"))

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-lg w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Join DaytaTech</h1>
            <p className="text-gray-600 mt-2">Get AI-powered insights tailored to your needs</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="john@company.com" {...field} type="email" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Create a strong password"
                          {...field}
                          type={showPassword ? "text" : "password"}
                          disabled={isLoading}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Your company name" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry.value} value={industry.value}>
                            {industry.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What type of insights do you want?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose your insight preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {insightRoles.map((role) => {
                          const IconComponent = role.icon
                          return (
                            <SelectItem key={role.value} value={role.value}>
                              <div className="flex items-center space-x-2">
                                <IconComponent className="h-4 w-4" />
                                <span>{role.label}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    {selectedRole && <p className="text-sm text-gray-600 mt-1">{selectedRole.description}</p>}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preview of selected insight type */}
              {selectedRole && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <selectedRole.icon className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Your AI will focus on:</h4>
                  </div>
                  <p className="text-sm text-blue-800">{selectedRole.description}</p>
                </div>
              )}

              <Button disabled={isLoading} className="w-full h-11 text-base font-medium" type="submit">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account & Start Free Trial"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in
              </Link>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>✨ 30-day free trial • No credit card required</p>
            <p>You can customize your goals and preferences after signup</p>
          </div>
        </div>
      </div>
    </div>
  )
}
