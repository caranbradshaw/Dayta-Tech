import Link from "next/link"
import Image from "next/image"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { height: 28, width: 28, textClass: "text-lg" },
    md: { height: 32, width: 32, textClass: "text-xl" },
    lg: { height: 40, width: 40, textClass: "text-2xl" },
  }

  const { height, width, textClass } = sizes[size]

  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="relative">
        <Image
          src="/daytatech-logo.png"
          alt="DaytaTech.ai Logo"
          height={height}
          width={width}
          className="rounded-md"
          priority
        />
      </div>
      {showText && <span className={`font-bold ${textClass} text-blue-600`}>DaytaTech.ai</span>}
    </Link>
  )
}
