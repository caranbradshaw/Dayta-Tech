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
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { signIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing required fields",
        description: "Please enter both email and password.",
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

    // Show loading state
    setIsLoading(true)

    // Check if user exists in localStorage (for demo purposes)
    const existingUsers = localStorage.getItem("daytaTechUsers")
    const users = existingUsers ? JSON.parse(existingUsers) : []
    const user = users.find((u: any) => u.email === formData.email)

    if (user) {
      // In a real app, we would verify the password here
      setTimeout(() => {
        // Store the current user in localStorage
        localStorage.setItem("daytaTechUser", JSON.stringify(user))

        toast({
          title: "Logged in successfully!",
          description: `Welcome back, ${user.name.split(" ")[0]}!`,
        })

        // Redirect to dashboard
        router.push("/dashboard")
        setIsLoading(false)
      }, 1000)
    } else {
      // For demo purposes, create a new Basic account if user doesn't exist
      setTimeout(() => {
        const newUser = {
          name: `User ${Math.floor(Math.random() * 1000)}`,
          email: formData.email,
          industry: "technology",
          company: "Not specified",
          accountType: "basic",
          uploadCredits: 10,
          exportCredits: 5,
          features: {
            basicInsights: true,
            csvSupport: true,
            excelSupport: true,
            advancedInsights: false,
            allFileFormats: false,
            industrySpecificAnalysis: false,
            historicalLearning: false,
            teamCollaboration: false,
            prioritySupport: false,
          },
          createdAt: new Date().toISOString(),
        }

        // Add user to users list
        users.push(newUser)
        localStorage.setItem("daytaTechUsers", JSON.stringify(users))

        // Set current user
        localStorage.setItem("daytaTechUser", JSON.stringify(newUser))

        toast({
          title: "Account created!",
          description: "We've created a Basic account for you since this is your first time logging in.",
        })

        // Redirect to dashboard
        router.push("/dashboard")
        setIsLoading(false)
      }, 1000)
    }
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
            <CardTitle className="text-2xl font-bold">Log in</CardTitle>
            <CardDescription>Enter your email and password to access your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-purple-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" value={formData.password} onChange={handleChange} required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </Button>
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="text-purple-600 hover:underline">
                Sign up for Basic Plan ($39/month)
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
