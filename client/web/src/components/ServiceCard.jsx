import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

export default function ServiceCard({ service }) {
  const price = service.price_amount ?? service.hourly_rate
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
      <div className="h-36 bg-gradient-to-br from-emerald-100 to-blue-100" />
      <div className="p-4">
        <Link to={`/services/${service.id}`} className="font-semibold text-slate-800 hover:text-emerald-700">
          {service.title || service.name}
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{service.description}</p>
        <div className="mt-3 flex items-center justify-between">
          {price != null && (
            <span className="font-bold text-emerald-700">{price} {service.currency || 'ETB'}</span>
          )}
          {service.avg_rating != null && (
            <span className="inline-flex items-center gap-1 text-sm text-amber-600">
              <Star size={14} fill="currentColor" /> {Number(service.avg_rating).toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
