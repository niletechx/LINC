import { Star, ShieldCheck, MapPin, Clock, Briefcase, MessageSquare, Calendar, Phone, X, CheckCircle } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useBookingStore } from '../../stores/bookingStore';
import { useChatStore } from '../../stores/chatStore';
import { useNavigate } from 'react-router-dom';

export default function ProviderDetailsModal() {
  const { selectedProviderForDetails, setSelectedProviderForDetails } = useAppStore();
  const { openCreateBooking } = useBookingStore();
  const { startConversationWithProvider } = useChatStore();
  const navigate = useNavigate();

  if (!selectedProviderForDetails) return null;
  const p = selectedProviderForDetails;

  const handleBookService = (service) => {
    const providerCopy = p;
    setSelectedProviderForDetails(null);
    openCreateBooking(providerCopy, service);
  };

  const handleDirectChat = () => {
    const providerCopy = p;
    setSelectedProviderForDetails(null);
    startConversationWithProvider(providerCopy);
    navigate('/messages');
  };

  return (
    <div className="modal-backdrop" onClick={() => setSelectedProviderForDetails(null)}>
      <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header Profile Banner */}
        <div className="provider-modal-header" style={{ borderTop: `4px solid ${p.avatarColor || '#7EC8E3'}` }}>
          <button
            className="modal-close-btn absolute-close"
            onClick={() => setSelectedProviderForDetails(null)}
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <div className="provider-modal-hero">
            <div className="provider-avatar-box-lg" style={{ backgroundColor: p.avatarColor || '#7EC8E3' }}>
              <span>{p.initials || p.name?.slice(0, 2).toUpperCase()}</span>
            </div>

            <div className="provider-modal-info">
              <div className="provider-name-row">
                <h2 className="provider-modal-name">{p.name}</h2>
                {p.verified && (
                  <span className="verified-badge">
                    <ShieldCheck size={14} className="text-emerald" />
                    <span>Verified Pro</span>
                  </span>
                )}
              </div>
              <p className="provider-modal-headline">{p.headline}</p>

              <div className="provider-modal-meta">
                <span><MapPin size={13} /> {p.locationCity || 'Bole, Addis Ababa'}</span>
                <span>•</span>
                <span><Star size={13} fill="#F59E0B" className="text-amber" /> {(p.rating || 4.9).toFixed(1)} ({p.reviewsCount || 42} reviews)</span>
                <span>•</span>
                <span><Briefcase size={13} /> {p.completedJobs || 85} jobs completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body max-h-[70vh] overflow-y-auto">
          {/* About Section */}
          <div className="provider-section">
            <h4 className="provider-section-title">About Professional</h4>
            <p className="provider-about-text">
              {p.about ||
                `${p.name} is a verified, background-checked professional with years of active experience delivering high-quality work across Addis Ababa.`}
            </p>
          </div>

          {/* Services Offered */}
          <div className="provider-section">
            <h4 className="provider-section-title">Services Offered</h4>
            <div className="services-list-grid">
              {(p.services || []).map((srv) => (
                <div key={srv.id} className="service-offer-card">
                  <div className="service-offer-top">
                    <h5 className="service-offer-name">{srv.name}</h5>
                    <span className="service-offer-price">{srv.price}</span>
                  </div>
                  <div className="service-offer-meta">
                    <span className="service-duration"><Clock size={12} /> {srv.duration}</span>
                    <div className="service-tags">
                      {(srv.tags || []).map((tag, idx) => (
                        <span key={idx} className="service-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleBookService(srv)}
                    className="btn btn-secondary btn-sm w-full mt-2"
                  >
                    <Calendar size={13} />
                    <span>Book this Service</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Client Reviews */}
          {p.reviews && p.reviews.length > 0 && (
            <div className="provider-section">
              <h4 className="provider-section-title">Client Reviews</h4>
              <div className="provider-reviews-list">
                {p.reviews.map((rev) => (
                  <div key={rev.id} className="review-card">
                    <div className="review-card-top">
                      <span className="review-author">{rev.author}</span>
                      <div className="review-stars">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={12} fill="#F59E0B" className="text-amber" />
                        ))}
                      </div>
                      <span className="review-date">{rev.date}</span>
                    </div>
                    <p className="review-comment">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="modal-footer-sticky">
          <button
            type="button"
            onClick={handleDirectChat}
            className="btn btn-outline"
          >
            <MessageSquare size={16} />
            <span>Chat with {p.name.split(' ')[0]}</span>
          </button>

          <button
            type="button"
            onClick={() => handleBookService(p.services ? p.services[0] : null)}
            className="btn btn-primary"
          >
            <Calendar size={16} />
            <span>Book with Escrow Protection</span>
          </button>
        </div>
      </div>
    </div>
  );
}
