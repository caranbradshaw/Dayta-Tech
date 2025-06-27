"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Check, Plus, Target, TrendingUp, Users, DollarSign, BarChart3, Zap } from "lucide-react"

interface GoalSelectorProps {
  selectedGoals: string[]
  onChange: (goals: string[]) => void
}

const PREDEFINED_GOALS = [
  {
    id: "increase_revenue",
    label: "Increase Revenue",
    description: "Find opportunities to boost sales and income",
    icon: DollarSign,
  },
  {
    id: "reduce_costs",
    label: "Reduce Costs",
    description: "Identify areas to cut expenses and improve efficiency",
    icon: TrendingUp,
  },
  {
    id: "improve_customer_satisfaction",
    label: "Improve Customer Satisfaction",
    description: "Enhance customer experience and retention",
    icon: Users,
  },
  {
    id: "optimize_operations",
    label: "Optimize Operations",
    description: "Streamline processes and workflows",
    icon: Zap,
  },
  {
    id: "market_analysis",
    label: "Market Analysis",
    description: "Understand market trends and opportunities",
    icon: BarChart3,
  },
  {
    id: "performance_tracking",
    label: "Performance Tracking",
    description: "Monitor KPIs and business metrics",
    icon: Target,
  },
]

export function GoalSelector({ selectedGoals, onChange }: GoalSelectorProps) {
  const [customGoal, setCustomGoal] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  const handleGoalToggle = (goalId: string) => {
    console.log("Goal toggled:", goalId)
    const newGoals = selectedGoals.includes(goalId)
      ? selectedGoals.filter((g) => g !== goalId)
      : [...selectedGoals, goalId]

    console.log("New goals:", newGoals)
    onChange(newGoals)
  }

  const handleCustomGoalAdd = () => {
    if (customGoal.trim() && !selectedGoals.includes(customGoal.trim())) {
      console.log("Custom goal added:", customGoal.trim())
      const newGoals = [...selectedGoals, customGoal.trim()]
      onChange(newGoals)
      setCustomGoal("")
      setShowCustomInput(false)
    }
  }

  const handleCustomGoalKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCustomGoalAdd()
    } else if (e.key === "Escape") {
      setShowCustomInput(false)
      setCustomGoal("")
    }
  }

  const isGoalSelected = (goalId: string) => selectedGoals.includes(goalId)

  const customGoals = selectedGoals.filter((goal) => !PREDEFINED_GOALS.some((predefined) => predefined.id === goal))

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {PREDEFINED_GOALS.map((goal) => {
          const Icon = goal.icon
          const isSelected = isGoalSelected(goal.id)

          return (
            <Button
              key={goal.id}
              type="button"
              variant={isSelected ? "default" : "outline"}
              className={`h-auto p-4 justify-start text-left ${isSelected ? "bg-blue-600 hover:bg-blue-700" : ""}`}
              onClick={() => handleGoalToggle(goal.id)}
            >
              <div className="flex items-center gap-3 w-full">
                <Icon className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{goal.label}</span>
                    {isSelected && <Check className="h-4 w-4 ml-auto" />}
                  </div>
                  <p className="text-sm opacity-80 mt-1">{goal.description}</p>
                </div>
              </div>
            </Button>
          )
        })}
      </div>

      {/* Custom Goal Section */}
      <div className="border-t pt-4">
        {!showCustomInput ? (
          <Button
            type="button"
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => setShowCustomInput(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Goal
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Enter your custom goal..."
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              onKeyDown={handleCustomGoalKeyPress}
              autoFocus
            />
            <Button type="button" onClick={handleCustomGoalAdd} disabled={!customGoal.trim()}>
              Add
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCustomInput(false)
                setCustomGoal("")
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Show selected goals */}
      {selectedGoals.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Selected Goals ({selectedGoals.length}):</p>
          <div className="flex flex-wrap gap-2">
            {selectedGoals.map((goal) => {
              const predefinedGoal = PREDEFINED_GOALS.find((g) => g.id === goal)
              const isCustom = !predefinedGoal

              return (
                <Badge
                  key={goal}
                  variant="default"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                  onClick={() => handleGoalToggle(goal)}
                >
                  {predefinedGoal ? predefinedGoal.label : goal}
                  <Check className="h-3 w-3 ml-1" />
                </Badge>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
