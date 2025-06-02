"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Crown, Shield, Zap, Users, Settings, Headphones, Globe } from "lucide-react"

export function EnterpriseFeaturesCard() {
  const enterpriseFeatures = [
    {
      icon: Users,
      title: "Unlimited Team Members",
      description: "Add as many team members as needed with role-based access control",
    },
    {
      icon: Zap,
      title: "Custom Integrations",
      description: "Connect with your existing tools via API and custom integrations",
    },
    {
      icon: Shield,
      title: "Advanced Security",
      description: "SOC 2 compliance, SSO, and enterprise-grade security features",
    },
    {
      icon: Headphones,
      title: "Dedicated Support",
      description: "24/7 priority support with dedicated account manager",
    },
    {
      icon: Settings,
      title: "Custom Deployment",
      description: "On-premise or private cloud deployment options available",
    },
    {
      icon: Globe,
      title: "White-label Solution",
      description: "Custom branding and white-label options for your organization",
    },
  ]

  return (
    <Card className="border-2 border-gradient-to-r from-yellow-200 to-orange-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-orange-600" />
          <CardTitle className="text-xl">Enterprise Features</CardTitle>
          <Badge className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800">Premium</Badge>
        </div>
        <CardDescription>
          Advanced capabilities designed for large organizations and enterprise deployments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {enterpriseFeatures.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="rounded-full bg-orange-100 p-1 mt-1">
                <feature.icon className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <div className="font-medium text-sm">{feature.title}</div>
                <div className="text-xs text-gray-600">{feature.description}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <div className="text-sm font-medium mb-2">Additional Enterprise Benefits:</div>
          <ul className="text-sm space-y-1">
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-500" />
              <span>99.9% SLA guarantee</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-500" />
              <span>Priority feature requests</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-500" />
              <span>Custom training and onboarding</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-500" />
              <span>Quarterly business reviews</span>
            </li>
          </ul>
        </div>

        <Button className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700">
          Contact Enterprise Sales
        </Button>
      </CardContent>
    </Card>
  )
}
