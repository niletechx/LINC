import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ShieldCheck, Star, Flag } from 'lucide-react'
import { providersApi, reviewsApi } from '../api'
import { LoadingScreen, ErrorAlert } from '../components/ui/Feedback'
import ReportModal from '../components/ReportModal'
import { extractError } from '../api/client'

export default function ProviderDetailPage() {
  const { id } = useParams()
  const [provider, setProvider] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reportOpen, setReportOpen] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const [p, r] = await Promise.all([
          providersApi.get(id),
          reviewsApi.list('provider', id).catch(() => []),
        ])
        setProvider(p)
        setReviews(Array.isArray(r) ? r : [])
      } catch (err) {
        setError(extractError(err))
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) return <LoadingScreen />
  if (error) return <ErrorAlert message={error} />
  if (!provider) return null

  const name = provider.full_name || provider.display_name || 'Provider'
  const verified = provider.is_verified || provider.verification_status === 'verified'

  return (
    <div className="max-w-3xl">
      <div className="glass-card p-6">
        <div className="flex items-start gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 text-2xl font-bold text-white">
            {name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{name}</h1>
              {verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  <ShieldCheck size={14} /> Verified
                </span>
              )}
            </div>
            {provider.headline && <p className="mt-1 text-slate-600">{provider.headline}</p>}
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              {provider.avg_rating != null && (
                <span className="inline-flex items-center gap-1 text-amber-600">
                  <Star size={16} fill="currentColor" /> {Number(provider.avg_rating).toFixed(1)}
                </span>
              )}
              {provider.location_city && <span className="text-slate-500">{provider.location_city}</span>}
              {provider.hourly_rate && (
                <span className="font-semibold text-emerald-700">{provider.hourly_rate} {provider.currency || 'ETB'}/hr</span>
              )}
            </div>
            {provider.bio && <p className="mt-4 text-slate-600">{provider.bio}</p>}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={`/bookings/new?provider=${provider.id}`} className="btn-primary">Book Now</Link>
          <Link to={`/messages?provider=${provider.id}`} className="btn-secondary">Chat</Link>
          <button type="button" onClick={() => setReportOpen(true)} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-red-600">
            <Flag size={16} /> Report
          </button>
        </div>
      </div>

      <div className="mt-6 glass-card p-6">
        <h2 className="font-semibold">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No reviews yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-slate-100 pb-4 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-amber-600">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span className="text-sm font-medium">{r.reviewer_name || 'User'}</span>
                </div>
                {r.comment && <p className="mt-1 text-sm text-slate-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <ReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} entityType="provider" entityId={id} />
    </div>
  )
}
