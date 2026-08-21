import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { servicesApi, categoriesApi } from '../api'
import ServiceCard from '../components/ServiceCard'
import { LoadingScreen, EmptyState, ErrorAlert } from '../components/ui/Feedback'
import { extractError } from '../api/client'

export default function ServicesPage() {
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (search) params.q = search
      if (category) params.category_id = category
      const [svc, cats] = await Promise.all([servicesApi.list(params), categoriesApi.list()])
      setServices(Array.isArray(svc) ? svc : svc?.items || [])
      setCategories(Array.isArray(cats) ? cats : cats?.items || [])
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = services.filter((s) => {
    const q = search.toLowerCase()
    if (!q) return true
    return (s.title || s.name || '').toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q)
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Browse Services</h1>
      <p className="mt-1 text-slate-500">Discover services from verified providers</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="input-field pl-10" placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-field sm:w-48" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="button" onClick={load} className="btn-primary">Search</button>
      </div>

      {loading && <LoadingScreen />}
      {error && <div className="mt-4"><ErrorAlert message={error} onRetry={load} /></div>}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="No services found" description="Try adjusting your search or check back later." />
      )}
      {!loading && filtered.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => <ServiceCard key={s.id} service={s} />)}
        </div>
      )}
    </div>
  )
}
