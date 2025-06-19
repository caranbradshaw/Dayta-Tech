export default function DebugPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Deployment Debug</h1>

      <div className="space-y-4">
        <div className="p-4 bg-green-100 rounded">
          <h2 className="font-bold text-green-800">✅ Next.js App Router Working</h2>
          <p className="text-green-700">This page loaded successfully</p>
        </div>

        <div className="p-4 bg-blue-100 rounded">
          <h2 className="font-bold text-blue-800">📦 Build Info</h2>
          <p className="text-blue-700">Node: {process.version}</p>
          <p className="text-blue-700">Environment: {process.env.NODE_ENV}</p>
        </div>

        <div className="p-4 bg-yellow-100 rounded">
          <h2 className="font-bold text-yellow-800">🔧 Environment Variables</h2>
          <p className="text-yellow-700">
            Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}
          </p>
          <p className="text-yellow-700">
            Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}
          </p>
        </div>
      </div>
    </div>
  )
}
