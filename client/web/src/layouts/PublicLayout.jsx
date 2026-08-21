import { Link, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

export default function PublicLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const links = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
    { to: '/providers', label: 'Providers' },
    { to: '/requests/new', label: 'How It Works' },
  ]

  return (
    <div className="min-h-screen">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass sticky top-0 z-40 border-b border-white/50"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-blue-600 text-sm font-bold text-white">L</div>
            <span className="text-xl font-bold text-emerald-900">LINC</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="text-sm font-medium text-slate-600 hover:text-emerald-700">{l.label}</Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <Link to="/dashboard" className="btn-secondary py-2 text-sm">Dashboard</Link>
                <button type="button" onClick={handleLogout} className="text-sm text-slate-500 hover:text-red-600">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-emerald-700">Sign In</Link>
                <Link to="/register" className="btn-primary py-2 text-sm">Get Started</Link>
              </>
            )}
          </div>

          <button type="button" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/50 px-4 py-4 md:hidden">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="block py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>{l.label}</Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              {user ? (
                <>
                  <Link to="/dashboard" className="btn-primary py-2 text-sm" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <button type="button" onClick={handleLogout} className="text-sm text-red-600">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary py-2 text-sm" onClick={() => setMenuOpen(false)}>Sign In</Link>
                  <Link to="/register" className="btn-primary py-2 text-sm" onClick={() => setMenuOpen(false)}>Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </motion.header>
      <main><Outlet /></main>
    </div>
  )
}
