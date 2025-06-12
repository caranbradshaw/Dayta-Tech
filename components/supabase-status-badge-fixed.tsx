"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"

export function SupabaseStatusBadgeFixed() {
  const [status, setStatus] = useState<"checking" | "connected" | "error" | "not-configured">("checking")
  const [message, setMessage] = useState<string>("Checking Supabase connection...")
  const [lastCheck, setLastCheck] = useState<Date>(new Date())

  useEffect(() => {
    checkStatus()
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkStatus = async () => {
    try {
      const response = await fetch("/api/force-connection-refresh", {
        method: "POST",
        cache: "no-cache", // Force fresh request
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      const data = await response.json()

      if (data.connected) {
        setStatus("connected")
        setMessage("Supabase connected ✅")
      } else {
        setStatus("error")
        setMessage(data.message || "Connection error")
      }

      setLastCheck(new Date())
    } catch (error) {
      setStatus("error")
      setMessage("Failed to check status")
      setLastCheck(new Date())
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
        return "default"
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
          <Badge variant={getVariant()} className="gap-1 cursor-pointer" onClick={checkStatus}>
            {getIcon()}
            <span>Supabase</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div>
            <p>{message}</p>
            <p className="text-xs mt-1">Last check: {lastCheck.toLocaleTimeString()}</p>
            {status !== "connected" && (
              <p className="text-xs mt-1">
                <a href="/connection-fix" className="underline">
                  Fix Connection Issues
                </a>
              </p>
            )}
            <p className="text-xs mt-1 text-gray-500">Click to refresh</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
