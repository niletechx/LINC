import { useNavigate } from 'react-router-dom';
import { X, ShieldCheck, Sparkles, User, Briefcase, ArrowRight, Lock } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';

export default function AuthPromptModal() {
  const navigate = useNavigate();
  const { isAuthModalOpen, authModalReason, closeAuthModal, showToast } = useAppStore();
  const { login } = useAuthStore();

  if (!isAuthModalOpen) return null;

  const handleDemoLogin = (role) => {
    if (role === 'client') {
      login({
        id: 'client-yonas',
        full_name: 'Yonas Molla',
        email: 'yonas.molla@example.et',
        role: 'client',
        city: 'Addis Ababa, Bole',
      }, 'demo-jwt-token-client');
      showToast('Logged in as Yonas Molla (Client) 👤', 'success');
    } else {
      login({
        id: 'provider-abebe',
        full_name: 'Abebe Girma',
        email: 'abebe.girma@example.et',
        role: 'provider',
        headline: 'Senior Plumber & Pipe Specialist',
        city: 'Addis Ababa, Bole',
      }, 'demo-jwt-token-provider');
      showToast('Logged in as Abebe Girma (Provider) 💼', 'success');
    }
    closeAuthModal();
  };

  const handleGoToAuth = (mode) => {
    closeAuthModal();
    navigate(`/${mode}`);
  };

  return (
    <div className="modal-backdrop-overlay animate-fade-in" onClick={closeAuthModal}>
      <div className="modal-card-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        {/* Modal Header */}
        <div className="modal-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #0F172A, #1E293B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} className="text-cyan" />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Join LINC</h3>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284C7' }}>Verified Ethiopian Network</span>
            </div>
          </div>
          <button type="button" onClick={closeAuthModal} className="modal-close-icon-btn">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#F0F9FF', border: '1.2px solid #BAE6FD', borderRadius: '14px', padding: '14px 16px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#0369A1', lineHeight: '1.45', margin: 0 }}>
              {authModalReason || 'Please create an account or sign in to chat with specialists, book services with Escrow safety, or use LINC AI.'}
            </p>
          </div>

          {/* Value Props */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', color: '#334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} className="text-emerald" />
              <span>Chapa Escrow Safe</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} className="text-cyan" />
              <span>AI Match Recommendations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} className="text-emerald" />
              <span>Fayda ID Verified Pros</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} className="text-cyan" />
              <span>Direct Chat & Quotes</span>
            </div>
          </div>

          {/* Quick 1-Click Demo Login */}
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              ⚡ Instant 1-Click Demo Logins:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleDemoLogin('client')}
                className="btn btn-outline btn-sm"
                style={{ justifyContent: 'flex-start', padding: '10px 12px' }}
              >
                <span style={{ fontSize: '16px' }}>👤</span>
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ fontSize: '12px', color: '#0F172A' }}>Client Demo</strong>
                  <span style={{ fontSize: '10px', color: '#64748B' }}>Yonas Molla</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('provider')}
                className="btn btn-outline btn-sm"
                style={{ justifyContent: 'flex-start', padding: '10px 12px' }}
              >
                <span style={{ fontSize: '16px' }}>🔧</span>
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ fontSize: '12px', color: '#0F172A' }}>Provider Demo</strong>
                  <span style={{ fontSize: '10px', color: '#64748B' }}>Abebe Girma</span>
                </div>
              </button>
            </div>
          </div>

          {/* Sign In / Sign Up Main Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => handleGoToAuth('signup')}
              className="btn btn-primary"
              style={{ flex: 1, height: '44px' }}
            >
              <span>Create Account</span>
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              onClick={() => handleGoToAuth('login')}
              className="btn btn-outline"
              style={{ flex: 1, height: '44px' }}
            >
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
