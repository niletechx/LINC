import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { bookingsApi } from '../api'
import { LoadingScreen, EmptyState, ErrorAlert } from '../components/ui/Feedback'
import { extractError } from '../api/client'

const tabs = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

export default function BookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('all')

  const load = async () => {
    setLoading(true)
    try {
      const data = await bookingsApi.list()
      setBookings(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = tab === 'all' ? bookings : bookings.filter((b) => b.status === tab)

  return (
    <div>
      <h1 className="text-2xl font-bold">Bookings</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-all ${
              tab === t ? 'bg-emerald-600 text-white' : 'bg-white/70 text-slate-600 hover:bg-emerald-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && <LoadingScreen />}
      {error && <div className="mt-4"><ErrorAlert message={error} onRetry={load} /></div>}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState icon={Calendar} title="No bookings" description="Book a service to get started." action={<Link to="/services" className="btn-primary mt-2">Browse Services</Link>} />
      )}
      {!loading && filtered.length > 0 && (
        <div className="mt-6 space-y-3">
          {filtered.map((b) => (
            <Link key={b.id} to={`/bookings/${b.id}`} className="glass-card flex items-center justify-between p-4">
              <div>
                <p className="font-semibold">{b.service_title || 'Service Booking'}</p>
                <p className="text-sm text-slate-500">
                  {b.scheduled_at ? new Date(b.scheduled_at).toLocaleString() : 'Date TBD'}
                  {b.agreed_price && ` · ${b.agreed_price} ${b.currency || 'ETB'}`}
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold capitalize text-emerald-800">{b.status}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
