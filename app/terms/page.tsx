"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <BarChart3 className="h-6 w-6 text-purple-600" />
            <span className="text-xl font-bold">DaytaTech</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => router.push("/#features")}
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Features
            </button>
            <button
              onClick={() => router.push("/#pricing")}
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Pricing
            </button>
            <button
              onClick={() => router.push("/#faq")}
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              FAQ
            </button>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
              Log in
            </Button>
            <Button size="sm" onClick={() => router.push("/signup")}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to DaytaTech Home
          </button>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
              <p className="text-gray-500">
                Last updated:{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-800 mb-2">Important Legal Notice</h3>
              <p className="text-yellow-700 text-sm">
                By using DaytaTech's services, you agree to be legally bound by these terms. Please read carefully
                before proceeding.
              </p>
            </div>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing, browsing, or using DaytaTech's website, mobile application, or services ("Service"), you
                acknowledge that you have read, understood, and agree to be bound by these Terms of Service ("Terms")
                and our Privacy Policy. If you do not agree to these Terms, you must not use our Service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                These Terms constitute a legally binding agreement between you ("User," "you," or "your") and DaytaTech,
                LLC ("Company," "we," "us," or "our"), a Georgia limited liability company located at 831 Auburn Rd Ste
                210 #3077, Dacula, GA 30019.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                DaytaTech provides artificial intelligence-powered data analysis and insights services ("Service"). Our
                platform allows users to upload data files and receive automated analysis, visualizations, and business
                insights through AI technology.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Service Limitations:</strong> Our Service is provided "as-is" and we make no guarantees about
                the accuracy, completeness, or reliability of any analysis, insights, or recommendations provided. Users
                are solely responsible for validating and acting upon any information provided by our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Eligibility</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Eligibility Requirements</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>You must be at least 18 years old to use our Service</li>
                    <li>You must have the legal capacity to enter into binding contracts</li>
                    <li>You must not be prohibited from using our Service under applicable laws</li>
                    <li>You must provide accurate and complete registration information</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Account Security</h3>
                  <p className="text-gray-700 leading-relaxed">
                    You are solely responsible for maintaining the confidentiality of your account credentials and for
                    all activities that occur under your account. You must immediately notify us of any unauthorized use
                    of your account or any other breach of security.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use Policy</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Prohibited Uses</h3>
                  <p className="text-gray-700 mb-3">You agree NOT to use our Service for any of the following:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Any unlawful purpose or to solicit others to perform unlawful acts</li>
                    <li>
                      Violating any international, federal, provincial, or state regulations, rules, laws, or local
                      ordinances
                    </li>
                    <li>
                      Infringing upon or violating our intellectual property rights or the intellectual property rights
                      of others
                    </li>
                    <li>
                      Harassing, abusing, insulting, harming, defaming, slandering, disparaging, intimidating, or
                      discriminating
                    </li>
                    <li>Submitting false or misleading information</li>
                    <li>Uploading or transmitting viruses or any other type of malicious code</li>
                    <li>Collecting or tracking personal information of others without consent</li>
                    <li>Spamming, phishing, pharming, pretexting, spidering, crawling, or scraping</li>
                    <li>Any obscene or immoral purpose or to encourage others to perform such acts</li>
                    <li>Interfering with or circumventing security features of our Service</li>
                    <li>Reverse engineering, decompiling, or attempting to extract source code</li>
                    <li>Using our Service to compete with us or create a competing service</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data and Content Ownership</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Data</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    You retain ownership of all data, files, and content you upload to our Service ("User Content").
                    However, by uploading User Content, you grant us a limited, non-exclusive, royalty-free license to
                    process, analyze, and store your data solely for the purpose of providing our Service.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    <strong>Data Responsibility:</strong> You are solely responsible for ensuring you have the right to
                    upload and process any data through our Service. You warrant that your User Content does not violate
                    any third-party rights or applicable laws.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Our Intellectual Property</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Our Service, including all software, algorithms, designs, text, graphics, and other content, is
                    owned by DaytaTech and protected by intellectual property laws. You may not copy, modify,
                    distribute, sell, or lease any part of our Service without our express written permission.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Payment Terms and Billing</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Subscription Fees</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>All fees are non-refundable unless otherwise stated</li>
                    <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                    <li>We reserve the right to change our pricing with 30 days' notice</li>
                    <li>Failure to pay fees may result in service suspension or termination</li>
                    <li>You are responsible for all taxes associated with your use of our Service</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Free Trial Terms</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Free trials are limited to one per customer and may be subject to usage limitations. We reserve the
                    right to terminate free trials at any time without notice.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Disclaimers and Limitation of Liability</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
                <h3 className="font-semibold text-red-800 mb-2">IMPORTANT LEGAL DISCLAIMERS</h3>
                <p className="text-red-700 text-sm">
                  The following sections limit our liability and disclaim warranties. Please read carefully.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Service Disclaimers</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    <strong>
                      OUR SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EITHER
                      EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
                    </strong>
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Warranties of merchantability, fitness for a particular purpose, or non-infringement</li>
                    <li>Warranties that the Service will be uninterrupted, secure, or error-free</li>
                    <li>Warranties regarding the accuracy, reliability, or completeness of any analysis or insights</li>
                    <li>Warranties that defects will be corrected or that the Service is free of viruses</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Limitation of Liability</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    <strong>
                      TO THE MAXIMUM EXTENT PERMITTED BY LAW, DAYTATECH SHALL NOT BE LIABLE FOR ANY INDIRECT,
                      INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
                    </strong>
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
                    <li>Damages resulting from unauthorized access to or alteration of your data</li>
                    <li>Damages resulting from any reliance on analysis or insights provided by our Service</li>
                    <li>Damages resulting from business decisions made based on our Service</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-3">
                    <strong>
                      OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS
                      PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.
                    </strong>
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree to defend, indemnify, and hold harmless DaytaTech, its officers, directors, employees, agents,
                and affiliates from and against any and all claims, damages, obligations, losses, liabilities, costs, or
                debt, and expenses (including but not limited to attorney's fees) arising from:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Your use of and access to our Service</li>
                <li>Your violation of any term of these Terms</li>
                <li>Your violation of any third-party right, including intellectual property or privacy rights</li>
                <li>Any claim that your User Content caused damage to a third party</li>
                <li>Any business decisions made based on analysis or insights from our Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Termination by You</h3>
                  <p className="text-gray-700 leading-relaxed">
                    You may terminate your account at any time by contacting us. Upon termination, your right to use our
                    Service will cease immediately.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Termination by Us</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    We may terminate or suspend your account immediately, without prior notice or liability, for any
                    reason, including but not limited to:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Breach of these Terms</li>
                    <li>Non-payment of fees</li>
                    <li>Violation of our Acceptable Use Policy</li>
                    <li>Fraudulent or illegal activity</li>
                    <li>At our sole discretion for any reason</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Effect of Termination</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Upon termination, we may delete your account and all associated data. We are not obligated to retain
                    any User Content after termination.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Dispute Resolution and Arbitration</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
                <h3 className="font-semibold text-blue-800 mb-2">Mandatory Arbitration Clause</h3>
                <p className="text-blue-700 text-sm">
                  This section requires binding arbitration for most disputes and waives your right to a jury trial.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Binding Arbitration</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    Any dispute, claim, or controversy arising out of or relating to these Terms or your use of our
                    Service shall be settled by binding arbitration administered by the American Arbitration Association
                    (AAA) under its Commercial Arbitration Rules.
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li>Arbitration will be conducted in Atlanta, Georgia</li>
                    <li>The arbitrator's decision will be final and binding</li>
                    <li>You waive your right to a jury trial</li>
                    <li>You waive your right to participate in class action lawsuits</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Exceptions</h3>
                  <p className="text-gray-700 leading-relaxed">
                    This arbitration clause does not apply to claims for injunctive relief, intellectual property
                    disputes, or small claims court actions under $10,000.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law and Jurisdiction</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the State of Georgia,
                without regard to its conflict of law principles. Any legal action or proceeding not subject to
                arbitration shall be brought exclusively in the state or federal courts located in Gwinnett County,
                Georgia.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Force Majeure</h2>
              <p className="text-gray-700 leading-relaxed">
                We shall not be liable for any failure or delay in performance under these Terms due to circumstances
                beyond our reasonable control, including but not limited to acts of God, war, terrorism, pandemic,
                government regulations, natural disasters, or internet service provider failures.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Severability and Waiver</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall
                remain in full force and effect. Our failure to enforce any right or provision of these Terms shall not
                constitute a waiver of such right or provision.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Modifications to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of material changes by
                email or through our Service. Your continued use of our Service after such modifications constitutes
                acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Entire Agreement</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and DaytaTech
                regarding your use of our Service and supersede all prior agreements and understandings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Contact Information</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-3">
                  <strong>General Inquiries:</strong>{" "}
                  <a href="mailto:caran@daytatech.ai" className="text-purple-600 hover:underline">
                    caran@daytatech.ai
                  </a>
                </p>
                <p className="text-gray-700 mb-3">
                  <strong>Mailing Address:</strong>
                  <br />
                  DaytaTech, LLC
                  <br />
                  831 Auburn Rd Ste 210 #3077
                  <br />
                  Dacula, GA 30019
                  <br />
                  United States
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong>{" "}
                  <a href="tel:+18663356505" className="text-purple-600 hover:underline">
                    866-335-6505
                  </a>
                </p>
              </div>
            </section>

            <div className="bg-gray-100 p-6 rounded-lg mt-8">
              <p className="text-sm text-gray-600 text-center">
                By using DaytaTech's services, you acknowledge that you have read, understood, and agree to be bound by
                these Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <BarChart3 className="h-6 w-6 text-purple-600" />
            <span className="text-lg font-bold">DaytaTech</span>
          </div>
          <p className="text-center text-sm text-gray-500 md:text-left">© 2025 DaytaTech, LLC. All rights reserved.</p>
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/terms")}
              className="text-sm text-gray-500 hover:underline underline-offset-4"
            >
              Terms
            </button>
            <button
              onClick={() => router.push("/privacy")}
              className="text-sm text-gray-500 hover:underline underline-offset-4"
            >
              Privacy
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
