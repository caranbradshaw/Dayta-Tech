"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Plus } from "lucide-react"

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
  selectedRole: string
  onRoleChange: (role: string) => void
  className?: string
}

export function RoleSelector({ selectedRole, onRoleChange, className }: RoleSelectorProps) {
  const [customRole, setCustomRole] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  const handleRoleSelect = (role: string) => {
    onRoleChange(role)
    setShowCustomInput(false)
    setCustomRole("")
  }

  const handleCustomRole = () => {
    if (customRole.trim()) {
      onRoleChange(customRole.trim())
      setCustomRole("")
      setShowCustomInput(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          What's Your Role?
        </CardTitle>
        <CardDescription>Select your role to get personalized insights and recommendations.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          {PREDEFINED_ROLES.map(({ role, description }) => (
            <Button
              key={role}
              variant={selectedRole === role ? "default" : "outline"}
              onClick={() => handleRoleSelect(role)}
              className="justify-start h-auto p-3 text-left"
            >
              <div>
                <div className="font-medium">{role}</div>
                <div className="text-xs text-muted-foreground mt-1">{description}</div>
              </div>
            </Button>
          ))}
        </div>

        {!showCustomInput ? (
          <Button variant="outline" onClick={() => setShowCustomInput(true)} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Role
          </Button>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="custom-role">Custom Role</Label>
            <div className="flex gap-2">
              <Input
                id="custom-role"
                placeholder="Enter your role..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCustomRole()}
              />
              <Button onClick={handleCustomRole} size="sm">
                Add
              </Button>
            </div>
          </div>
        )}

        {selectedRole && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <Label className="text-sm font-medium">Selected Role:</Label>
            <Badge variant="secondary" className="mt-1">
              {selectedRole}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
