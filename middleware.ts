import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Auto-run setup on first visit to dashboard
  if (request.nextUrl.pathname === "/dashboard" && !request.cookies.get("setup_complete")) {
    try {
      // Run auto-setup
      const setupResponse = await fetch(`${request.nextUrl.origin}/api/auto-setup`, {
        method: "POST",
      })

      const setupResult = await setupResponse.json()

      if (setupResult.success) {
        // Set cookie to prevent re-running setup
        const response = NextResponse.next()
        response.cookies.set("setup_complete", "true", { maxAge: 60 * 60 * 24 * 30 }) // 30 days
        return response
      }
    } catch (error) {
      console.error("Auto-setup failed:", error)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
}
