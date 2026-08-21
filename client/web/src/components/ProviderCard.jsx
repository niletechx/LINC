import { ShieldCheck, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function ProviderCard({ provider, matchScore, showBook = true }) {
  const name = provider.full_name || provider.users?.full_name || provider.display_name || provider.headline || 'Provider'
  const rating = provider.avg_rating ?? provider.rating ?? 0
  const verified = provider.is_verified || provider.verification_status === 'verified'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden p-5"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 text-lg font-bold text-white">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/providers/${provider.id}`} className="font-semibold text-slate-800 hover:text-emerald-700">
              {name}
            </Link>
            {verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                <ShieldCheck size={12} /> Verified
              </span>
            )}
          </div>
          {provider.headline && <p className="mt-1 text-sm text-slate-500 line-clamp-1">{provider.headline}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1 text-amber-600">
              <Star size={14} fill="currentColor" /> {Number(rating).toFixed(1)}
            </span>
            {provider.location_city && <span className="text-slate-500">{provider.location_city}</span>}
            {provider.hourly_rate && (
              <span className="font-medium text-emerald-700">{provider.hourly_rate} {provider.currency || 'ETB'}/hr</span>
            )}
            {matchScore != null && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                {Math.round(matchScore)}% match
              </span>
            )}
          </div>
        </div>
      </div>
      {showBook && (
        <div className="mt-4 flex gap-2">
          <Link to={`/providers/${provider.id}`} className="btn-secondary flex-1 py-2 text-sm">View Profile</Link>
          <Link to={`/messages?provider=${provider.id}`} className="btn-primary flex-1 py-2 text-sm">Chat</Link>
        </div>
      )}
    </motion.div>
  )
}
