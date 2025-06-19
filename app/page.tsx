"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/ui/logo"
import { useAuth } from "@/components/auth-context"
import { ArrowRight, FileText, Database, Brain, TrendingUp, Shield, Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // If user is logged in, redirect to dashboard
  useEffect(() => {
    if (mounted && !loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, mounted, router])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Don't render if user is logged in (will redirect)
  if (user) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4">
              Pricing
            </Link>
            <Link href="/demo" className="text-sm font-medium hover:underline underline-offset-4">
              Demo
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-blue-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
                    🚀 DaytaTech.ai - The Grammarly of Data Analysis
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Transform Complex Data Into Clear Business Insights
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    DaytaTech.ai's AI gives you the analytical power of data engineers and data scientists—no technical
                    skills required. Get expert-level insights that drive decisions.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="gap-1">
                    <Link href="/signup">
                      Start Free Trial <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/demo">See How It Works</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    <span>No technical skills needed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>Expert-level insights</span>
                  </div>
                </div>
              </div>
              <div className="mx-auto lg:mx-0 relative">
                <div className="relative rounded-lg border bg-background p-4 shadow-lg">
                  <div className="space-y-2">
                    <div className="h-2 w-20 rounded bg-blue-200"></div>
                    <div className="h-2 w-10 rounded bg-blue-200"></div>
                  </div>
                  <div className="mt-4 grid gap-2">
                    <div className="rounded-md bg-blue-100 p-3">
                      <div className="font-medium">Revenue Opportunity</div>
                      <div className="text-sm text-gray-500">
                        Northeast region shows 34% higher conversion rates—increase marketing spend by $50K for
                        projected $170K additional revenue
                      </div>
                    </div>
                    <div className="rounded-md bg-green-100 p-3">
                      <div className="font-medium">Cost Optimization</div>
                      <div className="text-sm text-gray-500">
                        Customer acquisition cost decreased 18% in Q3—reallocate budget from low-performing channels
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">Features</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Your AI Data Team in a Box</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get the expertise of data engineers and data scientists without hiring them. Our AI analyzes your data
                  like an expert team would, but delivers insights in plain English.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Brain className="h-6 w-6 text-blue-600" />
                  <CardTitle>AI Data Scientist</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get advanced statistical analysis, trend detection, and predictive insights that typically require
                    years of data science expertise—delivered in simple business language.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Database className="h-6 w-6 text-blue-600" />
                  <CardTitle>AI Data Engineer</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Automatically clean, validate, and optimize your data quality. Get technical recommendations for
                    better data management without needing engineering knowledge.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <CardTitle>Executive Summaries</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Transform complex data into clear, actionable executive summaries. Get the insights that matter for
                    decision-making, not technical jargon.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-600 text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to Get Expert Data Insights?</h2>
                <p className="max-w-[900px] text-blue-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of businesses using DaytaTech.ai to make data-driven decisions without hiring data
                  experts. Start your free trial today—no credit card required.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" variant="secondary" className="gap-1">
                  <Link href="/signup">
                    Start Free Trial <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-white border-white hover:bg-white hover:text-blue-600"
                >
                  <Link href="/demo">Watch Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <Logo />
          <p className="text-center text-sm text-gray-500 md:text-left">© 2025 DaytaTech.ai. All rights reserved.</p>
          <div className="flex gap-4 items-center">
            <Link href="/terms" className="text-sm text-gray-500 hover:underline underline-offset-4">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-gray-500 hover:underline underline-offset-4">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
