"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { SubscriptionCard } from "@/components/subscription/subscription-card"
import { OrganizationSelector } from "@/components/organization/organization-selector"
import { ProjectGrid } from "@/components/projects/project-grid"
import { InsightsDashboard } from "@/components/insights/insights-dashboard"
import type { Project } from "@/types/database"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [selectedOrgId, setSelectedOrgId] = useState<string>("")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to continue</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <OrganizationSelector userId={user.id} selectedOrgId={selectedOrgId} onOrganizationChange={setSelectedOrgId} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {selectedOrgId && (
            <>
              <ProjectGrid organizationId={selectedOrgId} userId={user.id} onProjectSelect={setSelectedProject} />

              {selectedProject && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Insights for {selectedProject.name}</h3>
                  <InsightsDashboard projectId={selectedProject.id} />
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-6">
          <SubscriptionCard userId={user.id} />
        </div>
      </div>
    </div>
  )
}
