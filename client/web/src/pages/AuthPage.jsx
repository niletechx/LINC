import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { LogIn, UserPlus, Layers, ArrowLeft } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import { APP_CONFIG } from '../config/constants';

export default function AuthPage({ initialMode = 'login' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const modeFromQuery = searchParams.get('mode');
  const [authMode, setAuthMode] = useState(
    modeFromQuery === 'signup' || initialMode === 'signup' ? 'signup' : 'login'
  );
  const [showForgotModal, setShowForgotModal] = useState(false);

  useEffect(() => {
    if (modeFromQuery === 'signup' || modeFromQuery === 'login') {
      setAuthMode(modeFromQuery);
    }
  }, [modeFromQuery]);

  const handleTabSwitch = (mode) => {
    setAuthMode(mode);
    setSearchParams({ mode });
  };

  const handleAuthSuccess = () => {
    navigate('/home');
  };

  return (
    <div className="auth-fullscreen-page">
      {/* Top Floating Back Link */}
      <div className="auth-top-bar">
        <Link to="/" className="auth-back-home-btn">
          <ArrowLeft size={16} />
          <span>Browse Services</span>
        </Link>
      </div>

      {/* Main Grid: Left Brand Block + Bottom-Right Auth Card */}
      <div className="auth-screen-grid">
        {/* Left Side: Logo Box & Tagline Card */}
        <div className="auth-left-brand-section">
          {/* 1. LINC Logo Badge Box */}
          <div className="auth-brand-badge-card">
            <div className="brand-badge-icon" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
              <Layers size={26} className="text-white" />
            </div>
            <div className="brand-text-block">
              <div className="brand-title-row">
                <span className="brand-name" style={{ fontSize: '26px' }}>{APP_CONFIG.appName}</span>
                <span className="brand-amharic-badge" style={{ fontSize: '14px' }}>{APP_CONFIG.appAmharicName}</span>
              </div>
              <span className="brand-tagline" style={{ fontSize: '10.5px', letterSpacing: '1px' }}>
                {APP_CONFIG.appTagline}
              </span>
            </div>
          </div>

          {/* 2. Tagline Card */}
          <div className="auth-tagline-box">
            <span className="auth-tagline-main-text">
              Social Media for WORK & Trusted Services.
            </span>
          </div>
        </div>

        {/* Right Side: Bottom-Right Elevated Auth Card */}
        <div className="auth-right-form-section">
          <div className="auth-bottom-right-card">
            {/* Dual Tabs: Sign In / Create Account */}
            <div className="auth-card-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={authMode === 'login'}
                onClick={() => handleTabSwitch('login')}
                className={`auth-card-tab-btn ${authMode === 'login' ? 'active' : ''}`}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={authMode === 'signup'}
                onClick={() => handleTabSwitch('signup')}
                className={`auth-card-tab-btn ${authMode === 'signup' ? 'active' : ''}`}
              >
                <UserPlus size={15} />
                <span>Create Account</span>
              </button>
            </div>

            {/* Form Body */}
            <div className="auth-card-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
              {authMode === 'login' ? (
                <LoginForm
                  onSwitchToSignup={() => handleTabSwitch('signup')}
                  onOpenForgotPassword={() => setShowForgotModal(true)}
                  onSuccess={handleAuthSuccess}
                />
              ) : (
                <SignupForm
                  onSwitchToLogin={() => handleTabSwitch('login')}
                  onSuccess={handleAuthSuccess}
                />
              )}
            </div>

            <footer className="auth-card-footer-note">
              <p>
                By continuing, you agree to LINC's{' '}
                <a href="#terms" className="footer-link">Terms of Service</a> and{' '}
                <a href="#privacy" className="footer-link">Privacy Policy</a>.
              </p>
            </footer>
          </div>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        onBackToLogin={() => {
          setShowForgotModal(false);
          handleTabSwitch('login');
        }}
      />
    </div>
  );
}
