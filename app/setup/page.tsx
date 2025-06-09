import { AutoSetupStatus } from "@/components/auto-setup-status"

export default function SetupPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">DaytaTech Analytics Setup</h1>
        <p className="text-muted-foreground mt-2">Automated setup and configuration for your analytics system</p>
      </div>

      <AutoSetupStatus />
    </div>
  )
}
