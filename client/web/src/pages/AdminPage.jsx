import { useEffect, useState } from 'react'
import { adminApi, verificationApi } from '../api'
import { LoadingScreen, ErrorAlert } from '../components/ui/Feedback'
import { extractError } from '../api/client'

export default function AdminPage() {
  const [tab, setTab] = useState('overview')
  const [overview, setOverview] = useState(null)
  const [users, setUsers] = useState([])
  const [reports, setReports] = useState([])
  const [verifications, setVerifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [ov, u, r, v] = await Promise.all([
        adminApi.overview(),
        adminApi.users({ limit: 50 }),
        adminApi.reports(),
        adminApi.verificationRequests(),
      ])
      setOverview(ov)
      setUsers(Array.isArray(u) ? u : [])
      setReports(Array.isArray(r) ? r : [])
      setVerifications(Array.isArray(v) ? v : [])
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const reviewVerification = async (id, status) => {
    try {
      await verificationApi.review(id, { status })
      load()
    } catch (err) {
      setError(extractError(err))
    }
  }

  if (loading) return <LoadingScreen />
  if (error) return <ErrorAlert message={error} onRetry={load} />

  const tabs = ['overview', 'users', 'reports', 'verification']

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${tab === t ? 'bg-emerald-600 text-white' : 'bg-white/70 text-slate-600'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && overview && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(overview).slice(0, 8).map(([key, val]) => (
            <div key={key} className="glass-card p-5">
              <p className="text-2xl font-bold text-emerald-700">{val ?? 0}</p>
              <p className="text-sm capitalize text-slate-500">{key.replace(/_/g, ' ')}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-slate-500">
              <th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">City</th><th className="p-3">Admin</th>
            </tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="p-3 font-medium">{u.full_name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.location_city || '—'}</td>
                  <td className="p-3">{u.is_admin ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'reports' && (
        <div className="mt-6 space-y-3">
          {reports.length === 0 ? <p className="text-slate-500">No reports.</p> : reports.map((r) => (
            <div key={r.id} className="glass-card p-4">
              <div className="flex justify-between">
                <span className="font-medium capitalize">{r.reason}</span>
                <span className="text-xs capitalize text-slate-500">{r.status}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{r.details}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'verification' && (
        <div className="mt-6 space-y-3">
          {verifications.length === 0 ? <p className="text-slate-500">No pending verifications.</p> : verifications.map((v) => (
            <div key={v.id} className="glass-card flex items-center justify-between p-4">
              <div>
                <p className="font-medium capitalize">{v.document_type?.replace('_', ' ')}</p>
                <p className="text-xs text-slate-500">{v.user_name || v.user_id}</p>
              </div>
              {v.status === 'pending' ? (
                <div className="flex gap-2">
                  <button type="button" onClick={() => reviewVerification(v.id, 'approved')} className="rounded-full bg-emerald-600 px-3 py-1 text-xs text-white">Approve</button>
                  <button type="button" onClick={() => reviewVerification(v.id, 'rejected')} className="rounded-full bg-red-500 px-3 py-1 text-xs text-white">Reject</button>
                </div>
              ) : (
                <span className="text-xs capitalize">{v.status}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
