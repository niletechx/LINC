import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Share2, 
  Bookmark, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Briefcase, 
  MessageSquare, 
  Calendar, 
  Zap, 
  CheckCircle, 
  Clock,
  Phone,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { useAppStore } from '../stores/appStore';
import { MOCK_PROVIDERS } from '../data/mockData';

export default function ProviderProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { startConversationWithProvider } = useChatStore();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal, showToast } = useAppStore();
  
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = MOCK_PROVIDERS.find(p => p.id === id) || MOCK_PROVIDERS[0];
    setProvider(p);
    setLoading(false);
  }, [id]);

  const handleStartChat = () => {
    if (!isAuthenticated) {
      openAuthModal(`Sign in or create an account to start a direct chat with ${provider?.name}.`);
      return;
    }
    startConversationWithProvider(provider);
    navigate(`/dm/${provider.id}`);
  };

  const handleBook = (serviceId) => {
    if (!isAuthenticated) {
      openAuthModal(`Create an account to book ${provider?.name} with Chapa Escrow protection.`);
      return;
    }
    navigate(`/booking/${provider.id}`);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Profile link copied to clipboard! 📋', 'success');
    }
  };

  if (loading || !provider) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <p style={{ color: '#64748B' }}>Loading provider profile...</p>
      </div>
    );
  }

  const reviews = provider.reviews || [
    { author: 'Mekdes A.', rating: 5, date: '2 days ago', comment: 'Incredibly professional. Fixed our pipe leak in under an hour and cleaned up afterwards.' },
    { author: 'Yared G.', rating: 5, date: '1 week ago', comment: 'Fast response, fair price, quality work. Will definitely call again for our upcoming renovations.' },
  ];

  return (
    <div style={{ padding: '24px 32px 48px' }}>
      {/* Back link */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-outline btn-sm"
        >
          <ChevronLeft size={16} />
          <span>Back to Specialists</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="btn btn-outline btn-sm"
        >
          <Share2 size={15} />
          <span>Share Profile</span>
        </button>
      </div>

      {/* ── 1. Hero Header Card ── */}
      <section className="profile-header-card" style={{ marginBottom: '24px' }}>
        <div className="profile-header-left">
          <div 
            className="profile-large-avatar"
            style={{ backgroundColor: provider.avatarColor || '#0284C7' }}
          >
            <span>{provider.initials || provider.name?.slice(0, 2).toUpperCase()}</span>
          </div>

          <div>
            <div className="profile-name-badge-row">
              <h1 className="profile-title">{provider.name}</h1>
              {provider.verified && (
                <span className="verified-pill">
                  <ShieldCheck size={13} />
                  <span>Verified Ethiopian Pro</span>
                </span>
              )}
              {provider.matchScore && (
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#D97706', background: '#FEF3C7', padding: '3px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <Zap size={11} />
                  <span>{provider.matchScore}% Match</span>
                </span>
              )}
            </div>

            <p className="profile-sub" style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginTop: '4px' }}>
              {provider.headline}
            </p>

            <div className="profile-contact-meta" style={{ marginTop: '8px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} className="text-muted" />
                <span>{provider.locationCity || 'Bole, Addis Ababa'} ({provider.distance || '1.8 km'})</span>
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Star size={13} fill="#F59E0B" className="text-amber" />
                <span><strong>{(provider.rating || 4.9).toFixed(1)}</strong> ({provider.reviewsCount || 42} reviews)</span>
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Briefcase size={13} className="text-muted" />
                <span>{provider.completedJobs || 85} completed tasks</span>
              </span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '200px' }}>
          <button
            type="button"
            onClick={() => handleBook()}
            className="btn btn-primary"
            style={{ width: '100%', height: '42px', justifyContent: 'center' }}
          >
            <Calendar size={15} />
            <span>Book Service ({provider.priceLabel || `${provider.hourlyRate || 300} ETB/hr`})</span>
          </button>

          <button
            type="button"
            onClick={handleStartChat}
            className="btn btn-outline"
            style={{ width: '100%', height: '42px', justifyContent: 'center' }}
          >
            <MessageSquare size={15} />
            <span>Direct Message</span>
          </button>
        </div>
      </section>

      {/* ── 2. Grid with About & Services ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left Column: About & Services & Reviews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* About Section */}
          <section className="profile-section-card">
            <h2 className="section-card-title">About the Specialist</h2>
            <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
              {provider.about || `${provider.name} is a licensed, background-checked professional with years of active experience across residential and commercial properties in Addis Ababa. Known for speed, transparent pricing, and quality craftsmanship.`}
            </p>
          </section>

          {/* Services Offered */}
          <section className="profile-section-card">
            <h2 className="section-card-title">Services & Fixed Rates</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(provider.services || [
                { name: 'Standard Diagnostics & Service', duration: '1–2 hours', price: '350 ETB/hr' },
                { name: 'Full Installation & Overhaul', duration: 'Half day', price: '1,500 ETB' },
              ]).map((svc, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '14px 16px', 
                    background: '#F8FAFC', 
                    border: '1px solid #E2E8F0', 
                    borderRadius: '12px' 
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '13.5px', color: '#0F172A' }}>{svc.name}</strong>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748B', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={11} />
                        <span>{svc.duration}</span>
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#0284C7' }}>{svc.price}</span>
                    <button
                      type="button"
                      onClick={() => handleBook(svc.id)}
                      className="btn btn-primary btn-sm"
                    >
                      <span>Book</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Client Reviews */}
          <section className="profile-section-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h2 className="section-card-title" style={{ margin: 0 }}>Verified Customer Reviews</h2>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#F59E0B' }}>★ {(provider.rating || 4.9).toFixed(1)} Rating</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviews.map((rev, i) => (
                <div key={i} style={{ padding: '14px 16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '13px', color: '#0F172A' }}>{rev.author}</strong>
                      <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#166534', padding: '1px 6px', borderRadius: '8px', fontWeight: 700 }}>Verified Job</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>{rev.date}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '2px', margin: '4px 0 6px' }}>
                    {[...Array(5)].map((_, starI) => (
                      <Star key={starI} size={12} fill="#F59E0B" className="text-amber" />
                    ))}
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.45', margin: 0 }}>{rev.comment}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Escrow & Trust Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: '16px', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Lock size={18} className="text-emerald" />
              <strong style={{ fontSize: '13.5px', color: '#166534' }}>100% Escrow Protected</strong>
            </div>
            <p style={{ fontSize: '12px', color: '#15803D', lineHeight: '1.45', margin: 0 }}>
              Your money is deposited safely in LINC Escrow via Chapa. {provider.name} is only paid after you inspect and approve the completed job.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '18px' }}>
            <strong style={{ fontSize: '13px', color: '#0F172A', display: 'block', marginBottom: '10px' }}>Trust & Verification</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} className="text-emerald" />
                <span>Fayda Digital National ID</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} className="text-emerald" />
                <span>Phone & Address Verified</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} className="text-emerald" />
                <span>Trade Certification Checked</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
