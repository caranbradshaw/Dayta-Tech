"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/ui/logo"
import { ContactSalesButton } from "@/components/contact-sales-button"
import { DemoModal } from "@/components/demo-modal"
import { useAuth } from "@/components/auth-context"
import { getClientEnvConfig } from "@/lib/client-safe-env"
import {
  ArrowRight,
  FileText,
  Zap,
  Database,
  Brain,
  Users,
  TrendingUp,
  Shield,
  CheckCircle,
  Loader2,
  Lock,
  Globe,
} from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [fixingConnection, setFixingConnection] = useState(false)
  const [connectionFixed, setConnectionFixed] = useState(false)
  const [showDemoModal, setShowDemoModal] = useState(false)

  // Check client environment safely
  const clientEnv = getClientEnvConfig()

  // Fix Supabase connection on page load
  useEffect(() => {
    if (clientEnv.hasSupabase) {
      fixSupabaseConnection()
    }
  }, [clientEnv.hasSupabase])

  const fixSupabaseConnection = async () => {
    setFixingConnection(true)
    try {
      const response = await fetch("/api/fix-supabase-now", { method: "POST" })
      const result = await response.json()

      if (result.success) {
        setConnectionFixed(true)
        console.log("✅ Supabase connection fixed:", result.message)
      } else {
        console.error("❌ Connection fix failed:", result.error)
      }
    } catch (error) {
      console.error("❌ Fix request failed:", error)
    } finally {
      setFixingConnection(false)
    }
  }

  // If user is logged in, redirect to upload
  useEffect(() => {
    if (user) {
      router.push("/upload")
    }
  }, [user, router])

  return (
    <div className="flex min-h-screen flex-col">
      {/* Connection Status - only show if we have Supabase config */}
      {clientEnv.hasSupabase && fixingConnection && (
        <div className="bg-blue-600 text-white p-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Connecting to DaytaTech.ai...</span>
          </div>
        </div>
      )}

      {clientEnv.hasSupabase && connectionFixed && (
        <div className="bg-green-600 text-white p-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>✅ DaytaTech.ai Connected Successfully!</span>
          </div>
        </div>
      )}

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
            <Link href="/faq" className="text-sm font-medium hover:underline underline-offset-4">
              FAQ
            </Link>
            <Link href="/security" className="text-sm font-medium hover:underline underline-offset-4">
              Security
            </Link>
            <Link href="/nigeria" className="text-sm font-medium hover:underline underline-offset-4">
              🇳🇬 Nigeria
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
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
                  <Link href="/signup">
                    <Button size="lg" className="gap-1">
                      Start Free Trial <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" onClick={() => setShowDemoModal(true)}>
                    See How It Works
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
                    <div className="rounded-md bg-blue-100 p-3">
                      <div className="font-medium">Risk Alert</div>
                      <div className="text-sm text-gray-500">
                        Customer churn pattern detected in enterprise segment—implement retention strategy within 30
                        days
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-blue-500/20 blur-xl"></div>
                <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-blue-500/20 blur-xl"></div>
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
                  like an expert team would, but delivers insights in plain English that anyone can understand and act
                  on.
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
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  <CardTitle>Business Intelligence</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Identify revenue opportunities, cost savings, and business risks automatically. Get the strategic
                    insights that drive growth and profitability.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Zap className="h-6 w-6 text-blue-600" />
                  <CardTitle>No Technical Skills Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Upload your data files and get expert-level analysis in minutes. No SQL, no coding, no complex
                    dashboards—just clear insights you can act on immediately.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  <CardTitle>Complements Your Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    If you have data professionals, DaytaTech accelerates their work. If you don't, it gives you their
                    expertise. Either way, you get faster, better insights.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">Pricing</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Expert Data Analysis for Everyone</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get the power of data engineers and data scientists at a fraction of the cost of hiring them.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-4 mt-12">
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle>Basic</CardTitle>
                  <div className="text-3xl font-bold">$39</div>
                  <CardDescription>Perfect for small businesses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>5 data analyses per month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>AI business insights & recommendations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Excel, CSV, JSON support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Executive summaries</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Email support</span>
                    </li>
                  </ul>
                  <Link href="/signup">
                    <Button className="mt-6 w-full">Start 30-Day Free Trial</Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="border-2 border-blue-600 shadow-lg">
                <CardHeader>
                  <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800 mb-2">
                    Most Popular
                  </div>
                  <CardTitle>Pro</CardTitle>
                  <div className="text-3xl font-bold">$99</div>
                  <CardDescription>For growing businesses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>20 data analyses per month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Advanced AI insights & predictions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>All file formats + database connections</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Industry-specific analysis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                  <Link href="/signup">
                    <Button className="mt-6 w-full">Start 30-Day Free Trial</Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle>Team</CardTitle>
                  <div className="text-3xl font-bold">$499</div>
                  <CardDescription>For teams & departments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Everything in Pro</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Up to 5 team members</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Shared insights & collaboration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Advanced team analytics</span>
                    </li>
                  </ul>
                  <Link href="/signup">
                    <Button className="mt-6 w-full">Start 30-Day Free Trial</Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <div className="text-3xl font-bold">Custom</div>
                  <CardDescription>For large organizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Everything in Team</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Unlimited team members</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Custom AI training on your data</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Dedicated success manager</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>On-premise deployment options</span>
                    </li>
                  </ul>
                  <ContactSalesButton className="mt-6 w-full bg-white text-black hover:bg-gray-100">
                    Contact Sales
                  </ContactSalesButton>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-blue-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">Security</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Enterprise-Grade Security</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Your data is protected with the same security standards used by Fortune 500 companies. DaytaTech.ai
                  implements comprehensive security measures so you can focus on insights, not security concerns.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mt-12">
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader className="text-center">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">SOC 2 Type II</CardTitle>
                  <CardDescription>Certified security compliance with annual audits</CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader className="text-center">
                  <Lock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">AES-256 Encryption</CardTitle>
                  <CardDescription>Military-grade encryption for data at rest and in transit</CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader className="text-center">
                  <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">AWS Infrastructure</CardTitle>
                  <CardDescription>Enterprise cloud security with 99.99% uptime SLA</CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader className="text-center">
                  <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Zero Trust Model</CardTitle>
                  <CardDescription>Advanced access controls and continuous verification</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="flex justify-center mt-8">
              <Link href="/security">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  <Shield className="h-4 w-4" />
                  View Complete Security Details
                </Button>
              </Link>
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
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="gap-1">
                    Start Free Trial <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white hover:bg-white hover:text-blue-600"
                  onClick={() => setShowDemoModal(true)}
                >
                  Watch Demo
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
            <Link href="/faq" className="text-sm text-gray-500 hover:underline underline-offset-4">
              FAQ
            </Link>
            <Link href="/security" className="text-sm text-gray-500 hover:underline underline-offset-4">
              Security
            </Link>
          </div>
        </div>
      </footer>

      <DemoModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
    </div>
  )
}
