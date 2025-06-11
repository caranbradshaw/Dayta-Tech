import { redirect } from "next/navigation"

export default function DemoPage() {
  // Redirect to home page with a message to use the "See How It Works" button
  redirect("/?demo=redirect")
}
