"use client"

import Link from "next/link"
import { ArrowRight, BarChart3, FileText, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ContactSalesButton } from "@/components/contact-sales-button"

export default function Home() {
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
                    Transform Raw Data into Executive Insights
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    No dashboards, formulas, or SQL required. DaytaTech uses AI to simplify, summarize, and extract
                    insights from your business data.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="gap-1">
                      Start Now <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/demo">
                    <Button size="lg" variant="outline">
                      Try Demo
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:mx-0 relative">
                <div className="relative rounded-lg border bg-background p-4 shadow-lg">
                  <div className="space-y-2">
                    <div className="h-2 w-20 rounded bg-purple-200"></div>
                    <div className="h-2 w-10 rounded bg-purple-200"></div>
                  </div>
                  <div className="mt-4 grid gap-2">
                    <div className="rounded-md bg-purple-100 p-3">
                      <div className="font-medium">Key Insight</div>
                      <div className="text-sm text-gray-500">Revenue increased by 24% in Q2 compared to Q1</div>
                    </div>
                    <div className="rounded-md bg-blue-100 p-3">
                      <div className="font-medium">Trend Detected</div>
                      <div className="text-sm text-gray-500">
                        Customer acquisition cost has decreased by 12% over the last 3 months
                      </div>
                    </div>
                    <div className="rounded-md bg-green-100 p-3">
                      <div className="font-medium">Recommendation</div>
                      <div className="text-sm text-gray-500">
                        Increase marketing spend in the Northeast region based on conversion rates
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
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">The Grammarly for Data Reports</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Unlike complex BI platforms or generic AI chatbots, DaytaTech is purpose-built for business
                  intelligence. It's the missing layer between your raw data and actionable insights—no dashboards, no
                  SQL, no weeks of setup.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <FileText className="h-6 w-6 text-purple-600" />
                  <CardTitle>Universal File Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Import data from Power BI, Tableau, Excel, CSV, and more. No need to change your existing tools.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <Zap className="h-6 w-6 text-purple-600" />
                  <CardTitle>AI-Powered Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Automatically identify trends, patterns, outliers, and correlations in your data without complex
                    queries.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                  <CardTitle>Industry-Specific Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Our AI adapts to your industry and learns from your usage patterns to provide more relevant insights
                    over time.
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
                    Get clear, concise summaries of your data that highlight what matters most for decision-making.
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
                    Designed for business users without data science expertise. No SQL, no formulas, no complex
                    dashboards.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                  <CardTitle>Historical Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    The more you use DaytaTech, the smarter it gets about your business needs and reporting preferences.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-purple-100 px-3 py-1 text-sm text-purple-800">Pricing</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Simple, Transparent Pricing</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose the plan that works best for your business needs.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-4 mt-12">
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle>Basic</CardTitle>
                  <div className="text-3xl font-bold">$39</div>
                  <CardDescription>Per month, billed monthly</CardDescription>
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
                      <span>10 file uploads per month</span>
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
                      <span>AI-powered insights & recommendations</span>
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
                      <span>CSV, Excel, JSON support</span>
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
                  <Link href="/signup">
                    <Button className="mt-6 w-full">Get Started - $39/mo</Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="border-2 border-purple-600 shadow-lg">
                <CardHeader>
                  <div className="inline-block rounded-lg bg-purple-100 px-3 py-1 text-sm text-purple-800 mb-2">
                    Most Popular
                  </div>
                  <CardTitle>Pro</CardTitle>
                  <div className="text-3xl font-bold">$99</div>
                  <CardDescription>Per month, billed monthly</CardDescription>
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
                      <span>Unlimited file uploads</span>
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
                      <span>Advanced insights and recommendations</span>
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
                      <span>All file formats supported</span>
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
                      <span>Historical data learning</span>
                    </li>
                  </ul>
                  <Link href="/signup">
                    <Button className="mt-6 w-full">Get Started</Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle>Team</CardTitle>
                  <div className="text-3xl font-bold">$499</div>
                  <CardDescription>Per month, billed monthly</CardDescription>
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
                      <span>Everything in Pro</span>
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
                      <span>Up to 5 team members</span>
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
                      <span>Team collaboration features</span>
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
                  <Link href="/signup">
                    <Button className="mt-6 w-full">Get Started</Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <div className="text-3xl font-bold">Custom</div>
                  <CardDescription>Tailored for your organization</CardDescription>
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
                      <span>SSO & advanced security</span>
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
                      <span>Dedicated support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/24"
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
                      <span>Custom integrations</span>
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

        <section id="faq" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-purple-100 px-3 py-1 text-sm text-purple-800">FAQ</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Frequently Asked Questions</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to know about DaytaTech.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 mt-12">
              <Card>
                <CardHeader>
                  <CardTitle>What file formats does DaytaTech support?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    DaytaTech supports all major data formats including CSV, Excel, Power BI exports, Tableau exports,
                    JSON, and more. If you have a specific format not listed, contact us and we'll work to add support.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>How does the industry-specific analysis work?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    When you sign up, you'll select your industry. Our AI models are trained on industry-specific data
                    patterns and metrics. As you use DaytaTech, the system learns your specific business context to
                    provide even more relevant insights.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Is my data secure?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 mb-3">
                    <strong>For Individual Users:</strong> We use enterprise-grade AES-256 encryption for all data in
                    transit and at rest. Your files are processed in isolated environments and automatically deleted
                    after analysis. We never store your raw data permanently or share it with third parties.
                  </p>
                  <p className="text-gray-500 mb-3">
                    <strong>For Enterprise Customers:</strong> We offer additional security features including SSO
                    integration, custom data retention policies, on-premise deployment options, SOC 2 Type II
                    compliance, and dedicated security reviews. Your data can be processed in your own cloud environment
                    if required.
                  </p>
                  <p className="text-gray-500">
                    <strong>Privacy Compliance:</strong> We're fully GDPR and CCPA compliant with built-in data deletion
                    tools, audit trails, and user consent management. All processing is logged and can be reviewed for
                    compliance purposes.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>What enterprise security features are available?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 mb-2">
                    <strong>Access Control:</strong> Role-based permissions, SSO integration (SAML, OIDC), multi-factor
                    authentication, and IP whitelisting.
                  </p>
                  <p className="text-gray-500 mb-2">
                    <strong>Data Protection:</strong> End-to-end encryption, zero-trust architecture, data residency
                    controls, and custom retention policies.
                  </p>
                  <p className="text-gray-500 mb-2">
                    <strong>Compliance:</strong> SOC 2 Type II, ISO 27001, GDPR, HIPAA-ready configurations, and regular
                    security audits.
                  </p>
                  <p className="text-gray-500">
                    <strong>Monitoring:</strong> Real-time security monitoring, detailed audit logs, anomaly detection,
                    and incident response procedures.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Do I need technical skills to use DaytaTech?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    Not at all! DaytaTech is designed for business users without technical expertise. Simply upload your
                    data files, and our AI does the rest, providing clear, actionable insights without requiring you to
                    write queries or formulas.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>How is DaytaTech different from other AI data tools?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 mb-3">
                    <strong>Unlike ChatGPT or Claude:</strong> DaytaTech is purpose-built for business data analysis,
                    not general conversation. It understands business metrics, industry contexts, and provides
                    structured insights rather than conversational responses.
                  </p>
                  <p className="text-gray-500 mb-3">
                    <strong>Unlike Tableau or Power BI:</strong> No dashboard creation required. DaytaTech focuses on
                    extracting insights, not building visualizations. It's the "analysis layer" that sits on top of your
                    existing tools.
                  </p>
                  <p className="text-gray-500 mb-3">
                    <strong>Unlike Traditional BI Tools:</strong> Zero technical setup. No SQL queries, no data
                    modeling, no complex configurations. Upload your file and get insights in minutes, not weeks.
                  </p>
                  <p className="text-gray-500 mb-3">
                    <strong>Unlike Generic AI Platforms:</strong> Industry-specific intelligence that learns your
                    business context. Our AI understands the difference between retail metrics and SaaS metrics,
                    manufacturing KPIs and healthcare analytics.
                  </p>
                  <p className="text-gray-500">
                    <strong>The "Grammarly for Data" Approach:</strong> Just as Grammarly doesn't replace Word but makes
                    your writing better, DaytaTech doesn't replace your existing tools—it makes your data analysis
                    smarter and faster.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>What's the difference between Data Engineer and Data Scientist roles?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 mb-3">
                    <strong>Data Engineers</strong> focus on the technical infrastructure that makes data usable. They
                    build and maintain data pipelines, ensure data quality, optimize storage systems, and create the
                    foundation that enables data analysis. Think of them as the architects and builders of your data
                    ecosystem.
                  </p>
                  <p className="text-gray-500">
                    <strong>Data Scientists</strong> focus on extracting business insights from data. They analyze
                    trends, create predictive models, generate executive summaries, and translate data into actionable
                    business recommendations. Think of them as the detectives who solve business problems using data.
                  </p>
                  <p className="text-gray-500 mt-3 text-sm">
                    <em>
                      DaytaTech provides specialized AI recommendations for both roles - technical optimization insights
                      for Data Engineers and business intelligence insights for Data Scientists.
                    </em>
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
                  Ready to Transform Your Data Experience?
                </h2>
                <p className="max-w-[900px] text-purple-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of businesses that use DaytaTech to make better decisions faster.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="gap-1">
                    Start Now - $39/month <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
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
    </div>
  )
}
