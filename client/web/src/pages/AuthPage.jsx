import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  LogIn, 
  UserPlus, 
  Layers, 
  ArrowLeft, 
  Briefcase, 
  ShieldCheck, 
  Sparkles, 
  MessageSquare, 
  Bot,
  Zap
} from 'lucide-react';
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
      {/* Background Glow Orbs & Subtle Mesh Grid */}
      <div className="auth-ambient-glow auth-glow-top-left" />
      <div className="auth-ambient-glow auth-glow-bottom-right" />
      <div className="auth-ambient-grid" />

      {/* Top Navigation Bar */}
      <header className="auth-top-bar">
        <Link to="/" className="auth-back-home-btn">
          <ArrowLeft size={16} />
          <span>Browse Marketplace</span>
        </Link>
      </header>

      {/* Main Grid: Left Platform Overview + Right Auth Form Card */}
      <div className="auth-screen-grid">
        {/* Left Side: Brand Badge & Platform Description Block */}
        <div className="auth-left-brand-section">
          {/* 1. Brand Logo Badge Box */}
          <div className="auth-brand-badge-card">
            <div className="brand-badge-icon-wrap">
              <div className="brand-badge-glow" />
              <Layers size={26} className="brand-icon-svg" />
            </div>
            <div className="brand-text-block">
              <div className="brand-title-row">
                <span className="brand-name">{APP_CONFIG.appName}</span>
                <span className="brand-amharic-badge">{APP_CONFIG.appAmharicName}</span>
              </div>
              <span className="brand-tagline">
                {APP_CONFIG.appTagline}
              </span>
            </div>
          </div>

          {/* 2. Platform Overview & Feature Showcase Card */}
          <div className="auth-platform-card">
            <div className="auth-platform-header">
              <div className="auth-platform-pill">
                <Sparkles size={14} className="text-cyan animate-pulse" />
                <span>Next-Gen Work & Services Platform</span>
              </div>
              <h1 className="auth-platform-title">
                Social Media for <span className="highlight-text-cyan">WORK</span> & Trusted Services
              </h1>
              <p className="auth-platform-description">
                Connect with verified local providers and clients across Ethiopia & East Africa for any everyday service — from repairs to tech and tutoring. Share work updates, request quotes, and transact with milestone escrow.
              </p>
            </div>

            {/* 3 Mobile Signature Trust Badges */}
            <div className="auth-mobile-trust-strip">
              <div className="mobile-trust-item">
                <ShieldCheck size={18} className="trust-icon-blue" />
                <span>Verified</span>
              </div>
              <div className="mobile-trust-divider" />
              <div className="mobile-trust-item">
                <Zap size={18} className="trust-icon-amber" />
                <span>Fast Match</span>
              </div>
              <div className="mobile-trust-divider" />
              <div className="mobile-trust-item">
                <MessageSquare size={18} className="trust-icon-purple" />
                <span>Secure Chat</span>
              </div>
            </div>

            {/* 4 Feature Pillars Grid */}
            <div className="auth-features-grid">
              <div className="auth-feature-item">
                <div className="auth-feature-icon icon-cyan">
                  <Briefcase size={18} />
                </div>
                <div className="auth-feature-content">
                  <span className="auth-feature-title">Social Work Feeds</span>
                  <span className="auth-feature-desc">
                    Showcase portfolios, post job updates, and discover verified work stories in real time.
                  </span>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon icon-emerald">
                  <ShieldCheck size={18} />
                </div>
                <div className="auth-feature-content">
                  <span className="auth-feature-title">Escrow Payment Safety</span>
                  <span className="auth-feature-desc">
                    Milestone-backed payments keep client funds 100% protected until job completion.
                  </span>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon icon-purple">
                  <Bot size={18} />
                </div>
                <div className="auth-feature-content">
                  <span className="auth-feature-title">AI Matching Engine</span>
                  <span className="auth-feature-desc">
                    LINC AI pairs your project requirements with local top-rated experts in seconds.
                  </span>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon icon-amber">
                  <MessageSquare size={18} />
                </div>
                <div className="auth-feature-content">
                  <span className="auth-feature-title">Real-Time Workspace</span>
                  <span className="auth-feature-desc">
                    Direct messaging, digital proposal quotes, voice notes, and live job status tracking.
                  </span>
                </div>
              </div>
            </div>

            {/* Trust Metrics Bar */}
            <div className="auth-trust-bar">
              <div className="trust-stat">
                <span className="trust-val">5,000+</span>
                <span className="trust-lbl">Verified Pros</span>
              </div>
              <div className="trust-divider" />
              <div className="trust-stat">
                <span className="trust-val">100%</span>
                <span className="trust-lbl">Escrow Protection</span>
              </div>
              <div className="trust-divider" />
              <div className="trust-stat">
                <span className="trust-val">4.9 ★</span>
                <span className="trust-lbl">Average Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Elevated Auth Card */}
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
            <div className="auth-card-body">
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

