"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/lib/client-storage"

interface UserAuthFormProps {
  type: "login" | "signup"
  className?: string
}

export function UserAuthForm({ type, className }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    company: "",
    role: "",
    industry: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)

    try {
      if (type === "login") {
        const result = authService.login(formData.email, formData.password)
        if (result.success) {
          toast({
            title: "Login successful",
            description: "Welcome back to DaytaTech.ai",
          })
          router.push("/dashboard")
        } else {
          toast({
            title: "Login failed",
            description: result.message || "Please check your credentials and try again",
            variant: "destructive",
          })
        }
      } else {
        const result = authService.register(formData.email, formData.password, {
          name: formData.name,
          company: formData.company,
          role: formData.role,
          industry: formData.industry,
        })

        if (result.success) {
          toast({
            title: "Account created",
            description: "Welcome to DaytaTech.ai",
          })
          router.push("/dashboard")
        } else {
          toast({
            title: "Registration failed",
            description: result.message || "Please try again with different credentials",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Auth error:", error)
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={className}>
      <form onSubmit={onSubmit} className="space-y-4">
        {type === "signup" && (
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="John Doe"
              type="text"
              autoCapitalize="none"
              autoComplete="name"
              autoCorrect="off"
              disabled={isLoading}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder="name@example.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            disabled={isLoading}
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoCapitalize="none"
              autoComplete={type === "login" ? "current-password" : "new-password"}
              disabled={isLoading}
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
        </div>
        {type === "signup" && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                name="company"
                placeholder="Your Company"
                type="text"
                disabled={isLoading}
                value={formData.company}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role (Optional)</Label>
              <Input
                id="role"
                name="role"
                placeholder="Data Analyst, Manager, etc."
                type="text"
                disabled={isLoading}
                value={formData.role}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="industry">Industry (Optional)</Label>
              <Input
                id="industry"
                name="industry"
                placeholder="Technology, Finance, etc."
                type="text"
                disabled={isLoading}
                value={formData.industry}
                onChange={handleChange}
              />
            </div>
          </>
        )}
        <Button disabled={isLoading} type="submit" className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {type === "login" ? "Sign In" : "Create Account"}
        </Button>
      </form>
    </div>
  )
}
