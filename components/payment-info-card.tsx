"use client"

import { useState } from "react"
import { CreditCard, Calendar, DollarSign, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PaymentInfoCardProps {
  userData: any
}

export function PaymentInfoCard({ userData }: PaymentInfoCardProps) {
  const [showPaymentDetails, setShowPaymentDetails] = useState(false)

  // Mock payment data - in real app this would come from secure backend
  const paymentInfo = {
    cardLast4: "4242",
    cardBrand: "Visa",
    expiryMonth: "12",
    expiryYear: "2025",
    billingEmail: userData.email,
    nextBillingDate: "2024-02-15",
    amount: userData.accountType === "basic" ? 39 : userData.accountType === "pro" ? 99 : 499,
  }

  const isTrialActive = userData.trialStatus === "active" && new Date(userData.trialEndDate) > new Date()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Information
        </CardTitle>
        <CardDescription>Manage your billing information and payment methods.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isTrialActive ? (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              You're currently on a free trial. Add a payment method to continue service after your trial ends.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                  {paymentInfo.cardBrand.toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">•••• •••• •••• {paymentInfo.cardLast4}</div>
                  <div className="text-sm text-gray-500">
                    Expires {paymentInfo.expiryMonth}/{paymentInfo.expiryYear}
                  </div>
                </div>
              </div>
              <Badge variant="secondary">Primary</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">Billing Email</div>
                <div className="text-sm">{paymentInfo.billingEmail}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">Next Billing Date</div>
                <div className="text-sm flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {new Date(paymentInfo.nextBillingDate).toLocaleDateString()}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">Monthly Amount</div>
                <div className="text-sm flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-gray-400" />${paymentInfo.amount}/month
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">Plan</div>
                <div className="text-sm capitalize">{userData.accountType} Plan</div>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2 pt-4">
          <Button variant="outline" size="sm">
            {isTrialActive ? "Add Payment Method" : "Update Payment Method"}
          </Button>
          {!isTrialActive && (
            <Button variant="outline" size="sm">
              Download Invoice
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
