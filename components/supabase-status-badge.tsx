"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

export function SupabaseStatusBadge() {
  const [status, setStatus] = useState<"checking" | "connected" | "error" | "not-configured">("checking")
  const [message, setMessage] = useState<string>("Checking Supabase connection...")

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const response = await fetch("/api/check-supabase-status")
      const data = await response.json()

      if (!data.envStatus.hasRequiredVars) {
        setStatus("not-configured")
        setMessage("Supabase not configured")
      } else if (data.connectionStatus.success) {
        setStatus("connected")
        setMessage("Supabase connected")
      } else {
        setStatus("error")
        setMessage(data.connectionStatus.message || "Connection error")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Failed to check status")
    }
  }

  const getIcon = () => {
    switch (status) {
      case "checking":
        return <Loader2 className="h-3 w-3 animate-spin" />
      case "connected":
        return <CheckCircle className="h-3 w-3" />
      case "error":
        return <XCircle className="h-3 w-3" />
      case "not-configured":
        return <AlertCircle className="h-3 w-3" />
    }
  }

  const getVariant = () => {
    switch (status) {
      case "checking":
        return "outline"
      case "connected":
        return "success"
      case "error":
        return "destructive"
      case "not-configured":
        return "secondary"
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getVariant()} className="gap-1">
            {getIcon()}
            <span>Supabase</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
          {status !== "connected" && (
            <p className="text-xs mt-1">
              <a href="/supabase-setup" className="underline">
                Configure Supabase
              </a>
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
