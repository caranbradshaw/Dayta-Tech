"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, BarChart3, FileText, Zap, Database, Brain, Users, TrendingUp, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ContactSalesButton } from "@/components/contact-sales-button"
import { UpgradeAccountModal } from "@/components/upgrade-account-modal"

export default function Home() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "pro" | "team" | "enterprise">("pro")

  const router = useRouter()

  const handlePlanSelect = (plan: "basic" | "pro" | "team" | "enterprise") => {
    console.log("Plan selected:", plan)
    setSelectedPlan(plan)
    setShowUpgradeModal(true)
  }

  const handleSignupRedirect = () => {
    console.log("Signup button clicked!")
    try {
      router.push("/signup")
    } catch (error) {
      console.error("Router navigation failed:", error)
      window.location.href = "/signup"
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold">DaytaTech</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4">
              Pricing
            </Link>
            <Link href="#faq" className="text-sm font-medium hover:underline underline-offset-4">
              FAQ
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
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-purple-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Get Expert Data Insights Without the Expert
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    DaytaTech's AI gives you the analytical power of data engineers and data scientists—no technical
                    skills required. Transform complex data into clear business insights that drive decisions.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="gap-1" onClick={handleSignupRedirect}>
                    Start Free Trial <ArrowRight className="h-4 w-4" />
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
                    <div className="h-2 w-20 rounded bg-purple-200"></div>
                    <div className="h-2 w-10 rounded bg-purple-200"></div>
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
                    <div className="rounded-md bg-purple-100 p-3">
                      <div className="font-medium">Risk Alert</div>
                      <div className="text-sm text-gray-500">
                        Customer churn pattern detected in enterprise segment—implement retention strategy within 30
                        days
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-purple-500/20 blur-xl"></div>
                <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-blue-500/20 blur-xl"></div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-purple-100 px-3 py-1 text-sm text-purple-800">Features</div>
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
                  <Brain className="h-6 w-6 text-purple-600" />
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
                  <Database className="h-6 w-6 text-purple-600" />
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
                  <FileText className="h-6 w-6 text-purple-600" />
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
                  <TrendingUp className="h-6 w-6 text-purple-600" />
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
                  <Zap className="h-6 w-6 text-purple-600" />
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
                  <Users className="h-6 w-6 text-purple-600" />
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

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Feel Like You Have a Data Team</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Whether you're a startup without data expertise or an enterprise looking to democratize insights,
                  DaytaTech gives everyone the power of expert data analysis.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    If You Have a Data Team
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-blue-100 p-1 mt-0.5">
                        <ArrowRight className="h-3 w-3 text-blue-600" />
                      </div>
                      <span>
                        <strong>Accelerate Analysis:</strong> Your data scientists get insights faster, freeing them for
                        strategic work
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-blue-100 p-1 mt-0.5">
                        <ArrowRight className="h-3 w-3 text-blue-600" />
                      </div>
                      <span>
                        <strong>Democratize Insights:</strong> Business users get answers without waiting for data team
                        availability
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-blue-100 p-1 mt-0.5">
                        <ArrowRight className="h-3 w-3 text-blue-600" />
                      </div>
                      <span>
                        <strong>Quality Assurance:</strong> AI validates findings and catches issues your team might
                        miss
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-blue-100 p-1 mt-0.5">
                        <ArrowRight className="h-3 w-3 text-blue-600" />
                      </div>
                      <span>
                        <strong>Scale Expertise:</strong> Extend your team's capabilities across the entire organization
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    If You Don't Have a Data Team
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-purple-100 p-1 mt-0.5">
                        <ArrowRight className="h-3 w-3 text-purple-600" />
                      </div>
                      <span>
                        <strong>Instant Expertise:</strong> Get data scientist-level insights without hiring expensive
                        talent
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-purple-100 p-1 mt-0.5">
                        <ArrowRight className="h-3 w-3 text-purple-600" />
                      </div>
                      <span>
                        <strong>No Learning Curve:</strong> Start getting insights immediately—no training or technical
                        knowledge required
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-purple-100 p-1 mt-0.5">
                        <ArrowRight className="h-3 w-3 text-purple-600" />
                      </div>
                      <span>
                        <strong>Cost Effective:</strong> Get expert analysis for a fraction of the cost of hiring data
                        professionals
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="rounded-full bg-purple-100 p-1 mt-0.5">
                        <ArrowRight className="h-3 w-3 text-purple-600" />
                      </div>
                      <span>
                        <strong>Competitive Advantage:</strong> Make data-driven decisions like companies with dedicated
                        data teams
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-purple-100 px-3 py-1 text-sm text-purple-800">Pricing</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Expert Data Analysis for Everyone</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get the power of data engineers and data scientists at a fraction of the cost of hiring them.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-4 mt-12">
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle>Starter</CardTitle>
                  <div className="text-3xl font-bold">$39</div>
                  <CardDescription>Perfect for small businesses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>10 data analyses per month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>AI business insights & recommendations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Excel, CSV, JSON support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Executive summaries</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Email support</span>
                    </li>
                  </ul>
                  <Button className="mt-6 w-full" onClick={() => handlePlanSelect("basic")}>
                    Start 30-Day Free Trial
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-2 border-purple-600 shadow-lg">
                <CardHeader>
                  <div className="inline-block rounded-lg bg-purple-100 px-3 py-1 text-sm text-purple-800 mb-2">
                    Most Popular
                  </div>
                  <CardTitle>Professional</CardTitle>
                  <div className="text-3xl font-bold">$99</div>
                  <CardDescription>For growing businesses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Unlimited data analyses</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Advanced AI insights & predictions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>All file formats + database connections</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Industry-specific analysis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Priority support</span>
                    </li>
                  </ul>
                  <Button className="mt-6 w-full" onClick={() => handlePlanSelect("pro")}>
                    Start 30-Day Free Trial
                  </Button>
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Everything in Professional</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Up to 10 team members</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Shared insights & collaboration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Advanced team analytics</span>
                    </li>
                  </ul>
                  <Button className="mt-6 w-full" onClick={() => handlePlanSelect("team")}>
                    Start 30-Day Free Trial
                  </Button>
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Everything in Team</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Unlimited team members</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Custom AI training on your data</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Dedicated success manager</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
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

        <section id="faq" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-purple-100 px-3 py-1 text-sm text-purple-800">FAQ</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Frequently Asked Questions</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to know about getting expert data insights without the experts.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 mt-12">
              <Card>
                <CardHeader>
                  <CardTitle>Do I need technical skills to use DaytaTech?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    Not at all! DaytaTech is designed for business users without technical expertise. Simply upload your
                    data files (Excel, CSV, etc.), and our AI does all the complex analysis. You get clear, actionable
                    insights in plain English—no coding, SQL, or data science knowledge required.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>How is this different from hiring data professionals?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    <strong>Cost:</strong> Get expert-level analysis for $39-99/month vs. $100K+ annually for data
                    professionals.
                    <br />
                    <br />
                    <strong>Speed:</strong> Get insights in minutes, not weeks of project planning and execution.
                    <br />
                    <br />
                    <strong>Availability:</strong> 24/7 access to analysis vs. limited availability of human experts.
                    <br />
                    <br />
                    <strong>Scalability:</strong> Analyze unlimited datasets without hiring additional staff.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>What if I already have data engineers or data scientists?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    Perfect! DaytaTech complements your existing team by:
                    <br />
                    <br />• <strong>Accelerating their work:</strong> Get initial insights faster so they can focus on
                    strategic projects
                    <br />• <strong>Democratizing access:</strong> Business users get answers without waiting for data
                    team availability
                    <br />• <strong>Quality assurance:</strong> AI validates findings and catches potential issues
                    <br />• <strong>Scaling expertise:</strong> Extend your team's capabilities across the organization
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>What types of insights can I expect?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    <strong>Revenue Opportunities:</strong> Identify high-performing segments, optimal pricing, market
                    expansion opportunities
                    <br />
                    <br />
                    <strong>Cost Optimization:</strong> Find inefficiencies, reduce waste, optimize resource allocation
                    <br />
                    <br />
                    <strong>Risk Detection:</strong> Early warning signs for customer churn, market changes, operational
                    issues
                    <br />
                    <br />
                    <strong>Performance Analysis:</strong> Track KPIs, benchmark against industry standards, identify
                    improvement areas
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>How accurate and reliable are the AI insights?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    Our AI is trained on thousands of business datasets and uses the same statistical methods that data
                    scientists use. We provide confidence scores for all insights and clearly indicate when more data is
                    needed for reliable conclusions. Many customers report that our insights match or exceed what they
                    previously got from expensive consulting projects.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>What data formats do you support?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    We support all common business data formats: Excel (.xlsx, .xls), CSV, JSON, Google Sheets exports,
                    and database exports. For Professional plans and above, we also support direct connections to
                    databases, cloud storage, and business applications like Salesforce, HubSpot, and QuickBooks.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Is my business data secure?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    <strong>Data Protection:</strong> Enterprise-grade encryption, secure processing environments, and
                    automatic data deletion after analysis.
                    <br />
                    <br />
                    <strong>Privacy:</strong> We never store your raw data permanently or share it with third parties.
                    Only statistical patterns and insights are retained.
                    <br />
                    <br />
                    <strong>Compliance:</strong> SOC 2 Type II certified, GDPR and CCPA compliant, with audit trails for
                    all data access.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Can I try it before committing to a paid plan?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    We offer a 30-day free trial with full access to all features. No credit card required to start. You
                    can upload your own data and see exactly what insights you'll get. Most users know within the first
                    few analyses whether DaytaTech will be valuable for their business.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-purple-600 text-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Ready to Feel Like You Have a Data Team?
                </h2>
                <p className="max-w-[900px] text-purple-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of businesses getting expert-level data insights without the expert-level costs.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" variant="secondary" className="gap-1" onClick={handleSignupRedirect}>
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Button>
                <ContactSalesButton size="lg" className="bg-white text-black hover:bg-gray-100 border-white">
                  Contact Sales
                </ContactSalesButton>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            <span className="text-lg font-bold">DaytaTech</span>
          </div>
          <p className="text-center text-sm text-gray-500 md:text-left">© 2025 DaytaTech. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-gray-500 hover:underline underline-offset-4">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-gray-500 hover:underline underline-offset-4">
              Privacy
            </Link>
          </div>
        </div>
      </footer>

      {showUpgradeModal && (
        <UpgradeAccountModal
          initialPlan={selectedPlan}
          onClose={() => setShowUpgradeModal(false)}
          onSuccess={() => {
            console.log("Modal onSuccess called, attempting redirect...")
            setShowUpgradeModal(false)
            handleSignupRedirect()
          }}
        />
      )}
    </div>
  )
}
