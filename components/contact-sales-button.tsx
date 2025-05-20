"use client"

import { Button, type ButtonProps } from "@/components/ui/button"

export function ContactSalesButton({ className, children, ...props }: ButtonProps) {
  const handleClick = () => {
    document.getElementById("contact-sales-dialog")?.showModal()
  }

  return (
    <Button className={className} onClick={handleClick} {...props}>
      {children || "Contact Sales"}
    </Button>
  )
}
