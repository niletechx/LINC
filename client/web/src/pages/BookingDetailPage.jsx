import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { bookingsApi, servicesApi, providersApi } from '../api'
import { LoadingScreen, ErrorAlert } from '../components/ui/Feedback'
import { extractError } from '../api/client'
import { useNavigate } from 'react-router-dom'

export default function BookingDetailPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isNew = id === 'new' || !id

  const [booking, setBooking] = useState(null)
  const [form, setForm] = useState({
    service_id: searchParams.get('service') || '',
    entity_id: searchParams.get('provider') || '',
    entity_type: 'provider',
    scheduled_at: '',
    notes: '',
    agreed_price: '',
  })
  const [loading, setLoading] = useState(!isNew)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isNew) {
      const loadDefaults = async () => {
        if (form.service_id) {
          try {
            const svc = await servicesApi.get(form.service_id)
            setForm((f) => ({ ...f, agreed_price: svc.price_amount || '', entity_id: svc.provider_id || f.entity_id }))
          } catch { /* ignore */ }
        } else if (form.entity_id) {
          try {
            const p = await providersApi.get(form.entity_id)
            setForm((f) => ({ ...f, agreed_price: p.hourly_rate || '' }))
          } catch { /* ignore */ }
        }
      }
      loadDefaults()
      return
    }
    (async () => {
      try {
        setBooking(await bookingsApi.get(id))
      } catch (err) {
        setError(extractError(err))
      } finally {
        setLoading(false)
      }
    })()
  }, [id, isNew, form.service_id, form.entity_id])

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const created = await bookingsApi.create({
        ...form,
        agreed_price: form.agreed_price ? Number(form.agreed_price) : undefined,
        scheduled_at: form.scheduled_at || new Date(Date.now() + 86400000).toISOString(),
      })
      navigate(`/bookings/${created.id}`)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const markComplete = async () => {
    try {
      await bookingsApi.complete(id)
      setBooking(await bookingsApi.get(id))
    } catch (err) {
      setError(extractError(err))
    }
  }

  if (loading) return <LoadingScreen />

  if (isNew) {
    return (
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold">New Booking</h1>
        <form onSubmit={submit} className="glass-card mt-6 space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium">Scheduled Date & Time</label>
            <input type="datetime-local" className="input-field" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Agreed Price (ETB)</label>
            <input type="number" className="input-field" value={form.agreed_price} onChange={(e) => setForm({ ...form, agreed_price: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Notes</label>
            <textarea className="input-field" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Creating...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    )
  }

  if (error && !booking) return <ErrorAlert message={error} />
  if (!booking) return null

  return (
    <div className="max-w-lg">
      <Link to="/bookings" className="text-sm text-emerald-700">← Back to bookings</Link>
      <div className="glass-card mt-4 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Booking Details</h1>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold capitalize text-emerald-800">{booking.status}</span>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <p><span className="text-slate-500">Date:</span> {booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleString() : '—'}</p>
          <p><span className="text-slate-500">Price:</span> {booking.agreed_price} {booking.currency || 'ETB'}</p>
          {booking.notes && <p><span className="text-slate-500">Notes:</span> {booking.notes}</p>}
        </div>
        {['confirmed', 'in_progress'].includes(booking.status) && (
          <button type="button" onClick={markComplete} className="btn-primary mt-4 w-full">Mark Complete</button>
        )}
      </div>
    </div>
  )
}
