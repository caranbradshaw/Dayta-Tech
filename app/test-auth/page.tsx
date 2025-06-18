"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function TestAuthPage() {
  const [email, setEmail] = useState("test@example.com")
  const [password, setPassword] = useState("testpassword123")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testSignup = async () => {
    setLoading(true)
    setResult(null)

    console.log("🧪 Testing signup...")
    console.log("📧 Email:", email)
    console.log("🔐 Password length:", password.length)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      })

      console.log("✅ Signup result:", { data, error })
      setResult({ type: "signup", data, error })
    } catch (err) {
      console.error("💥 Signup error:", err)
      setResult({ type: "signup", error: err })
    } finally {
      setLoading(false)
    }
  }

  const testSignin = async () => {
    setLoading(true)
    setResult(null)

    console.log("🧪 Testing signin...")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      console.log("✅ Signin result:", { data, error })
      setResult({ type: "signin", data, error })
    } catch (err) {
      console.error("💥 Signin error:", err)
      setResult({ type: "signin", error: err })
    } finally {
      setLoading(false)
    }
  }

  const checkEnv = () => {
    console.log("🔍 Environment check:")
    console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "...")
    console.log("Supabase client:", supabase)

    setResult({
      type: "env",
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "...",
      client: !!supabase,
    })
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧪 Auth Debug Test</h1>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="test@example.com" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password:</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="testpassword123"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={checkEnv} variant="outline">
          Check Environment
        </Button>
        <Button onClick={testSignup} disabled={loading}>
          Test Signup
        </Button>
        <Button onClick={testSignin} disabled={loading}>
          Test Signin
        </Button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Result:</h3>
          <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
