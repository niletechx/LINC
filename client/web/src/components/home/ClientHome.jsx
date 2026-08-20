import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Search, 
  Sparkles, 
  Bell, 
  ChevronDown, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight,
  PlusCircle,
  Clock,
  Star,
  ShieldCheck,
  Zap,
  Filter
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { MOCK_PROVIDERS, MOCK_OPEN_REQUESTS, CATEGORIES } from '../../data/mockData';
import ProviderCard from '../provider/ProviderCard';

export default function ClientHome() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    currentLocation, 
    setLocationPickerOpen, 
    setNotificationsOpen, 
    unreadNotificationsCount, 
    setAppMode,
    setPostRequestOpen,
    setSelectedCategory,
    showToast
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCat] = useState('all');

  const firstName = user?.full_name?.split(' ')[0] || 'Yonas';

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

  const handleSwitchMode = () => {
    setAppMode('provider');
    showToast('Switched to Provider Mode 💼', 'info');
  };

  return (
    <div className="client-home-view">
      {/* ── 1. Cyan Hero Header Section ── */}
      <section className="client-hero-header">
        <div className="client-header-top-row">
          {/* Location Badge */}
          <button 
            type="button" 
            onClick={() => setLocationPickerOpen(true)}
            className="client-location-box"
            title="Change Location"
          >
            <MapPin size={15} />
            <span className="location-text">{currentLocation || 'Bole, Addis Ababa'}</span>
            <ChevronDown size={14} />
          </button>

          {/* Quick Actions */}
          <div className="header-actions-group">
            <button 
              type="button"
              onClick={handleSwitchMode}
              className="client-mode-switch-btn"
              title="Switch to Provider Dashboard"
            >
              <Briefcase size={14} />
              <span>Switch to Provider</span>
            </button>

            <button 
              type="button"
              onClick={() => setNotificationsOpen(true)}
              className="client-notif-btn"
              title="Notifications"
            >
              <Bell size={16} />
              {unreadNotificationsCount > 0 && <span className="notif-dot" />}
            </button>
          </div>
        </div>

        {/* Greeting & Headline */}
        <div className="client-greeting-block">
          <h1 className="client-greeting-title">
            Good morning, {firstName}
          </h1>
          <p className="client-greeting-subtitle">
            Find verified Ethiopian professionals for plumbing, electrical, tutoring, cleaning, and technical repairs with secure escrow protection.
          </p>
        </div>

        {/* Search Bar with AI Quick Trigger */}
        <form onSubmit={handleSearchSubmit} className="client-search-bar">
          <Search size={18} className="search-icon-left" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plumbers, electricians, tutors, cleaners..."
            className="search-input-field"
          />
          <button 
            type="button"
            onClick={() => navigate('/ai')}
            className="search-ai-pill-btn"
            title="Open AI Matchmaker"
          >
            <Sparkles size={14} className="ai-sparkle-icon" />
            <span>Ask LINC AI</span>
          </button>
          <button type="submit" className="search-action-pill">
            Search
          </button>
        </form>
      </section>

      {/* ── 2. Quick Filter Chips Carousel ── */}
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

      {/* ── 3. AI Matchmaker Spotlight Banner ── */}
      <div 
        onClick={() => navigate('/ai')}
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
            Describe your problem in plain English or Amharic. Our AI matches your budget, urgency, and location with vetted local specialists.
          </p>
        </div>
        <button type="button" className="btn btn-secondary ai-banner-btn">
          <span>Try AI Matchmaker</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* ── 4. Main Two-Column Dashboard Content ── */}
      <div className="home-dashboard-grid">
        {/* Left Column: Verified Nearby Providers */}
        <section className="home-providers-section">
          <div className="section-title-row">
            <div className="title-with-badge">
              <h2 className="section-heading">Verified Nearby</h2>
              <span className="location-distance-badge">
                <MapPin size={12} />
                <span>{currentLocation.split(',')[0]} • 2 km</span>
              </span>
            </div>
            <button 
              type="button" 
              onClick={() => navigate('/search')}
              className="view-all-link"
            >
              <span>See all specialists</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="providers-grid">
            {MOCK_PROVIDERS.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </section>

        {/* Right Column: Open Local Requests */}
        <section className="home-requests-section">
          <div className="section-title-row">
            <h2 className="section-heading">Open Job Requests</h2>
            <button 
              type="button" 
              onClick={() => setPostRequestOpen(true)}
              className="post-request-action-btn"
            >
              <PlusCircle size={14} />
              <span>Post Request</span>
            </button>
          </div>

          <div className="requests-cards-stack">
            {MOCK_OPEN_REQUESTS.map((req, idx) => {
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
  );
}
