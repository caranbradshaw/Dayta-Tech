"use client"

import { useEffect, useState } from "react"
import { ActivityHistory } from "@/components/user/activity-history"
import { supabase } from "@/lib/supabase"

export default function ActivityPage() {
  const [userId, setUserId] = useState<string>("")

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    getUser()
  }, [])

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <ActivityHistory userId={userId} />
    </div>
  )
}
