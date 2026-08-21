import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  LogOut, 
  Briefcase, 
  CheckCircle2, 
  ChevronRight,
  ExternalLink,
  Lock,
  Star,
  Award,
  Zap,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useAppStore } from '../stores/appStore';
import { useBookingStore } from '../stores/bookingStore';
import EditProfileModal from '../components/common/EditProfileModal';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { appMode, setAppMode, showToast } = useAppStore();
  const { bookings } = useBookingStore();

  const [language, setLanguage] = useState('en'); // 'en' | 'am'
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isProvider = appMode === 'provider';

  const totalProtected = bookings
    .filter(b => b.escrowStatus === 'funded_locked')
    .reduce((acc, b) => acc + (b.agreedPrice || 0), 0);

  const completedCount = bookings.filter(b => b.status === 'completed').length;

  const handleLogout = () => {
    logout();
    showToast('Signed out successfully. See you soon! 👋', 'info');
    navigate('/login');
  };

  const handleToggleMode = () => {
    const next = isProvider ? 'client' : 'provider';
    setAppMode(next);
    showToast(`Switched to ${next === 'provider' ? 'Specialist Dashboard 💼' : 'Client View 👤'}`, 'info');
  };

  return (
    <div className="profile-dashboard-wrapper">
      {/* ── 1. Frosted Glass Profile Hero Card ── */}
      <section className="profile-hero-banner-card">
        <div className="profile-hero-identity">
          <div className="profile-avatar-squircle">
            <span>{(user?.full_name || 'Yonas Molla').slice(0, 2).toUpperCase()}</span>
            <span className="profile-verified-dot" title="Verified Account">✓</span>
          </div>

          <div className="profile-hero-details">
            <div className="profile-title-badges">
              <h1 className="profile-user-name">{user?.full_name || 'Yonas Molla'}</h1>
              <span className="profile-role-tag">
                {isProvider ? '💼 Verified Specialist' : '👤 Household Client'}
              </span>
              <span className="fayda-id-verified-chip">
                <ShieldCheck size={13} />
                <span>Fayda ID Verified</span>
              </span>
            </div>

            <p className="profile-headline-sub">
              {user?.headline || 'Member since February 2026 • Bole, Addis Ababa, Ethiopia'}
            </p>

            <div className="profile-contact-chips-row">
              <span className="contact-chip">
                <Phone size={12} className="text-cyan" />
                <span>{user?.phone || '+251 911 234 567'}</span>
              </span>
              <span className="contact-dot">•</span>
              <span className="contact-chip">
                <Mail size={12} className="text-cyan" />
                <span>{user?.email || 'yonas.molla@example.et'}</span>
              </span>
              <span className="contact-dot">•</span>
              <span className="contact-chip">
                <MapPin size={12} className="text-cyan" />
                <span>Addis Ababa, Ethiopia</span>
              </span>
            </div>
          </div>
        </div>

        {/* Mode Switch & Edit CTA */}
        <div className="profile-hero-actions flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm"
          >
            Edit Profile
          </button>
          <button
            type="button"
            onClick={handleToggleMode}
            className="switch-mode-btn"
          >
            {isProvider ? <User size={15} /> : <Briefcase size={15} />}
            <span>{isProvider ? 'Switch to Client View' : 'Specialist Dashboard'}</span>
          </button>
        </div>
      </section>

      {/* ── 2. Escrow & Activity Metrics Row ── */}
      <section className="profile-metrics-strip">
        <div className="profile-stat-box">
          <div className="stat-icon-wrap lock-bg">
            <Lock size={18} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Chapa Escrow Protected</span>
            <strong className="stat-number text-emerald">{totalProtected} ETB</strong>
            <span className="stat-caption">Held safely in vault</span>
          </div>
        </div>

        <div className="profile-stat-box">
          <div className="stat-icon-wrap tasks-bg">
            <Zap size={18} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Completed Services</span>
            <strong className="stat-number">{completedCount}</strong>
            <span className="stat-caption">Verified bookings</span>
          </div>
        </div>

        <div className="profile-stat-box">
          <div className="stat-icon-wrap trust-bg">
            <ShieldCheck size={18} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Trust Score</span>
            <strong className="stat-number text-cyan">100%</strong>
            <span className="stat-caption">Fayda National ID Verified</span>
          </div>
        </div>
      </section>

      {/* ── 3. Trust & KYC Verification Banner ── */}
      <section className="profile-glass-card">
        <div className="card-header-with-action">
          <div className="card-title-group">
            <div className="badge-icon-wrap">
              <ShieldCheck size={20} className="text-emerald" />
            </div>
            <div>
              <h2 className="card-main-title">Ethiopian Trust & National ID Status</h2>
              <p className="card-sub-desc">
                Your Fayda Digital National ID is linked and verified. This unlocks instant Chapa Escrow processing.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/verification')}
            className="card-action-link-btn"
          >
            <span>Manage Verification Badges</span>
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="verified-credentials-grid">
          <div className="credential-badge-item">
            <CheckCircle2 size={18} className="text-emerald flex-shrink-0" />
            <div>
              <strong className="cred-name">Fayda Digital National ID</strong>
              <span className="cred-sub">Verified • Ref: FAN-****-9821</span>
            </div>
          </div>

          <div className="credential-badge-item">
            <CheckCircle2 size={18} className="text-emerald flex-shrink-0" />
            <div>
              <strong className="cred-name">Phone Number (Telebirr OTP)</strong>
              <span className="cred-sub">Verified • +251 911 234 567</span>
            </div>
          </div>

          <div className="credential-badge-item">
            <CheckCircle2 size={18} className="text-emerald flex-shrink-0" />
            <div>
              <strong className="cred-name">Police Criminal Clearance</strong>
              <span className="cred-sub">Clean Record Certificate</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Payment Methods & Account Settings ── */}
      <section className="profile-glass-card">
        <h2 className="card-main-title mb-3">Preferences, Escrow & Security</h2>

        <div className="settings-items-stack">
          {/* Payment Method */}
          <div className="settings-row-item">
            <div className="settings-left-group">
              <div className="settings-icon-box">
                <CreditCard size={18} />
              </div>
              <div>
                <strong className="settings-title">Ethiopian Payment & Escrow Channels</strong>
                <span className="settings-sub">Telebirr, Commercial Bank of Ethiopia (CBE Birr), Awash Birr</span>
              </div>
            </div>
            <span className="settings-status-tag text-emerald">Telebirr Connected ✓</span>
          </div>

          {/* Language Switcher */}
          <div className="settings-row-item">
            <div className="settings-left-group">
              <div className="settings-icon-box">
                <Globe size={18} />
              </div>
              <div>
                <strong className="settings-title">Language / ቋንቋ</strong>
                <span className="settings-sub">Choose your preferred platform language</span>
              </div>
            </div>
            <div className="language-toggle-pills">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`lang-pill ${language === 'en' ? 'active' : ''}`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('am')}
                className={`lang-pill ${language === 'am' ? 'active' : ''}`}
              >
                አማርኛ
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="settings-row-item">
            <div className="settings-left-group">
              <div className="settings-icon-box">
                <Bell size={18} />
              </div>
              <div>
                <strong className="settings-title">Escrow & Booking SMS Alerts</strong>
                <span className="settings-sub">Get real-time updates when tasks are completed or funds are released</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`toggle-switch-btn ${notificationsEnabled ? 'enabled' : ''}`}
            >
              <span className="toggle-dot" />
            </button>
          </div>

          {/* Business & Team Management */}
          <div className="settings-row-item">
            <div className="settings-left-group">
              <div className="settings-icon-box">
                <Briefcase size={18} />
              </div>
              <div>
                <strong className="settings-title">Company Profile & Team Members</strong>
                <span className="settings-sub">Manage your Business PLC or Organization and assign staff</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/business/manage')}
              className="settings-link-btn"
            >
              <span>Manage Company</span>
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Admin Portal (if admin) */}
          {user?.is_admin && (
            <div className="settings-row-item bg-purple-50/50 border border-purple-100 rounded-2xl p-3">
              <div className="settings-left-group">
                <div className="settings-icon-box bg-purple-100 text-purple-800">
                  <Award size={18} />
                </div>
                <div>
                  <strong className="settings-title text-purple-900">👑 Admin Superuser Console</strong>
                  <span className="settings-sub text-purple-700">Platform overview, dispute resolution, KYC approvals</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-3 py-1.5 bg-purple-900 text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <span>Enter Admin</span>
                <ChevronRight size={13} />
              </button>
            </div>
          )}

          {/* Help & Support */}
          <div className="settings-row-item">
            <div className="settings-left-group">
              <div className="settings-icon-box">
                <HelpCircle size={18} />
              </div>
              <div>
                <strong className="settings-title">LINC 24/7 Mediation & Dispute Center</strong>
                <span className="settings-sub">Reach our Addis Ababa customer safety & mediation team</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/messages')}
              className="settings-link-btn"
            >
              <span>Contact Support</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </div>

        {/* Sign Out Action */}
        <div className="profile-signout-row">
          <button
            type="button"
            onClick={handleLogout}
            className="profile-logout-btn"
          >
            <LogOut size={16} />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </section>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
}
