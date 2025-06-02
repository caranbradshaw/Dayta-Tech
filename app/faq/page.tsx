import Link from "next/link"
import {
  ArrowLeft,
  Database,
  Lock,
  Shield,
  AlertTriangle,
  Wifi,
  CreditCard,
  HelpCircle,
  MessageSquare,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FAQPage() {
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex items-center mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Frequently Asked Questions</h1>
          <p className="mt-4 text-lg text-gray-500">
            Detailed answers to your questions about DaytaTech's technology, security, and data handling
          </p>
        </div>

        <Tabs defaultValue="database" className="mb-12">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="database">Database & Storage</TabsTrigger>
            <TabsTrigger value="security">Security & Compliance</TabsTrigger>
            <TabsTrigger value="historical">Historical Data</TabsTrigger>
            <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
          </TabsList>

          <TabsContent value="database" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-purple-600" />
                    How does DaytaTech's database infrastructure work?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    DaytaTech is built on Supabase, a robust PostgreSQL database platform that provides enterprise-grade
                    reliability and performance. Here's how our database infrastructure works:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>
                      <strong>PostgreSQL Foundation:</strong> We use PostgreSQL, the world's most advanced open-source
                      relational database, known for its reliability, feature robustness, and performance.
                    </li>
                    <li>
                      <strong>Row-Level Security (RLS):</strong> Every piece of data has granular access controls that
                      ensure users can only access their own data or data explicitly shared with them.
                    </li>
                    <li>
                      <strong>Isolated Tenancy:</strong> Each customer's data is logically isolated through schema
                      separation and security policies, preventing cross-customer data access.
                    </li>
                    <li>
                      <strong>Automated Backups:</strong> We perform point-in-time recovery backups every 24 hours with
                      transaction logs backed up every 60 seconds.
                    </li>
                    <li>
                      <strong>Geo-Replication:</strong> Enterprise customers can opt for multi-region data replication
                      for enhanced availability and disaster recovery.
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What happens to my data when I upload files?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    When you upload files to DaytaTech, the following process occurs:
                  </p>
                  <ol className="list-decimal pl-6 space-y-2 text-gray-600">
                    <li>
                      <strong>Secure Upload:</strong> Your file is encrypted during transit using TLS 1.3.
                    </li>
                    <li>
                      <strong>Initial Processing:</strong> The file is temporarily stored in an isolated processing
                      environment.
                    </li>
                    <li>
                      <strong>Data Extraction:</strong> Our system extracts the relevant data points while applying any
                      configured PII detection and masking rules.
                    </li>
                    <li>
                      <strong>Analysis Generation:</strong> The AI generates insights, summaries, and recommendations
                      based on the extracted data.
                    </li>
                    <li>
                      <strong>Metadata Storage:</strong> Only the analysis results and file metadata are stored in the
                      database—not your raw data files (unless specifically requested for enterprise accounts).
                    </li>
                    <li>
                      <strong>Secure Cleanup:</strong> The original file is securely deleted from the processing
                      environment after analysis is complete.
                    </li>
                  </ol>
                  <p className="mt-4 text-gray-700">
                    For enterprise customers with data retention requirements, we offer configurable retention policies
                    and secure long-term storage options.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Can I export or delete my data?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">Yes, you have complete control over your data:</p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>
                      <strong>Data Export:</strong> You can export all your analysis results, insights, and account data
                      at any time through the Settings panel.
                    </li>
                    <li>
                      <strong>Export Formats:</strong> Exports are available in CSV, JSON, and PDF formats.
                    </li>
                    <li>
                      <strong>Data Deletion:</strong> You can delete individual analyses or your entire account data
                      through the Settings panel.
                    </li>
                    <li>
                      <strong>Deletion Confirmation:</strong> When you delete data, we provide a confirmation and a
                      30-day recovery window (unless immediate deletion is requested).
                    </li>
                    <li>
                      <strong>Complete Removal:</strong> After the recovery window or upon immediate deletion request,
                      your data is permanently removed from our systems, including all backups (within 90 days for
                      backups).
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    How does DaytaTech handle HIPAA compliance?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    DaytaTech is designed to meet HIPAA compliance requirements for healthcare organizations:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>
                      <strong>Business Associate Agreement (BAA):</strong> We offer signed BAAs for healthcare customers
                      on Enterprise plans.
                    </li>
                    <li>
                      <strong>PHI Protection:</strong> Our platform includes specialized detection and handling for
                      Protected Health Information (PHI).
                    </li>
                    <li>
                      <strong>Automatic PHI Detection:</strong> Our AI can identify 18 HIPAA-defined PHI identifiers and
                      apply appropriate masking or encryption.
                    </li>
                    <li>
                      <strong>Access Controls:</strong> Granular role-based access controls ensure PHI is only
                      accessible to authorized personnel.
                    </li>
                    <li>
                      <strong>Audit Trails:</strong> Comprehensive audit logging tracks all PHI access, modifications,
                      and exports.
                    </li>
                    <li>
                      <strong>Encryption:</strong> All PHI is encrypted at rest using AES-256 and in transit using TLS
                      1.3.
                    </li>
                    <li>
                      <strong>Secure Processing:</strong> PHI processing occurs in isolated, HIPAA-compliant
                      environments.
                    </li>
                    <li>
                      <strong>Breach Notification:</strong> Our platform includes built-in breach detection and
                      notification procedures.
                    </li>
                  </ul>
                  <p className="mt-4 text-sm text-gray-500 italic">
                    Note: HIPAA compliance features are available on Enterprise plans only. Standard plans are not
                    suitable for PHI processing.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-purple-600" />
                    How does DaytaTech handle PII and sensitive data?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    DaytaTech employs multiple layers of protection for Personally Identifiable Information (PII):
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>
                      <strong>Automatic PII Detection:</strong> Our AI automatically identifies common PII elements like
                      names, addresses, phone numbers, email addresses, SSNs, and more.
                    </li>
                    <li>
                      <strong>Configurable PII Handling:</strong> Customers can choose how PII should be handled:
                      <ul className="list-disc pl-6 mt-2">
                        <li>
                          <strong>Masking:</strong> Replace PII with asterisks or redacted labels
                        </li>
                        <li>
                          <strong>Tokenization:</strong> Replace PII with consistent tokens for analysis
                        </li>
                        <li>
                          <strong>Encryption:</strong> Encrypt PII while maintaining ability to process
                        </li>
                        <li>
                          <strong>Removal:</strong> Completely remove PII from analysis
                        </li>
                      </ul>
                    </li>
                    <li>
                      <strong>Data Minimization:</strong> We only extract and store the minimum data needed for
                      analysis.
                    </li>
                    <li>
                      <strong>PII Access Controls:</strong> Access to unmasked PII requires specific permissions and is
                      fully audited.
                    </li>
                    <li>
                      <strong>Geographic Data Controls:</strong> Enterprise customers can specify geographic regions for
                      PII processing to meet data sovereignty requirements.
                    </li>
                  </ul>
                  <p className="mt-4 text-gray-700">
                    Our platform is designed to comply with global privacy regulations including GDPR, CCPA, LGPD, and
                    others.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What security certifications does DaytaTech maintain?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    DaytaTech maintains a comprehensive set of security certifications and compliance attestations:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Core Certifications</h4>
                      <ul className="list-disc pl-6 space-y-1 text-gray-600">
                        <li>SOC 2 Type II</li>
                        <li>ISO 27001:2013</li>
                        <li>HIPAA Compliance (Enterprise)</li>
                        <li>GDPR Compliance</li>
                        <li>CCPA Compliance</li>
                      </ul>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Industry-Specific</h4>
                      <ul className="list-disc pl-6 space-y-1 text-gray-600">
                        <li>HITRUST (Healthcare)</li>
                        <li>PCI DSS (Payment)</li>
                        <li>FINRA (Financial)</li>
                        <li>FedRAMP Moderate (Government)</li>
                        <li>FERPA (Education)</li>
                      </ul>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-700">
                    Our security team conducts regular penetration testing, vulnerability assessments, and third-party
                    security audits. All certification reports are available to Enterprise customers upon request.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="historical" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>How does DaytaTech's historical data tracking work?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    DaytaTech provides comprehensive historical data tracking through our audit and activity system:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>
                      <strong>Activity Logging:</strong> Every significant action in the system is logged with details
                      including:
                      <ul className="list-disc pl-6 mt-2">
                        <li>User identification</li>
                        <li>Timestamp (with timezone)</li>
                        <li>Action type</li>
                        <li>Affected resources</li>
                        <li>IP address and device information</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Change Tracking:</strong> For data modifications, we store both the previous and new
                      values to create a complete audit trail.
                    </li>
                    <li>
                      <strong>File Activity History:</strong> All file operations (uploads, analyses, exports,
                      deletions) are tracked with detailed metadata.
                    </li>
                    <li>
                      <strong>Account Changes:</strong> Changes to account settings, permissions, and user management
                      are comprehensively logged.
                    </li>
                    <li>
                      <strong>Immutable Logs:</strong> Activity logs cannot be modified or deleted, even by
                      administrators, ensuring a tamper-proof audit trail.
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Who can access historical data and activity logs?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Access to historical data and activity logs is strictly controlled:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-600">
                    <li>
                      <strong>Individual Users:</strong> Can only view their own activity history and the history of
                      resources they own.
                    </li>
                    <li>
                      <strong>Team Administrators:</strong> Can view activity logs for all team members and resources
                      within their team.
                    </li>
                    <li>
                      <strong>Organization Administrators:</strong> Can access organization-wide activity logs and audit
                      trails.
                    </li>
                    <li>
                      <strong>Support Staff:</strong> DaytaTech support staff can only access customer data with
                      explicit permission or through time-limited, audited support sessions.
                    </li>
                  </ul>
                  <p className="mt-4 text-gray-700">
                    All historical data access is itself logged, creating a complete chain of custody for sensitive
                    information.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How long is historical data retained?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Our historical data retention policies are designed to balance compliance requirements with privacy
                    best practices:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Basic Plan
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pro Plan
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Enterprise Plan
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            User Activity Logs
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">30 days</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">90 days</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            Customizable (1-7 years)
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            Account Changes
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">1 year</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">2 years</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            Customizable (1-7 years)
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            File Activities
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">90 days</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">1 year</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            Customizable (1-7 years)
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            Analysis Results
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">1 year</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">3 years</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            Customizable (1-10 years)
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            Security Audit Logs
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">1 year</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">2 years</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            Customizable (1-7 years)
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-4 text-gray-700">
                    Enterprise customers can configure custom retention policies to meet specific regulatory
                    requirements such as HIPAA (7 years), financial regulations, or internal compliance policies.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="troubleshooting" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Common Upload and Processing Errors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-semibold text-red-700">Error: "File too large"</h4>
                      <p className="text-gray-700 mt-1">
                        <strong>Cause:</strong> Your file exceeds the maximum size limit for your plan.
                      </p>
                      <p className="text-gray-700 mt-1">
                        <strong>Solution:</strong>
                      </p>
                      <ul className="list-disc pl-6 mt-2 text-gray-600">
                        <li>Basic Plan: Maximum 50MB per file</li>
                        <li>Pro Plan: Maximum 500MB per file</li>
                        <li>Enterprise Plan: Maximum 5GB per file</li>
                        <li>Try compressing your file or splitting large datasets into smaller chunks</li>
                        <li>Consider upgrading your plan for larger file support</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h4 className="font-semibold text-yellow-700">Error: "Unsupported file format"</h4>
                      <p className="text-gray-700 mt-1">
                        <strong>Supported formats:</strong> CSV, Excel (.xlsx, .xls), JSON, TSV, Parquet
                      </p>
                      <p className="text-gray-700 mt-1">
                        <strong>Solution:</strong> Convert your file to one of the supported formats. Most data can be
                        exported as CSV from other applications.
                      </p>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-blue-700">Error: "Analysis failed - insufficient data"</h4>
                      <p className="text-gray-700 mt-1">
                        <strong>Cause:</strong> Your file doesn't contain enough data points for meaningful analysis.
                      </p>
                      <p className="text-gray-700 mt-1">
                        <strong>Solution:</strong> Ensure your file has at least 10 rows of data and multiple columns
                        for analysis.
                      </p>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-purple-700">Error: "Processing timeout"</h4>
                      <p className="text-gray-700 mt-1">
                        <strong>Cause:</strong> Large or complex files may take longer to process than the timeout
                        limit.
                      </p>
                      <p className="text-gray-700 mt-1">
                        <strong>Solution:</strong>
                      </p>
                      <ul className="list-disc pl-6 mt-2 text-gray-600">
                        <li>Try uploading during off-peak hours</li>
                        <li>Simplify your data by removing unnecessary columns</li>
                        <li>Contact support for priority processing (Pro/Enterprise plans)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="h-5 w-5 text-blue-600" />
                    Connection and Access Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-semibold text-red-700">Error: "Unable to connect to server"</h4>
                      <p className="text-gray-700 mt-1">
                        <strong>Troubleshooting steps:</strong>
                      </p>
                      <ol className="list-decimal pl-6 mt-2 text-gray-600">
                        <li>Check your internet connection</li>
                        <li>Try refreshing the page</li>
                        <li>Clear your browser cache and cookies</li>
                        <li>Try using an incognito/private browsing window</li>
                        <li>Check if your firewall or corporate network is blocking the connection</li>
                        <li>Try accessing from a different network or device</li>
                      </ol>
                    </div>

                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h4 className="font-semibold text-yellow-700">Error: "Session expired"</h4>
                      <p className="text-gray-700 mt-1">
                        <strong>Solution:</strong> Your login session has expired for security reasons. Simply log in
                        again to continue.
                      </p>
                      <p className="text-gray-700 mt-1">
                        <strong>Prevention:</strong> Enable "Remember me" when logging in to extend session duration.
                      </p>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-blue-700">Error: "Access denied"</h4>
                      <p className="text-gray-700 mt-1">
                        <strong>Possible causes:</strong>
                      </p>
                      <ul className="list-disc pl-6 mt-2 text-gray-600">
                        <li>You don't have permission to access this resource</li>
                        <li>Your account has been suspended (check your email for notifications)</li>
                        <li>You're trying to access a feature not included in your plan</li>
                        <li>Your trial period has expired</li>
                      </ul>
                      <p className="text-gray-700 mt-2">
                        <strong>Solution:</strong> Contact your account administrator or upgrade your plan.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    Billing and Account Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-semibold text-red-700">Error: "Payment failed"</h4>
                      <p className="text-gray-700 mt-1">
                        <strong>Common causes and solutions:</strong>
                      </p>
                      <ul className="list-disc pl-6 mt-2 text-gray-600">
                        <li>
                          <strong>Expired card:</strong> Update your payment method in Settings → Payment Info
                        </li>
                        <li>
                          <strong>Insufficient funds:</strong> Ensure your account has sufficient balance
                        </li>
                        <li>
                          <strong>Bank decline:</strong> Contact your bank to authorize the transaction
                        </li>
                        <li>
                          <strong>Incorrect details:</strong> Verify your billing address matches your card
                        </li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h4 className="font-semibold text-yellow-700">Error: "Usage limit exceeded"</h4>
                      <p className="text-gray-700 mt-1">
                        <strong>What this means:</strong> You've reached your monthly limit for reports, exports, or
                        file uploads.
                      </p>
                      <p className="text-gray-700 mt-1">
                        <strong>Solutions:</strong>
                      </p>
                      <ul className="list-disc pl-6 mt-2 text-gray-600">
                        <li>Wait until next month for limits to reset</li>
                        <li>Upgrade to a higher plan for increased limits</li>
                        <li>Purchase additional credits (Pro/Enterprise plans)</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-blue-700">Error: "Trial expired"</h4>
                      <p className="text-gray-700 mt-1">
                        <strong>Solution:</strong> Your free trial has ended. Choose a paid plan to continue using
                        DaytaTech.
                      </p>
                      <p className="text-gray-700 mt-1">
                        <strong>Note:</strong> Your data and analyses are preserved for 30 days after trial expiration.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-purple-600" />
                    Data Quality and Analysis Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <h4 className="font-semibold text-yellow-700">Issue: "Analysis results seem inaccurate"</h4>
                      <p className="text-gray-700 mt-1">
                        <strong>Troubleshooting steps:</strong>
                      </p>
                      <ol className="list-decimal pl-6 mt-2 text-gray-600">
                        <li>Check your data for missing values, duplicates, or formatting issues</li>
                        <li>Ensure column headers are descriptive and properly formatted</li>
                        <li>Verify that date columns are in a standard format (YYYY-MM-DD)</li>
                        <li>Remove or clean any special characters in numeric columns</li>
                        <li>Try re-uploading with cleaned data</li>
                      </ol>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-blue-700">Issue: "Missing insights or recommendations"</h4>
                      <p className="text-gray-700 mt-1">
                        <strong>Possible reasons:</strong>
                      </p>
                      <ul className="list-disc pl-6 mt-2 text-gray-600">
                        <li>Dataset is too small (less than 50 rows)</li>
                        <li>Data lacks patterns or trends to analyze</li>
                        <li>All columns contain the same data type (need mix of categorical and numerical)</li>
                        <li>Data is too clean/uniform for meaningful insights</li>
                      </ul>
                      <p className="text-gray-700 mt-2">
                        <strong>Solution:</strong> Try uploading a larger, more diverse dataset or contact support for
                        guidance.
                      </p>
                    </div>

                    <div className="border-l-4 border-green-500 pl-4">
                      <h4 className="font-semibold text-green-700">Best Practices for Better Results</h4>
                      <ul className="list-disc pl-6 mt-2 text-gray-600">
                        <li>Include at least 100 rows of data when possible</li>
                        <li>Mix categorical and numerical columns</li>
                        <li>Use clear, descriptive column headers</li>
                        <li>Include time-series data when available</li>
                        <li>Remove completely empty rows and columns</li>
                        <li>Ensure consistent data formatting within columns</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Getting Additional Help
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">When to Contact Support</h4>
                      <ul className="list-disc pl-6 text-blue-700">
                        <li>Error persists after trying troubleshooting steps</li>
                        <li>You need help with data preparation or formatting</li>
                        <li>Questions about specific analysis results</li>
                        <li>Account or billing issues that can't be resolved in settings</li>
                        <li>Feature requests or technical questions</li>
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Support Channels</h4>
                        <ul className="space-y-2 text-gray-600">
                          <li>
                            <strong>Email:</strong> support@daytatech.com
                          </li>
                          <li>
                            <strong>Live Chat:</strong> Available in-app (Pro/Enterprise)
                          </li>
                          <li>
                            <strong>Phone:</strong> Enterprise customers only
                          </li>
                          <li>
                            <strong>Help Center:</strong> help.daytatech.com
                          </li>
                        </ul>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Response Times</h4>
                        <ul className="space-y-2 text-gray-600">
                          <li>
                            <strong>Basic:</strong> 24-48 hours
                          </li>
                          <li>
                            <strong>Pro:</strong> 12-24 hours
                          </li>
                          <li>
                            <strong>Enterprise:</strong> 2-4 hours
                          </li>
                          <li>
                            <strong>Critical Issues:</strong> 1 hour (Enterprise)
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Before Contacting Support</h4>
                      <p className="text-gray-700 mb-2">To help us assist you faster, please include:</p>
                      <ul className="list-disc pl-6 text-gray-600">
                        <li>Your account email address</li>
                        <li>Description of the issue and when it started</li>
                        <li>Steps you've already tried</li>
                        <li>Screenshots of any error messages</li>
                        <li>Browser and operating system information</li>
                        <li>File details (size, format, number of rows/columns) if relevant</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-purple-50 rounded-lg p-6 mb-12">
          <h3 className="text-xl font-semibold mb-4">Still have questions?</h3>
          <p className="text-gray-700 mb-4">
            Our security and compliance team is available to answer any specific questions about our data handling,
            security practices, or compliance certifications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/contact">
              <Button className="w-full sm:w-auto">Contact Support</Button>
            </Link>
            <Link href="/resources/security-whitepaper">
              <Button variant="outline" className="w-full sm:w-auto">
                Download Security Whitepaper
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
