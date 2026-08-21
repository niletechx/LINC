import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Calendar, 
  Clock, 
  MapPin, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Star, 
  Download, 
  X, 
  Zap, 
  ArrowRight,
  FileText,
  AlertTriangle,
  RefreshCw,
  Search,
  ShieldAlert
} from 'lucide-react';
import { useBookingStore } from '../stores/bookingStore';
import { useChatStore } from '../stores/chatStore';
import { useAppStore } from '../stores/appStore';
import { MOCK_PROVIDERS } from '../data/mockData';
import ReviewModal from '../components/common/ReviewModal';
import ReportModal from '../components/common/ReportModal';

export default function BookingsPage() {
  const navigate = useNavigate();
  const { 
    bookings, 
    activeTab, 
    setActiveTab,
    loadBookings,
    isReleaseModalOpen,
    releaseTargetBooking,
    openReleaseModal,
    closeReleaseModal,
    releaseEscrowFunds,
    isDisputeModalOpen,
    disputeTargetBooking,
    openDisputeModal,
    closeDisputeModal,
    raiseDispute,
    isReceiptModalOpen,
    receiptTargetBooking,
    openReceiptModal,
    closeReceiptModal
  } = useBookingStore();

  const { startConversationWithProvider } = useChatStore();
  const { showToast } = useAppStore();

  // Review & Report Modal states
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);

  // Modal form states
  const [releaseRating, setReleaseRating] = useState(5);
  const [releaseReview, setReleaseReview] = useState('');
  const [disputeReason, setDisputeReason] = useState('incomplete_work');
  const [disputeNotes, setDisputeNotes] = useState('');

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Calculate vault stats
  const totalLocked = bookings
    .filter(b => b.escrowStatus === 'funded_locked')
    .reduce((acc, b) => acc + (b.agreedPrice || 0), 0);

  const activeCount = bookings.filter(b => b.status === 'in_progress').length;
  const scheduledCount = bookings.filter(b => b.status === 'scheduled').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const disputedCount = bookings.filter(b => b.status === 'disputed').length;

  // Filter bookings according to activeTab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'in_progress') return b.status === 'in_progress';
    if (activeTab === 'scheduled') return b.status === 'scheduled';
    if (activeTab === 'completed') return b.status === 'completed';
    if (activeTab === 'disputed') return b.status === 'disputed';
    return true; // 'all'
  });

  const handleChatWithProvider = (booking) => {
    const provider = MOCK_PROVIDERS.find(p => p.id === booking.providerId) || {
      id: booking.providerId || '1',
      name: booking.providerName,
      headline: booking.serviceTitle,
      avatarColor: booking.avatarColor || '#0284C7',
      initials: booking.initials || 'PR',
    };
    startConversationWithProvider(provider);
    navigate(`/dm/${provider.id}`);
  };

  const handleConfirmRelease = () => {
    if (!releaseTargetBooking) return;
    releaseEscrowFunds(releaseTargetBooking.id, releaseRating, releaseReview);
    showToast(`🎉 Escrow funds of ${releaseTargetBooking.agreedPrice} ETB released to ${releaseTargetBooking.providerName}!`, 'success');
  };

  const handleConfirmDispute = () => {
    if (!disputeTargetBooking) return;
    raiseDispute(disputeTargetBooking.id, `${disputeReason}: ${disputeNotes}`);
    showToast('⚠️ Dispute submitted. LINC Mediation Team has locked the funds and will review within 24 hours.', 'error');
  };

  return (
    <div className="bookings-dashboard-wrapper">
      {/* ── 1. Header & Vault Metrics Strip ── */}
      <header className="bookings-dashboard-header">
        <div>
          <div className="header-badge-row">
            <h1 className="dashboard-title">My Bookings & Escrow Vault</h1>
            <span className="vault-active-pill">
              <Lock size={12} className="text-emerald" />
              <span>Chapa Escrow Protected</span>
            </span>
          </div>
          <p className="dashboard-subtitle">
            Manage your service contracts, track live task progress, and control milestone escrow release.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/search')}
          className="book-new-service-btn"
        >
          <Zap size={15} />
          <span>Book New Service</span>
        </button>
      </header>

      {/* Vault Metric Cards */}
      <section className="escrow-metrics-row">
        <div className="escrow-metric-card highlight">
          <div className="metric-icon-box lock-box">
            <Lock size={20} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Funds Held in Escrow Vault</span>
            <strong className="metric-val text-emerald">{totalLocked} ETB</strong>
            <span className="metric-sub">100% Protected until you approve</span>
          </div>
        </div>

        <div className="escrow-metric-card">
          <div className="metric-icon-box in-progress-box">
            <Zap size={20} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Active Tasks in Progress</span>
            <strong className="metric-val">{activeCount}</strong>
            <span className="metric-sub">{scheduledCount} scheduled upcoming</span>
          </div>
        </div>

        <div className="escrow-metric-card">
          <div className="metric-icon-box complete-box">
            <CheckCircle2 size={20} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Completed & Verified</span>
            <strong className="metric-val">{completedCount}</strong>
            <span className="metric-sub">All milestones released</span>
          </div>
        </div>
      </section>

      {/* ── 2. Filter Tabs Navigation ── */}
      <div className="dashboard-tabs-bar">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`dash-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
        >
          <span>All Tasks ({bookings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('in_progress')}
          className={`dash-tab-btn ${activeTab === 'in_progress' ? 'active' : ''}`}
        >
          <span>In Progress ({activeCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('scheduled')}
          className={`dash-tab-btn ${activeTab === 'scheduled' ? 'active' : ''}`}
        >
          <span>Scheduled ({scheduledCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`dash-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
        >
          <span>Completed ({completedCount})</span>
        </button>

        {disputedCount > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('disputed')}
            className={`dash-tab-btn ${activeTab === 'disputed' ? 'active' : ''}`}
          >
            <span>In Dispute ({disputedCount})</span>
          </button>
        )}
      </div>

      {/* ── 3. Bookings Cards List ── */}
      <div className="dashboard-bookings-list">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((b) => {
            const isFunded = b.escrowStatus === 'funded_locked';
            const isCompleted = b.status === 'completed';
            const isDisputed = b.status === 'disputed';

            return (
              <div key={b.id} className="booking-card-glass">
                {/* Top Row: Provider Identity & Status Badge */}
                <div className="card-top-row">
                  <div className="booking-specialist-info">
                    <div 
                      className="booking-avatar"
                      style={{ backgroundColor: b.avatarColor || '#0284C7' }}
                    >
                      <span>{b.initials || b.providerName?.slice(0, 2).toUpperCase()}</span>
                    </div>

                    <div className="booking-specialist-details">
                      <div className="spec-name-row">
                        <strong className="spec-name">{b.providerName}</strong>
                        <span className="escrow-ref-pill">Ref: {b.escrowRef}</span>
                      </div>
                      <h3 className="booking-task-title">{b.serviceTitle}</h3>
                    </div>
                  </div>

                  {/* Escrow Status Pill */}
                  <div className="card-status-box">
                    <span className="booking-price-badge">{b.agreedPrice} {b.currency || 'ETB'}</span>
                    <span className={`escrow-status-pill status-${b.status}`}>
                      {isFunded && (
                        <>
                          <span className="live-status-dot" />
                          <span>Funded & Locked in Escrow</span>
                        </>
                      )}
                      {isCompleted && (
                        <>
                          <CheckCircle2 size={12} className="text-emerald" />
                          <span>Completed & Released</span>
                        </>
                      )}
                      {isDisputed && (
                        <>
                          <AlertTriangle size={12} className="text-rose" />
                          <span>Under Mediation</span>
                        </>
                      )}
                      {!isFunded && !isCompleted && !isDisputed && (
                        <>
                          <Clock size={12} />
                          <span>Scheduled</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Middle Row: Date, Location & Payment Metadata */}
                <div className="booking-details-strip">
                  <div className="detail-pill">
                    <Calendar size={13} className="text-cyan" />
                    <span>{b.scheduledDate}</span>
                  </div>

                  <div className="detail-pill">
                    <MapPin size={13} className="text-cyan" />
                    <span>{b.address}</span>
                  </div>

                  <div className="detail-pill">
                    <span className="payment-icon">💳</span>
                    <span>{b.paymentMethodLabel || 'Telebirr 📱'} ({b.paymentPhone || '+251 91 ...'})</span>
                  </div>
                </div>

                {/* Review if completed */}
                {b.clientReview && (
                  <div className="booking-review-feedback-box">
                    <div className="stars-row">
                      {[...Array(b.rating || 5)].map((_, i) => (
                        <Star key={i} size={12} fill="#F59E0B" color="#F59E0B" />
                      ))}
                    </div>
                    <p className="review-quote">"{b.clientReview}"</p>
                  </div>
                )}

                {/* Bottom Actions Row */}
                <div className="card-actions-row">
                  <div className="actions-left">
                    <button
                      type="button"
                      onClick={() => handleChatWithProvider(b)}
                      className="booking-action-btn chat-btn"
                    >
                      <MessageSquare size={14} />
                      <span>Message Specialist</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openReceiptModal(b)}
                      className="booking-action-btn receipt-btn"
                    >
                      <FileText size={14} />
                      <span>Escrow Receipt</span>
                    </button>
                  </div>

                  <div className="actions-right flex items-center gap-2">
                    {/* Rate & Review Button for Completed tasks */}
                    {isCompleted && (
                      <button
                        type="button"
                        onClick={() => setReviewBooking(b)}
                        className="booking-action-btn bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border"
                      >
                        <Star size={13} fill="#F59E0B" className="text-amber-500" />
                        <span>{b.clientReview ? 'Update Review' : 'Rate Specialist'}</span>
                      </button>
                    )}

                    {/* Approve & Release Button */}
                    {!isCompleted && !isDisputed && (
                      <button
                        type="button"
                        onClick={() => openReleaseModal(b)}
                        className="booking-action-btn release-btn"
                      >
                        <CheckCircle2 size={15} />
                        <span>Approve & Release Funds</span>
                      </button>
                    )}

                    {/* Dispute Button */}
                    {!isCompleted && !isDisputed && (
                      <button
                        type="button"
                        onClick={() => openDisputeModal(b)}
                        className="booking-action-btn dispute-btn"
                        title="Report issue or dispute"
                      >
                        <AlertTriangle size={13} />
                        <span>Dispute</span>
                      </button>
                    )}

                    {/* Report Safety Violation */}
                    <button
                      type="button"
                      onClick={() => setReportTarget({ id: b.providerId || b.id, name: b.providerName, entity_type: 'provider' })}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Report specialist or violation"
                    >
                      <ShieldAlert size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-bookings-box">
            <Calendar size={48} className="text-muted" />
            <h3 className="empty-title">No {activeTab.replace('_', ' ')} tasks found</h3>
            <p className="empty-desc">
              Book a verified professional in Addis Ababa with 100% Chapa Escrow protection.
            </p>
            <button
              type="button"
              onClick={() => navigate('/search')}
              className="empty-cta-btn"
            >
              Browse Specialists
            </button>
          </div>
        )}
      </div>

      {/* ── MODAL 1: APPROVE & RELEASE FUNDS ── */}
      {isReleaseModalOpen && releaseTargetBooking && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge" style={{ background: '#ECFDF5', color: '#059669' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="modal-title">Approve & Release Escrow Funds</h3>
                  <p className="modal-subtitle">Transfer payment to {releaseTargetBooking.providerName}</p>
                </div>
              </div>
              <button type="button" onClick={closeReleaseModal} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="release-amount-banner">
                <span>Total Payout:</span>
                <strong className="release-amount-val">{releaseTargetBooking.agreedPrice} ETB</strong>
              </div>

              <p className="release-note-text">
                By approving, you confirm that <strong>{releaseTargetBooking.providerName}</strong> has completed the task to your satisfaction. The funds will be transferred to their account immediately.
              </p>

              {/* Rating Picker */}
              <div className="rating-picker-box">
                <label className="picker-label">Rate your experience with this specialist:</label>
                <div className="stars-picker-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReleaseRating(star)}
                      className="star-click-btn"
                    >
                      <Star 
                        size={24} 
                        fill={star <= releaseRating ? '#F59E0B' : '#E2E8F0'} 
                        color={star <= releaseRating ? '#F59E0B' : '#CBD5E1'} 
                      />
                    </button>
                  ))}
                  <span className="rating-score-text">{releaseRating}.0 / 5.0</span>
                </div>
              </div>

              {/* Review Text */}
              <div className="review-input-group">
                <label className="picker-label">Leave a review for other clients:</label>
                <textarea
                  value={releaseReview}
                  onChange={(e) => setReleaseReview(e.target.value)}
                  placeholder="E.g. Arrived on time, fixed the leak quickly, and cleaned up afterwards!"
                  rows={3}
                  className="modal-textarea"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeReleaseModal} className="btn-cancel">
                  Cancel
                </button>
                <button type="button" onClick={handleConfirmRelease} className="btn-confirm-release">
                  <CheckCircle2 size={16} />
                  <span>Release {releaseTargetBooking.agreedPrice} ETB</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: DISPUTE & MEDIATION ── */}
      {isDisputeModalOpen && disputeTargetBooking && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="modal-title">Request Escrow Dispute Mediation</h3>
                  <p className="modal-subtitle">Funds remain locked safely in escrow</p>
                </div>
              </div>
              <button type="button" onClick={closeDisputeModal} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="dispute-warning-box">
                <AlertCircle size={18} className="text-rose flex-shrink-0" />
                <p className="warning-text">
                  Opening a dispute immediately freezes the <strong>{disputeTargetBooking.agreedPrice} ETB</strong> in Chapa Escrow. Our mediation team will contact you and the specialist.
                </p>
              </div>

              <div className="dispute-input-group">
                <label className="picker-label">Reason for Dispute:</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="modal-select"
                >
                  <option value="incomplete_work">Work was left incomplete</option>
                  <option value="poor_quality">Quality does not match agreement</option>
                  <option value="provider_no_show">Specialist did not show up</option>
                  <option value="pricing_dispute">Pricing disagreement / Extra charges</option>
                  <option value="damage_caused">Property damage occurred</option>
                </select>
              </div>

              <div className="dispute-input-group">
                <label className="picker-label">Explain the issue in detail:</label>
                <textarea
                  value={disputeNotes}
                  onChange={(e) => setDisputeNotes(e.target.value)}
                  placeholder="Describe what went wrong and what resolution you are seeking..."
                  rows={3}
                  className="modal-textarea"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeDisputeModal} className="btn-cancel">
                  Cancel
                </button>
                <button type="button" onClick={handleConfirmDispute} className="btn-confirm-dispute">
                  <AlertTriangle size={16} />
                  <span>Submit Dispute</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: DIGITAL ESCROW RECEIPT ── */}
      {isReceiptModalOpen && receiptTargetBooking && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="modal-title">Official Chapa Escrow Receipt</h3>
                  <p className="modal-subtitle">Verified digital transaction voucher</p>
                </div>
              </div>
              <button type="button" onClick={closeReceiptModal} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="receipt-paper-card">
                <div className="receipt-paper-header">
                  <div className="linc-logo-text">LINC 🇪🇹</div>
                  <span className="paper-ref font-mono">{receiptTargetBooking.escrowRef}</span>
                </div>

                <div className="paper-rows-list">
                  <div className="paper-row">
                    <span className="paper-label">Service:</span>
                    <span className="paper-val">{receiptTargetBooking.serviceTitle}</span>
                  </div>
                  <div className="paper-row">
                    <span className="paper-label">Specialist:</span>
                    <span className="paper-val">{receiptTargetBooking.providerName}</span>
                  </div>
                  <div className="paper-row">
                    <span className="paper-label">Client Location:</span>
                    <span className="paper-val">{receiptTargetBooking.address}</span>
                  </div>
                  <div className="paper-row">
                    <span className="paper-label">Payment Channel:</span>
                    <span className="paper-val">{receiptTargetBooking.paymentMethodLabel}</span>
                  </div>
                  <div className="paper-row">
                    <span className="paper-label">Escrow Status:</span>
                    <span className="paper-val font-bold text-emerald">
                      {receiptTargetBooking.escrowStatus === 'released' ? 'Released to Specialist ✓' : 'Secured in Escrow Vault 🔒'}
                    </span>
                  </div>
                  <div className="paper-divider" />
                  <div className="paper-row total">
                    <span className="paper-label">Amount:</span>
                    <span className="paper-val total-price">{receiptTargetBooking.agreedPrice} ETB</span>
                  </div>
                </div>

                <div className="paper-footer">
                  <ShieldCheck size={14} className="text-emerald" />
                  <span>Verified by Chapa Payment Gateway & LINC Escrow Engine</span>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => {
                    showToast('Receipt downloaded! 📄', 'success');
                    closeReceiptModal();
                  }} 
                  className="btn-download-receipt"
                >
                  <Download size={15} />
                  <span>Download PDF Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: REVIEW & RATINGS ── */}
      {reviewBooking && (
        <ReviewModal
          isOpen={!!reviewBooking}
          onClose={() => setReviewBooking(null)}
          booking={reviewBooking}
          onReviewSubmitted={() => loadBookings()}
        />
      )}

      {/* ── MODAL 5: SAFETY REPORT ── */}
      {reportTarget && (
        <ReportModal
          isOpen={!!reportTarget}
          onClose={() => setReportTarget(null)}
          entityType={reportTarget.entity_type || 'provider'}
          entityId={reportTarget.id}
          entityName={reportTarget.name}
        />
      )}
    </div>
  );
}
