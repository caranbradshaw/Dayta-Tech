import Link from "next/link"
import { BarChart3, Calendar, FileText, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function HistoryPage() {
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
            <Link
              href="/dashboard/history"
              className="text-sm font-medium text-purple-600 hover:underline underline-offset-4"
            >
              History
            </Link>
            <Link href="/dashboard/settings" className="text-sm font-medium hover:underline underline-offset-4">
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
            <h1 className="text-3xl font-bold tracking-tight">Analysis History</h1>
            <p className="text-gray-500">View and manage your previous data analyses.</p>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input placeholder="Search analyses..." className="max-w-sm" />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="powerbi">Power BI</SelectItem>
                  <SelectItem value="tableau">Tableau</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border shadow-sm">
            <div className="flex flex-col">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div className="text-lg font-semibold">Your Analysis History</div>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Date Range
                </Button>
              </div>
              <div className="p-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-semibold">No Analysis History</h3>
                  <p className="mt-2 text-sm text-gray-500 max-w-md">
                    You haven't analyzed any data files yet. Upload a file to get started with AI-powered insights.
                  </p>
                  <Button className="mt-6" asChild>
                    <Link href="/dashboard">Upload Your First File</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
