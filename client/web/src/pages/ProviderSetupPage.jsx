import { useEffect, useState } from 'react'
import { providersApi, categoriesApi } from '../api'
import { LoadingScreen, ErrorAlert } from '../components/ui/Feedback'
import { extractError } from '../api/client'

export default function ProviderSetupPage() {
  const [form, setForm] = useState({
    headline: '', bio: '', hourly_rate: '', currency: 'ETB',
    location_city: 'Addis Ababa', availability_status: 'available', category_ids: [],
  })
  const [categories, setCategories] = useState([])
  const [exists, setExists] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const cats = await categoriesApi.list()
        setCategories(Array.isArray(cats) ? cats : [])
        try {
          const profile = await providersApi.me()
          setExists(true)
          setForm({
            headline: profile.headline || '',
            bio: profile.bio || '',
            hourly_rate: profile.hourly_rate || '',
            currency: profile.currency || 'ETB',
            location_city: profile.location_city || '',
            availability_status: profile.availability_status || 'available',
            category_ids: profile.category_ids || [],
          })
        } catch { /* no profile yet */ }
      } catch (err) {
        setError(extractError(err))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const body = { ...form, hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : undefined }
      if (exists) await providersApi.update(body)
      else await providersApi.create(body)
      setSuccess('Provider profile saved!')
      setExists(true)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold">{exists ? 'Edit Provider Profile' : 'Become a Provider'}</h1>
      <form onSubmit={submit} className="glass-card mt-6 space-y-4 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Headline</label>
          <input className="input-field" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Bio</label>
          <textarea className="input-field min-h-[100px]" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Hourly Rate</label>
            <input type="number" className="input-field" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">City</label>
            <input className="input-field" value={form.location_city} onChange={(e) => setForm({ ...form, location_city: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Availability</label>
          <select className="input-field" value={form.availability_status} onChange={(e) => setForm({ ...form, availability_status: e.target.value })}>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        {categories.length > 0 && (
          <div>
            <label className="mb-1 block text-sm font-medium">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={form.category_ids.includes(c.id)}
                    onChange={(e) => {
                      const ids = e.target.checked
                        ? [...form.category_ids, c.id]
                        : form.category_ids.filter((x) => x !== c.id)
                      setForm({ ...form, category_ids: ids })
                    }}
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-emerald-600">{success}</p>}
        <button type="submit" className="btn-primary w-full" disabled={saving}>
          {saving ? 'Saving...' : exists ? 'Update Profile' : 'Create Profile'}
        </button>
      </form>
    </div>
  )
}
