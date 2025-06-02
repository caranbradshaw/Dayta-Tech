"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getUserOrganizations, createOrganization } from "@/lib/supabase-utils"
import type { Organization } from "@/types/database"
import { Building2, Plus } from "lucide-react"

interface OrganizationSelectorProps {
  userId: string
  selectedOrgId?: string
  onOrganizationChange: (orgId: string) => void
}

export function OrganizationSelector({ userId, selectedOrgId, onOrganizationChange }: OrganizationSelectorProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newOrg, setNewOrg] = useState({
    name: "",
    slug: "",
    description: "",
    industry: "",
    company_size: "",
  })

  useEffect(() => {
    loadOrganizations()
  }, [userId])

  async function loadOrganizations() {
    try {
      const orgs = await getUserOrganizations(userId)
      setOrganizations(orgs)

      // Auto-select first organization if none selected
      if (!selectedOrgId && orgs.length > 0) {
        onOrganizationChange(orgs[0].id)
      }
    } catch (error) {
      console.error("Error loading organizations:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateOrganization() {
    if (!newOrg.name.trim()) return

    setCreating(true)
    try {
      const slug =
        newOrg.slug ||
        newOrg.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")

      const organization = await createOrganization({
        ...newOrg,
        slug,
        created_by: userId,
      })

      setOrganizations((prev) => [organization, ...prev])
      onOrganizationChange(organization.id)
      setShowCreateDialog(false)
      setNewOrg({ name: "", slug: "", description: "", industry: "", company_size: "" })
    } catch (error) {
      console.error("Error creating organization:", error)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4" />
      <Select value={selectedOrgId} onValueChange={onOrganizationChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select organization" />
        </SelectTrigger>
        <SelectContent>
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={newOrg.name}
                onChange={(e) => setNewOrg((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Acme Corporation"
              />
            </div>
            <div>
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={newOrg.slug}
                onChange={(e) => setNewOrg((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="acme-corp"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newOrg.description}
                onChange={(e) => setNewOrg((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of your organization"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={newOrg.industry}
                  onChange={(e) => setNewOrg((prev) => ({ ...prev, industry: e.target.value }))}
                  placeholder="Technology"
                />
              </div>
              <div>
                <Label htmlFor="company_size">Company Size</Label>
                <Select
                  value={newOrg.company_size}
                  onValueChange={(value) => setNewOrg((prev) => ({ ...prev, company_size: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-1000">201-1000 employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOrganization} disabled={creating || !newOrg.name.trim()}>
                {creating ? "Creating..." : "Create Organization"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
