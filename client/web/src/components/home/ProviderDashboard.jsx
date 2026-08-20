import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  DollarSign, 
  Eye, 
  Zap, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User, 
  Settings, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { setAppMode, showToast } = useAppStore();
  const { user } = useAuthStore();
  const [isAvailable, setIsAvailable] = useState(true);

  const toggleMode = () => {
    setAppMode('client');
    showToast('Switched to Client Mode 👤', 'info');
  };

  const handleToggleAvailability = () => {
    setIsAvailable(!isAvailable);
    showToast(
      isAvailable ? 'Status set to Busy / Unavailable' : 'Status set to Available for Bookings! 🟢',
      isAvailable ? 'info' : 'success'
    );
  };

  return (
    <div className="provider-dashboard-view" style={{ padding: '24px 32px 48px' }}>
      {/* ── 1. Provider Hero Status Banner ── */}
      <section className="provider-dashboard-hero">
        <div className="provider-hero-top">
          <div>
            <div className="provider-hero-badge">
              <ShieldCheck size={14} />
              <span>VERIFIED ETHIOPIAN SPECIALIST</span>
            </div>
            <h1 className="provider-hero-title">
              Welcome back, {user?.full_name || 'Abebe Girma'}
            </h1>
            <p className="provider-hero-headline">
              Senior Plumber & Pipe Specialist • Bole & Kazanchis, Addis Ababa
            </p>
          </div>

          <div className="provider-availability-box">
            <span className="availability-label">Availability Status</span>
            <button
              type="button"
              onClick={handleToggleAvailability}
              className={`availability-toggle-btn ${isAvailable ? 'available' : 'busy'}`}
            >
              <span className="status-dot" />
              <span>{isAvailable ? 'Online & Available' : 'Currently Busy'}</span>
            </button>
          </div>
        </div>

        {/* Quick Mode Switch & Profile Setup Bar */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            type="button"
            onClick={toggleMode}
            className="btn btn-secondary btn-sm"
          >
            <User size={14} />
            <span>Switch to Client Mode</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/provider-setup')}
            className="btn btn-outline btn-sm"
            style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <Settings size={14} />
            <span>Edit Services & Hourly Rates</span>
          </button>
        </div>
      </section>

      {/* ── 2. Performance Metrics 4-Column Grid ── */}
      <section className="provider-metrics-grid">
        <div className="provider-metric-card">
          <div className="p-metric-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38BDF8' }}>
            <DollarSign size={22} />
          </div>
          <div className="p-metric-data">
            <span className="p-metric-value">12,400 ETB</span>
            <span className="p-metric-label">Earnings (This Month)</span>
          </div>
        </div>

        <div className="provider-metric-card">
          <div className="p-metric-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
            <Briefcase size={22} />
          </div>
          <div className="p-metric-data">
            <span className="p-metric-value">3 Active</span>
            <span className="p-metric-label">Ongoing Escrow Jobs</span>
          </div>
        </div>

        <div className="provider-metric-card">
          <div className="p-metric-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24' }}>
            <Zap size={22} />
          </div>
          <div className="p-metric-data">
            <span className="p-metric-value">96%</span>
            <span className="p-metric-label">AI Match Score</span>
          </div>
        </div>

        <div className="provider-metric-card">
          <div className="p-metric-icon" style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#A78BFA' }}>
            <Eye size={22} />
          </div>
          <div className="p-metric-data">
            <span className="p-metric-value">148</span>
            <span className="p-metric-label">Profile Views</span>
          </div>
        </div>
      </section>

      {/* ── 3. Incoming Job Requests ── */}
      <section style={{ marginTop: '12px' }}>
        <div className="section-title-row">
          <h2 className="section-heading">Direct Client Requests</h2>
          <span style={{ fontSize: '13px', color: '#64748B' }}>2 pending requests</span>
        </div>

        <div className="provider-jobs-list">
          {/* Job Item 1 */}
          <div className="provider-job-card">
            <div className="job-card-header">
              <div>
                <h3 className="job-title">Emergency Kitchen Pipe Leak Repair</h3>
                <p className="job-client">Client: <strong>Beza Tesfaye</strong> • Bole Rwanda, Addis Ababa</p>
              </div>
              <div className="job-price-badge">
                <span>650 ETB</span>
                <span className="escrow-pill">🛡️ Escrow Funded</span>
              </div>
            </div>

            <div className="job-card-meta">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} />
                <span>Requested 15 mins ago</span>
              </span>
              <span>•</span>
              <span>Urgency: <strong>High</strong></span>
            </div>

            <div className="job-card-actions">
              <button type="button" className="btn btn-outline btn-sm">
                <XCircle size={14} />
                <span>Decline</span>
              </button>
              <button 
                type="button" 
                onClick={() => {
                  showToast('Booking Accepted! Escrow payment locked in secure vault.', 'success');
                  navigate('/bookings');
                }}
                className="btn btn-primary btn-sm"
              >
                <CheckCircle2 size={14} />
                <span>Accept & Start Job</span>
              </button>
            </div>
          </div>

          {/* Job Item 2 */}
          <div className="provider-job-card">
            <div className="job-card-header">
              <div>
                <h3 className="job-title">Complete Bathroom Fixture Installation</h3>
                <p className="job-client">Client: <strong>Michael Alemu</strong> • Kazanchis, Addis Ababa</p>
              </div>
              <div className="job-price-badge">
                <span>2,200 ETB</span>
                <span className="escrow-pill">🛡️ Escrow Funded</span>
              </div>
            </div>

            <div className="job-card-meta">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} />
                <span>Requested 45 mins ago</span>
              </span>
              <span>•</span>
              <span>Scheduled for tomorrow</span>
            </div>

            <div className="job-card-actions">
              <button type="button" className="btn btn-outline btn-sm">
                <XCircle size={14} />
                <span>Decline</span>
              </button>
              <button 
                type="button"
                onClick={() => {
                  showToast('Booking Accepted! Escrow payment locked in secure vault.', 'success');
                  navigate('/bookings');
                }}
                className="btn btn-primary btn-sm"
              >
                <CheckCircle2 size={14} />
                <span>Accept & Start Job</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
