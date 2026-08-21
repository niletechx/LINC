import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usersApi } from '../api'
import { useAuthStore } from '../store/authStore'
import { LoadingScreen, ErrorAlert } from '../components/ui/Feedback'
import { extractError } from '../api/client'

export default function ProfilePage() {
  const { user, refreshUser } = useAuthStore()
  const [form, setForm] = useState({
    full_name: '', username: '', phone: '', location_city: '', headline: '', bio: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const u = await usersApi.me()
        setForm({
          full_name: u.full_name || '',
          username: u.username || '',
          phone: u.phone || '',
          location_city: u.location_city || '',
          headline: u.headline || '',
          bio: u.bio || '',
        })
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
    setSuccess('')
    try {
      await usersApi.updateMe(form)
      await refreshUser()
      setSuccess('Profile updated successfully')
    } catch (err) {
      setError(extractError(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="mt-1 text-sm text-slate-500">{user?.email}</p>

      <form onSubmit={submit} className="glass-card mt-6 space-y-4 p-6">
        {['full_name', 'username', 'phone', 'location_city', 'headline'].map((field) => (
          <div key={field}>
            <label className="mb-1 block text-sm font-medium capitalize">{field.replace('_', ' ')}</label>
            <input className="input-field" value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
          </div>
        ))}
        <div>
          <label className="mb-1 block text-sm font-medium">Bio</label>
          <textarea className="input-field min-h-[80px]" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-emerald-600">{success}</p>}
        <button type="submit" className="btn-primary w-full" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div className="mt-6 grid gap-3">
        <Link to="/provider/setup" className="btn-secondary text-center">Provider Profile Setup</Link>
        <Link to="/business/setup" className="btn-secondary text-center">Business Profile Setup</Link>
        <Link to="/verification" className="btn-secondary text-center">Verification</Link>
      </div>
    </div>
  )
}
