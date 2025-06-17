"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"

interface PricingCardProps {
  title: string
  description: string
  price: string
  period?: string
  features: string[]
  cta: string
  popular?: boolean
  onClick?: () => void
  className?: string
}

export function PricingCard({
  title,
  description,
  price,
  period = "/month",
  features,
  cta,
  popular = false,
  onClick,
  className = "",
}: PricingCardProps) {
  return (
    <Card
      className={`relative ${popular ? "border-2 border-blue-600 shadow-lg" : "border-2 border-gray-200"} ${className}`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">Most Popular</Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{price}</span>
          {price !== "Custom" && price !== "Free" && <span className="text-sm text-gray-500">{period}</span>}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <Button className="w-full" onClick={onClick} variant={popular ? "default" : "outline"}>
          {cta}
        </Button>
      </CardContent>
    </Card>
  )
}

export default PricingCard
