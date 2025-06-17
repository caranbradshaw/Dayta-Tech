import Link from "next/link"
import { Logo } from "@/components/ui/logo"

interface FooterProps {
  className?: string
}

export function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`bg-gray-50 border-t ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Logo className="h-8 w-auto mb-4" />
            <p className="text-gray-600 text-sm max-w-md">
              Transform your data into actionable insights with AI-powered analytics. Built for businesses of all sizes.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/upload" className="text-gray-600 hover:text-gray-900 text-sm">
                  Upload Data
                </Link>
              </li>
              <li>
                <Link href="/reports" className="text-gray-600 hover:text-gray-900 text-sm">
                  Reports
                </Link>
              </li>
              <li>
                <Link href="/enterprise" className="text-gray-600 hover:text-gray-900 text-sm">
                  Enterprise
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-gray-900 text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-gray-600 hover:text-gray-900 text-sm">
                  Security
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">© 2024 DaytaTech. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
