"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"

export default function PrivacyPage() {
  const router = useRouter()

  const handleBackToHome = () => {
    router.push("/")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleBackToHome}>
            <Logo />
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={handleBackToHome} className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </button>
            <button onClick={handleBackToHome} className="text-sm font-medium hover:underline underline-offset-4">
              Pricing
            </button>
            <button onClick={handleBackToHome} className="text-sm font-medium hover:underline underline-offset-4">
              FAQ
            </button>
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

      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBackToHome}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to DaytaTech Home
          </button>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
              <p className="text-gray-500">
                Last updated:{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to DaytaTech ("we," "our," or "us"). We are committed to protecting your privacy and ensuring
                the security of your personal information. This Privacy Policy explains how we collect, use, disclose,
                and safeguard your information when you use our data analysis platform and services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Personal Information</h3>
              <p className="text-gray-700 mb-4">We may collect the following personal information:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6 ml-4">
                <li>Name and contact information (email address, phone number)</li>
                <li>Account credentials and authentication information</li>
                <li>Billing and payment information</li>
                <li>Company or organization details</li>
                <li>Profile information and preferences</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.2 Usage Data</h3>
              <p className="text-gray-700 mb-4">We automatically collect information about your use of our services:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6 ml-4">
                <li>Log data (IP address, browser type, operating system)</li>
                <li>Device information and unique identifiers</li>
                <li>Usage patterns and feature interactions</li>
                <li>Performance metrics and analytics data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">2.3 Data Files and Content</h3>
              <p className="text-gray-700">
                When you upload data files or create content using our platform, we process and store this information
                to provide our services. We treat your data with the highest level of security and confidentiality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use the collected information for the following purposes:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Providing and maintaining our data analysis services</li>
                <li>Processing your transactions and managing your account</li>
                <li>Generating AI-powered insights and recommendations</li>
                <li>Improving our platform and developing new features</li>
                <li>Communicating with you about your account and our services</li>
                <li>Providing customer support and technical assistance</li>
                <li>Ensuring security and preventing fraud</li>
                <li>Complying with legal obligations and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">4.1 We Do Not Sell Your Data</h3>
              <p className="text-gray-700 mb-4">
                We do not sell, rent, or trade your personal information to third parties for their marketing purposes.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">4.2 Limited Sharing</h3>
              <p className="text-gray-700 mb-4">We may share your information only in the following circumstances:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>
                  <strong>Service Providers:</strong> With trusted third-party vendors who assist in operating our
                  platform
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or to protect our rights and safety
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales
                </li>
                <li>
                  <strong>Consent:</strong> With your explicit consent for specific purposes
                </li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">4.3 Third-Party Service Providers</h3>
              <p className="text-gray-700 mb-4">
                We use trusted third-party service providers to operate our platform. These providers have access to
                your information only to perform specific tasks on our behalf and are obligated to protect your data:
              </p>

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Vercel (Hosting & Infrastructure)</h4>
                <p className="text-gray-700 text-sm mb-2">
                  Vercel hosts our application and processes your data to deliver our services. They implement
                  enterprise-grade security measures including:
                </p>
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 ml-4">
                  <li>SOC 2 Type II compliance and regular security audits</li>
                  <li>Data encryption in transit and at rest</li>
                  <li>DDoS protection and network security monitoring</li>
                  <li>GDPR and CCPA compliance frameworks</li>
                  <li>Data processing agreements that limit data use to service provision only</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Supabase (Database & Authentication)</h4>
                <p className="text-gray-700 text-sm mb-2">
                  Supabase provides our database and authentication services. They maintain strict data protection
                  standards:
                </p>
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 ml-4">
                  <li>SOC 2 Type II certified infrastructure</li>
                  <li>End-to-end encryption with AES-256 encryption at rest</li>
                  <li>Row Level Security (RLS) policies for data isolation</li>
                  <li>Regular penetration testing and security assessments</li>
                  <li>GDPR, CCPA, and HIPAA compliance capabilities</li>
                  <li>Data residency controls and geographic data storage options</li>
                  <li>Automated backups with point-in-time recovery</li>
                </ul>
              </div>

              <p className="text-gray-700 text-sm">
                Both providers are bound by strict data processing agreements that ensure your data is used solely for
                providing our services and is protected according to industry best practices and applicable privacy
                laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>End-to-end encryption for data transmission and storage</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure data centers with physical and digital safeguards</li>
                <li>Employee training on data protection and privacy practices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contact Us</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-3">
                  <strong>Privacy Officer Email:</strong>{" "}
                  <a href="mailto:caran@daytatech.ai" className="text-blue-600 hover:underline">
                    caran@daytatech.ai
                  </a>
                </p>
                <p className="text-gray-700 mb-3">
                  <strong>Mailing Address:</strong>
                  <br />
                  DaytaTech Privacy Office
                  <br />
                  831 Auburn Rd Ste 210 #3077
                  <br />
                  Dacula, GA 30019
                  <br />
                  United States
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong>{" "}
                  <a href="tel:+18663356505" className="text-blue-600 hover:underline">
                    866-335-6505
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleBackToHome}>
            <Logo />
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
