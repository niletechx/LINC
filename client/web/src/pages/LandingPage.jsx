import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, MapPin, Sparkles, Shield, MapPinned, MessageCircle, CreditCard, Star } from 'lucide-react'
import { useState } from 'react'

const tags = ['Home Cleaning', 'Phone Repair', 'Tutoring', 'Plumbing', 'Delivery', 'Photography']
const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '2K+', label: 'Verified Providers' },
  { value: '5K+', label: 'Services Available' },
  { value: '4.8', label: 'User Rating' },
]
const features = [
  { icon: Sparkles, title: 'Smart Matching', desc: 'AI-powered matching finds the right provider for your need.' },
  { icon: Shield, title: 'Verified Providers', desc: 'Trusted and verified service professionals.' },
  { icon: MapPinned, title: 'Location Based', desc: 'Discover services in your area.' },
  { icon: MessageCircle, title: 'Real-Time Chat', desc: 'Instant communication with providers.' },
  { icon: CreditCard, title: 'Secure Payments', desc: 'Safe and flexible payment options.' },
  { icon: Star, title: 'Ratings & Reviews', desc: 'Real feedback from customers.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('Addis Ababa, Ethiopia')

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/requests/new?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`)
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold leading-tight text-slate-900 md:text-6xl"
          >
            Your Need. <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Our Connection.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-2xl text-lg text-slate-600"
          >
            Describe what you need — LINC understands, matches, and connects you with verified providers nearby.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSearch}
            className="glass mx-auto mt-10 max-w-2xl rounded-2xl p-3 md:p-4"
          >
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  className="input-field pl-10"
                  placeholder="What do you need?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="relative md:w-56">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  className="input-field pl-10"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary shrink-0">Search</button>
            </div>
          </motion.form>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => { setQuery(tag); navigate(`/requests/new?q=${encodeURIComponent(tag)}`) }}
                className="rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm hover:bg-emerald-50 hover:text-emerald-700"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5 text-center"
          >
            <p className="text-2xl font-bold text-emerald-700 md:text-3xl">{s.value}</p>
            <p className="mt-1 text-sm text-slate-500">{s.label}</p>
          </motion.div>
        ))}
      </section>

      {/* Features footer bar */}
      <section className="glass-dark mx-4 mt-16 rounded-2xl p-8 md:mx-auto md:max-w-6xl">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Icon size={22} className="text-emerald-200" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="mt-1 text-sm text-emerald-100/70">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16 text-center">
        <Link to="/register" className="btn-primary text-base">Join LINC Today</Link>
      </section>
    </div>
  )
}
