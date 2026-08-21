import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Search, 
  Sparkles, 
  ChevronDown, 
  ShieldCheck, 
  Lock, 
  Star, 
  ArrowRight, 
  PlusCircle, 
  Clock, 
  Zap, 
  CheckCircle2, 
  UserPlus, 
  LogIn,
  User,
  Briefcase
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { useAuthStore } from '../stores/authStore';
import { MOCK_PROVIDERS, MOCK_OPEN_REQUESTS, CATEGORIES } from '../data/mockData';
import ProviderCard from '../components/provider/ProviderCard';

export default function LandingPage() {
  const navigate = useNavigate();
  const { currentLocation, setLocationPickerOpen, openAuthModal, setSelectedCategory } = useAppStore();
  const { isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCat] = useState('all');

  const handleCategoryClick = (catId) => {
    setActiveCat(catId);
    setSelectedCategory(catId);
    navigate(`/search?category=${catId}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/search');
    }
  };

  const handleAiTrigger = () => {
    if (!isAuthenticated) {
      openAuthModal('Sign in or create an account to get instant personalized AI provider matches.');
    } else {
      navigate('/ai');
    }
  };

  const handlePostRequest = () => {
    if (!isAuthenticated) {
      openAuthModal('Create an account to post a service request and receive competitive quotes from verified pros.');
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="client-home-view">
      {/* ── 1. Hero Banner ── */}
      <section className="client-hero-header">
        <div className="client-header-top-row">
          {/* Location Badge */}
          <button 
            type="button" 
            onClick={() => setLocationPickerOpen(true)}
            className="client-location-box"
            title="Select Location in Addis Ababa"
          >
            <MapPin size={15} />
            <span className="location-text">{currentLocation || 'Bole, Addis Ababa'}</span>
            <ChevronDown size={14} />
          </button>

          {/* Unauthenticated Quick Join Links */}
          <div className="header-actions-group">
            <Link to="/login" className="client-mode-switch-btn">
              <LogIn size={14} />
              <span>Sign In</span>
            </Link>

            <Link 
              to="/signup" 
              className="client-mode-switch-btn" 
              style={{ background: '#0F172A', color: '#ffffff', borderColor: '#0F172A' }}
            >
              <UserPlus size={14} />
              <span>Join LINC</span>
            </Link>
          </div>
        </div>

        {/* Greeting & Headline */}
        <div className="client-greeting-block">
          <h1 className="client-greeting-title">
            Find & Book Verified Ethiopian Specialists in Minutes.
          </h1>
          <p className="client-greeting-subtitle">
            Connect directly with background-checked plumbers, electricians, tutors, cleaners, and mechanics across Addis Ababa. Guaranteed escrow protection on every task.
          </p>
        </div>

        {/* Search Bar with AI Quick Trigger */}
        <form onSubmit={handleSearchSubmit} className="client-search-bar">
          <Search size={18} className="search-icon-left" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="What service do you need? (e.g. Plumber, Electrician, Cleaner, Math Tutor)..."
            className="search-input-field"
          />
          <button 
            type="button"
            onClick={handleAiTrigger}
            className="search-ai-pill-btn"
            title="Ask LINC AI for instant recommendations"
          >
            <Sparkles size={14} className="ai-sparkle-icon" />
            <span>Ask LINC AI</span>
          </button>
          <button type="submit" className="search-action-pill">
            Search
          </button>
        </form>
      </section>

      {/* ── 2. AI Matchmaker Spotlight Banner ── */}
      <div 
        onClick={handleAiTrigger}
        className="ai-matchmaker-banner"
        role="button"
        tabIndex={0}
      >
        <div className="ai-banner-content">
          <div className="ai-banner-badge">
            <Sparkles size={14} />
            <span>POWERED BY LINC INTELLIGENCE</span>
          </div>
          <h2 className="ai-banner-title">Need the right specialist in minutes?</h2>
          <p className="ai-banner-desc">
            Describe your problem in plain English or Amharic. Our AI matches your budget, urgency, and location with vetted local specialists in real-time.
          </p>
        </div>
        <button type="button" className="btn btn-secondary ai-banner-btn">
          <span>Try AI Matchmaker</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* ── 3. Popular Service Categories ── */}
      <section className="category-scroll-section">
        <div className="category-chips-carousel">
          <button
            type="button"
            onClick={() => handleCategoryClick('urgent')}
            className={`category-pill-card urgent-pill ${activeCategory === 'urgent' ? 'active' : ''}`}
          >
            <span className="cat-pill-icon">🚨</span>
            <span className="cat-pill-name">Urgent Tasks</span>
          </button>

          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat.id)}
              className={`category-pill-card ${activeCategory === cat.id ? 'active' : ''}`}
            >
              <span className="cat-pill-icon">{cat.icon}</span>
              <span className="cat-pill-name">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── 4. Main Two-Column Content ── */}
      <div className="home-dashboard-grid">
        {/* Left Column: Top Verified Specialists (Public Directory) */}
        <section className="home-providers-section">
          <div className="section-title-row">
            <div className="title-with-badge">
              <h2 className="section-heading">Verified Nearby in Addis</h2>
              <span className="location-distance-badge">
                <MapPin size={12} />
                <span>{currentLocation.split(',')[0]} • 2 km</span>
              </span>
            </div>
            <Link to="/search" className="view-all-link">
              <span>View all 500+ specialists</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="providers-grid">
            {MOCK_PROVIDERS.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </section>

        {/* Right Column: Live Requests & How It Works */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* How LINC Works Card */}
          <section className="request-card-item" style={{ background: 'linear-gradient(145deg, #F8FAFC, #F0F9FF)', border: '1.5px solid #BAE6FD', padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>
              🛡️ How LINC Protects You
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0284C7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, shrink: 0 }}>1</span>
                <div>
                  <strong style={{ fontSize: '13px', color: '#0F172A' }}>Find or Match</strong>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>Search verified local talent or use AI matching for instant recommendations.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#10B981', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, shrink: 0 }}>2</span>
                <div>
                  <strong style={{ fontSize: '13px', color: '#0F172A' }}>Chapa Escrow Vault</strong>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>Your payment is held safely in escrow. The provider is only paid once you approve the job.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0F172A', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, shrink: 0 }}>3</span>
                <div>
                  <strong style={{ fontSize: '13px', color: '#0F172A' }}>Job Complete</strong>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>Release payment with one click and leave an honest review for the community.</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePostRequest}
              className="btn btn-primary btn-sm"
              style={{ marginTop: '16px', width: '100%' }}
            >
              <PlusCircle size={15} />
              <span>Post a Job Request</span>
            </button>
          </section>

          {/* Open Requests Stack */}
          <section className="home-requests-section">
            <div className="section-title-row">
              <h2 className="section-heading">Recent Requests</h2>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Addis Ababa</span>
            </div>

            <div className="requests-cards-stack">
              {MOCK_OPEN_REQUESTS.slice(0, 3).map((req, idx) => {
                const isUrgent = req.urgency === 'urgent' || req.urgency === 'high';
                return (
                  <div key={idx} className="request-card-item">
                    <div className="request-item-top">
                      <div className="request-cat-badge">
                        <span>{req.category}</span>
                      </div>
                      {isUrgent && (
                        <span className="urgent-badge">
                          <Zap size={11} />
                          <span>URGENT</span>
                        </span>
                      )}
                    </div>

                    <h3 className="request-item-title">{req.title}</h3>
                    <p className="request-item-desc">{req.description}</p>

                    <div className="request-item-footer">
                      <div className="request-price-box">
                        <span className="request-budget-label">Budget</span>
                        <span className="request-budget-val">{req.budget}</span>
                      </div>
                      <div className="request-meta-info">
                        <span className="request-time">
                          <Clock size={12} />
                          <span>{req.time}</span>
                        </span>
                        <span className="request-loc">
                          <MapPin size={12} />
                          <span>{req.location}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
