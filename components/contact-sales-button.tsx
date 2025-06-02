"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ContactSalesButtonProps {
  children?: React.ReactNode
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
}

export function ContactSalesButton({
  children = "Contact Sales",
  className,
  size = "default",
}: ContactSalesButtonProps) {
  const [open, setOpen] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real implementation, this would send the form data to your backend
    setTimeout(() => {
      setFormSubmitted(true)
    }, 1000)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" size={size} className={className}>
        {children}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {!formSubmitted ? (
            <>
              <DialogHeader>
                <DialogTitle>Contact our sales team</DialogTitle>
                <DialogDescription>
                  Fill out the form below and our team will get back to you within 24 hours.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input id="first-name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input id="last-name" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">How can we help?</Label>
                  <Textarea id="message" rows={4} required />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full">
                    Submit Request
                  </Button>
                </DialogFooter>
              </form>
            </>
          ) : (
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-green-600"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <DialogTitle>Request Submitted!</DialogTitle>
              <DialogDescription>
                Thank you for contacting us. A member of our sales team will reach out to you within 24 hours.
              </DialogDescription>
              <Button onClick={() => setOpen(false)} className="mt-4">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
