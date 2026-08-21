import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { verificationApi, providersApi } from '../api'
import { LoadingScreen, EmptyState } from '../components/ui/Feedback'
import { extractError } from '../api/client'

export default function VerificationPage() {
  const [requests, setRequests] = useState([])
  const [providerId, setProviderId] = useState('')
  const [form, setForm] = useState({ document_type: 'id_card', document_url: '', notes: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    try {
      const [data, profile] = await Promise.all([
        verificationApi.myRequests(),
        providersApi.me().catch(() => null),
      ])
      setRequests(Array.isArray(data) ? data : [])
      if (profile?.id) setProviderId(profile.id)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!providerId) { setError('Create a provider profile first'); return }
    setSubmitting(true)
    setError('')
    try {
      await verificationApi.create({
        entity_type: 'provider',
        entity_id: providerId,
        documents: [{ type: form.document_type, url: form.document_url, notes: form.notes }],
      })
      setSuccess('Verification request submitted!')
      setForm({ document_type: 'id_card', document_url: '', notes: '' })
      load()
    } catch (err) {
      setError(extractError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3">
        <ShieldCheck className="text-emerald-600" size={28} />
        <div>
          <h1 className="text-2xl font-bold">Provider Verification</h1>
          <p className="text-sm text-slate-500">Submit documents to get verified</p>
        </div>
      </div>

      {!providerId && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You need a provider profile before submitting verification. Go to Provider Setup first.
        </p>
      )}

      <form onSubmit={submit} className="glass-card mt-6 space-y-4 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Document Type</label>
          <select className="input-field" value={form.document_type} onChange={(e) => setForm({ ...form, document_type: e.target.value })}>
            <option value="id_card">National ID</option>
            <option value="passport">Passport</option>
            <option value="business_license">Business License</option>
            <option value="certificate">Professional Certificate</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Document URL</label>
          <input className="input-field" placeholder="https://..." value={form.document_url} onChange={(e) => setForm({ ...form, document_url: e.target.value })} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Notes</label>
          <textarea className="input-field" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-emerald-600">{success}</p>}
        <button type="submit" className="btn-primary w-full" disabled={submitting || !providerId}>
          {submitting ? 'Submitting...' : 'Submit for Verification'}
        </button>
      </form>

      <h2 className="mb-3 mt-8 font-semibold">Your Requests</h2>
      {requests.length === 0 ? (
        <EmptyState title="No verification requests" description="Submit your first verification above." />
      ) : (
        <div className="space-y-2">
          {requests.map((r) => (
            <div key={r.id} className="glass-card flex items-center justify-between p-4">
              <div>
                <p className="font-medium capitalize">{r.entity_type}</p>
                <p className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                r.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
              }`}>{r.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
