import type { Metadata } from "next"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { UserAuthForm } from "@/components/auth/user-auth-form"
import { Logo } from "@/components/ui/logo"

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authenticate to DaytaTech.",
}

export default function LoginPage() {
  return (
    <>
      <div className="md:hidden">
        <img src="/examples/authentication-mobile.png" alt="Authentication" className="block dark:hidden w-full" />
        <img src="/examples/authentication-mobile-dark.png" alt="Authentication" className="hidden dark:block w-full" />
      </div>
      <div className="container relative hidden h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          href="/examples/authentication"
          className={cn(
            buttonVariants({
              variant: "ghost",
            }),
            "absolute right-4 top-4 md:hidden",
          )}
        >
          Skip
        </Link>
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Link href="/" className="flex items-center justify-center mb-6">
              <Logo size="lg" />
            </Link>
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;This library has saved me countless hours of work and helped me deliver stunning designs to my
                clients faster than ever before.&rdquo;
              </p>
              <footer className="text-sm">Sofia Davis, Design Lead</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold">Welcome back to DaytaTech.ai</h1>
              <p className="text-sm text-muted-foreground">Enter your email below to sign in to your account</p>
            </div>
            <UserAuthForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
              By continuing, you are setting up a DaytaTech.ai account and agree to our{" "}
              <Link href="/terms" className="hover:text-brand underline underline-offset-4">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="hover:text-brand underline underline-offset-4">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
