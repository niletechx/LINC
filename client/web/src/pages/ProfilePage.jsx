import { useState } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useAppStore } from '../stores/appStore';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { appMode, setAppMode, showToast } = useAppStore();

  const isProvider = appMode === 'provider';

  const handleLogout = () => {
    logout();
    showToast('Signed out successfully. See you soon! 👋', 'info');
    navigate('/login');
  };

  const handleToggleMode = () => {
    const next = isProvider ? 'client' : 'provider';
    setAppMode(next);
    showToast(`Switched to ${next === 'provider' ? 'Provider Dashboard 💼' : 'Client Mode 👤'}`, 'info');
  };

  return (
    <div className="profile-container">
      {/* ── 1. Profile Identity Header Card ── */}
      <section className="profile-header-card">
        <div className="profile-header-left">
          <div className="profile-large-avatar">
            <span>{(user?.full_name || 'Yonas Molla').slice(0, 2).toUpperCase()}</span>
          </div>
          <div>
            <div className="profile-name-badge-row">
              <h1 className="profile-title">{user?.full_name || 'Yonas Molla'}</h1>
              <span className="profile-role-pill">
                {isProvider ? '💼 Service Provider' : '👤 Household Client'}
              </span>
              <span className="verified-pill">
                <ShieldCheck size={13} />
                <span>Verified Account</span>
              </span>
            </div>

            <p className="profile-sub">
              {user?.headline || 'Member since February 2026 • Addis Ababa, Ethiopia'}
            </p>

            <div className="profile-contact-meta">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={12} />
                <span>{user?.phone || '+251 911 234 567'}</span>
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={12} />
                <span>{user?.email || 'yonas.molla@example.et'}</span>
              </span>
            </div>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleToggleMode}
            className="btn btn-secondary btn-sm"
          >
            {isProvider ? <User size={14} /> : <Briefcase size={14} />}
            <span>{isProvider ? 'Switch to Client View' : 'Switch to Provider Dashboard'}</span>
          </button>
        </div>
      </section>

      {/* ── 2. Trust & Identity Verification Card ── */}
      <section className="profile-section-card">
        <div className="section-card-header">
          <ShieldCheck size={24} className="text-emerald" />
          <div>
            <h2 className="section-card-title">National ID & Trust Verification</h2>
            <p className="section-card-sub">
              Fayda National ID verification guarantees trusted interactions and unlocks priority escrow processing.
            </p>
          </div>
        </div>

        <div className="verification-status-box">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} className="text-emerald" />
              <strong style={{ fontSize: '13.5px', color: '#0F172A' }}>Fayda Digital ID: Verified</strong>
            </div>
            <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginTop: '2px' }}>
              Document ID: ****-****-9821 (Verified on Feb 12, 2026)
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/verification')}
            className="btn btn-outline btn-sm"
          >
            <span>View Badges</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </section>

      {/* ── 3. Account Settings & Preferences ── */}
      <section className="profile-section-card">
        <h2 className="section-card-title">Preferences & Security</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Item 1 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard size={18} className="text-muted" />
              <div>
                <strong style={{ fontSize: '13px', color: '#0F172A' }}>Payment & Escrow Methods</strong>
                <span style={{ fontSize: '11.5px', color: '#64748B', display: 'block' }}>Telebirr, CBE Birr, Chapa</span>
              </div>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0284C7' }}>Telebirr Connected</span>
          </div>

          {/* Item 2 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Globe size={18} className="text-muted" />
              <div>
                <strong style={{ fontSize: '13px', color: '#0F172A' }}>Language / ቋንቋ</strong>
                <span style={{ fontSize: '11.5px', color: '#64748B', display: 'block' }}>English / አማርኛ</span>
              </div>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>English (US)</span>
          </div>

          {/* Item 3 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <HelpCircle size={18} className="text-muted" />
              <div>
                <strong style={{ fontSize: '13px', color: '#0F172A' }}>LINC Support & Dispute Resolution</strong>
                <span style={{ fontSize: '11.5px', color: '#64748B', display: 'block' }}>24/7 Ethiopian mediation support</span>
              </div>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0284C7' }}>Open Help Desk</span>
          </div>
        </div>

        {/* Sign Out Button */}
        <div style={{ paddingTop: '12px', borderTop: '1px solid #E2E8F0', marginTop: '6px' }}>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-outline"
            style={{ color: '#DC2626', borderColor: '#FECACA', background: '#FEF2F2' }}
          >
            <LogOut size={16} />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </section>
    </div>
  );
}
