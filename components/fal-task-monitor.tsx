"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, Download, AlertCircle, CheckCircle, Clock } from "lucide-react"

interface FALTask {
  taskId: string
  status: "queued" | "processing" | "completed" | "failed"
  progress?: number
  result?: any
  error?: string
  type: "pdf" | "analysis"
  reportId: string
  submittedAt: string
}

interface FALTaskMonitorProps {
  reportId?: string
  onTaskComplete?: (taskId: string, result: any) => void
}

export function FALTaskMonitor({ reportId, onTaskComplete }: FALTaskMonitorProps) {
  const [tasks, setTasks] = useState<FALTask[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTaskStatus = async (taskId: string, type: "pdf" | "analysis") => {
    try {
      const response = await fetch(`/api/fal/status?taskId=${taskId}&type=${type}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching task status:", error)
      return null
    }
  }

  const fetchTaskResult = async (taskId: string, type: "pdf" | "analysis") => {
    try {
      const response = await fetch(`/api/fal/result?taskId=${taskId}&type=${type}`)
      const data = await response.json()
      return data.result
    } catch (error) {
      console.error("Error fetching task result:", error)
      return null
    }
  }

  const refreshTasks = async () => {
    setLoading(true)
    try {
      // Update status for all active tasks
      const updatedTasks = await Promise.all(
        tasks.map(async (task) => {
          if (task.status === "completed" || task.status === "failed") {
            return task
          }

          const status = await fetchTaskStatus(task.taskId, task.type)
          if (status) {
            const updatedTask = {
              ...task,
              status: status.status,
              progress: status.progress,
              error: status.error,
            }

            // If completed, fetch result
            if (status.status === "completed") {
              const result = await fetchTaskResult(task.taskId, task.type)
              updatedTask.result = result
              onTaskComplete?.(task.taskId, result)
            }

            return updatedTask
          }
          return task
        }),
      )

      setTasks(updatedTasks)
    } catch (error) {
      console.error("Error refreshing tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "queued":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "queued":
        return "secondary"
      case "processing":
        return "default"
      case "completed":
        return "default"
      case "failed":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // Auto-refresh every 10 seconds for active tasks
  useEffect(() => {
    const activeTasks = tasks.filter((task) => task.status === "queued" || task.status === "processing")
    if (activeTasks.length > 0) {
      const interval = setInterval(refreshTasks, 10000)
      return () => clearInterval(interval)
    }
  }, [tasks])

  // Mock data for demonstration
  useEffect(() => {
    if (reportId) {
      setTasks([
        {
          taskId: "fal-pdf-123",
          status: "processing",
          progress: 65,
          type: "pdf",
          reportId,
          submittedAt: new Date().toISOString(),
        },
        {
          taskId: "fal-analysis-456",
          status: "completed",
          progress: 100,
          type: "analysis",
          reportId,
          submittedAt: new Date(Date.now() - 300000).toISOString(),
          result: {
            summary: "Analysis completed successfully",
            insights: [],
            recommendations: [],
          },
        },
      ])
    }
  }, [reportId])

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>FAL Tasks</CardTitle>
          <CardDescription>No active tasks</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>FAL Tasks</CardTitle>
          <CardDescription>Monitor long-running AI tasks</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={refreshTasks} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.map((task) => (
          <div key={task.taskId} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(task.status)}
                <span className="font-medium">{task.type === "pdf" ? "PDF Generation" : "Report Analysis"}</span>
                <Badge variant={getStatusColor(task.status)}>{task.status}</Badge>
              </div>
              <span className="text-sm text-muted-foreground">{new Date(task.submittedAt).toLocaleTimeString()}</span>
            </div>

            {task.progress !== undefined && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{task.progress}%</span>
                </div>
                <Progress value={task.progress} className="h-2" />
              </div>
            )}

            {task.error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                <strong>Error:</strong> {task.error}
              </div>
            )}

            {task.status === "completed" && task.result && (
              <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                <span className="text-sm text-green-700">Task completed successfully</span>
                {task.type === "pdf" && task.result.pdfUrl && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={task.result.pdfUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
