"use client"

import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface DemoTooltipProps {
  position: "top" | "right" | "bottom" | "left"
  title: string
  content: string
  onClose: () => void
}

export function DemoTooltip({ position, title, content, onClose }: DemoTooltipProps) {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
  }

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white",
    right:
      "right-full top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-white",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white",
    left: "left-full top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-white",
  }

  return (
    <div className={`absolute z-50 w-64 ${positionClasses[position]}`}>
      <Card className="p-4 shadow-lg border-purple-200 animate-pulse-once">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-purple-700">{title}</h3>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <p className="text-sm text-gray-600">{content}</p>
      </Card>
      <div className={`absolute h-0 w-0 ${arrowClasses[position]}`} />
    </div>
  )
}
