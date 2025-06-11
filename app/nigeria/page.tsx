"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ContactSalesDialog } from "@/components/contact-sales-dialog"
import { ContactSupportModal } from "@/components/contact-support-modal"
import { Logo } from "@/components/ui/logo"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Shield,
  Lock,
  FileCheck,
  Brain,
  CheckCircle,
  Globe,
  ArrowRight,
  Database,
  TrendingUp,
  Zap,
  Users,
  Download,
  Play,
} from "lucide-react"

export default function NigeriaPage() {
  const [showContactSales, setShowContactSales] = useState(false)
  const [showContactSupport, setShowContactSupport] = useState(false)
  const router = useRouter()

  const handleWhitePaperDownload = (paperName: string) => {
    // Create a blob with comprehensive content
    const content = `# ${paperName}

## Executive Summary
This comprehensive guide provides Nigerian businesses with practical insights and strategies for ${paperName.toLowerCase()}.

## Table of Contents
1. Introduction to ${paperName}
2. Nigerian Market Context
3. Implementation Strategies
4. Best Practices
5. ROI Analysis
6. Case Studies
7. Next Steps

## Key Benefits for Nigerian Businesses
- Improved decision-making capabilities
- Competitive advantage in local markets
- Compliance with Nigerian regulations
- Cost-effective implementation
- Scalable solutions

## Implementation Roadmap
### Phase 1: Assessment (Weeks 1-2)
- Current state analysis
- Requirements gathering
- Stakeholder alignment

### Phase 2: Planning (Weeks 3-4)
- Strategy development
- Resource allocation
- Timeline creation

### Phase 3: Execution (Weeks 5-12)
- System implementation
- Team training
- Process optimization

### Phase 4: Optimization (Ongoing)
- Performance monitoring
- Continuous improvement
- Scaling strategies

## Nigerian Market Insights
- Local consumer behavior patterns
- Regulatory compliance requirements
- Economic factors and considerations
- Cultural adaptation strategies

## Contact Information
For more information or implementation support:
- Email: caran@daytatech.ai
- Website: daytatech.ai/nigeria
- Phone: +234 (0) 123 456 7890

© 2025 DaytaTech Nigeria. All rights reserved.`

    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${paperName.replace(/\s+/g, "-").toLowerCase()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleStartTrial = () => {
    router.push("/signup")
  }

  const handleSeeDemo = () => {
    router.push("/demo")
  }

  const handleGetStarted = (plan: string) => {
    // Store the selected plan and redirect to signup
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedPlan", plan)
    }
    router.push("/signup")
  }

  const handleLogin = () => {
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/nigeria">
            <Logo />
          </Link>
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
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleLogin}>
              Log in
            </Button>
            <Button size="sm" onClick={() => handleGetStarted("pro")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-blue-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
                  🇳🇬 Built for Nigerian Businesses
                </Badge>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Get Expert Data Insights Without the Expert
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl">
                  DaytaTech's AI gives you the analytical power of data engineers and data scientists—no technical
                  skills required. Transform complex data into clear business insights that drive decisions.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" className="gap-1 bg-green-600 hover:bg-green-700" onClick={handleStartTrial}>
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={handleSeeDemo}>
                  <Play className="mr-2 h-4 w-4" />
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
                      Lagos region shows 34% higher conversion rates—increase marketing spend by ₦75K for projected
                      ₦255K additional revenue
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
                      Customer churn pattern detected in enterprise segment—implement retention strategy within 30 days
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

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">Features</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Your AI Data Team in a Box</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Get the expertise of data engineers and data scientists without hiring them. Our AI analyzes your data
                like an expert team would, but delivers insights in plain English that anyone can understand and act on.
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
                <FileCheck className="h-6 w-6 text-blue-600" />
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

      {/* Pricing Section */}
      <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800">Pricing</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Expert Data Analysis for Everyone</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Get the power of data engineers and data scientists at a fraction of the cost of hiring them. All prices
                in Nigerian Naira.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-4 mt-12">
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle>Basic</CardTitle>
                <div className="text-3xl font-bold">₦58,500</div>
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
                <Button className="mt-6 w-full" onClick={() => handleGetStarted("basic")}>
                  Start 30-Day Free Trial
                </Button>
              </CardContent>
            </Card>
            <Card className="border-2 border-blue-600 shadow-lg">
              <CardHeader>
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800 mb-2">
                  Most Popular
                </div>
                <CardTitle>Pro</CardTitle>
                <div className="text-3xl font-bold">₦148,500</div>
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
                <Button className="mt-6 w-full" onClick={() => handleGetStarted("pro")}>
                  Start 30-Day Free Trial
                </Button>
              </CardContent>
            </Card>
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle>Team</CardTitle>
                <div className="text-3xl font-bold">₦748,500</div>
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
                <Button className="mt-6 w-full" onClick={() => handleGetStarted("team")}>
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
                <Button
                  className="mt-6 w-full bg-white text-black hover:bg-gray-100"
                  onClick={() => setShowContactSales(true)}
                >
                  Contact Sales
                </Button>
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
                Your data is protected with the same security standards used by Fortune 500 companies. We implement
                comprehensive security measures so you can focus on insights, not security concerns.
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

          {/* White Paper Downloads Section */}
          <div className="mt-16 bg-white rounded-lg border-2 border-blue-200 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-blue-800 mb-4">Security Documentation</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Download our comprehensive security documentation to understand how we protect your data and ensure
                compliance with industry standards.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border border-blue-200 hover:border-blue-400 transition-colors">
                <CardHeader className="text-center">
                  <FileCheck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Security White Paper</CardTitle>
                  <CardDescription>Comprehensive overview of our security architecture and compliance</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleWhitePaperDownload("Security White Paper")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-blue-200 hover:border-blue-400 transition-colors">
                <CardHeader className="text-center">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Compliance Guide</CardTitle>
                  <CardDescription>SOC 2, GDPR, and industry-specific compliance information</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleWhitePaperDownload("Compliance Guide")}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-blue-200 hover:border-blue-400 transition-colors">
                <CardHeader className="text-center">
                  <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Data Protection</CardTitle>
                  <CardDescription>How we handle, encrypt, and protect your sensitive business data</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleWhitePaperDownload("Data Protection")}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            </div>
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

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-green-600 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to Get Expert Data Insights?</h2>
              <p className="max-w-[900px] text-green-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of businesses using DaytaTech to make data-driven decisions without hiring data experts.
                Start your free trial today—no credit card required.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" variant="secondary" className="gap-1" onClick={handleStartTrial}>
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-green-600"
                onClick={handleSeeDemo}
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <Logo />
          <p className="text-center text-sm text-gray-500 md:text-left">© 2025 DaytaTech. All rights reserved.</p>
          <div className="flex gap-4 items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowContactSupport(true)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Contact Support
            </Button>
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

      {/* Modals */}
      <ContactSalesDialog isOpen={showContactSales} onClose={() => setShowContactSales(false)} />
      {showContactSupport && <ContactSupportModal onClose={() => setShowContactSupport(false)} />}
    </div>
  )
}
