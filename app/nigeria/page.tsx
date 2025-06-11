"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ContactSalesDialog } from "@/components/contact-sales-dialog"
import { ContactSupportModal } from "@/components/contact-support-modal"
import { Logo } from "@/components/ui/logo"
import Link from "next/link"
import {
  Shield,
  Lock,
  FileCheck,
  BarChart3,
  Brain,
  CheckCircle,
  Download,
  Star,
  Globe,
  Building2,
  Banknote,
} from "lucide-react"

export default function NigeriaPage() {
  const [showContactSales, setShowContactSales] = useState(false)
  const [showContactSupport, setShowContactSupport] = useState(false)

  const handleWhitePaperDownload = (paperName: string) => {
    // Create a blob with sample content
    const content = `# ${paperName}\n\nThis is a comprehensive guide about ${paperName.toLowerCase()} for Nigerian businesses.\n\n## Key Points:\n- Industry best practices\n- Nigerian market insights\n- Implementation strategies\n- ROI analysis\n\n© 2025 DaytaTech Nigeria`
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Logo />
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/faq" className="text-gray-600 hover:text-gray-900">
                FAQ
              </Link>
              <Link href="/security" className="text-gray-600 hover:text-gray-900">
                Security
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Log in
              </Link>
              <Button>Get Started</Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
                🇳🇬 Built for Nigerian Businesses
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Get Expert Data Insights
                <span className="block text-green-600">Without the Expert</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                DaytaTech's AI gives Nigerian businesses the analytical power of data engineers and data scientists—no
                technical skills required. Transform complex data into clear business insights that drive decisions and
                growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Start Free Trial →
                </Button>
                <Button variant="outline" size="lg">
                  See How It Works
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  No technical skills needed
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  NDPR compliant
                </div>
              </div>
            </div>
            <div className="lg:pl-8">
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-blue-700 mb-2">Revenue Opportunity</h3>
                    <p className="text-sm text-gray-600">
                      Lagos region shows 34% higher conversion rates—increase marketing spend by ₦50K for projected
                      ₦170K additional revenue
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-green-700 mb-2">Cost Optimization</h3>
                    <p className="text-sm text-gray-600">
                      Customer acquisition cost decreased 18% in Q3—reallocate budget from low-performing channels
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-orange-700 mb-2">Risk Alert</h3>
                    <p className="text-sm text-gray-600">
                      Customer churn pattern detected in enterprise segment—implement retention strategy within 30 days
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4">Features</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Your AI Data Team in a Box</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get the expertise of data engineers and data scientists without hiring them. Our AI analyzes your data
              like an expert team would, but delivers insights in plain English that anyone can understand and act on.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>AI Data Scientist</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Advanced statistical analysis, predictive modeling, and pattern recognition—all automated and
                  explained in simple terms.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>AI Data Engineer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Automated data processing, cleaning, and transformation. Connect multiple data sources without
                  technical complexity.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <FileCheck className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Executive Summaries</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Clear, actionable reports that executives can understand immediately. No technical jargon, just
                  business insights.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4">Pricing</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Transparent Nigerian Pricing</h2>
            <p className="text-xl text-gray-600">No hidden fees. Cancel anytime. All prices in Nigerian Naira.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Starter
                  <Banknote className="h-5 w-5 text-gray-400" />
                </CardTitle>
                <div className="text-3xl font-bold">
                  ₦75,000<span className="text-lg font-normal text-gray-500">/month</span>
                </div>
                <CardDescription>Perfect for small Nigerian businesses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Up to 10,000 data points</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">5 data sources</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Basic AI insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Email support</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="border-green-200 relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-600">Most Popular</Badge>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Professional
                  <Star className="h-5 w-5 text-green-500" />
                </CardTitle>
                <div className="text-3xl font-bold">
                  ₦150,000<span className="text-lg font-normal text-gray-500">/month</span>
                </div>
                <CardDescription>Ideal for growing Nigerian companies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Up to 100,000 data points</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Unlimited data sources</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Advanced AI insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Priority support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Custom dashboards</span>
                  </div>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700">Get Started</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Enterprise
                  <Building2 className="h-5 w-5 text-gray-400" />
                </CardTitle>
                <div className="text-3xl font-bold">
                  ₦750,000<span className="text-lg font-normal text-gray-500">/month</span>
                </div>
                <CardDescription>For large Nigerian enterprises</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Unlimited data points</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">White-label solution</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Dedicated account manager</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">24/7 phone support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Custom integrations</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline" onClick={() => setShowContactSales(true)}>
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4">Security & Compliance</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Nigerian Data Protection Standards</h2>
            <p className="text-xl text-gray-600">
              Built for Nigerian businesses with full NDPR compliance and CBN guidelines adherence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">NDPR Compliant</h3>
                <p className="text-sm text-gray-600">Full compliance with Nigeria Data Protection Regulation</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Bank-Grade Security</h3>
                <p className="text-sm text-gray-600">Meets CBN cybersecurity guidelines for financial institutions</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Local Data Centers</h3>
                <p className="text-sm text-gray-600">Your data stays in Nigeria, hosted in Lagos data centers</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <FileCheck className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Audit Ready</h3>
                <p className="text-sm text-gray-600">Complete audit trails and compliance reporting</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* White Papers Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4">Resources</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Nigerian Business Intelligence Guides</h2>
            <p className="text-xl text-gray-600">
              Free resources tailored for Nigerian businesses and market conditions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Data Analytics for Nigerian SMEs
                </CardTitle>
                <CardDescription>
                  Complete guide to implementing data analytics in small and medium Nigerian enterprises.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleWhitePaperDownload("Data Analytics for Nigerian SMEs")}
                >
                  Download Free Guide
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  NDPR Compliance Checklist
                </CardTitle>
                <CardDescription>
                  Essential checklist for ensuring your data practices comply with Nigerian regulations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleWhitePaperDownload("NDPR Compliance Checklist")}
                >
                  Download Checklist
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Nigerian Market Intelligence
                </CardTitle>
                <CardDescription>
                  Data-driven insights into Nigerian consumer behavior and market trends.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleWhitePaperDownload("Nigerian Market Intelligence")}
                >
                  Download Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Transform Your Nigerian Business with AI?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of Nigerian businesses already using DaytaTech to make data-driven decisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-green-600"
              onClick={() => setShowContactSales(true)}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Logo />
              <p className="text-gray-400 mt-4">AI-powered data analytics for Nigerian businesses.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-white">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy
                  </Link>
                </li>
                <li>
                  <button onClick={() => setShowContactSupport(true)} className="hover:text-white">
                    Contact Support
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Nigerian Office</h3>
              <p className="text-gray-400">
                Lagos, Nigeria
                <br />
                support@daytatech.ai
                <br />
                +234 (0) 123 456 7890
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 DaytaTech Nigeria. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ContactSalesDialog isOpen={showContactSales} onClose={() => setShowContactSales(false)} />
      {showContactSupport && <ContactSupportModal onClose={() => setShowContactSupport(false)} />}
    </div>
  )
}
