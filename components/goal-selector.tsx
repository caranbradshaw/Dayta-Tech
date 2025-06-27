"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, TrendingUp, Users, Cog, BarChart3, Check } from "lucide-react"

const PREDEFINED_GOALS = [
  {
    category: "Revenue",
    icon: TrendingUp,
    goals: [
      "Increase monthly recurring revenue by 25%",
      "Improve customer lifetime value",
      "Reduce customer acquisition cost",
      "Optimize pricing strategy",
    ],
  },
  {
    category: "Efficiency",
    icon: Cog,
    goals: [
      "Reduce operational costs by 15%",
      "Automate manual processes",
      "Improve team productivity",
      "Streamline workflows",
    ],
  },
  {
    category: "Customer",
    icon: Users,
    goals: [
      "Increase customer satisfaction scores",
      "Reduce churn rate by 20%",
      "Improve customer support response time",
      "Enhance user experience",
    ],
  },
  {
    category: "Growth",
    icon: BarChart3,
    goals: [
      "Expand to new markets",
      "Launch new product features",
      "Increase market share",
      "Scale operations efficiently",
    ],
  },
]

interface GoalSelectorProps {
  selectedGoals: string[]
  onChange: (goals: string[]) => void
  className?: string
}

export function GoalSelector({ selectedGoals, onChange, className }: GoalSelectorProps) {
  const [customGoal, setCustomGoal] = useState("")

  const toggleGoal = (goal: string) => {
    console.log("Goal toggled:", goal)
    if (selectedGoals.includes(goal)) {
      onChange(selectedGoals.filter((g) => g !== goal))
    } else {
      onChange([...selectedGoals, goal])
    }
  }

  const addCustomGoal = () => {
    if (customGoal.trim() && !selectedGoals.includes(customGoal.trim())) {
      console.log("Custom goal added:", customGoal.trim())
      onChange([...selectedGoals, customGoal.trim()])
      setCustomGoal("")
    }
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {PREDEFINED_GOALS.map((category) => {
          const Icon = category.icon
          return (
            <div key={category.category}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium">{category.category}</h4>
              </div>
              <div className="grid gap-2">
                {category.goals.map((goal) => {
                  const isSelected = selectedGoals.includes(goal)
                  return (
                    <Button
                      key={goal}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleGoal(goal)}
                      className="justify-start h-auto p-3 text-left relative"
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="flex-1 text-sm">{goal}</div>
                        {isSelected && <Check className="h-4 w-4 text-white flex-shrink-0" />}
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t pt-4 mt-6">
        <Label htmlFor="custom-goal" className="text-sm font-medium">
          Add Custom Goal
        </Label>
        <div className="flex gap-2 mt-2">
          <Input
            id="custom-goal"
            placeholder="Enter your specific goal..."
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addCustomGoal()}
          />
          <Button type="button" onClick={addCustomGoal} size="sm" disabled={!customGoal.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {selectedGoals.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <Label className="text-sm font-medium mb-2 block">Selected Goals ({selectedGoals.length})</Label>
          <div className="flex flex-wrap gap-2">
            {selectedGoals.map((goal) => (
              <Badge key={goal} variant="secondary" className="cursor-pointer text-xs" onClick={() => toggleGoal(goal)}>
                {goal} ×
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
