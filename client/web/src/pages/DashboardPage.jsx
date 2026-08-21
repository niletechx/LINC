import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, FileText, MessageSquare, Users, TrendingUp } from 'lucide-react'
import { bookingsApi, requestsApi, messagingApi, providersApi } from '../api'
import { useAuthStore } from '../store/authStore'
import { LoadingScreen, ErrorAlert } from '../components/ui/Feedback'
import { extractError } from '../api/client'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ bookings: 0, requests: 0, messages: 0, providers: 0 })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const [bookings, requests, conversations, providers] = await Promise.all([
          bookingsApi.list().catch(() => []),
          requestsApi.list({ user_id: user?.id }).catch(() => []),
          messagingApi.conversations().catch(() => []),
          providersApi.list({ limit: 5 }).catch(() => []),
        ])
        const bArr = Array.isArray(bookings) ? bookings : []
        const rArr = Array.isArray(requests) ? requests : []
        const cArr = Array.isArray(conversations) ? conversations : []
        const pArr = Array.isArray(providers) ? providers : providers?.items || []
        setStats({ bookings: bArr.length, requests: rArr.length, messages: cArr.length, providers: pArr.length })
        setRecentBookings(bArr.slice(0, 5))
      } catch (err) {
        setError(extractError(err))
      } finally {
        setLoading(false)
      }
    })()
  }, [user?.id])

  if (loading) return <LoadingScreen />

  const cards = [
    { icon: Calendar, label: 'Bookings', value: stats.bookings, color: 'from-emerald-500 to-emerald-600', to: '/bookings' },
    { icon: FileText, label: 'Requests', value: stats.requests, color: 'from-blue-500 to-blue-600', to: '/requests/new' },
    { icon: MessageSquare, label: 'Messages', value: stats.messages, color: 'from-violet-500 to-violet-600', to: '/messages' },
    { icon: Users, label: 'Providers', value: stats.providers, color: 'from-amber-500 to-amber-600', to: '/providers' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold">Hello, {user?.full_name?.split(' ')[0] || 'there'} 👋</h1>
      <p className="mt-1 text-slate-500">Welcome to your LINC dashboard</p>

      {error && <div className="mt-4"><ErrorAlert message={error} /></div>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ icon: Icon, label, value, color, to }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={to} className="glass-card block p-5">
              <div className={`inline-flex rounded-xl bg-gradient-to-br ${color} p-2.5 text-white`}>
                <Icon size={20} />
              </div>
              <p className="mt-3 text-2xl font-bold">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent Bookings</h2>
            <Link to="/bookings" className="text-sm text-emerald-700">View all</Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No bookings yet. <Link to="/services" className="text-emerald-700">Browse services</Link></p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentBookings.map((b) => (
                <Link key={b.id} to={`/bookings/${b.id}`} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 hover:bg-emerald-50">
                  <div>
                    <p className="font-medium text-sm">{b.service_title || 'Booking'}</p>
                    <p className="text-xs text-slate-500">{b.scheduled_at ? new Date(b.scheduled_at).toLocaleDateString() : '—'}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium capitalize text-emerald-800">{b.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-600" />
            <h2 className="font-semibold">Quick Actions</h2>
          </div>
          <div className="mt-4 grid gap-3">
            <Link to="/requests/new" className="btn-primary text-center">Create AI Request</Link>
            <Link to="/provider/setup" className="btn-secondary text-center">Become a Provider</Link>
            <Link to="/verification" className="btn-secondary text-center">Get Verified</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
