import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the current environment
  const isDevelopment = process.env.NODE_ENV === "development"

  // Define trusted origins for production
  const trustedOrigins = [
    "https://daytatech.vercel.app",
    "https://www.daytatech.com",
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ].filter(Boolean)

  // In development, allow localhost
  if (isDevelopment) {
    const devOrigins = [
      "http://localhost:3000",
      "https://localhost:3000",
      "http://localhost:3001",
      "https://localhost:3001",
    ]
    trustedOrigins.push(...devOrigins)
  }

  // Allow Vercel preview domains
  const origin = request.nextUrl.origin
  const isVercelPreview = origin.includes(".vercel.app")

  if (!isDevelopment && !isVercelPreview && !trustedOrigins.includes(origin)) {
    console.warn(`Untrusted origin detected: ${origin}`)
    return NextResponse.json({ error: "Untrusted origin" }, { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
