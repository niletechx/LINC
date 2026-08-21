import { useEffect, useState } from 'react'
import { businessesApi } from '../api'
import { LoadingScreen } from '../components/ui/Feedback'
import { extractError } from '../api/client'

export default function BusinessSetupPage() {
  const [form, setForm] = useState({
    name: '', description: '', location_city: 'Addis Ababa', phone: '', website: '',
  })
  const [exists, setExists] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const biz = await businessesApi.me()
        setExists(true)
        setForm({
          name: biz.name || '',
          description: biz.description || '',
          location_city: biz.location_city || '',
          phone: biz.phone || '',
          website: biz.website || '',
        })
      } catch { /* no business */ }
      finally { setLoading(false) }
    })()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (exists) await businessesApi.update(form)
      else await businessesApi.create(form)
      setSuccess('Business profile saved!')
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
      <h1 className="text-2xl font-bold">{exists ? 'Edit Business' : 'Create Business Profile'}</h1>
      <form onSubmit={submit} className="glass-card mt-6 space-y-4 p-6">
        {['name', 'location_city', 'phone', 'website'].map((field) => (
          <div key={field}>
            <label className="mb-1 block text-sm font-medium capitalize">{field.replace('_', ' ')}</label>
            <input className="input-field" value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} required={field === 'name'} />
          </div>
        ))}
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea className="input-field min-h-[100px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-emerald-600">{success}</p>}
        <button type="submit" className="btn-primary w-full" disabled={saving}>
          {saving ? 'Saving...' : exists ? 'Update Business' : 'Create Business'}
        </button>
      </form>
    </div>
  )
}
