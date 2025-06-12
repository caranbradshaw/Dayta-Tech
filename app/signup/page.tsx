"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    industry: "",
    company: "",
    role: "",
    region: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong">("weak")
  const [emailWarnings, setEmailWarnings] = useState<string[]>([])

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Retail",
    "Manufacturing",
    "Education",
    "Real Estate",
    "Agriculture",
    "Oil & Gas",
    "Telecommunications",
    "Banking",
    "Insurance",
    "Consulting",
    "Government",
    "Non-Profit",
    "Other",
  ]

  const roles = [
    { value: "business-analyst", label: "Business Analyst" },
    { value: "data-scientist", label: "Data Scientist" },
    { value: "data-engineer", label: "Data Engineer" },
    { value: "admin", label: "Administrator" },
  ]

  const regions = [
    { value: "nigeria", label: "🇳🇬 Nigeria", description: "Optimized for Nigerian businesses" },
    { value: "america", label: "🇺🇸 United States", description: "US-based support and features" },
    { value: "global", label: "🌍 Global", description: "International support" },
  ]

  const validatePassword = (password: string) => {
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const isLongEnough = password.length >= 8

    if (isLongEnough && hasUpper && hasLower && hasNumber && hasSpecial) {
      if (password.length >= 12) {
        setPasswordStrength("strong")
      } else {
        setPasswordStrength("medium")
      }
    } else {
      setPasswordStrength("weak")
    }
  }

  const validateEmail = (email: string) => {
    const warnings: string[] = []
    const domain = email.split("@")[1]?.toLowerCase()

    if (domain) {
      const personalDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]
      if (personalDomains.includes(domain)) {
        warnings.push("Consider using a corporate email for better account management")
      }

      const blockedDomains = ["tempmail.com", "10minutemail.com", "guerrillamail.com"]
      if (blockedDomains.some((blocked) => domain.includes(blocked))) {
        warnings.push("Temporary email addresses are not allowed")
      }
    }

    setEmailWarnings(warnings)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (field === "password") {
      validatePassword(value)
    }

    if (field === "email") {
      validateEmail(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (passwordStrength === "weak") {
      setError("Please choose a stronger password")
      setLoading(false)
      return
    }

    if (emailWarnings.some((w) => w.includes("not allowed"))) {
      setError("Please use a valid email address")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(
          "Account created successfully! Please check your email to verify your account and activate your 30-day PRO trial.",
        )
        setTimeout(() => {
          router.push("/login?message=Please verify your email to complete signup")
        }, 3000)
      } else {
        setError(result.error || "Failed to create account")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-600">Start Your 30-Day PRO Trial</CardTitle>
          <CardDescription className="text-lg">
            Get full access to all PRO features - completely free for 30 days!
          </CardDescription>

          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Unlimited Uploads
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Advanced AI Insights
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              All File Formats
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Priority Support
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  placeholder="your@email.com"
                />
                {emailWarnings.map((warning, index) => (
                  <p key={index} className="text-sm text-amber-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {warning}
                  </p>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  placeholder="Create a strong password"
                />
                <div className="flex items-center space-x-2">
                  <div
                    className={`h-2 w-full rounded ${
                      passwordStrength === "weak"
                        ? "bg-red-200"
                        : passwordStrength === "medium"
                          ? "bg-yellow-200"
                          : "bg-green-200"
                    }`}
                  >
                    <div
                      className={`h-full rounded transition-all ${
                        passwordStrength === "weak"
                          ? "w-1/3 bg-red-500"
                          : passwordStrength === "medium"
                            ? "w-2/3 bg-yellow-500"
                            : "w-full bg-green-500"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs ${
                      passwordStrength === "weak"
                        ? "text-red-600"
                        : passwordStrength === "medium"
                          ? "text-yellow-600"
                          : "text-green-600"
                    }`}
                  >
                    {passwordStrength}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Select value={formData.region} onValueChange={(value) => handleInputChange("region", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      <div className="flex items-center space-x-2">
                        <span>{region.label}</span>
                        <span className="text-xs text-gray-500">- {region.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Your Role</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                placeholder="Your company name (optional)"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">🎉 Your 30-Day PRO Trial Includes:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                <div className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Unlimited file uploads
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Advanced AI insights
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  All file formats
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Industry analysis
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Team collaboration
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Priority support
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Start My 30-Day PRO Trial"}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:underline font-medium">
                Sign in here
              </a>
            </p>

            <p className="text-xs text-gray-500 text-center">
              By signing up, you agree to our Terms of Service and Privacy Policy. No credit card required for trial.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
