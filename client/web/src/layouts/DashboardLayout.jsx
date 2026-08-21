import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Users, Calendar, MessageSquare, Heart,
  Star, CreditCard, Settings, LogOut, Shield, Menu, X, Building2, BadgeCheck,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/requests/new', icon: FileText, label: 'New Request' },
  { to: '/providers', icon: Users, label: 'Providers' },
  { to: '/services', icon: Heart, label: 'Services' },
  { to: '/bookings', icon: Calendar, label: 'Bookings' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/profile', icon: Settings, label: 'Profile' },
  { to: '/provider/setup', icon: BadgeCheck, label: 'Provider Setup' },
  { to: '/business/setup', icon: Building2, label: 'Business Setup' },
  { to: '/verification', icon: Shield, label: 'Verification' },
  { to: '/admin', icon: Star, label: 'Admin', adminOnly: true },
]

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const filteredNav = navItems.filter((item) => !item.adminOnly || user?.is_admin)

  const Sidebar = ({ mobile = false }) => (
    <aside className={`glass-dark flex h-full w-64 flex-col text-white ${mobile ? '' : 'hidden lg:flex'}`}>
      <div className="border-b border-white/10 p-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-sm font-bold">L</div>
          <span className="text-lg font-bold">LINC</span>
        </Link>
        <p className="mt-2 truncate text-xs text-emerald-100/70">{user?.full_name || user?.email}</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {filteredNav.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + '/')
          return (
            <Link
              key={to}
              to={to}
              onClick={() => mobile && setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active ? 'bg-white/20 text-white' : 'text-emerald-100/80 hover:bg-white/10'
              }`}
            >
              <Icon size={18} /> {label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-emerald-100/80 hover:bg-white/10">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full"><Sidebar mobile /></div>
        </div>
      )}
      <div className="flex flex-1 flex-col">
        <header className="glass flex items-center gap-3 border-b border-white/50 px-4 py-3 lg:hidden">
          <button type="button" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
          <span className="font-semibold text-emerald-900">LINC</span>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="page-enter mx-auto max-w-7xl"><Outlet /></div>
        </main>
      </div>
    </div>
  )
}
