import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Calendar, Clock, MapPin, MessageSquare, CheckCircle, AlertCircle, RefreshCw, Star } from 'lucide-react';
import { useBookingStore } from '../stores/bookingStore';
import { useChatStore } from '../stores/chatStore';
import { useAppStore } from '../stores/appStore';
import { MOCK_BOOKINGS } from '../data/mockData';

export default function BookingsPage() {
  const navigate = useNavigate();
  const { bookings } = useBookingStore();
  const { startConversationWithProvider } = useChatStore();
  const { showToast } = useAppStore();

  const [activeTab, setActiveTab] = useState('active');

  const allBookings = bookings.length > 0 ? bookings : MOCK_BOOKINGS;

  const activeBookings = allBookings.filter((b) => b.status === 'confirmed' || b.status === 'in_progress');
  const upcomingBookings = allBookings.filter((b) => b.status === 'upcoming' || b.status === 'scheduled');
  const completedBookings = allBookings.filter((b) => b.status === 'completed');

  let displayBookings = activeBookings;
  if (activeTab === 'upcoming') displayBookings = upcomingBookings;
  if (activeTab === 'completed') displayBookings = completedBookings;

  const handleChat = (b) => {
    startConversationWithProvider({
      id: b.providerId || b.id,
      name: b.providerName || b.provider_name,
      headline: b.serviceName || b.service_name,
      initials: (b.providerName || b.provider_name || 'PR').slice(0, 2).toUpperCase(),
    });
    navigate(`/dm/${b.providerId || b.id}`);
  };

  const handleReleasePayment = (b) => {
    showToast('Payment successfully released to provider! Thank you.', 'success');
  };

  return (
    <div className="bookings-container">
      {/* Header */}
      <div className="bookings-header">
        <div>
          <h1 className="bookings-title">My Bookings & Escrow Vault</h1>
          <p className="bookings-subtitle">Track your active tasks, scheduled services, and manage escrow security.</p>
        </div>

        <div className="escrow-assurance-badge">
          <ShieldCheck size={20} className="text-emerald" />
          <div className="assurance-text">
            <span className="assurance-title">100% Escrow Protected</span>
            <span className="assurance-sub">Funds released only upon your approval</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bookings-tabs-bar">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`booking-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
        >
          <span>Active Tasks ({activeBookings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`booking-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
        >
          <span>Upcoming ({upcomingBookings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`booking-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
        >
          <span>Completed History ({completedBookings.length})</span>
        </button>
      </div>

      {/* Bookings List */}
      <div className="bookings-list">
        {displayBookings.length > 0 ? (
          displayBookings.map((b) => {
            const providerName = b.providerName || b.provider_name || 'Abebe Girma';
            const serviceName = b.serviceName || b.service_name || 'Plumbing Service';
            const price = b.price || b.amount || '450 ETB';
            const date = b.date || b.scheduledDate || 'Today, 2:30 PM';
            const location = b.location || 'Bole Rwanda, Addis Ababa';

            return (
              <div key={b.id} className="booking-card">
                <div className="booking-card-top">
                  <div className="booking-provider-info">
                    <div className="booking-avatar" style={{ backgroundColor: '#0284C7' }}>
                      <span>{providerName.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="booking-service-name">{serviceName}</h3>
                      <p className="booking-provider-name">Specialist: <strong>{providerName}</strong></p>
                    </div>
                  </div>

                  <div className="booking-status-right">
                    <span className="booking-price-tag">{price}</span>
                    <span className="status-badge badge-emerald">
                      {activeTab === 'active' ? '● In Progress' : activeTab === 'upcoming' ? '⏱ Scheduled' : '✓ Completed'}
                    </span>
                  </div>
                </div>

                <div className="booking-card-details">
                  <div className="booking-detail-item">
                    <Calendar size={14} className="text-muted" />
                    <span>{date}</span>
                  </div>
                  <div className="booking-detail-item">
                    <MapPin size={14} className="text-muted" />
                    <span>{location}</span>
                  </div>
                  <div className="booking-detail-item">
                    <ShieldCheck size={14} className="text-emerald" />
                    <span>Escrow Vault: <strong>Funded & Secured</strong></span>
                  </div>
                </div>

                <div className="booking-card-actions">
                  <button
                    type="button"
                    onClick={() => handleChat(b)}
                    className="btn btn-outline btn-sm"
                  >
                    <MessageSquare size={14} />
                    <span>Message Provider</span>
                  </button>

                  {activeTab === 'active' && (
                    <button
                      type="button"
                      onClick={() => handleReleasePayment(b)}
                      className="btn btn-primary btn-sm"
                    >
                      <CheckCircle size={14} />
                      <span>Approve & Release Payment</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-results-box" style={{ background: '#ffffff', padding: '48px', borderRadius: '16px', border: '1.5px solid #E2E8F0', textAlign: 'center' }}>
            <Calendar size={40} style={{ color: '#94A3B8', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>No {activeTab} bookings found</h3>
            <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '360px', margin: '6px auto 16px' }}>
              Explore top specialists in Addis Ababa and book your next service with complete escrow protection.
            </p>
            <button
              type="button"
              onClick={() => navigate('/search')}
              className="btn btn-primary btn-sm"
            >
              Browse Services
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
