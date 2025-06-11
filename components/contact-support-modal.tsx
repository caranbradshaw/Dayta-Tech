"use client"

import type React from "react"

import { useState } from "react"
import { X, Send, MessageCircle, Mail, Phone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { sendEmail } from "@/lib/email-service"

interface ContactSupportModalProps {
  onClose: () => void
}

export function ContactSupportModal({ onClose }: ContactSupportModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    priority: "",
    message: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.subject || !formData.category || !formData.message) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Format the email content
      const emailText = `
New Support Request

SUPPORT DETAILS:
===============
Subject: ${formData.subject}
Category: ${formData.category}
Priority: ${formData.priority || "Not specified"}

MESSAGE:
========
${formData.message}

NEXT STEPS:
==========
- Respond within 24 hours based on priority level
- Escalate if marked as urgent or high priority
- Follow up to ensure issue is resolved

This support request was submitted through the DaytaTech.ai support form.
`

      const emailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
    New Support Request
  </h2>

  <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #1e40af; margin-top: 0;">Support Details</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 5px 0; font-weight: bold;">Subject:</td><td style="padding: 5px 0;">${formData.subject}</td></tr>
      <tr><td style="padding: 5px 0; font-weight: bold;">Category:</td><td style="padding: 5px 0;">${formData.category}</td></tr>
      <tr><td style="padding: 5px 0; font-weight: bold;">Priority:</td><td style="padding: 5px 0;">${formData.priority || "Not specified"}</td></tr>
    </table>
  </div>

  <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #1e40af; margin-top: 0;">Message</h3>
    <p style="line-height: 1.6; white-space: pre-wrap;">${formData.message}</p>
  </div>

  <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #1e40af; margin-top: 0;">Next Steps</h3>
    <ul style="line-height: 1.6;">
      <li>Respond within 24 hours based on priority level</li>
      <li>Escalate if marked as urgent or high priority</li>
      <li>Follow up to ensure issue is resolved</li>
    </ul>
  </div>

  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
  <p style="color: #6b7280; font-size: 14px; text-align: center;">
    This support request was submitted through the DaytaTech.ai support form.
  </p>
</div>
`

      // Send the email
      const result = await sendEmail({
        to: "caran@daytatech.ai",
        from: "noreply@daytatech.ai",
        subject: `Support Request: ${formData.subject}`,
        text: emailText,
        html: emailHtml,
      })

      if (result.success) {
        toast({
          title: "Support request sent",
          description: "We've received your message and will respond within 24 hours.",
        })
        onClose()
      } else {
        toast({
          title: "Failed to send request",
          description: result.message || "Please try again or contact us directly.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending support request:", error)
      toast({
        title: "Error sending request",
        description: "Please try again or contact us directly at caran@daytatech.ai",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Contact Support
          </CardTitle>
          <CardDescription>
            Get help with your account, billing, or technical issues. Our support team typically responds within 24
            hours.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <Mail className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-sm font-medium">Email Support</div>
              <div className="text-xs text-gray-500">24-48 hours</div>
            </div>
            <div className="text-center">
              <MessageCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-sm font-medium">Live Chat</div>
              <div className="text-xs text-gray-500">Business hours</div>
            </div>
            <div className="text-center">
              <Phone className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-sm font-medium">Phone Support</div>
              <div className="text-xs text-gray-500">Pro+ plans only</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                placeholder="Brief description of your issue"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="billing">Billing & Payments</SelectItem>
                    <SelectItem value="technical">Technical Issues</SelectItem>
                    <SelectItem value="account">Account Management</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="data">Data Analysis Help</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleChange("message", e.target.value)}
                placeholder="Please describe your issue in detail..."
                rows={6}
              />
            </div>

            <div className="text-xs text-gray-500">
              * Required fields. Please include as much detail as possible to help us assist you quickly.
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Support Request
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
