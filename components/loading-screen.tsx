"use client"

import { useEffect, useState } from "react"
import { Loader2, Database, Shield, Zap } from "lucide-react"

interface LoadingScreenProps {
  message?: string
  showSteps?: boolean
}

export function LoadingScreen({ message = "Loading...", showSteps = false }: LoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { icon: Database, label: "Connecting to database", duration: 1000 },
    { icon: Shield, label: "Verifying security", duration: 800 },
    { icon: Zap, label: "Initializing AI services", duration: 1200 },
  ]

  useEffect(() => {
    if (!showSteps) return

    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
    }, 2000)

    return () => clearInterval(timer)
  }, [showSteps, steps.length])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center space-y-8 max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DaytaTech.ai</h1>
          <p className="text-gray-600">AI-Powered Data Analytics</p>
        </div>

        {/* Loading Animation */}
        <div className="relative">
          <div className="w-16 h-16 mx-auto mb-6">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
          </div>

          {showSteps && (
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = index === currentStep
                const isCompleted = index < currentStep

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-center space-x-3 transition-all duration-500 ${
                      isActive ? "text-blue-600 scale-105" : isCompleted ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "animate-pulse" : ""}`} />
                    <span className="text-sm font-medium">{step.label}</span>
                    {isActive && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isCompleted && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">{message}</p>
          <p className="text-sm text-gray-500">Setting up your personalized analytics dashboard...</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: showSteps ? `${((currentStep + 1) / steps.length) * 100}%` : "60%" }}
          />
        </div>
      </div>
    </div>
  )
}
