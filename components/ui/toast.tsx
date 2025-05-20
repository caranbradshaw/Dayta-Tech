"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-lg border p-4 shadow-md transition-all duration-300 animate-in slide-in-from-right-full 
            ${toast.variant === "destructive" ? "bg-red-50 border-red-200 text-red-800" : "bg-white border-gray-200"}`}
        >
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-medium">{toast.title}</h3>
              {toast.description && <p className="text-sm text-gray-500 mt-1">{toast.description}</p>}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className={`rounded-full p-1 hover:bg-gray-100 ${
                toast.variant === "destructive" ? "hover:bg-red-100" : ""
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>,
    document.body,
  )
}
