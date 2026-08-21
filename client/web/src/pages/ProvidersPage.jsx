import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { providersApi } from '../api'
import ProviderCard from '../components/ProviderCard'
import { LoadingScreen, EmptyState, ErrorAlert } from '../components/ui/Feedback'
import { extractError } from '../api/client'

export default function ProvidersPage() {
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [city, setCity] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (city) params.city = city
      const data = await providersApi.list(params)
      setProviders(Array.isArray(data) ? data : data?.items || [])
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold">Providers Near You</h1>
      <p className="mt-1 text-slate-500">Verified professionals ready to help</p>

      <div className="mt-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="input-field pl-10" placeholder="Filter by city..." value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <button type="button" onClick={load} className="btn-primary">Search</button>
      </div>

      {loading && <LoadingScreen />}
      {error && <div className="mt-4"><ErrorAlert message={error} onRetry={load} /></div>}
      {!loading && !error && providers.length === 0 && (
        <EmptyState title="No providers found" description="Try a different city or check back later." />
      )}
      {!loading && providers.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {providers.map((p) => <ProviderCard key={p.id} provider={p} />)}
        </div>
      )}
    </div>
  )
}
