import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { requestsApi, matchingApi } from '../api'
import ProviderCard from '../components/ProviderCard'
import { LoadingScreen, ErrorAlert } from '../components/ui/Feedback'
import { extractError } from '../api/client'

export default function RequestDetailPage() {
  const { id } = useParams()
  const [request, setRequest] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const [req, m] = await Promise.all([
          requestsApi.get(id),
          matchingApi.list(id).catch(() => []),
        ])
        setRequest(req)
        setMatches(Array.isArray(m) ? m : [])
      } catch (err) {
        setError(extractError(err))
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) return <LoadingScreen />
  if (error) return <ErrorAlert message={error} />
  if (!request) return null

  return (
    <div className="max-w-3xl">
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{request.title}</h1>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 capitalize">
            {request.status}
          </span>
        </div>
        <p className="mt-3 text-slate-600">{request.description}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
          {request.location_city && <span>📍 {request.location_city}</span>}
          {request.urgency && <span>⏱ {request.urgency}</span>}
        </div>
      </div>

      <h2 className="mb-4 mt-6 text-lg font-semibold">Matches ({matches.length})</h2>
      {matches.length === 0 ? (
        <p className="text-slate-500">No matches yet. <Link to="/requests/new" className="text-emerald-700">Create a new AI search</Link></p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {matches.map((m) => (
            <ProviderCard
              key={m.id}
              provider={m.provider || m.entity || { id: m.entity_id, ...m }}
              matchScore={m.match_score}
            />
          ))}
        </div>
      )}
    </div>
  )
}
