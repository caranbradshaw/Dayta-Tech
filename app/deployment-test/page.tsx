"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function DeploymentTestPage() {
  const [deploymentInfo, setDeploymentInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkDeployment()
  }, [])

  const checkDeployment = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/deployment-check")
      if (response.ok) {
        const data = await response.json()
        setDeploymentInfo(data)
      } else {
        setError("Failed to fetch deployment info")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const testRoutes = [
    { name: "Select Role", path: "/select-role" },
    { name: "Signup", path: "/signup" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Upload", path: "/upload" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Deployment Status</h1>
          <p className="text-gray-600">Check if your latest changes are deployed</p>
        </div>

        {error ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center">
                <XCircle className="h-5 w-5 mr-2" />
                Deployment Check Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{error}</p>
              <Button onClick={checkDeployment} className="mt-4">
                Retry Check
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  Deployment Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Version</p>
                    <Badge variant="secondary">{deploymentInfo?.version}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Environment</p>
                    <Badge variant="outline">{deploymentInfo?.environment}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Deployed At</p>
                    <p className="text-sm font-mono">{deploymentInfo?.timestamp}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {deploymentInfo?.features &&
                    Object.entries(deploymentInfo.features).map(([feature, enabled]) => (
                      <div key={feature} className="flex items-center justify-between">
                        <span className="capitalize">{feature.replace(/([A-Z])/g, " $1")}</span>
                        {enabled ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Route Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {testRoutes.map((route) => (
                    <Button
                      key={route.path}
                      variant="outline"
                      onClick={() => window.open(route.path, "_blank")}
                      className="justify-start"
                    >
                      Test {route.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-8 text-center">
          <Button onClick={checkDeployment} variant="outline">
            Refresh Status
          </Button>
        </div>
      </div>
    </div>
  )
}
