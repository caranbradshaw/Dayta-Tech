"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Example type for your data
type ExampleData = {
  id: number
  created_at: string
  name: string
  description: string | null
}

export function SupabaseExample() {
  const [data, setData] = useState<ExampleData[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Replace 'example_table' with your actual table name
        const { data, error } = await supabase.from("example_table").select("*").limit(5)

        if (error) {
          throw error
        }

        setData(data)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to fetch data from Supabase")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supabase Integration Example</CardTitle>
        <CardDescription>Demonstrating connection to your Supabase project</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading data...</p>
        ) : error ? (
          <div>
            <p className="text-red-500">{error}</p>
            <p className="text-sm mt-2">
              Make sure your Supabase URL and anon key are correctly set in the environment variables.
            </p>
          </div>
        ) : data && data.length > 0 ? (
          <div>
            <p className="mb-2">Successfully connected to Supabase!</p>
            <ul className="space-y-2">
              {data.map((item) => (
                <li key={item.id} className="p-2 bg-gray-50 rounded">
                  <strong>{item.name}</strong>
                  {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No data found. Your connection is working but the table might be empty.</p>
        )}

        <Button className="mt-4" onClick={() => window.location.reload()}>
          Refresh Data
        </Button>
      </CardContent>
    </Card>
  )
}
