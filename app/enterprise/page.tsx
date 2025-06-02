"use client"

import Link from "next/link"
import { BarChart3, ArrowLeft, Crown, Shield, Users, Settings, Headphones, Building, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EnterpriseFeaturesCard } from "@/components/enterprise-features-card"
import { ContactSalesForm } from "@/components/contact-sales-form"

export default function EnterprisePage() {
  const comparisonFeatures = [
    { feature: "File Uploads", free: "5/month", pro: "Unlimited", team: "Unlimited", enterprise: "Unlimited" },
    { feature: "Team Members", free: "1", pro: "1", team: "Up to 5", enterprise: "Unlimited" },
    { feature: "File Size Limit", free: "50MB", pro: "100MB", team: "100MB", enterprise: "1GB" },
    { feature: "AI Insights", free: "Basic", pro: "Advanced", team: "Advanced", enterprise: "Advanced + Custom" },
    {
      feature: "File Formats",
      free: "CSV, Excel",
      pro: "All formats",
      team: "All formats",
      enterprise: "All formats + Custom",
    },
    { feature: "Industry Analysis", free: "❌", pro: "✅", team: "✅", enterprise: "✅ + Custom Models" },
    { feature: "Historical Learning", free: "❌", pro: "✅", team: "✅", enterprise: "✅ + Extended History" },
    { feature: "API Access", free: "❌", pro: "❌", team: "❌", enterprise: "Full API + Webhooks" },
    { feature: "Support", free: "Community", pro: "Email", team: "Priority Email", enterprise: "24/7 Dedicated" },
    { feature: "SLA", free: "❌", pro: "❌", team: "❌", enterprise: "99.9% Uptime" },
    { feature: "Custom Branding", free: "❌", pro: "❌", team: "❌", enterprise: "✅" },
    { feature: "On-premise Deployment", free: "❌", pro: "❌", team: "❌", enterprise: "✅" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-bold">DaytaTech</span>
            </Link>
            <Badge className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800">
              <Crown className="h-3 w-3 mr-1" />
              Enterprise
            </Badge>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/pricing" className="text-sm font-medium hover:underline underline-offset-4">
              Pricing
            </Link>
            <Link href="/demo" className="text-sm font-medium hover:underline underline-offset-4">
              Demo
            </Link>
            <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Crown className="h-4 w-4" />
            Enterprise Solution
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Enterprise-Grade
            <span className="bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
              {" "}
              Data Analytics
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Powerful data analytics platform designed for large organizations with advanced security, unlimited
            scalability, and dedicated support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700"
            >
              Contact Sales
            </Button>
            <Button size="lg" variant="outline">
              Schedule Demo
            </Button>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Enterprise Security</h3>
              <p className="text-sm text-gray-600">SOC 2 compliance, SSO, and advanced security features</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Unlimited Scale</h3>
              <p className="text-sm text-gray-600">Support for unlimited users and data processing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Headphones className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Dedicated Support</h3>
              <p className="text-sm text-gray-600">24/7 priority support with dedicated account manager</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Settings className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Custom Deployment</h3>
              <p className="text-sm text-gray-600">On-premise, private cloud, or hybrid deployment options</p>
            </CardContent>
          </Card>
        </div>

        {/* Enterprise Features */}
        <div className="mb-16">
          <EnterpriseFeaturesCard />
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Plan Comparison</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Feature</th>
                      <th className="text-center p-4 font-medium">Free</th>
                      <th className="text-center p-4 font-medium">Pro</th>
                      <th className="text-center p-4 font-medium">Team</th>
                      <th className="text-center p-4 font-medium bg-gradient-to-r from-yellow-50 to-orange-50">
                        <div className="flex items-center justify-center gap-1">
                          <Crown className="h-4 w-4 text-orange-600" />
                          Enterprise
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-4 font-medium">{row.feature}</td>
                        <td className="p-4 text-center text-sm">{row.free}</td>
                        <td className="p-4 text-center text-sm">{row.pro}</td>
                        <td className="p-4 text-center text-sm">{row.team}</td>
                        <td className="p-4 text-center text-sm bg-gradient-to-r from-yellow-50 to-orange-50 font-medium">
                          {row.enterprise}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Sales Section */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-6">
              Contact our enterprise sales team to discuss your organization's specific needs and get a custom quote.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="text-sm">Response within 24 hours</span>
              </div>
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-orange-600" />
                <span className="text-sm">Custom pricing and deployment options</span>
              </div>
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-orange-600" />
                <span className="text-sm">Dedicated implementation support</span>
              </div>
            </div>
          </div>
          <ContactSalesForm />
        </div>
      </main>
    </div>
  )
}
