"use client"

import { Globe, Database, Lock, Shield, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PricingCard } from "@/components/pricing-card"
import { Footer } from "@/components/footer"

export default function IndexPage() {
  return (
    <>
      <section className="w-full pt-12 md:pt-24 lg:pt-32 bg-gradient-to-b from-white to-gray-100">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                New
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                The AI Platform for Data-Driven Teams
              </h1>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                DaytaTech.ai is the AI platform that helps data-driven teams generate insights, automate tasks, and
                build AI-powered applications.
              </p>
            </div>
            <div className="flex gap-4">
              <Button size="lg">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                Book a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 items-center grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                  Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Everything you need to build AI-powered applications
                </h2>
                <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed">
                  From data ingestion to model deployment, DaytaTech.ai provides the tools and infrastructure you need
                  to build AI-powered applications.
                </p>
              </div>
              <ul className="grid gap-2.5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Data Ingestion
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Model Training
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Model Deployment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Model Monitoring
                </li>
              </ul>
            </div>
            <div className="relative rounded-lg overflow-hidden border">
              <img
                src="/examples/card-example-1.png"
                alt="Card example 1"
                className="absolute inset-0 object-cover w-full h-full"
              />
            </div>
            <div className="relative rounded-lg overflow-hidden border">
              <img
                src="/examples/card-example-2.png"
                alt="Card example 2"
                className="absolute inset-0 object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                Pricing
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Choose the plan that's right for you</h2>
              <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed">
                Whether you're a small team or a large enterprise, we have a plan that's right for you.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PricingCard
                title="Free"
                description="Get started with our free plan."
                price="Free"
                features={["Up to 2 team members", "Up to 100 API requests per month", "Basic support"]}
                cta="Get Started"
              />
              <PricingCard
                title="Team"
                description="For small teams who need more features."
                price="$99/month"
                features={["Up to 5 team members", "Up to 1,000 API requests per month", "Priority support"]}
                cta="Get Started"
              />
              <PricingCard
                title="Enterprise"
                description="For large enterprises who need custom solutions."
                price="Contact Us"
                features={[
                  "Unlimited team members",
                  "Unlimited API requests per month",
                  "24/7 support",
                  "Custom integrations",
                ]}
                cta="Contact Us"
              />
            </div>
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

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                Contact
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Need help? Contact our support team</h2>
              <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed">
                Our support team is available 24/7 to help you with any questions you may have.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
