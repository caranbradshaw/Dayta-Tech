"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ContactSalesDialog } from "@/components/contact-sales-dialog"

export default function Page() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState("Nigeria")
  const [showContactSales, setShowContactSales] = useState(false)

  return (
    <div>
      <h1>Welcome to {name}!</h1>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>Increment</Button>
      <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={() => setShowContactSales(true)}>
        Contact Sales
      </Button>
      <ContactSalesDialog isOpen={showContactSales} onClose={() => setShowContactSales(false)} />
    </div>
  )
}
