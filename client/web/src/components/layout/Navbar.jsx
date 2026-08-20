import { Link, useLocation } from 'react-router-dom';
import { Layers, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { APP_CONFIG } from '../../config/constants';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';

export default function Navbar({ activeTab = 'home' }) {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useAppStore();
  const { conversations } = useChatStore();

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + (c.unread || 0), 0);

  const authNavTabs = [
    { id: 'home', label: 'Home', path: '/home' },
    { id: 'services', label: 'Find Services', path: '/search' },
    { id: 'ai', label: 'AI Match', path: '/ai', highlight: true },
    { id: 'bookings', label: 'Bookings', path: '/bookings' },
    { id: 'messages', label: 'Messages', path: '/messages', badge: totalUnreadMessages },
    { id: 'profile', label: 'Profile', path: '/profile' },
  ];

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

  const navTabs = isAuthenticated ? authNavTabs : publicNavTabs;

  return (
    <header className="navbar-container hidden md:flex">
      {/* Brand Logo with Amharic Badging */}
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
