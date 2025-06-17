"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, Upload, User, Settings, BarChart3, Download, X } from "lucide-react"

interface OnboardingChecklistProps {
  region: "nigeria" | "america"
  userTier: "basic" | "pro" | "team" | "enterprise"
  onDismiss: () => void
}

interface ChecklistItem {
  id: string
  title: string
  description: string
  icon: any
  completed: boolean
  action: string
  href: string
}

export function OnboardingChecklist({ region, userTier, onDismiss }: OnboardingChecklistProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: "profile",
      title: "Complete Your Profile",
      description: "Add your company details and industry for better insights",
      icon: User,
      completed: false,
      action: "Complete Profile",
      href: "/dashboard/settings",
    },
    {
      id: "upload",
      title: "Upload Your First Dataset",
      description: "Try our AI analysis with your business data",
      icon: Upload,
      completed: false,
      action: "Upload Data",
      href: "/upload",
    },
    {
      id: "analyze",
      title: "Run Your First Analysis",
      description: "Experience AI-powered insights tailored to your industry",
      icon: BarChart3,
      completed: false,
      action: "Start Analysis",
      href: "/upload",
    },
    {
      id: "export",
      title: "Export Your First Report",
      description:
        region === "nigeria"
          ? "Download professional reports for your Nigerian business"
          : "Create executive-ready reports for your team",
      icon: Download,
      completed: false,
      action: "Export Report",
      href: "/reports",
    },
    {
      id: "settings",
      title: "Customize Your Experience",
      description: "Set preferences and notification settings",
      icon: Settings,
      completed: false,
      action: "Customize",
      href: "/dashboard/settings",
    },
  ])

  const [isVisible, setIsVisible] = useState(true)
  const completedItems = checklist.filter((item) => item.completed).length
  const progress = (completedItems / checklist.length) * 100

  // Simulate checking completion status
  useEffect(() => {
    // In a real app, you'd check actual completion status from your backend
    const timer = setTimeout(() => {
      setChecklist((prev) => prev.map((item) => (item.id === "profile" ? { ...item, completed: true } : item)))
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss()
  }

  if (!isVisible || completedItems === checklist.length) return null

  return (
    <Card className="mb-6 border-2 border-dashed border-primary/20">
      <CardHeader className="relative">
        <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={handleDismiss}>
          <X className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-full ${region === "nigeria" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}
          >
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Welcome to DaytaTech.ai!</CardTitle>
            <CardDescription>
              Complete these steps to get the most out of your {userTier.toUpperCase()} plan
            </CardDescription>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              {completedItems} of {checklist.length} completed
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {checklist.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                item.completed ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <div className="flex-shrink-0">
                {item.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-gray-500" />
                  <h4 className={`font-medium ${item.completed ? "text-green-700" : "text-gray-900"}`}>{item.title}</h4>
                  {item.completed && (
                    <Badge variant="secondary" className="text-xs">
                      Complete
                    </Badge>
                  )}
                </div>
                <p className={`text-sm ${item.completed ? "text-green-600" : "text-gray-600"}`}>{item.description}</p>
              </div>

              {!item.completed && (
                <Button size="sm" variant="outline" onClick={() => (window.location.href = item.href)}>
                  {item.action}
                </Button>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
