"use client"

import { Shield, Lock, AlertTriangle, ArrowLeft, FileText, Download, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

export default function SecurityPage() {
  // Function to handle white paper downloads
  const handleDownload = (paperName: string) => {
    try {
      // Create comprehensive security white paper content
      const content = `# ${paperName}

## Executive Summary
This document provides a comprehensive overview of DaytaTech's security architecture, compliance certifications, and data protection measures.

## Table of Contents
1. Security Architecture Overview
2. Data Encryption Standards
3. Access Control Mechanisms
4. Compliance Certifications
5. Incident Response Procedures
6. Security Testing Methodology
7. Data Retention Policies

## Security Architecture
DaytaTech implements a multi-layered security architecture that includes:
- Network security with advanced firewalls and intrusion detection
- Application security with regular code reviews and penetration testing
- Data security with encryption at rest and in transit
- Operational security with strict access controls and audit logging

## Encryption Standards
- AES-256 encryption for all data at rest
- TLS 1.3 for all data in transit
- Key management using HSM (Hardware Security Modules)
- Regular key rotation and secure key storage

## Compliance Certifications
- SOC 2 Type II certified
- GDPR compliant
- ISO 27001 certified
- HIPAA compliant for healthcare data

## Contact Information
For security inquiries:
- Email: security@daytatech.ai
- Emergency: +1 (555) 123-4567

© 2025 DaytaTech. All rights reserved.`

      // Create the blob and trigger download
      const blob = new Blob([content], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)

      // Create and trigger download link
      const a = document.createElement("a")
      a.href = url
      a.download = `${paperName.replace(/\s+/g, "-").toLowerCase()}.md`
      document.body.appendChild(a)
      a.click()

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)

      // Show success message
      alert(
        `Downloading ${paperName}. If the download doesn't start automatically, please check your browser settings.`,
      )
    } catch (error) {
      console.error("Download error:", error)
      alert("There was an error downloading the white paper. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">DaytaTech.ai Security</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Enterprise-Grade Security</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Your data security is our top priority. We implement industry-leading security measures to protect your
            sensitive business information at every level.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Lock className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">End-to-End Encryption</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. Your sensitive
                information is protected at every step.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Access Control</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Role-based access control ensures only authorized personnel can access your data. Multi-factor
                authentication adds an extra layer of security.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle className="text-lg">Continuous Monitoring</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                24/7 security monitoring with automated threat detection and response. Regular vulnerability assessments
                keep your data safe.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* White Papers Section - NEW */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Security White Papers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* White Paper 1 */}
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-3">
                  <FileText className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <CardTitle className="text-lg font-medium">Data Security Architecture</CardTitle>
                    <CardDescription className="text-sm text-gray-500">PDF • 24 pages • 3.2 MB</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm text-gray-600">
                  A comprehensive overview of DaytaTech's multi-layered security architecture, encryption protocols, and
                  data protection measures.
                </p>
                <div className="mt-3 flex items-center text-xs text-gray-500">
                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                  <span>Updated June 2025</span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  onClick={() => handleDownload("Data Security Architecture")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download White Paper
                </Button>
              </CardFooter>
            </Card>

            {/* White Paper 2 */}
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-3">
                  <FileText className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <CardTitle className="text-lg font-medium">Compliance & Certifications</CardTitle>
                    <CardDescription className="text-sm text-gray-500">PDF • 18 pages • 2.8 MB</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm text-gray-600">
                  Detailed information about DaytaTech's compliance with industry standards including SOC 2, GDPR,
                  HIPAA, and ISO 27001.
                </p>
                <div className="mt-3 flex items-center text-xs text-gray-500">
                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                  <span>Updated May 2025</span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  onClick={() => handleDownload("Compliance & Certifications")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download White Paper
                </Button>
              </CardFooter>
            </Card>

            {/* White Paper 3 */}
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-3">
                  <FileText className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <CardTitle className="text-lg font-medium">AI Data Processing Security</CardTitle>
                    <CardDescription className="text-sm text-gray-500">PDF • 32 pages • 4.5 MB</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm text-gray-600">
                  How DaytaTech secures AI data processing pipelines, including data isolation, model security, and
                  privacy-preserving techniques.
                </p>
                <div className="mt-3 flex items-center text-xs text-gray-500">
                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                  <span>Updated June 2025</span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  onClick={() => handleDownload("AI Data Processing Security")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download White Paper
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Compliance Section */}
        <Card className="bg-white shadow-lg mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Compliance & Certifications</CardTitle>
            <CardDescription className="text-center text-lg">
              We meet the highest industry standards for data protection and privacy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="p-4">
                <div className="text-2xl font-bold text-blue-600 mb-2">SOC 2</div>
                <div className="text-sm text-gray-600">Type II Compliant</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-blue-600 mb-2">GDPR</div>
                <div className="text-sm text-gray-600">EU Compliant</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-blue-600 mb-2">HIPAA</div>
                <div className="text-sm text-gray-600">Healthcare Ready</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-blue-600 mb-2">ISO 27001</div>
                <div className="text-sm text-gray-600">Certified</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Questions About Security?</h3>
          <p className="text-gray-600 mb-6">
            Our security team is here to answer any questions about how we protect your data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="mailto:security@daytatech.ai">Contact Security Team</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
