"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Check, Plus, User, TrendingUp, Users, Settings, BarChart3, Brain } from "lucide-react"

export type AnalysisRole =
  | "business_owner"
  | "data_analyst"
  | "marketing_manager"
  | "operations_manager"
  | "financial_analyst"
  | "consultant"
  | string

interface RoleSelectorProps {
  selectedRole: AnalysisRole
  onChange: (role: AnalysisRole) => void
  isPremium?: boolean
}

const PREDEFINED_ROLES = [
  {
    id: "business_owner",
    label: "Business Owner",
    description: "Strategic insights and growth opportunities",
    icon: TrendingUp,
    premium: false,
  },
  {
    id: "data_analyst",
    label: "Data Analyst",
    description: "Technical analysis and data patterns",
    icon: BarChart3,
    premium: false,
  },
  {
    id: "marketing_manager",
    label: "Marketing Manager",
    description: "Customer insights and campaign optimization",
    icon: Users,
    premium: false,
  },
  {
    id: "operations_manager",
    label: "Operations Manager",
    description: "Process optimization and efficiency metrics",
    icon: Settings,
    premium: true,
  },
  {
    id: "financial_analyst",
    label: "Financial Analyst",
    description: "Financial performance and forecasting",
    icon: TrendingUp,
    premium: true,
  },
  {
    id: "consultant",
    label: "Consultant",
    description: "Comprehensive analysis for client recommendations",
    icon: Brain,
    premium: true,
  },
]

export function RoleSelector({ selectedRole, onChange, isPremium = false }: RoleSelectorProps) {
  const [customRole, setCustomRole] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  const handleRoleSelect = (roleId: string) => {
    console.log("Role selected:", roleId)
    onChange(roleId)
  }

  const handleCustomRoleAdd = () => {
    if (customRole.trim()) {
      console.log("Custom role added:", customRole.trim())
      onChange(customRole.trim())
      setCustomRole("")
      setShowCustomInput(false)
    }
  }

  const handleCustomRoleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCustomRoleAdd()
    } else if (e.key === "Escape") {
      setShowCustomInput(false)
      setCustomRole("")
    }
  }

  const isRoleSelected = (roleId: string) => selectedRole === roleId

  const isCustomRole = !PREDEFINED_ROLES.some((role) => role.id === selectedRole) && selectedRole !== ""

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {PREDEFINED_ROLES.map((role) => {
          const Icon = role.icon
          const isSelected = isRoleSelected(role.id)
          const isDisabled = role.premium && !isPremium

          return (
            <Button
              key={role.id}
              type="button"
              variant={isSelected ? "default" : "outline"}
              className={`h-auto p-4 justify-start text-left ${
                isSelected ? "bg-blue-600 hover:bg-blue-700" : ""
              } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => !isDisabled && handleRoleSelect(role.id)}
              disabled={isDisabled}
            >
              <div className="flex items-center gap-3 w-full">
                <Icon className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{role.label}</span>
                    {role.premium && (
                      <Badge variant="secondary" className="text-xs">
                        Pro
                      </Badge>
                    )}
                    {isSelected && <Check className="h-4 w-4 ml-auto" />}
                  </div>
                  <p className="text-sm opacity-80 mt-1">{role.description}</p>
                </div>
              </div>
            </Button>
          )
        })}
      </div>

      {/* Custom Role Section */}
      <div className="border-t pt-4">
        {!showCustomInput ? (
          <Button
            type="button"
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => setShowCustomInput(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Role
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Enter your custom role..."
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              onKeyDown={handleCustomRoleKeyPress}
              autoFocus
            />
            <Button type="button" onClick={handleCustomRoleAdd} disabled={!customRole.trim()}>
              Add
            </Button>
            <Button
              type="button"
              variant="outline"
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

      {/* Show selected custom role */}
      {isCustomRole && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <User className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-900">Selected: {selectedRole}</span>
          <Check className="h-4 w-4 text-blue-600 ml-auto" />
        </div>
      )}
    </div>
  )
}
