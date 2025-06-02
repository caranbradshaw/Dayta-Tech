"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BarChart3, Loader2, Clock, Info, Database, FlaskConical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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

      // Create user account with 30-day free trial
      const industry = formData.industry === "other" ? formData.customIndustry : formData.industry
      const role = formData.role as "data-scientist" | "data-engineer"
      const name = `${formData.firstName} ${formData.lastName}`

      // Create account with 30-day trial
      const userData = createAccount(name, formData.email, industry, formData.company || "Not specified", "basic", role)

      // Store in localStorage
      localStorage.setItem("daytaTechUser", JSON.stringify(userData))

      // Show appropriate toast message
      if (role === "data-scientist") {
        toast({
          title: "Data Scientist Account Created!",
          description: "Welcome to DaytaTech. Your 30-day free trial has started with premium data science features.",
        })
      } else if (role === "data-engineer") {
        toast({
          title: "Data Engineer Account Created!",
          description:
            "Welcome to DaytaTech. Your 30-day free trial has started with premium data engineering features.",
        })
      } else {
        toast({
          title: "Account created!",
          description: "Welcome to DaytaTech. Your 30-day free trial has started.",
        })
      }

      // Redirect to dashboard
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <Link href="/" className="absolute left-8 top-8 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-purple-600" />
          <span className="text-xl font-bold">DaytaTech</span>
        </Link>

        <Card className="w-full max-w-md">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Start Your Free Trial</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span>30 days free, then $39/month - No credit card required</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
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
                <Label htmlFor="role" className="flex items-center gap-2">
                  Your Role <span className="text-red-500">*</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">
                        Choose the role that best describes what you do with data. Hover over each option for more
                        details!
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Select onValueChange={handleRoleChange} value={formData.role}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data-scientist">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="h-4 w-4 text-purple-600" />
                        <span>Data Scientist</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <div className="text-sm space-y-1">
                              <p className="font-medium">Data Scientist = Detective 🕵️</p>
                              <p>You look at data like clues to solve business mysteries!</p>
                              <p>• Find patterns (like "why do customers buy more on Fridays?")</p>
                              <p>• Make predictions (like "how many toys will we sell next month?")</p>
                              <p>• Create reports for bosses to make big decisions</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </SelectItem>
                    <SelectItem value="data-engineer">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-600" />
                        <span>Data Engineer</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <div className="text-sm space-y-1">
                              <p className="font-medium">Data Engineer = Builder 🔧</p>
                              <p>You build the "roads" that data travels on!</p>
                              <p>• Make sure data gets from place to place safely</p>
                              <p>• Clean messy data (like organizing a messy room)</p>
                              <p>• Build systems that collect and store data properly</p>
                              <p>• Make everything run fast and smooth</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {formData.role === "data-scientist" && (
                  <div className="mt-2 text-xs text-purple-600 bg-purple-50 p-2 rounded-md border border-purple-100">
                    <p className="font-medium">Data Scientist Bonus Features (Free for 30 days):</p>
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
                    <p className="font-medium">Data Engineer Bonus Features (Free for 30 days):</p>
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
                <div className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  30-Day Free Trial
                </div>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• 10 file uploads per month</li>
                  <li>• AI-powered insights & recommendations</li>
                  <li>• CSV, Excel, JSON support</li>
                  <li>• Executive summaries</li>
                  <li>• Email support</li>
                  <li>• No credit card required</li>
                </ul>
                <div className="text-xs text-green-600 mt-2 font-medium">After 30 days: $39/month (cancel anytime)</div>
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
                  "Start 30-Day Free Trial"
                )}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-purple-600 hover:underline">
                  Log in
                </Link>
              </div>
              <div className="text-center text-xs text-gray-500">
                By creating an account, you agree to our Terms of Service and Privacy Policy. No credit card required
                for trial.
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </TooltipProvider>
  )
}
