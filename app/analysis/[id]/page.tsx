import { generateRecommendations } from "@/lib/ai-service"

interface Props {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

async function AnalysisPage({ params, searchParams }: Props) {
  const id = params.id
  const query = searchParams?.query

  let recommendations = null

  if (query) {
    recommendations = await generateRecommendations(query)
  }

  return (
    <div>
      <h1>Analysis Page</h1>
      <p>ID: {id}</p>
      <p>Query: {query}</p>

      {recommendations && (
        <div>
          <h2>Recommendations:</h2>
          <pre>{JSON.stringify(recommendations, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default AnalysisPage
