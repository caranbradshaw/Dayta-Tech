"use client"

import { X } from "lucide-react"
import { ContactSalesForm } from "./contact-sales-form"

export function ContactSalesDialog() {
  const handleClose = () => {
    document.getElementById("contact-sales-dialog")?.close()
  }

  return (
    <dialog id="contact-sales-dialog" className="modal w-full max-w-lg rounded-lg shadow-lg p-0 backdrop:bg-black/50">
      <div className="flex justify-end p-2">
        <button onClick={handleClose} className="rounded-full p-1 hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="p-4">
        <ContactSalesForm onClose={handleClose} />
      </div>
    </dialog>
  )
}
