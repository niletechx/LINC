import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Share2, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Briefcase, 
  MessageSquare, 
  Calendar, 
  Zap, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Lock, 
  ArrowRight, 
  Globe, 
  Award, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  Pin,
  Camera,
  Edit2,
  ShieldAlert
} from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { useAppStore } from '../stores/appStore';
import { useProviderStore } from '../stores/providerStore';
import { reviewService } from '../services/reviewService';
import { MOCK_PROVIDERS } from '../data/mockData';
import ReportModal from '../components/common/ReportModal';

export default function ProviderProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { startConversationWithProvider } = useChatStore();
  const { isAuthenticated } = useAuthStore();
  const { appMode, openAuthModal, showToast } = useAppStore();

  const providerStore = useProviderStore();
  
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'services' | 'portfolio' | 'reviews'
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedHours, setSelectedHours] = useState(2);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    // If viewing provider 1, 'me', or provider's own profile ID, synchronize with live providerStore
    if (id === '1' || id === 'me' || (providerStore.profile?.id && String(id) === String(providerStore.profile.id))) {
      const liveData = {
        id: String(providerStore.profile.id || '1'),
        name: providerStore.profile.name,
        headline: providerStore.profile.headline,
        about: providerStore.profile.bio,
        locationCity: providerStore.profile.location,
        hourlyRate: providerStore.profile.hourlyRate,
        priceLabel: `${providerStore.profile.hourlyRate} ETB/hr`,
        rating: providerStore.profile.rating || 4.9,
        reviewsCount: providerStore.reviews?.length || 58,
        matchScore: providerStore.profile.matchScore || 97,
        verified: providerStore.profile.faydaVerified,
        completedJobs: providerStore.profile.completedJobsCount || 89,
        responseTime: providerStore.profile.responseTime || '~4 mins',
        availabilityStatus: providerStore.profile.isAvailable ? 'available' : 'busy',
        workingHours: 'Mon – Fri: 8:00 AM – 7:00 PM, Sat: 8:30 AM – 5:00 PM',
        languages: ['Amharic (Native)', 'English (Conversational)'],
        services: providerStore.services?.filter(s => s.active) || [],
        portfolio: providerStore.portfolio || [],
        reviews: providerStore.reviews || [],
        credentials: providerStore.credentials || [],
        avatarColor: '#0284C7',
        initials: 'YM',
      };
      setProvider(liveData);
      if (liveData.services?.length > 0) {
        setSelectedServiceId(liveData.services[0].id);
      }
    } else {
      const p = MOCK_PROVIDERS.find(p => p.id === id) || MOCK_PROVIDERS[0];
      setProvider(p);
      if (p.services && p.services.length > 0) {
        setSelectedServiceId(p.services[0].id);
      }
    }
    setLoading(false);
  }, [id, providerStore.profile, providerStore.services, providerStore.portfolio, providerStore.reviews, providerStore.credentials]);

  const handleStartChat = () => {
    if (!isAuthenticated) {
      openAuthModal(`Sign in or create an account to start a direct chat with ${provider?.name}.`);
      return;
    }
    startConversationWithProvider(provider);
    navigate(`/dm/${provider.id}`);
  };

  const handleBookWithEscrow = () => {
    if (!isAuthenticated) {
      openAuthModal(`Create an account to book ${provider?.name} with Chapa Escrow protection.`);
      return;
    }
    navigate(`/booking/${provider.id}?service=${selectedServiceId || ''}&hours=${selectedHours}`);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Profile link copied to clipboard! 📋', 'success');
    }
  };

  if (loading || !provider) {
    return (
      <div className="profile-loading-state">
        <p>Loading provider profile...</p>
      </div>
    );
  }

  // Calculate live booking price
  const activeService = provider.services?.find(s => s.id === selectedServiceId) || provider.services?.[0];
  const calculatedTotal = activeService
    ? (activeService.fixed ? activeService.amount : (activeService.amount || provider.hourlyRate || 300) * selectedHours)
    : (provider.hourlyRate || 300) * selectedHours;

  const isOnline = provider.availabilityStatus === 'available';
  const reviews = provider.reviews || [];
  const portfolio = provider.portfolio || [];
  const credentials = provider.credentials || [];

  return (
    <div className="provider-profile-wrapper">
      {/* ── Top Navigation Bar ── */}
      <div className="profile-nav-row">
        <button
          type="button"
          onClick={() => navigate('/search')}
          className="profile-back-btn"
        >
          <ChevronLeft size={16} />
          <span>Back to Specialists</span>
        </button>

        <div className="flex items-center gap-2">
          {appMode === 'provider' && (
            <button
              type="button"
              onClick={() => navigate('/provider/showcase')}
              className="btn btn-primary btn-sm"
            >
              <Edit2 size={13} />
              <span>Edit Showcase & Portfolio Studio</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="profile-share-btn"
            title="Share specialist profile"
          >
            <Share2 size={15} />
            <span>Share Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-200"
            title="Report this specialist"
          >
            <ShieldAlert size={16} />
          </button>
        </div>
      </div>

      {/* ── 1. Frosted Glass Hero Header Card ── */}
      <section className="profile-hero-card">
        <div className="hero-avatar-identity-wrap">
          <div 
            className="profile-large-avatar"
            style={{ backgroundColor: provider.avatarColor || '#0284C7' }}
          >
            <span>{provider.initials || provider.name?.slice(0, 2).toUpperCase()}</span>
            <span 
              className={`profile-status-dot ${isOnline ? 'online' : 'busy'}`} 
              title={isOnline ? 'Online & Available Now' : 'Currently Busy'}
            />
          </div>

          <div className="profile-identity-info">
            <div className="profile-name-badges-row">
              <h1 className="profile-provider-name">{provider.name}</h1>
              {provider.verified && (
                <span className="profile-verified-pill" title="Verified with Fayda Digital National ID">
                  <ShieldCheck size={14} />
                  <span>Verified Ethiopian Pro</span>
                </span>
              )}
              {provider.matchScore && (
                <span className="profile-ai-badge" title="AI Match Recommendation">
                  <Zap size={12} />
                  <span>{provider.matchScore}% AI Match</span>
                </span>
              )}
            </div>

            <p className="profile-headline-text">{provider.headline}</p>

            {/* Quick Metrics Bar */}
            <div className="profile-hero-meta-bar">
              <span className="hero-meta-item">
                <MapPin size={13} className="text-cyan" />
                <span>{provider.locationCity || 'Addis Ababa'} ({provider.distance || '1.8 km'})</span>
              </span>

              <span className="hero-meta-divider">•</span>

              <span className="hero-meta-item rating">
                <Star size={13} fill="#F59E0B" className="text-amber" />
                <strong>{(provider.rating || 4.9).toFixed(1)}</strong>
                <span className="meta-sub">({reviews.length} reviews)</span>
              </span>

              <span className="hero-meta-divider">•</span>

              <span className="hero-meta-item">
                <Briefcase size={13} className="text-slate" />
                <span>{provider.completedJobs || 85}+ jobs completed</span>
              </span>

              <span className="hero-meta-divider">•</span>

              <span className="hero-meta-item">
                <Clock size={13} className="text-slate" />
                <span>{provider.responseTime || '~4 min'} response</span>
              </span>
            </div>
          </div>
        </div>

        {/* Hero Action Buttons */}
        <div className="profile-hero-actions-box">
          <button
            type="button"
            onClick={handleStartChat}
            className="hero-chat-btn"
          >
            <MessageSquare size={16} />
            <span>Chat Directly</span>
          </button>

          <button
            type="button"
            onClick={handleBookWithEscrow}
            className="hero-book-btn"
          >
            <Calendar size={16} />
            <span>Book with Escrow ({provider.priceLabel || `${provider.hourlyRate} ETB/hr`})</span>
          </button>
        </div>
      </section>

      {/* ── 2. Profile Tabs Navigation ── */}
      <div className="profile-tabs-container">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`profile-tab-pill ${activeTab === 'overview' ? 'active' : ''}`}
        >
          <span>Overview & Bio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`profile-tab-pill ${activeTab === 'services' ? 'active' : ''}`}
        >
          <span>Services & Rates ({provider.services?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('portfolio')}
          className={`profile-tab-pill ${activeTab === 'portfolio' ? 'active' : ''}`}
        >
          <span>Portfolio Showcase ({portfolio.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`profile-tab-pill ${activeTab === 'reviews' ? 'active' : ''}`}
        >
          <span>Customer Reviews ({reviews.length})</span>
        </button>
      </div>

      {/* ── 3. Main Split Layout: Left Content Tabs + Right Sticky Escrow Box ── */}
      <div className="profile-split-layout">
        {/* Left Column: Tab Contents */}
        <div className="profile-main-pane">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="profile-tab-content-stack">
              {/* About Bio Card */}
              <div className="glass-content-card">
                <h3 className="card-section-heading">About the Specialist</h3>
                <p className="profile-about-text">
                  {provider.about}
                </p>

                <div className="profile-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Service Area</span>
                    <span className="detail-value">{provider.locationCity || 'Addis Ababa, Ethiopia'}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Languages</span>
                    <span className="detail-value">{provider.languages?.join(', ') || 'Amharic, English'}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Working Hours</span>
                    <span className="detail-value">{provider.workingHours || 'Mon – Sat: 8:00 AM – 7:00 PM'}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Payment Methods</span>
                    <span className="detail-value">Chapa Escrow (Telebirr, CBE, Dashen, Awash)</span>
                  </div>
                </div>
              </div>

              {/* Verified Credentials & Fayda ID Card */}
              <div className="glass-content-card">
                <div className="card-heading-with-badge">
                  <h3 className="card-section-heading">Verified Credentials & ID Check</h3>
                  <span className="fayda-verified-tag">
                    <ShieldCheck size={13} />
                    <span>LINC Verified Trust</span>
                  </span>
                </div>

                <div className="credentials-list">
                  {credentials.map((cred) => (
                    <div key={cred.id} className="credential-item-row">
                      <div className="credential-icon-box">
                        <CheckCircle2 size={18} className="text-emerald" />
                      </div>
                      <div className="credential-info">
                        <div className="credential-title-row">
                          <strong className="cred-title">{cred.title}</strong>
                          <span className="cred-status-badge">{cred.status}</span>
                        </div>
                        <span className="cred-issuer">{cred.issuer} • {cred.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured Services Preview */}
              <div className="glass-content-card">
                <div className="card-heading-with-action">
                  <h3 className="card-section-heading">Popular Services</h3>
                  <button type="button" onClick={() => setActiveTab('services')} className="link-action-btn">
                    View all ({provider.services?.length}) →
                  </button>
                </div>

                <div className="services-list-vertical">
                  {provider.services?.slice(0, 2).map((svc) => (
                    <div 
                      key={svc.id} 
                      onClick={() => {
                        setSelectedServiceId(svc.id);
                        setActiveTab('services');
                      }}
                      className="service-card-row preview-mode"
                    >
                      <div className="service-main-data">
                        <h4 className="service-name">{svc.name}</h4>
                        <p className="service-desc">{svc.description}</p>
                        <div className="service-tags-bar">
                          <span className="service-duration-badge">
                            <Clock size={11} />
                            <span>{svc.duration}</span>
                          </span>
                          {svc.tags?.map((tag, i) => (
                            <span key={i} className="service-tag-chip">{tag}</span>
                          ))}
                        </div>
                      </div>

                      <div className="service-price-select-box">
                        <span className="service-price-tag">{svc.price}</span>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedServiceId(svc.id);
                          }}
                          className={`service-select-btn ${selectedServiceId === svc.id ? 'selected' : ''}`}
                        >
                          {selectedServiceId === svc.id ? 'Selected ✓' : 'Select'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SERVICES & PRICING */}
          {activeTab === 'services' && (
            <div className="profile-tab-content-stack">
              <div className="glass-content-card">
                <h3 className="card-section-heading">Available Service Packages</h3>
                <p className="section-sub-desc">
                  Select a service below to calculate the total price and book with Chapa Escrow protection.
                </p>

                <div className="services-list-vertical">
                  {provider.services?.map((svc) => {
                    const isSelected = selectedServiceId === svc.id;
                    return (
                      <div 
                        key={svc.id} 
                        onClick={() => setSelectedServiceId(svc.id)}
                        className={`service-card-row ${isSelected ? 'selected-service' : ''}`}
                      >
                        <div className="service-main-data">
                          <div className="service-title-row">
                            <h4 className="service-name">{svc.name}</h4>
                            {svc.fixed && <span className="fixed-rate-badge">Fixed Rate</span>}
                          </div>
                          <p className="service-desc">{svc.description}</p>
                          <div className="service-tags-bar">
                            <span className="service-duration-badge">
                              <Clock size={11} />
                              <span>{svc.duration}</span>
                            </span>
                            {svc.tags?.map((tag, i) => (
                              <span key={i} className="service-tag-chip">{tag}</span>
                            ))}
                          </div>
                        </div>

                        <div className="service-price-select-box">
                          <span className="service-price-tag">{svc.price}</span>
                          <button 
                            type="button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedServiceId(svc.id);
                            }}
                            className={`service-select-btn ${isSelected ? 'selected' : ''}`}
                          >
                            {isSelected ? 'Selected ✓' : 'Select'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PORTFOLIO SHOWCASE */}
          {activeTab === 'portfolio' && (
            <div className="profile-tab-content-stack">
              <div className="glass-content-card">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="card-section-heading">Completed Projects & Case Studies</h3>
                  {appMode === 'provider' && (
                    <button
                      type="button"
                      onClick={() => navigate('/provider/showcase')}
                      className="btn btn-outline btn-sm text-xs"
                    >
                      <Edit2 size={12} />
                      <span>Manage Projects</span>
                    </button>
                  )}
                </div>
                <p className="section-sub-desc">
                  Explore verified past jobs completed by {provider.name} across Addis Ababa.
                </p>

                {portfolio.length > 0 ? (
                  <div className="portfolio-cards-grid">
                    {portfolio.map((proj) => (
                      <div key={proj.id} className={`portfolio-project-card ${proj.pinned ? 'pinned-proj' : ''}`}>
                        <div className="proj-header-row">
                          <div className="flex items-center gap-2">
                            <h4 className="proj-title">{proj.title}</h4>
                            {proj.pinned && <span className="pin-indicator">📌</span>}
                          </div>
                          <span className="proj-cost-badge">{proj.cost}</span>
                        </div>

                        <div className="proj-meta-bar">
                          <span className="proj-subcity">📍 {proj.subCity}</span>
                          <span>•</span>
                          <span className="proj-duration">⏱️ {proj.duration}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-bold text-xs">🛡️ Escrow Verified</span>
                        </div>

                        <p className="proj-desc">{proj.description}</p>

                        {/* Before / After Photo Indicator */}
                        <div className="before-after-mini-row">
                          <span className="photo-pill-mini before">📸 Before Photo</span>
                          <span className="text-slate-300">➔</span>
                          <span className="photo-pill-mini after">✓ After Photo</span>
                        </div>

                        <div className="proj-tags-bar">
                          {proj.tags?.map((t, idx) => (
                            <span key={idx} className="proj-tag-pill">{t}</span>
                          ))}
                        </div>

                        {proj.clientFeedback && (
                          <div className="proj-feedback-box">
                            <p className="feedback-quote">{proj.clientFeedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-portfolio-box">
                    <Sparkles size={32} className="text-muted" />
                    <p>New projects and photos will be uploaded soon.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: REVIEWS & RATINGS */}
          {activeTab === 'reviews' && (
            <div className="profile-tab-content-stack">
              <div className="glass-content-card">
                <div className="reviews-summary-header">
                  <div>
                    <h3 className="card-section-heading">Client Reviews & Ratings</h3>
                    <p className="section-sub-desc">Verified feedback from clients who completed jobs via LINC Escrow.</p>
                  </div>
                  <div className="rating-score-badge">
                    <Star size={20} fill="#F59E0B" className="text-amber" />
                    <span className="score-big">{(provider.rating || 4.9).toFixed(1)}</span>
                    <span className="score-total">/ 5.0</span>
                  </div>
                </div>

                <div className="reviews-feed-list">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="review-card-item">
                      <div className="review-header-row">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar">
                            {rev.author?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="reviewer-name">{rev.author}</strong>
                              {rev.pinned && <span className="text-xs">📌 Featured</span>}
                            </div>
                            <span className="review-date">{rev.date} • {rev.subCity || 'Addis Ababa'}</span>
                          </div>
                        </div>

                        <span className="verified-booking-chip">
                          <CheckCircle2 size={12} />
                          <span>Verified Booking</span>
                        </span>
                      </div>

                      <div className="review-stars-row">
                        {[...Array(5)].map((_, idx) => (
                          <Star 
                            key={idx} 
                            size={14} 
                            fill={idx < rev.rating ? '#F59E0B' : '#E2E8F0'} 
                            color={idx < rev.rating ? '#F59E0B' : '#CBD5E1'} 
                          />
                        ))}
                      </div>

                      <p className="review-text">{rev.comment}</p>

                      {/* Official Specialist Response */}
                      {rev.providerReply && (
                        <div className="provider-official-reply-box mt-2">
                          <div className="reply-header">
                            <ShieldCheck size={13} className="text-cyan-600" />
                            <strong className="text-xs text-slate-800">Response from {provider.name}:</strong>
                          </div>
                          <p className="reply-body-text">{rev.providerReply.text}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Escrow Booking Card & Live Calculator */}
        <aside className="profile-sidebar-pane">
          <div className="sticky-booking-card">
            <div className="booking-card-header">
              <div>
                <span className="booking-card-sub">Instant Booking with</span>
                <h3 className="booking-card-title">Chapa Escrow Vault</h3>
              </div>
              <Lock size={20} className="text-emerald" />
            </div>

            {/* Service Picker */}
            <div className="calculator-service-picker">
              <label className="calc-label">Selected Service</label>
              <select
                value={selectedServiceId || ''}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="calc-select"
              >
                {provider.services?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.price})
                  </option>
                ))}
              </select>
            </div>

            {/* Hours Counter (Only for hourly services) */}
            {activeService && !activeService.fixed && (
              <div className="calculator-hours-picker">
                <div className="hours-label-row">
                  <span className="calc-label">Estimated Hours</span>
                  <span className="calc-hours-val">{selectedHours} hrs</span>
                </div>
                <div className="hours-buttons-row">
                  {[1, 2, 3, 4, 6, 8].map((hr) => (
                    <button
                      key={hr}
                      type="button"
                      onClick={() => setSelectedHours(hr)}
                      className={`hour-btn ${selectedHours === hr ? 'active' : ''}`}
                    >
                      {hr}h
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cost Breakdown */}
            <div className="booking-price-breakdown">
              <div className="breakdown-row">
                <span>Service Cost</span>
                <span className="breakdown-val">{calculatedTotal} ETB</span>
              </div>
              <div className="breakdown-row">
                <span>LINC Escrow Protection</span>
                <span className="breakdown-val text-emerald">0 ETB (Free)</span>
              </div>
              <div className="breakdown-divider" />
              <div className="breakdown-row total">
                <span>Total Escrow Deposit</span>
                <span className="breakdown-total-val">{calculatedTotal} ETB</span>
              </div>
            </div>

            {/* Booking CTA Button */}
            <button
              type="button"
              onClick={handleBookWithEscrow}
              className="booking-submit-btn"
            >
              <Lock size={16} />
              <span>Book with Chapa Escrow</span>
            </button>

            {/* Escrow Guarantee Box */}
            <div className="escrow-guarantee-info-box">
              <div className="guarantee-title-row">
                <ShieldCheck size={16} className="text-emerald" />
                <strong>100% Money-Back Guarantee</strong>
              </div>
              <p className="guarantee-desc">
                Your deposit is locked in Chapa Escrow. {provider.name} is only paid after you inspect and approve the completed job.
              </p>
            </div>

            {/* Provider Quick Contact */}
            <div className="provider-direct-chat-prompt">
              <span>Have questions before booking?</span>
              <button type="button" onClick={handleStartChat} className="chat-link-btn">
                <MessageSquare size={13} />
                <span>Chat with {provider.name?.split(' ')[0]}</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Report Modal */}
      {isReportModalOpen && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          entityType="provider"
          entityId={provider.id}
          entityName={provider.name}
        />
      )}
    </div>
  );
}
