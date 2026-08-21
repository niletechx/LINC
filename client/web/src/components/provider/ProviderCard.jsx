import React from 'react';
import { Star, ShieldCheck, MapPin, Clock, Briefcase, MessageSquare, Calendar, Zap } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';
import { useNavigate } from 'react-router-dom';

export default function ProviderCard({ provider }) {
  const { startConversationWithProvider } = useChatStore();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useAppStore();
  const navigate = useNavigate();

  const handleChat = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal(`Sign in or create an account to start a direct chat with ${provider.name}.`);
      return;
    }
    startConversationWithProvider(provider);
    navigate(`/dm/${provider.id}`);
  };

  const handleBook = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openAuthModal(`Create an account to book ${provider.name} with Chapa Escrow protection.`);
      return;
    }
    navigate(`/booking/${provider.id}`);
  };

  const handleCardClick = () => {
    navigate(`/provider/${provider.id}`);
  };

  // Collect skills / service tags
  const tags = provider.services?.flatMap((s) => s.tags || []).slice(0, 3) || [];
  const isOnline = provider.availabilityStatus === 'available';

  return (
    <div className="provider-spotlight-card" onClick={handleCardClick}>
      {/* ── Top Row: Avatar & Identity Header ── */}
      <div className="card-top-identity-row">
        <div className="card-avatar-box">
          <div className="card-avatar-squircle" style={{ backgroundColor: provider.avatarColor || '#0284C7' }}>
            <span>{provider.initials || provider.name?.slice(0, 2).toUpperCase()}</span>
            <span className={`avatar-status-dot ${isOnline ? 'online' : 'busy'}`} title={isOnline ? 'Online & Available' : 'Busy'} />
          </div>
          {provider.matchScore && (
            <div className="card-match-chip" title="AI Match Confidence">
              <Zap size={10} />
              <span>{provider.matchScore}%</span>
            </div>
          )}
        </div>

        <div className="card-name-headline-group">
          <div className="card-name-badge-line">
            <h4 className="provider-card-name">{provider.name}</h4>
            {provider.verified && (
              <span className="provider-verified-tag" title="Identity & Skill Verified with Fayda ID">
                <ShieldCheck size={12} className="text-emerald" />
                <span>Verified</span>
              </span>
            )}
          </div>

          <p className="provider-card-headline">{provider.headline}</p>

          <div className="provider-rating-inline">
            <Star size={12} fill="#F59E0B" className="text-amber" />
            <strong className="rating-score">{(provider.rating || 4.9).toFixed(1)}</strong>
            <span className="rating-reviews-count">({provider.reviewsCount || 42} reviews)</span>
          </div>
        </div>
      </div>

      {/* ── Middle: Skill Tags ── */}
      {tags.length > 0 && (
        <div className="card-tags-strip">
          {tags.map((tag, idx) => (
            <span key={idx} className="card-tag-pill">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* ── Middle: Location & Performance Stats Strip ── */}
      <div className="card-metrics-strip-row">
        <span className="metric-chip">
          <MapPin size={12} className="text-muted" />
          <span>{provider.locationCity?.split(',')[0] || 'Addis'}</span>
        </span>

        <span className="metric-sep">•</span>

        <span className="metric-chip">
          <Briefcase size={12} className="text-muted" />
          <span>{provider.completedJobs || 80}+ jobs</span>
        </span>

        <span className="metric-sep">•</span>

        <span className="metric-chip">
          <Clock size={12} className="text-muted" />
          <span>{provider.responseTime || '~5 min'}</span>
        </span>
      </div>

      {/* ── Bottom Row: Pricing & Actions ── */}
      <div className="card-bottom-footer-row">
        <div className="card-rate-group">
          <span className="rate-tiny-label">STARTING RATE</span>
          <strong className="rate-amount-val">{provider.priceLabel || `${provider.hourlyRate || 300} ETB/hr`}</strong>
        </div>

        <div className="card-actions-buttons">
          <button
            type="button"
            onClick={handleChat}
            className="card-chat-btn"
            title="Chat directly with specialist"
          >
            <MessageSquare size={13} />
            <span>Chat</span>
          </button>

          <button
            type="button"
            onClick={handleBook}
            className="card-book-btn"
            title="Book with Chapa Escrow"
          >
            <Calendar size={13} />
            <span>Book</span>
          </button>
        </div>
      </div>
    </div>
  );
}
