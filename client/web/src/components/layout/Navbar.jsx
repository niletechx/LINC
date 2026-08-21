import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ChevronRight, 
  Menu, 
  X,
  Briefcase,
  User,
  ShieldCheck,
  Zap,
  Layers,
  Home,
  Search,
  MessageSquare
} from 'lucide-react';
import { APP_CONFIG } from '../../config/constants';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';
import { useProviderStore } from '../../stores/providerStore';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const { appMode, setAppMode, openAuthModal, showToast } = useAppStore();
  const { conversations } = useChatStore();
  const { jobs } = useProviderStore();

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + (c.unread || 0), 0);
  const activeJobsCount = jobs.filter((j) => j.stage !== 'completed').length;

  const handleToggleAppMode = (e) => {
    e.preventDefault();
    const nextMode = appMode === 'provider' ? 'client' : 'provider';
    setAppMode(nextMode);
    showToast(
      nextMode === 'provider'
        ? 'Switched to Specialist Pro Dashboard 💼'
        : 'Switched to Household Client View 👤',
      'info'
    );
  };

  const handlePostAJob = () => {
    if (!isAuthenticated) {
      navigate('/signup?intent=post-job');
    } else {
      navigate('/requests');
    }
  };

  // 1. Authenticated Provider Navigation Tabs
  const providerNavTabs = [
    { id: 'home', label: 'Dashboard', path: '/home' },
    { id: 'jobs', label: 'Active Jobs', path: '/provider/jobs', badge: activeJobsCount },
    { id: 'market', label: 'Market', path: '/requests' },
    { id: 'wallet', label: 'Escrow Wallet', path: '/provider/wallet' },
    { id: 'services', label: 'Services', path: '/provider/services' },
    { id: 'business', label: 'Company', path: '/business/manage' },
    { id: 'messages', label: 'Messages', path: '/messages', badge: totalUnreadMessages },
    ...(user?.is_admin ? [{ id: 'admin', label: 'Admin', path: '/admin' }] : []),
    { id: 'profile', label: 'Profile', path: '/profile' },
  ];

  // 2. Authenticated Client Navigation Tabs
  const clientNavTabs = [
    { id: 'home', label: 'Home', path: '/home' },
    { id: 'how-it-works', label: 'How it Works', path: '/#how-it-works' },
    { id: 'specialists', label: 'Specialists', path: '/search' },
    { id: 'booking', label: 'Booking', path: '/bookings' },
    { id: 'ai', label: 'AI Match', path: '/ai', highlight: true },
    { id: 'messages', label: 'Messages', path: '/messages', badge: totalUnreadMessages },
    ...(user?.is_admin ? [{ id: 'admin', label: 'Admin', path: '/admin' }] : []),
    { id: 'profile', label: 'Profile', path: '/profile' },
  ];

  // 3. Public Navigation Tabs (Exact Mockup)
  const publicNavTabs = [
    { id: 'how-it-works', label: 'How it Works', path: '/#how-it-works' },
    { id: 'specialists', label: 'Specialists', path: '/search' },
    { id: 'booking', label: 'Booking', path: '/search' },
  ];

  const currentTabs = !isAuthenticated 
    ? publicNavTabs 
    : (appMode === 'provider' ? providerNavTabs : clientNavTabs);

  // Mobile Bottom App Bar Items
  const mobileBottomNav = [
    { id: 'home', label: 'Home', path: isAuthenticated ? '/home' : '/', icon: Home },
    { id: 'search', label: 'Search', path: '/search', icon: Search },
    { id: 'ai', label: 'AI Match', path: '/ai', icon: Sparkles, highlight: true },
    { id: 'messages', label: 'Chat', path: '/messages', icon: MessageSquare, badge: totalUnreadMessages },
    { id: 'profile', label: 'Account', path: isAuthenticated ? '/profile' : '/login', icon: User },
  ];

  return (
    <>
      <header className="sticky top-3 z-50 w-full px-4 sm:px-6 lg:px-8 transition-all">
        <div className="max-w-6xl mx-auto rounded-full backdrop-blur-md bg-white/95 border border-slate-200/90 shadow-sm px-5 py-2.5 flex items-center justify-between gap-4">
          
          {/* Brand Logo with Teal Mark */}
          <div className="flex items-center gap-3">
            <Link to={isAuthenticated ? '/home' : '/'} className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm group-hover:scale-105 transition-transform">
                <Layers size={18} />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                {APP_CONFIG.appName || 'LINC'}
              </span>
            </Link>

            {/* Mode Switcher Pill (Authenticated Only) */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleToggleAppMode}
                className={`hidden lg:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  appMode === 'provider'
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-teal-50 text-teal-900 border-teal-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${appMode === 'provider' ? 'bg-amber-500' : 'bg-teal-600'}`} />
                <span>{appMode === 'provider' ? 'Pro Mode' : 'Client'}</span>
              </button>
            )}
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {currentTabs.map((tab) => {
              const isActive = location.pathname === tab.path || (tab.id === 'specialists' && location.pathname === '/search');
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  onClick={tab.onClick}
                  className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'text-teal-700 font-bold'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  {tab.highlight && <Sparkles size={13} className="text-amber-500 animate-pulse" />}
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-teal-600 text-white">
                      {tab.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right CTA / Auth Buttons */}
          <div className="hidden sm:flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-slate-950 px-2 py-1 transition-colors"
                >
                  Login
                </Link>
                <button
                  type="button"
                  onClick={handlePostAJob}
                  className="inline-flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold px-5 py-2 rounded-full shadow-sm hover:shadow transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>Post a Job</span>
                </button>
              </>
            ) : (
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-xs font-bold text-white">
                  {user?.name?.[0] || 'U'}
                </div>
                <span className="max-w-[110px] truncate">{user?.name || 'Account'}</span>
              </Link>
            )}
          </div>

          {/* Mobile Right CTA (Post a Job or Profile shortcut) */}
          <div className="flex sm:hidden items-center gap-2">
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={handlePostAJob}
                className="bg-teal-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xs"
              >
                Post a Job
              </button>
            ) : (
              <Link
                to="/profile"
                className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-xs font-bold text-white shadow-xs"
              >
                {user?.name?.[0] || 'U'}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile Floating Bottom App Bar (Native App Feel) ── */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden w-[92%] max-w-sm bg-white/95 backdrop-blur-lg border border-slate-200/90 shadow-2xl rounded-full px-4 py-2 flex items-center justify-around">
        {mobileBottomNav.map((item) => {
          const IconComp = item.icon;
          const isActive = location.pathname === item.path || (item.id === 'search' && location.pathname === '/search');
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`relative flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-full transition-colors ${
                isActive ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <IconComp size={18} className={isActive ? 'text-teal-700' : 'text-slate-500'} />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
              {item.badge > 0 && (
                <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-teal-600" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
