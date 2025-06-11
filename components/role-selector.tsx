"use client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { InfoIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type AnalysisRole = "business_analyst" | "data_scientist" | "data_engineer" | "executive"

interface RoleSelectorProps {
  selectedRole: AnalysisRole
  onChange: (role: AnalysisRole) => void
  isPremium?: boolean
  className?: string
}

export function RoleSelector({ selectedRole, onChange, isPremium = false, className }: RoleSelectorProps) {
  const handleRoleChange = (value: string) => {
    onChange(value as AnalysisRole)
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Analysis Perspective</Label>
        {isPremium && (
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-2.5 py-0.5 text-xs font-medium text-white">
            Premium Feature
          </span>
        )}
      </div>

      <RadioGroup
        value={selectedRole}
        onValueChange={handleRoleChange}
        className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4"
      >
        <div className="relative">
          <div
            className={cn(
              "flex items-center space-x-2 rounded-md border p-3 hover:bg-slate-50",
              selectedRole === "business_analyst" && "border-blue-600 bg-blue-50 hover:bg-blue-50",
            )}
          >
            <RadioGroupItem value="business_analyst" id="business_analyst" />
            <Label
              htmlFor="business_analyst"
              className={cn(
                "flex-1 cursor-pointer font-medium",
                selectedRole === "business_analyst" && "text-blue-600",
              )}
            >
              Business Analyst
            </Label>
            <HoverCard>
              <HoverCardTrigger asChild>
                <InfoIcon className="h-4 w-4 text-slate-400" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Business Analyst Perspective</h4>
                  <p className="text-sm text-slate-600">
                    Focuses on operational insights, KPIs, business metrics, and actionable recommendations for process
                    improvement and decision support.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>

        <div className="relative">
          <div
            className={cn(
              "flex items-center space-x-2 rounded-md border p-3 hover:bg-slate-50",
              selectedRole === "data_scientist" && "border-purple-600 bg-purple-50 hover:bg-purple-50",
            )}
          >
            <RadioGroupItem value="data_scientist" id="data_scientist" />
            <Label
              htmlFor="data_scientist"
              className={cn(
                "flex-1 cursor-pointer font-medium",
                selectedRole === "data_scientist" && "text-purple-600",
              )}
            >
              Data Scientist
            </Label>
            <HoverCard>
              <HoverCardTrigger asChild>
                <InfoIcon className="h-4 w-4 text-slate-400" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Data Scientist Perspective</h4>
                  <p className="text-sm text-slate-600">
                    Emphasizes statistical insights, predictive modeling opportunities, feature importance, correlation
                    analysis, and machine learning potential.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>

        <div className="relative">
          <div
            className={cn(
              "flex items-center space-x-2 rounded-md border p-3 hover:bg-slate-50",
              selectedRole === "data_engineer" && "border-green-600 bg-green-50 hover:bg-green-50",
            )}
          >
            <RadioGroupItem value="data_engineer" id="data_engineer" />
            <Label
              htmlFor="data_engineer"
              className={cn("flex-1 cursor-pointer font-medium", selectedRole === "data_engineer" && "text-green-600")}
            >
              Data Engineer
            </Label>
            <HoverCard>
              <HoverCardTrigger asChild>
                <InfoIcon className="h-4 w-4 text-slate-400" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Data Engineer Perspective</h4>
                  <p className="text-sm text-slate-600">
                    Focuses on data quality, structure optimization, schema recommendations, data pipeline improvements,
                    and technical implementation details.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>

        <div className="relative">
          <div
            className={cn(
              "flex items-center space-x-2 rounded-md border p-3 hover:bg-slate-50",
              selectedRole === "executive" && "border-orange-600 bg-orange-50 hover:bg-orange-50",
            )}
          >
            <RadioGroupItem value="executive" id="executive" />
            <Label
              htmlFor="executive"
              className={cn("flex-1 cursor-pointer font-medium", selectedRole === "executive" && "text-orange-600")}
            >
              Executive
            </Label>
            <HoverCard>
              <HoverCardTrigger asChild>
                <InfoIcon className="h-4 w-4 text-slate-400" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Executive Perspective</h4>
                  <p className="text-sm text-slate-600">
                    Provides strategic insights, competitive analysis, market positioning, risk assessment, and
                    high-level recommendations for C-suite decision makers.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      </RadioGroup>
    </div>
  )
}
