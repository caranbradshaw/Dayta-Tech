"use client"

import type React from "react"

import { useState } from "react"
import { X, Check, CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { upgradeAccount, accountPricing } from "@/lib/account-utils"

interface UpgradeAccountModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function UpgradeAccountModal({ onClose, onSuccess }: UpgradeAccountModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [plan, setPlan] = useState("pro")
  const [billingCycle, setBillingCycle] = useState("monthly")
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
      toast({
        title: "Missing payment information",
        description: "Please fill in all payment details to upgrade your account.",
        variant: "destructive",
      })
      return
    }

    // Simple card number validation
    if (formData.cardNumber.replace(/\s/g, "").length !== 16) {
      toast({
        title: "Invalid card number",
        description: "Please enter a valid 16-digit card number.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate payment processing
    setTimeout(() => {
      // Update user account in localStorage
      const userDataStr = localStorage.getItem("daytaTechUser")
      if (userDataStr) {
        const userData = JSON.parse(userDataStr)
        const updatedUser = upgradeAccount(userData, plan as any)
        localStorage.setItem("daytaTechUser", JSON.stringify(updatedUser))

        toast({
          title: "Account upgraded!",
          description: `Your account has been upgraded to ${plan === "pro" ? "Pro" : plan === "team" ? "Team" : "Enterprise"}.`,
        })

        onSuccess()
      }

      setIsSubmitting(false)
    }, 2000)
  }

  const getPlanPrice = () => {
    if (plan === "enterprise") return "Custom"
    const pricing = accountPricing[plan as keyof typeof accountPricing]
    return billingCycle === "monthly" ? `$${pricing.monthly}` : `$${pricing.annual}`
  }

  const getSavings = () => {
    if (billingCycle === "annual" && plan !== "enterprise") {
      const pricing = accountPricing[plan as keyof typeof accountPricing]
      const monthlyCost = pricing.monthly * 12
      const annualCost = pricing.annual
      return `$${monthlyCost - annualCost}`
    }
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex justify-end p-2 bg-white">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <CardHeader>
          <CardTitle className="text-2xl">Upgrade Your Account</CardTitle>
          <CardDescription>Get access to advanced features and unlimited uploads</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Select a Plan</Label>
              <RadioGroup value={plan} onValueChange={setPlan} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <RadioGroupItem value="pro" id="pro" className="peer sr-only" aria-label="Pro Plan" />
                  <Label
                    htmlFor="pro"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-purple-600 [&:has([data-state=checked])]:border-purple-600"
                  >
                    <div className="mb-2 rounded-full bg-purple-100 p-1">
                      <Check className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">Pro</div>
                      <div className="text-sm text-gray-500">For individuals</div>
                      <div className="mt-2 text-2xl font-bold">
                        {billingCycle === "monthly" ? "$99" : "$990"}
                        <span className="text-sm font-normal text-gray-500">
                          /{billingCycle === "monthly" ? "month" : "year"}
                        </span>
                      </div>
                    </div>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="team" id="team" className="peer sr-only" aria-label="Team Plan" />
                  <Label
                    htmlFor="team"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 [&:has([data-state=checked])]:border-blue-600"
                  >
                    <div className="mb-2 rounded-full bg-blue-100 p-1">
                      <Check className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">Team</div>
                      <div className="text-sm text-gray-500">For teams up to 5</div>
                      <div className="mt-2 text-2xl font-bold">
                        {billingCycle === "monthly" ? "$499" : "$4,990"}
                        <span className="text-sm font-normal text-gray-500">
                          /{billingCycle === "monthly" ? "month" : "year"}
                        </span>
                      </div>
                    </div>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem
                    value="enterprise"
                    id="enterprise"
                    className="peer sr-only"
                    aria-label="Enterprise Plan"
                  />
                  <Label
                    htmlFor="enterprise"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-600 [&:has([data-state=checked])]:border-orange-600"
                  >
                    <div className="mb-2 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 p-1">
                      <Check className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">Enterprise</div>
                      <div className="text-sm text-gray-500">For large organizations</div>
                      <div className="mt-2 text-lg font-bold text-orange-600">Custom Pricing</div>
                      <div className="text-xs text-gray-500 mt-1">Contact sales</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label>Billing Cycle</Label>
              <RadioGroup
                value={billingCycle}
                onValueChange={setBillingCycle}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="monthly" id="monthly" className="peer sr-only" aria-label="Monthly billing" />
                  <Label
                    htmlFor="monthly"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-purple-600 [&:has([data-state=checked])]:border-purple-600"
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold">Monthly</div>
                      <div className="text-sm text-gray-500">Pay month-to-month</div>
                    </div>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="annual" id="annual" className="peer sr-only" aria-label="Annual billing" />
                  <Label
                    htmlFor="annual"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-600 [&:has([data-state=checked])]:border-green-600"
                  >
                    <div className="text-center">
                      <div className="text-lg font-semibold">Annual</div>
                      <div className="text-sm text-gray-500">Save up to 17%</div>
                      {billingCycle === "annual" && (
                        <div className="mt-1 text-xs font-medium text-green-600">Save {getSavings()}</div>
                      )}
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {plan === "enterprise" ? (
              <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 p-6 text-center">
                <div className="text-lg font-semibold text-orange-800 mb-2">Enterprise Plan</div>
                <div className="text-sm text-orange-600 mb-4">Custom pricing based on your organization's needs</div>
                <Button
                  type="button"
                  variant="outline"
                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                  onClick={() => {
                    // Handle contact sales action
                    toast({
                      title: "Contact Sales",
                      description: "Our sales team will reach out to you within 24 hours.",
                    })
                    onClose()
                  }}
                >
                  Contact Sales Team
                </Button>
              </div>
            ) : (
              // Existing payment form
              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between">
                  <div className="text-lg font-medium">Payment Information</div>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-10 rounded bg-blue-600"></div>
                    <div className="h-6 w-10 rounded bg-red-500"></div>
                    <div className="h-6 w-10 rounded bg-gray-800"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardName">Name on Card</Label>
                  <Input id="cardName" placeholder="John Doe" value={formData.cardName} onChange={handleChange} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input id="expiryDate" placeholder="MM/YY" value={formData.expiryDate} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" value={formData.cvv} onChange={handleChange} />
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex justify-between mb-2">
                <div className="text-sm text-gray-500">Plan</div>
                <div className="font-medium">
                  {plan === "pro" ? "Pro" : plan === "team" ? "Team" : "Enterprise"} (
                  {billingCycle === "monthly" ? "Monthly" : "Annual"})
                </div>
              </div>
              <div className="flex justify-between mb-4">
                <div className="text-sm text-gray-500">Price</div>
                <div className="font-medium">{getPlanPrice()}</div>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <div>Total</div>
                <div>{getPlanPrice()}</div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Upgrade Now
                </>
              )}
            </Button>
            <div className="text-center text-xs text-gray-500">
              By upgrading, you agree to our Terms of Service and Privacy Policy. You can cancel your subscription at
              any time.
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
