"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Check } from "lucide-react"

export type AnalysisRole =
  | "CEO/Founder"
  | "Data Analyst"
  | "Business Analyst"
  | "Marketing Manager"
  | "Sales Manager"
  | "Operations Manager"
  | "Product Manager"
  | "Finance Manager"
  | "HR Manager"
  | "IT Manager"
  | "Consultant"
  | "Student/Researcher"
  | string

const PREDEFINED_ROLES = [
  { role: "CEO/Founder", description: "Strategic oversight and decision making" },
  { role: "Data Analyst", description: "Data analysis and reporting" },
  { role: "Business Analyst", description: "Business process analysis" },
  { role: "Marketing Manager", description: "Marketing strategy and campaigns" },
  { role: "Sales Manager", description: "Sales performance and strategy" },
  { role: "Operations Manager", description: "Operational efficiency and processes" },
  { role: "Product Manager", description: "Product development and strategy" },
  { role: "Finance Manager", description: "Financial analysis and planning" },
  { role: "HR Manager", description: "Human resources and talent management" },
  { role: "IT Manager", description: "Technology and systems management" },
  { role: "Consultant", description: "External advisory and analysis" },
  { role: "Student/Researcher", description: "Academic or research purposes" },
]

interface RoleSelectorProps {
  selectedRole: AnalysisRole
  onChange: (role: AnalysisRole) => void
  isPremium?: boolean
  className?: string
}

export function RoleSelector({ selectedRole, onChange, isPremium = false, className }: RoleSelectorProps) {
  const [customRole, setCustomRole] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  const handleRoleSelect = (role: string) => {
    console.log("Role selected:", role)
    onChange(role as AnalysisRole)
    setShowCustomInput(false)
    setCustomRole("")
  }

  const handleCustomRole = () => {
    if (customRole.trim()) {
      console.log("Custom role added:", customRole.trim())
      onChange(customRole.trim() as AnalysisRole)
      setCustomRole("")
      setShowCustomInput(false)
    }
  }

  return (
    <div className={className}>
      <div className="grid gap-3">
        {PREDEFINED_ROLES.map(({ role, description }) => {
          const isSelected = selectedRole === role
          return (
            <Button
              key={role}
              type="button"
              variant={isSelected ? "default" : "outline"}
              onClick={() => handleRoleSelect(role)}
              className="justify-start h-auto p-4 text-left relative"
            >
              <div className="flex items-start gap-3 w-full">
                <div className="flex-1">
                  <div className="font-medium text-sm">{role}</div>
                  <div className="text-xs text-muted-foreground mt-1 opacity-80">{description}</div>
                </div>
                {isSelected && <Check className="h-4 w-4 text-white flex-shrink-0" />}
              </div>
            </Button>
          )
        })}
      </div>

      <div className="mt-4">
        {!showCustomInput ? (
          <Button type="button" variant="outline" onClick={() => setShowCustomInput(true)} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Role
          </Button>
        ) : (
          <div className="space-y-3">
            <Label htmlFor="custom-role" className="text-sm font-medium">
              Custom Role
            </Label>
            <div className="flex gap-2">
              <Input
                id="custom-role"
                placeholder="Enter your role..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCustomRole()}
                className="flex-1"
              />
              <Button type="button" onClick={handleCustomRole} size="sm" disabled={!customRole.trim()}>
                Add
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCustomInput(false)
                setCustomRole("")
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {selectedRole && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <Label className="text-sm font-medium">Selected Role:</Label>
          <div className="mt-1">
            <Badge variant="secondary" className="text-sm">
              {selectedRole}
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}
