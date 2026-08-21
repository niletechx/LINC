import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { extractError } from '../api/client'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading } = useAuthStore()
  const [form, setForm] = useState({
    email: '', password: '', full_name: '', username: '', location_city: 'Addis Ababa',
  })
  const [error, setError] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (form.username.length < 3) { setError('Username must be at least 3 characters'); return }
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(extractError(err))
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass w-full max-w-md rounded-2xl p-8">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Join LINC — connect needs with solutions</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Full Name</label>
            <input className="input-field" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Username</label>
            <input className="input-field" value={form.username} onChange={(e) => set('username', e.target.value)} required pattern="[a-zA-Z0-9_]+" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input type="email" className="input-field" value={form.email} onChange={(e) => set('email', e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input type="password" className="input-field" value={form.password} onChange={(e) => set('password', e.target.value)} required minLength={6} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">City</label>
            <input className="input-field" value={form.location_city} onChange={(e) => set('location_city', e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-semibold text-emerald-700">Sign In</Link>
        </p>
      </motion.div>
    </div>
  )
}
