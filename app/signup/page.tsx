"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BarChart3, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createAccount } from "@/lib/account-utils"

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    company: "",
    industry: "",
    customIndustry: "",
    role: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleIndustryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, industry: value }))
  }

  const handleCustomIndustryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, customIndustry: e.target.value }))
  }

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const requiredFields = ["firstName", "lastName", "email", "password", "industry", "role"]
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData])

    if (missingFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields to create your account.",
        variant: "destructive",
      })
      return
    }

    // Check if custom industry is required but missing
    if (formData.industry === "other" && !formData.customIndustry) {
      toast({
        title: "Missing industry information",
        description: "Please specify your industry.",
        variant: "destructive",
      })
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    // Password validation (at least 6 characters)
    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    // Simulate account creation
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)

      // Create user account with special features based on role
      const industry = formData.industry === "other" ? formData.customIndustry : formData.industry
      const role = formData.role as "data-scientist" | "data-engineer"
      const name = `${formData.firstName} ${formData.lastName}`

      // Create account with appropriate features based on role
      const userData = createAccount(name, formData.email, industry, formData.company || "Not specified", "basic", role)

      // Store in localStorage
      localStorage.setItem("daytaTechUser", JSON.stringify(userData))

      // Show appropriate toast message
      if (role === "data-scientist") {
        toast({
          title: "Data Scientist Account Created!",
          description: "Welcome to DaytaTech. Your account includes premium data science features.",
        })
      } else if (role === "data-engineer") {
        toast({
          title: "Data Engineer Account Created!",
          description: "Welcome to DaytaTech. Your account includes premium data engineering features.",
        })
      } else {
        toast({
          title: "Account created!",
          description: "Welcome to DaytaTech. You're now signed in with a Basic plan.",
        })
      }

      // Redirect to dashboard
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Link href="/" className="absolute left-8 top-8 flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-purple-600" />
        <span className="text-xl font-bold">DaytaTech</span>
      </Link>

      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>
              Start with our Basic plan at $39/month - includes 10 file uploads and 5 exports per month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First name <span className="text-red-500">*</span>
                </Label>
                <Input id="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last name <span className="text-red-500">*</span>
                </Label>
                <Input id="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input id="password" type="password" value={formData.password} onChange={handleChange} required />
              <p className="text-xs text-gray-500">Must be at least 6 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company (Optional)</Label>
              <Input id="company" placeholder="Your company name" value={formData.company} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">
                Industry <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={handleIndustryChange} value={formData.industry}>
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance & Banking</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="real-estate">Real Estate</SelectItem>
                  <SelectItem value="hospitality">Hospitality</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.industry === "other" && (
              <div className="space-y-2">
                <Label htmlFor="customIndustry">
                  Please specify your industry <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customIndustry"
                  placeholder="Enter your industry"
                  value={formData.customIndustry}
                  onChange={handleCustomIndustryChange}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">
                Your Role <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={handleRoleChange} value={formData.role}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="data-scientist">Data Scientist</SelectItem>
                  <SelectItem value="data-engineer">Data Engineer</SelectItem>
                </SelectContent>
              </Select>

              {formData.role === "data-scientist" && (
                <div className="mt-2 text-xs text-purple-600 bg-purple-50 p-2 rounded-md border border-purple-100">
                  <p className="font-medium">Data Scientist Bonus Features:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5">
                    <li>AI industry-specific insights</li>
                    <li>Advanced data analysis</li>
                    <li>Universal file format support</li>
                    <li>Executive summaries</li>
                  </ul>
                </div>
              )}

              {formData.role === "data-engineer" && (
                <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-md border border-blue-100">
                  <p className="font-medium">Data Engineer Bonus Features:</p>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5">
                    <li>AI pipeline development insights</li>
                    <li>Data architecture recommendations</li>
                    <li>Data transformation & processing insights</li>
                    <li>Data governance & security insights</li>
                    <li>Performance tuning & optimizations</li>
                    <li>AI-supported data cleaning recommendations</li>
                    <li>Universal file format support</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="rounded-lg bg-green-50 p-4 border border-green-200">
              <div className="text-sm font-medium text-green-800 mb-2">Basic Plan - $39/month</div>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• 10 file uploads per month</li>
                <li>• 5 data exports per month</li>
                <li>• Basic AI insights</li>
                <li>• CSV and Excel support</li>
                <li>• Email support</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Start Basic Plan - $39/month"
              )}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-purple-600 hover:underline">
                Log in
              </Link>
            </div>
            <div className="text-center text-xs text-gray-500">
              By creating an account, you agree to our Terms of Service and Privacy Policy. Cancel anytime.
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
