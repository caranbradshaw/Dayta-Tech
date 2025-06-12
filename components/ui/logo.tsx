"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const [imageError, setImageError] = useState(false)

  const sizes = {
    sm: { height: 28, width: 28, textClass: "text-lg" },
    md: { height: 32, width: 32, textClass: "text-xl" },
    lg: { height: 40, width: 40, textClass: "text-2xl" },
  }

  const { height, width, textClass } = sizes[size]

  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="relative">
        {!imageError ? (
          <Image
            src="/daytatech-logo.png"
            alt="DaytaTech.ai Logo"
            height={height}
            width={width}
            className="rounded-md"
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={`flex items-center justify-center bg-blue-600 text-white rounded-md font-bold`}
            style={{ height, width }}
          >
            D
          </div>
        )}
      </div>
      {showText && <span className={`font-bold ${textClass} text-blue-600`}>DaytaTech.ai</span>}
    </Link>
  )
}
