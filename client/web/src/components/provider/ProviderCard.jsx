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

  return (
    <div className="provider-card" onClick={handleCardClick}>
      {/* Top Header */}
      <div className="provider-card-top">
        <div className="provider-avatar-box" style={{ backgroundColor: provider.avatarColor || '#7EC8E3' }}>
          <span>{provider.initials || provider.name?.slice(0, 2).toUpperCase()}</span>
        </div>

        <div className="provider-identity">
          <div className="provider-name-row">
            <h4 className="provider-name">{provider.name}</h4>
            {provider.verified && (
              <span className="verified-badge-icon" title="Verified Professional">
                <ShieldCheck size={16} className="text-emerald" />
              </span>
            )}
          </div>
          <p className="provider-headline">{provider.headline}</p>
        </div>

        {provider.matchScore && (
          <div className="provider-match-badge" title="AI Match Confidence">
            <Zap size={12} />
            <span>{provider.matchScore}%</span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="provider-metrics-row">
        <div className="metric-badge metric-rating">
          <Star size={13} fill="#F59E0B" className="text-amber" />
          <span className="metric-val">{(provider.rating || 4.9).toFixed(1)}</span>
          <span className="metric-sub">({provider.reviewsCount || 42})</span>
        </div>

        <div className="metric-badge">
          <MapPin size={13} className="text-muted" />
          <span className="metric-val">{provider.distance || '1.8 km'}</span>
        </div>

        <div className="metric-badge">
          <Briefcase size={13} className="text-muted" />
          <span className="metric-val">{provider.completedJobs || 80}+ jobs</span>
        </div>

        <div className="metric-badge">
          <Clock size={13} className="text-muted" />
          <span className="metric-val">{provider.responseTime || '~5 min'}</span>
        </div>
      </div>

      {/* Price & Action Footer */}
      <div className="provider-card-footer">
        <div className="provider-price-box">
          <span className="price-label">Starting at</span>
          <span className="price-amount">{provider.priceLabel || `${provider.hourlyRate || 300} ETB/hr`}</span>
        </div>

        <div className="provider-action-group">
          <button
            type="button"
            onClick={handleChat}
            className="btn btn-outline btn-sm provider-chat-btn"
            title="Chat directly with provider"
          >
            <MessageSquare size={14} />
            <span>Chat</span>
          </button>

          <button
            type="button"
            onClick={handleBook}
            className="btn btn-primary btn-sm provider-book-btn"
          >
            <Calendar size={14} />
            <span>Book</span>
          </button>
        </div>
      </div>
    </div>
  );
}
