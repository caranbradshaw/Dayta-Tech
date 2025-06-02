"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BarChart3, Save, HelpCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { UpgradeAccountModal } from "@/components/upgrade-account-modal"
import { ContactSupportModal } from "@/components/contact-support-modal"
import { PaymentInfoCard } from "@/components/payment-info-card"
import { UsageStatsCard } from "@/components/usage-stats-card"
import { AccountSecurityCard } from "@/components/account-security-card"

interface UserData {
  name: string
  email: string
  industry: string
  company: string
}

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    industry: "",
  })

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const userDataStr = localStorage.getItem("daytaTechUser")

    if (userDataStr) {
      try {
        const parsedUserData = JSON.parse(userDataStr)
        setUserData(parsedUserData)

        // Split name into first and last name
        const nameParts = parsedUserData.name.split(" ")
        const firstName = nameParts[0]
        const lastName = nameParts.slice(1).join(" ")

        setFormData({
          firstName,
          lastName,
          email: parsedUserData.email,
          company: parsedUserData.company,
          industry: parsedUserData.industry,
        })
      } catch (error) {
        console.error("Failed to parse user data:", error)
      }
    } else {
      // Redirect to login if no user data found
      router.push("/login")
    }

    setIsLoading(false)
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleIndustryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, industry: value }))
  }

  const handleSaveProfile = () => {
    // Update user data in localStorage
    const updatedUserData = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      industry: formData.industry,
      company: formData.company,
    }

    localStorage.setItem("daytaTechUser", JSON.stringify(updatedUserData))
    setUserData(updatedUserData)

    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    })
  }

  const handleSaveIndustry = () => {
    // Update user data in localStorage
    if (userData) {
      const updatedUserData = {
        ...userData,
        industry: formData.industry,
      }

      localStorage.setItem("daytaTechUser", JSON.stringify(updatedUserData))
      setUserData(updatedUserData)

      toast({
        title: "Industry updated",
        description: "Your industry settings have been updated successfully.",
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("daytaTechUser")
    router.push("/")
  }

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (!userData) {
    return null // Will redirect to login
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
            <Link href="/dashboard" className="text-sm font-medium hover:underline underline-offset-4">
              Dashboard
            </Link>
            <Link href="/dashboard/history" className="text-sm font-medium hover:underline underline-offset-4">
              History
            </Link>
            <Link
              href="/dashboard/settings"
              className="text-sm font-medium text-purple-600 hover:underline underline-offset-4"
            >
              Settings
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium mr-2">Welcome, {userData.name.split(" ")[0]}</div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-gray-500">Manage your account and preferences.</p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-5">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your account information and how we contact you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Enter your company name"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="ml-auto" onClick={handleSaveProfile}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="industry" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Industry Settings</CardTitle>
                  <CardDescription>Select your industry to get more relevant insights from your data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={formData.industry} onValueChange={handleIndustryChange}>
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance & Banking</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="real-estate">Real Estate</SelectItem>
                        <SelectItem value="hospitality">Hospitality</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sub-industry">Sub-Industry (Optional)</Label>
                    <Input id="sub-industry" placeholder="E.g., SaaS, E-commerce, etc." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-size">Company Size</Label>
                    <Select>
                      <SelectTrigger id="company-size">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">201-500 employees</SelectItem>
                        <SelectItem value="501-1000">501-1000 employees</SelectItem>
                        <SelectItem value="1001+">1001+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="ml-auto" onClick={handleSaveIndustry}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Industry Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="preferences" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Preferences</CardTitle>
                  <CardDescription>Customize how DaytaTech analyzes and presents your data.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-format">Preferred Report Format</Label>
                    <Select>
                      <SelectTrigger id="report-format">
                        <SelectValue placeholder="Select report format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concise">Concise (Key points only)</SelectItem>
                        <SelectItem value="detailed">Detailed (In-depth analysis)</SelectItem>
                        <SelectItem value="visual">Visual (More charts and graphs)</SelectItem>
                        <SelectItem value="executive">Executive Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="key-metrics">Key Metrics Focus</Label>
                    <Select>
                      <SelectTrigger id="key-metrics">
                        <SelectValue placeholder="Select key metrics focus" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Revenue & Growth</SelectItem>
                        <SelectItem value="costs">Cost & Efficiency</SelectItem>
                        <SelectItem value="customers">Customer Metrics</SelectItem>
                        <SelectItem value="operations">Operational Metrics</SelectItem>
                        <SelectItem value="all">All Metrics (Balanced)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time-period">Default Time Period Focus</Label>
                    <Select>
                      <SelectTrigger id="time-period">
                        <SelectValue placeholder="Select time period focus" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short-term">Short-term (Days/Weeks)</SelectItem>
                        <SelectItem value="medium-term">Medium-term (Months/Quarters)</SelectItem>
                        <SelectItem value="long-term">Long-term (Years/Multi-year)</SelectItem>
                        <SelectItem value="all">All Time Periods</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="ml-auto">
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="account" className="mt-6">
              <div className="space-y-6">
                <PaymentInfoCard userData={userData} />
                <UsageStatsCard userData={userData} onUpgrade={() => setShowUpgradeModal(true)} />
              </div>
            </TabsContent>

            <TabsContent value="usage" className="mt-6">
              <UsageStatsCard userData={userData} onUpgrade={() => setShowUpgradeModal(true)} detailed />
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <AccountSecurityCard userData={userData} />
            </TabsContent>

            <TabsContent value="support" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>Get help with your account or technical issues.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => setShowSupportModal(true)} className="w-full">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Contact Support Team
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      {showUpgradeModal && (
        <UpgradeAccountModal
          onClose={() => setShowUpgradeModal(false)}
          onSuccess={() => {
            setShowUpgradeModal(false)
            // Refresh user data
            const updatedUserData = JSON.parse(localStorage.getItem("daytaTechUser") || "{}")
            setUserData(updatedUserData)
          }}
        />
      )}

      {showSupportModal && <ContactSupportModal onClose={() => setShowSupportModal(false)} />}
    </div>
  )
}
