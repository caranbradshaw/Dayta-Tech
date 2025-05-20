import Link from "next/link"
import { BarChart3, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
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
            <Button variant="ghost" size="sm">
              Help
            </Button>
            <Button variant="ghost" size="sm">
              Account
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
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="industry">Industry</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
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
                      <Label htmlFor="first-name">First name</Label>
                      <Input id="first-name" placeholder="Enter your first name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last name</Label>
                      <Input id="last-name" placeholder="Enter your last name" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Enter your email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" placeholder="Enter your company name" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="ml-auto">
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
                    <Select>
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
                  <Button className="ml-auto">
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
          </Tabs>
        </div>
      </main>
    </div>
  )
}
