import Link from "next/link"
import { Logo } from "@/components/ui/logo"

interface FooterProps {
  className?: string
}

export function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`w-full border-t py-6 md:py-0 ${className}`}>
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <Logo />
        <p className="text-center text-sm text-gray-500 md:text-left">© 2025 DaytaTech.ai. All rights reserved.</p>
        <div className="flex gap-4 items-center">
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
  )
}

export default Footer
