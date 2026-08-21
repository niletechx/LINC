import { Link, useLocation } from 'react-router-dom';
import { 
  Layers, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  Briefcase, 
  User, 
  Wallet, 
  Wrench, 
  ListOrdered, 
  ShoppingBag,
  ArrowLeftRight
} from 'lucide-react';
import { APP_CONFIG } from '../../config/constants';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';
import { useProviderStore } from '../../stores/providerStore';

export default function Navbar({ activeTab = 'home' }) {
  const location = useLocation();
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
        ? 'Switched to Specialist Dashboard 💼'
        : 'Switched to Household Client View 👤',
      'info'
    );
  };

  // 1. Authenticated Provider Navigation Tabs
  const providerNavTabs = [
    { id: 'home', label: 'Dashboard', path: '/home' },
    { id: 'jobs', label: 'Active Jobs', path: '/provider/jobs', badge: activeJobsCount },
    { id: 'market', label: 'Job Market', path: '/requests' },
    { id: 'wallet', label: 'Wallet & Escrow', path: '/provider/wallet' },
    { id: 'services', label: 'Services & Rates', path: '/provider/services' },
    { id: 'business', label: 'Company / Team', path: '/business/manage' },
    { id: 'showcase', label: 'Showcase', path: '/provider/showcase' },
    { id: 'messages', label: 'Messages', path: '/messages', badge: totalUnreadMessages },
    ...(user?.is_admin ? [{ id: 'admin', label: '👑 Admin Portal', path: '/admin' }] : []),
    { id: 'profile', label: 'Profile', path: '/profile' },
  ];

  // 2. Authenticated Client Navigation Tabs
  const clientNavTabs = [
    { id: 'home', label: 'Home', path: '/home' },
    { id: 'services', label: 'Find Services', path: '/search' },
    { id: 'requests', label: 'Job Requests', path: '/requests' },
    { id: 'ai', label: 'AI Match', path: '/ai', highlight: true },
    { id: 'bookings', label: 'Bookings', path: '/bookings' },
    { id: 'messages', label: 'Messages', path: '/messages', badge: totalUnreadMessages },
    ...(user?.is_admin ? [{ id: 'admin', label: '👑 Admin Portal', path: '/admin' }] : []),
    { id: 'profile', label: 'Profile', path: '/profile' },
  ];

  // 3. Public Navigation Tabs
  const publicNavTabs = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'services', label: 'Find Services', path: '/search' },
    { 
      id: 'ai', 
      label: 'AI Match', 
      path: '#', 
      highlight: true,
      onClick: (e) => {
        e.preventDefault();
        openAuthModal('Sign in or create an account to use LINC AI Matchmaker.');
      }
    },
    { id: 'login', label: 'Sign In', path: '/login' },
    { id: 'signup', label: 'Join LINC', path: '/signup', primary: true },
  ];

  let navTabs = publicNavTabs;
  if (isAuthenticated) {
    navTabs = appMode === 'provider' ? providerNavTabs : clientNavTabs;
  }

  return (
    <header className="navbar-container hidden md:flex">
      {/* Brand Logo with Amharic Badging & Mode Pill */}
      <div className="flex items-center gap-3">
        <Link to={isAuthenticated ? '/home' : '/'} className="navbar-brand">
          <div className="brand-badge-icon">
            <Layers size={22} className="text-white" />
          </div>
          <div className="brand-text-block">
            <div className="brand-title-row">
              <span className="brand-name">{APP_CONFIG.appName}</span>
              <span className="brand-amharic-badge">{APP_CONFIG.appAmharicName}</span>
            </div>
            <span className="brand-tagline">{APP_CONFIG.appTagline}</span>
          </div>
        </Link>

        {isAuthenticated && (
          <button
            type="button"
            onClick={handleToggleAppMode}
            className={`navbar-mode-pill ${appMode === 'provider' ? 'provider-active' : 'client-active'}`}
            title={`Currently in ${appMode === 'provider' ? 'Specialist Workspace' : 'Client Mode'}. Click to switch.`}
          >
            {appMode === 'provider' ? (
              <>
                <span className="mode-dot provider" />
                <span className="mode-text">Specialist Pro</span>
                <span className="mode-switch-hint">Switch to Client 👤</span>
              </>
            ) : (
              <>
                <span className="mode-dot client" />
                <span className="mode-text">Client Mode</span>
                <span className="mode-switch-hint">Switch to Pro 💼</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Clean & Compact Pill Tabs */}
      <div className="navbar-pill-tabs-container">
        <nav className="navbar-pill-tabs" aria-label="Main Navigation">
          {navTabs.map((tab) => {
            const isActive = location.pathname === tab.path || (tab.id === 'home' && location.pathname === '/');
            return (
              <Link
                key={tab.id}
                to={tab.path}
                onClick={tab.onClick}
                className={`pill-tab-item ${isActive ? 'active' : ''} ${tab.highlight ? 'highlight-tab' : ''} ${tab.primary ? 'primary-tab' : ''}`}
                style={tab.primary ? { background: '#0F172A', color: '#ffffff', fontWeight: 700 } : undefined}
              >
                {tab.id === 'ai' && <Sparkles size={13} className="tab-icon-sparkle animate-pulse" />}
                {tab.id === 'login' && <LogIn size={13} />}
                {tab.id === 'signup' && <UserPlus size={13} />}
                <span>{tab.label}</span>
                {tab.badge > 0 && <span className="tab-unread-badge">{tab.badge}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
