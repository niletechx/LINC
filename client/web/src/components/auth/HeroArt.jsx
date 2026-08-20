import { ShieldCheck, Sparkles, Lock, MessageSquare, Star, Users, CheckCircle2, Zap } from 'lucide-react';
import { APP_CONFIG, TRUST_PILLARS } from '../../config/constants';

const ICON_MAP = {
  ShieldCheck,
  Sparkles,
  Lock,
  MessageSquare,
};

export default function HeroArt() {
  return (
    <div className="hero-art-container">
      {/* Background Decorative Gradient Orbs & Ethiopic Grid Art */}
      <div className="hero-art-glow hero-glow-1" />
      <div className="hero-art-glow hero-glow-2" />
      <div className="hero-art-grid-pattern" />

      {/* Hero Content */}
      <div className="hero-art-content">
        {/* Brand Accent Banner */}
        <div className="hero-brand-pill">
          <span className="hero-brand-amharic">ሊንክ</span>
          <span className="hero-brand-dot">•</span>
          <span className="hero-brand-eng">Life Infrastructure Network</span>
          <span className="hero-badge-tag">v2.0</span>
        </div>

        {/* Main Display Headline */}
        <h1 className="hero-main-title">
          Social Media for <span className="highlight-gradient">WORK</span> & Trusted Services.
        </h1>

        <p className="hero-main-description">
          The all-in-one Ethiopian network connecting households and businesses with verified plumbers, electricians, tutors, cleaners, and technical experts.
        </p>

        {/* Interactive Stats Floater Cards */}
        <div className="hero-stats-row">
          <div className="hero-stat-card">
            <div className="stat-icon-wrap stat-cyan">
              <Users size={18} />
            </div>
            <div className="stat-details">
              <span className="stat-number">500+</span>
              <span className="stat-label">Verified Pros</span>
            </div>
          </div>

          <div className="hero-stat-card">
            <div className="stat-icon-wrap stat-emerald">
              <CheckCircle2 size={18} />
            </div>
            <div className="stat-details">
              <span className="stat-number">99.4%</span>
              <span className="stat-label">Job Completion</span>
            </div>
          </div>

          <div className="hero-stat-card">
            <div className="stat-icon-wrap stat-amber">
              <Star size={18} fill="#F59E0B" />
            </div>
            <div className="stat-details">
              <span className="stat-number">4.9 / 5</span>
              <span className="stat-label">Client Rating</span>
            </div>
          </div>
        </div>

        {/* 4 Trust Pillars */}
        <div className="hero-pillars-grid">
          {TRUST_PILLARS.map((pillar, idx) => {
            const IconComponent = ICON_MAP[pillar.icon] || Zap;
            return (
              <div key={idx} className="hero-pillar-item">
                <div className="pillar-icon-box">
                  <IconComponent size={18} />
                </div>
                <div className="pillar-text">
                  <h4 className="pillar-title">{pillar.title}</h4>
                  <p className="pillar-desc">{pillar.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Escrow & Location Footnote */}
        <div className="hero-footnote-card">
          <div className="footnote-flag">🇪🇹</div>
          <div className="footnote-info">
            <div className="footnote-title">
              Built for Addis Ababa & Ethiopian Cities
            </div>
            <div className="footnote-sub">
              Full Chapa Escrow Integration • Telebirr & CBE Ready • 72h Buyer Protection
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
