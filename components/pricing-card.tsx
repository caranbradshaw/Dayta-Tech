"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

interface PricingCardProps {
  title: string
  price: string
  description: string
  features: string[]
  buttonText: string
  buttonVariant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link"
  popular?: boolean
  onButtonClick?: () => void
  currency?: string
  period?: string
}

export function PricingCard({
  title,
  price,
  description,
  features,
  buttonText,
  buttonVariant = "default",
  popular = false,
  onButtonClick,
  currency = "$",
  period = "/month",
}: PricingCardProps) {
  return (
    <Card className={`relative ${popular ? "border-blue-500 shadow-lg" : ""}`}>
      {popular && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">Most Popular</Badge>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="text-3xl font-bold">
          {currency}
          {price}
          <span className="text-sm font-normal text-muted-foreground">{period}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant={buttonVariant} onClick={onButtonClick}>
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default PricingCard
