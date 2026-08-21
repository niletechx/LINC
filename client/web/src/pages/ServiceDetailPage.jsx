import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { servicesApi, reviewsApi } from '../api'
import { LoadingScreen, ErrorAlert } from '../components/ui/Feedback'
import { extractError } from '../api/client'
import { Star } from 'lucide-react'

export default function ServiceDetailPage() {
  const { id } = useParams()
  const [service, setService] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const svc = await servicesApi.get(id)
        setService(svc)
        const entityType = svc.provider_id ? 'provider' : svc.business_id ? 'business' : 'organization'
        const entityId = svc.provider_id || svc.business_id || svc.organization_id
        if (entityId) {
          try {
            const rev = await reviewsApi.list(entityType, entityId)
            setReviews(Array.isArray(rev) ? rev : [])
          } catch { /* optional */ }
        }
      } catch (err) {
        setError(extractError(err))
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) return <LoadingScreen />
  if (error) return <ErrorAlert message={error} />
  if (!service) return null

  return (
    <div className="max-w-3xl">
      <div className="glass-card overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-emerald-200 to-blue-200" />
        <div className="p-6">
          <h1 className="text-2xl font-bold">{service.title || service.name}</h1>
          <p className="mt-2 text-slate-600">{service.description}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {service.price_amount != null && (
              <span className="text-lg font-bold text-emerald-700">{service.price_amount} {service.currency || 'ETB'}</span>
            )}
            {service.avg_rating != null && (
              <span className="inline-flex items-center gap-1 text-amber-600">
                <Star size={16} fill="currentColor" /> {Number(service.avg_rating).toFixed(1)}
              </span>
            )}
          </div>
          <div className="mt-6 flex gap-3">
            <Link to={`/bookings/new?service=${service.id}`} className="btn-primary">Book Now</Link>
            <Link to="/messages" className="btn-secondary">Chat</Link>
          </div>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="mt-6 glass-card p-6">
          <h2 className="font-semibold">Reviews</h2>
          <div className="mt-4 space-y-3">
            {reviews.slice(0, 5).map((r) => (
              <div key={r.id} className="border-b border-slate-100 pb-3 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-amber-600">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span className="text-sm text-slate-500">{r.reviewer_name || 'User'}</span>
                </div>
                {r.comment && <p className="mt-1 text-sm text-slate-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
