"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Target, TrendingUp, Users, Cog, BarChart3 } from "lucide-react"

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
  onGoalsChange: (goals: string[]) => void
  className?: string
}

export function GoalSelector({ selectedGoals, onGoalsChange, className }: GoalSelectorProps) {
  const [customGoal, setCustomGoal] = useState("")

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      onGoalsChange(selectedGoals.filter((g) => g !== goal))
    } else {
      onGoalsChange([...selectedGoals, goal])
    }
  }

  const addCustomGoal = () => {
    if (customGoal.trim() && !selectedGoals.includes(customGoal.trim())) {
      onGoalsChange([...selectedGoals, customGoal.trim()])
      setCustomGoal("")
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Select Your Goals
        </CardTitle>
        <CardDescription>
          Choose the business goals you want to achieve. This helps us provide more targeted insights.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {PREDEFINED_GOALS.map((category) => {
          const Icon = category.icon
          return (
            <div key={category.category}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium">{category.category}</h4>
              </div>
              <div className="grid gap-2">
                {category.goals.map((goal) => (
                  <Button
                    key={goal}
                    variant={selectedGoals.includes(goal) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleGoal(goal)}
                    className="justify-start h-auto p-3 text-left"
                  >
                    {goal}
                  </Button>
                ))}
              </div>
            </div>
          )
        })}

        <div className="border-t pt-4">
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
            <Button onClick={addCustomGoal} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {selectedGoals.length > 0 && (
          <div className="border-t pt-4">
            <Label className="text-sm font-medium mb-2 block">Selected Goals ({selectedGoals.length})</Label>
            <div className="flex flex-wrap gap-2">
              {selectedGoals.map((goal) => (
                <Badge key={goal} variant="secondary" className="cursor-pointer" onClick={() => toggleGoal(goal)}>
                  {goal} ×
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
