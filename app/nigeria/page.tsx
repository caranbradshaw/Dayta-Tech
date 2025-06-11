"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ContactSalesDialog } from "@/components/contact-sales-dialog"
import { ContactSupportModal } from "@/components/contact-support-modal"
import { Logo } from "@/components/logo"
import Link from "next/link"

export default function Page() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState("Nigeria")
  const [showContactSales, setShowContactSales] = useState(false)
  const [showContactSupport, setShowContactSupport] = useState(false)

  return (
    <div>
      <h1>Welcome to {name}!</h1>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>Increment</Button>
      <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={() => setShowContactSales(true)}>
        Contact Sales
      </Button>
      <ContactSalesDialog isOpen={showContactSales} onClose={() => setShowContactSales(false)} />
      {showContactSupport && <ContactSupportModal onClose={() => setShowContactSupport(false)} />}
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <Logo />
          <p className="text-center text-sm text-gray-500 md:text-left">
            © 2025 DaytaTech Nigeria. All rights reserved.
          </p>
          <div className="flex gap-4 items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowContactSupport(true)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Contact Support
            </Button>
            <Link href="/terms" className="text-sm text-gray-500 hover:underline underline-offset-4">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-gray-500 hover:underline underline-offset-4">
              Privacy
            </Link>
            <Link href="/faq" className="text-sm text-gray-500 hover:underline underline-offset-4">
              FAQ
            </Link>
            <Link href="/security" className="text-sm text-gray-500 hover:underline underline-offset-4">
              Security
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
