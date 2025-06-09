"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, Eye, EyeOff, Loader2, Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { signUp } from "@/lib/auth-utils"
import { Logo } from "@/components/ui/logo"

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    company: "",
    industry: "",
    role: "",
    agreeToTerms: false,
  })

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    const score = Object.values(checks).filter(Boolean).length
    return { checks, score }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (passwordStrength.score < 3) {
      toast({
        title: "Password Too Weak",
        description: "Please create a stronger password.",
        variant: "destructive",
      })
      return
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Agreement Required",
        description: "Please agree to the Terms of Service and Privacy Policy to continue.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await signUp(formData)

      if (result.success) {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
        })
        router.push("/verify-email")
      } else {
        toast({
          title: "Signup Failed",
          description: result.error || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Already have an account?</span>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Start Your Free Trial</CardTitle>
            <CardDescription>Get expert data insights without the experts. No credit card required.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" placeholder="Your Company" value={formData.company} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select onValueChange={handleSelectChange("industry")} value={formData.industry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance & Banking</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="retail">Retail & E-commerce</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select onValueChange={handleSelectChange("role")} value={formData.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business-analyst">Business Analyst</SelectItem>
                    <SelectItem value="data-analyst">Data Analyst</SelectItem>
                    <SelectItem value="data-scientist">Data Scientist</SelectItem>
                    <SelectItem value="data-engineer">Data Engineer</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-full rounded-full bg-gray-200`}>
                        <div
                          className={`h-full rounded-full transition-all ${
                            passwordStrength.score < 2
                              ? "bg-red-500 w-1/4"
                              : passwordStrength.score < 4
                                ? "bg-yellow-500 w-2/4"
                                : passwordStrength.score < 5
                                  ? "bg-blue-500 w-3/4"
                                  : "bg-green-500 w-full"
                          }`}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {passwordStrength.score < 2
                          ? "Weak"
                          : passwordStrength.score < 4
                            ? "Fair"
                            : passwordStrength.score < 5
                              ? "Good"
                              : "Strong"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.checks.length ? "text-green-600" : "text-gray-400"}`}
                      >
                        {passwordStrength.checks.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        8+ characters
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.checks.uppercase ? "text-green-600" : "text-gray-400"}`}
                      >
                        {passwordStrength.checks.uppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        Uppercase
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.checks.lowercase ? "text-green-600" : "text-gray-400"}`}
                      >
                        {passwordStrength.checks.lowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        Lowercase
                      </div>
                      <div
                        className={`flex items-center gap-1 ${passwordStrength.checks.number ? "text-green-600" : "text-gray-400"}`}
                      >
                        {passwordStrength.checks.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        Number
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData((prev) => ({ ...prev, agreeToTerms: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => window.open("/terms", "_blank")}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Terms of Service
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    onClick={() => window.open("/privacy", "_blank")}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Privacy Policy
                  </button>
                  . *
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || passwordStrength.score < 3 || !formData.agreeToTerms}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-gray-700">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-gray-700">
                Privacy Policy
              </Link>
              .
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">What you get with your free trial:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 30 days of full access</li>
                <li>• Unlimited data analyses</li>
                <li>• AI-powered insights</li>
                <li>• All file formats supported</li>
                <li>• Priority email support</li>
                <li>• No credit card required</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
