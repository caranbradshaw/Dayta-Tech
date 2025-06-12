"use client"

import Link from "next/link"
import { UserAuthForm } from "@/components/auth/user-auth-form"
import { Logo } from "@/components/ui/logo"

export default function SignUpPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Logo size="md" showText={true} />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "DaytaTech.ai is like having a team of data scientists without the overhead. It's revolutionized our
              decision-making process."
            </p>
            <footer className="text-sm">Marcus Chen, Founder of DataDriven Inc</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="lg:hidden mb-4">
              <Logo size="lg" showText={true} />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Join DaytaTech.ai</h1>
            <p className="text-sm text-muted-foreground">
              Create your account and start getting expert data insights in minutes
            </p>
          </div>
          <UserAuthForm type="signup" />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
              Sign in
            </Link>
          </p>
          <p className="px-8 text-center text-sm text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
