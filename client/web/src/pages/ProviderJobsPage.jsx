import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Navigation, 
  Camera, 
  Upload, 
  Check, 
  ChevronRight, 
  FileText, 
  Sparkles, 
  Search, 
  Filter,
  X,
  Play,
  RotateCcw,
  Download,
  AlertCircle
} from 'lucide-react';
import { useProviderStore } from '../stores/providerStore';
import { useChatStore } from '../stores/chatStore';
import { useAppStore } from '../stores/appStore';
import { bookingService } from '../services/bookingService';

export default function ProviderJobsPage() {
  const navigate = useNavigate();
  const { 
    jobs, 
    profile, 
    acceptJob, 
    declineJob, 
    advanceJobStage, 
    openCompletionModal, 
    closeCompletionModal, 
    isCompletionModalOpen, 
    selectedJobForModal, 
    submitJobCompletion,
    isReceiptModalOpen,
    activeReceiptTx,
    openReceiptModal,
    closeReceiptModal
  } = useProviderStore();

  const { startConversationWithProvider } = useChatStore();
  const { showToast } = useAppStore();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'incoming' | 'active' | 'pending_approval' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');

  // Completion modal form state
  const [completionSummary, setCompletionSummary] = useState('');
  const [partsReplaced, setPartsReplaced] = useState('');
  const [selectedProofTags, setSelectedProofTags] = useState(['Leak Sealed', 'Pressure Tested']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const proofTagOptions = [
    'Leak Sealed',
    'Pressure Tested',
    'New Parts Fitted',
    'Work Area Cleaned',
    'Client Inspected',
    '6-Month Guarantee Given',
  ];

  const toggleProofTag = (tag) => {
    setSelectedProofTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleStartChatWithClient = (job) => {
    startConversationWithProvider({
      id: `client-${job.id}`,
      name: job.clientName,
      headline: `Client • ${job.title}`,
      avatarColor: '#0284C7',
      initials: job.clientName.slice(0, 2).toUpperCase(),
    });
    navigate(`/dm/client-${job.id}`);
  };

  const handleStageAdvance = (job, targetStage) => {
    advanceJobStage(job.id, targetStage);
    if (targetStage === 'en_route') {
      showToast(`🚗 En route to ${job.clientSubCity}! Client notified of your arrival in ~${job.etaMinutes || 15} mins.`, 'success');
    } else if (targetStage === 'in_progress') {
      showToast(`⏱️ Job started for ${job.clientName}! Escrow remains safely locked.`, 'info');
    }
  };

  const handleOpenProofModal = (job) => {
    setCompletionSummary(
      `Completed ${job.title} to full specifications. Tested pressure and verified all fittings are completely dry and sealed.`
    );
    setPartsReplaced('Genuine brass shutoff valve, PPR 25mm connector (2x), high-temp sealant tape.');
    openCompletionModal(job);
  };

  const handleConfirmCompletion = (e) => {
    e.preventDefault();
    if (!selectedJobForModal || !completionSummary.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      submitJobCompletion(selectedJobForModal.id, {
        summary: completionSummary,
        partsUsed: partsReplaced,
        proofPhotos: ['/assets/bg-city.jpg'],
      });
      setIsSubmitting(false);
      showToast(`🎉 Work submitted! ${selectedJobForModal.clientName} has been pinged to inspect and release the ${selectedJobForModal.agreedPrice} ETB escrow payment.`, 'success');
    }, 600);
  };

  const handleViewReceipt = (job) => {
    openReceiptModal({
      id: `tx-${job.id}`,
      type: 'escrow_payout',
      title: `Escrow Payout: ${job.title}`,
      clientName: job.clientName,
      amount: job.agreedPrice,
      currency: job.currency || 'ETB',
      date: 'Aug 2026',
      time: 'Verified Settlement',
      status: 'completed',
      ref: job.escrowRef || `PAY-ESC-${Date.now()}`,
      gateway: 'Chapa Escrow Vault (Ethiopia)',
      icon: '🛡️',
    });
  };

  // Filtered list
  const filteredJobs = jobs.filter((j) => {
    if (activeFilter === 'incoming' && j.stage !== 'incoming') return false;
    if (activeFilter === 'active' && j.stage !== 'accepted' && j.stage !== 'en_route' && j.stage !== 'in_progress') return false;
    if (activeFilter === 'pending_approval' && j.stage !== 'completion_submitted') return false;
    if (activeFilter === 'completed' && j.stage !== 'completed') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        j.title.toLowerCase().includes(q) ||
        j.clientName.toLowerCase().includes(q) ||
        j.clientSubCity?.toLowerCase().includes(q) ||
        j.address?.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const totalEscrowLocked = jobs
    .filter((j) => j.stage !== 'completed')
    .reduce((acc, j) => acc + (j.agreedPrice || 0), 0);

  const incomingCount = jobs.filter((j) => j.stage === 'incoming').length;
  const activeCount = jobs.filter((j) => ['accepted', 'en_route', 'in_progress'].includes(j.stage)).length;
  const pendingCount = jobs.filter((j) => j.stage === 'completion_submitted').length;
  const completedCount = jobs.filter((j) => j.stage === 'completed').length;

  return (
    <div className="provider-jobs-page-wrapper">
      {/* ── 1. Page Header & Escrow Summary ── */}
      <header className="provider-page-header">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="provider-page-title">Active Job Orders & Stage Progression</h1>
            <span className="escrow-vault-chip">
              <Lock size={12} className="text-emerald-600" />
              <span>Chapa Escrow Protected</span>
            </span>
          </div>
          <p className="provider-page-sub">
            Track client locations across Addis Ababa, log live work milestones, and submit verifiable completion proofs for instant escrow release.
          </p>
        </div>

        <div className="header-stat-box">
          <span className="stat-sub">Escrow in Pipeline</span>
          <strong className="stat-val text-emerald-700">{totalEscrowLocked.toLocaleString()} ETB</strong>
        </div>
      </header>

      {/* ── 2. Filter Tabs Strip ── */}
      <div className="provider-filter-tabs-bar">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`p-tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
        >
          <span>All Orders ({jobs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('incoming')}
          className={`p-tab-btn ${activeFilter === 'incoming' ? 'active' : ''} ${incomingCount > 0 ? 'highlight-pill' : ''}`}
        >
          <span>🚨 Incoming Requests ({incomingCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('active')}
          className={`p-tab-btn ${activeFilter === 'active' ? 'active' : ''}`}
        >
          <span>⚡ En Route & In Progress ({activeCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('pending_approval')}
          className={`p-tab-btn ${activeFilter === 'pending_approval' ? 'active' : ''}`}
        >
          <span>⏱️ Pending Client Release ({pendingCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('completed')}
          className={`p-tab-btn ${activeFilter === 'completed' ? 'active' : ''}`}
        >
          <span>✓ Completed & Paid ({completedCount})</span>
        </button>
      </div>

      {/* ── 3. Search & Quick Info Bar ── */}
      <div className="provider-search-card">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by task title, client name, or sub-city..."
          className="search-input"
        />
        {searchQuery && (
          <button type="button" onClick={() => setSearchQuery('')} className="clear-btn">
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── 4. Jobs Stack ── */}
      <div className="provider-jobs-stack">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => {
            const isIncoming = job.stage === 'incoming';
            const isAccepted = job.stage === 'accepted';
            const isEnRoute = job.stage === 'en_route';
            const isInProgress = job.stage === 'in_progress';
            const isSubmitted = job.stage === 'completion_submitted';
            const isCompleted = job.stage === 'completed';
            const isDisputed = job.escrowStatus === 'disputed';

            // Stage index for progress stepper (0 to 5)
            let stageIndex = 0;
            if (isAccepted) stageIndex = 1;
            if (isEnRoute) stageIndex = 2;
            if (isInProgress) stageIndex = 3;
            if (isSubmitted) stageIndex = 4;
            if (isCompleted) stageIndex = 5;

            return (
              <div 
                key={job.id} 
                className={`provider-job-card-glass ${isIncoming ? 'incoming-glow' : ''} ${isCompleted ? 'completed-card' : ''}`}
              >
                {/* Header Row */}
                <div className="p-card-top-row">
                  <div className="p-card-title-group">
                    <div className="title-badges-line">
                      <h3 className="job-order-title">{job.title}</h3>
                      {job.urgency === 'urgent' && (
                        <span className="urgent-tag">
                          <span>⚡ URGENT</span>
                        </span>
                      )}
                      <span className="escrow-ref-badge">
                        <Lock size={11} className="text-emerald-600" />
                        <span>{job.escrowRef}</span>
                      </span>
                    </div>

                    <div className="job-client-details-row">
                      <span className="client-name">Client: <strong>{job.clientName}</strong></span>
                      <span className="divider">•</span>
                      <span className="client-subcity">📍 {job.clientSubCity}</span>
                      <span className="divider">•</span>
                      <span className="job-time">⏱️ {job.scheduledTime}</span>
                    </div>
                  </div>

                  {/* Price Tag & Escrow Status */}
                  <div className="p-card-price-box">
                    <span className="price-big">{job.agreedPrice} {job.currency || 'ETB'}</span>
                    <span className={`p-status-pill stage-${job.stage}`}>
                      {isIncoming && '🚨 New Request'}
                      {isAccepted && '✓ Accepted'}
                      {isEnRoute && '🚗 En Route'}
                      {isInProgress && '⚙️ In Progress'}
                      {isSubmitted && '⏱️ Awaiting Client Release'}
                      {isCompleted && '✓ Escrow Released'}
                      {isDisputed && '⚠️ Under Admin Review'}
                    </span>
                  </div>
                </div>

                {/* Address & Client Notes Strip */}
                <div className="p-card-details-strip">
                  <div className="detail-item">
                    <MapPin size={14} className="text-cyan-600 flex-shrink-0" />
                    <span>{job.address}</span>
                  </div>

                  {job.notes && (
                    <div className="detail-item notes">
                      <span className="notes-icon">📝</span>
                      <span>"{job.notes}"</span>
                    </div>
                  )}
                </div>

                {/* ── 5-Stage Live Progression Stepper ── */}
                <div className="p-job-stepper-container">
                  <div className="stepper-track">
                    {/* Step 1: Order Placed */}
                    <div className={`step-node ${stageIndex >= 0 ? 'completed' : ''}`}>
                      <div className="node-circle">{stageIndex > 0 ? <Check size={12} /> : '1'}</div>
                      <span className="node-label">Booking Received</span>
                    </div>
                    <div className={`step-line ${stageIndex >= 1 ? 'active' : ''}`} />

                    {/* Step 2: Accepted / En Route */}
                    <div className={`step-node ${stageIndex >= 2 ? 'completed' : stageIndex === 1 ? 'current' : ''}`}>
                      <div className="node-circle">{stageIndex > 2 ? <Check size={12} /> : '2'}</div>
                      <span className="node-label">En Route</span>
                    </div>
                    <div className={`step-line ${stageIndex >= 3 ? 'active' : ''}`} />

                    {/* Step 3: In Progress */}
                    <div className={`step-node ${stageIndex >= 3 ? 'completed' : stageIndex === 2 ? 'current' : ''}`}>
                      <div className="node-circle">{stageIndex > 3 ? <Check size={12} /> : '3'}</div>
                      <span className="node-label">Work In Progress</span>
                    </div>
                    <div className={`step-line ${stageIndex >= 4 ? 'active' : ''}`} />

                    {/* Step 4: Proof Submitted */}
                    <div className={`step-node ${stageIndex >= 4 ? 'completed' : stageIndex === 3 ? 'current' : ''}`}>
                      <div className="node-circle">{stageIndex > 4 ? <Check size={12} /> : '4'}</div>
                      <span className="node-label">Completion Proof</span>
                    </div>
                    <div className={`step-line ${stageIndex >= 5 ? 'active' : ''}`} />

                    {/* Step 5: Escrow Released */}
                    <div className={`step-node ${stageIndex === 5 ? 'completed' : ''}`}>
                      <div className="node-circle">{stageIndex === 5 ? <Check size={12} /> : '5'}</div>
                      <span className="node-label">Escrow Payout</span>
                    </div>
                  </div>
                </div>

                {/* ── 72-Hour Auto-Release Countdown Banner (for submitted stage) ── */}
                {isSubmitted && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2 mt-1">
                    <Clock size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>72-Hour Inspection Window Active:</strong> Client has been notified to verify work. If no dispute is raised, Chapa Escrow automatically releases <strong>{job.agreedPrice} ETB</strong> to your wallet.
                    </div>
                  </div>
                )}

                {/* ── Dispute Alert (if disputed) ── */}
                {isDisputed && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2 mt-1">
                    <AlertTriangle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Dispute Raised by Client:</strong> Escrow is temporarily on hold. LINC Trust & Safety team is reviewing evidence and will resolve within 24 hours.
                    </div>
                  </div>
                )}

                {/* ── Completion Details if submitted ── */}
                {job.completionDetails && (
                  <div className="completion-details-box">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      <strong className="text-emerald-700 text-sm">Work Completion Verified & Submitted:</strong>
                    </div>
                    <p className="text-slate-700 text-sm">{job.completionDetails.summary}</p>
                    {job.completionDetails.partsUsed && (
                      <p className="text-slate-500 text-xs mt-1">
                        <strong>Parts / Materials:</strong> {job.completionDetails.partsUsed}
                      </p>
                    )}
                  </div>
                )}

                {/* ── Client Review if completed ── */}
                {job.clientReview && (
                  <div className="p-client-review-box">
                    <span className="text-amber-500 font-bold">★★★★★</span>
                    <p className="review-quote">"{job.clientReview}"</p>
                  </div>
                )}

                {/* ── Action Buttons Footer ── */}
                <div className="p-card-actions-footer">
                  {/* Left Group: Contact & Chat */}
                  <div className="footer-left-actions">
                    <a
                      href={`tel:${job.clientPhone}`}
                      className="p-action-btn-outline"
                      title="Call Client"
                    >
                      <Phone size={14} />
                      <span>{job.clientPhone}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleStartChatWithClient(job)}
                      className="p-action-btn-outline"
                    >
                      <MessageSquare size={14} />
                      <span>Chat Directly</span>
                    </button>
                  </div>

                  {/* Right Group: Stage Specific Actions */}
                  <div className="footer-right-actions">
                    {/* INCOMING STAGE */}
                    {isIncoming && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            declineJob(job.id);
                            showToast('Request declined', 'info');
                          }}
                          className="btn btn-outline btn-sm"
                        >
                          <XCircle size={14} />
                          <span>Decline</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            acceptJob(job.id);
                            showToast(`Accepted booking from ${job.clientName}! Escrow funded in vault.`, 'success');
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          <CheckCircle2 size={14} />
                          <span>Accept & Lock Escrow ({job.agreedPrice} ETB)</span>
                        </button>
                      </>
                    )}

                    {/* ACCEPTED STAGE */}
                    {isAccepted && (
                      <button
                        type="button"
                        onClick={() => handleStageAdvance(job, 'en_route')}
                        className="btn btn-primary btn-sm"
                      >
                        <Navigation size={14} />
                        <span>Start Travel (Mark En Route 🚗)</span>
                      </button>
                    )}

                    {/* EN ROUTE STAGE */}
                    {isEnRoute && (
                      <button
                        type="button"
                        onClick={() => handleStageAdvance(job, 'in_progress')}
                        className="btn btn-primary btn-sm"
                      >
                        <Play size={14} />
                        <span>Arrived at Location (Start Work ⚙️)</span>
                      </button>
                    )}

                    {/* IN PROGRESS STAGE */}
                    {isInProgress && (
                      <button
                        type="button"
                        onClick={() => handleOpenProofModal(job)}
                        className="btn btn-primary btn-sm animate-pulse"
                      >
                        <Camera size={14} />
                        <span>Submit Work Completion & Proof 📸</span>
                      </button>
                    )}

                    {/* SUBMITTED STAGE */}
                    {isSubmitted && (
                      <button
                        type="button"
                        onClick={() => showToast(`Pinged ${job.clientName} to review and release payment.`, 'info')}
                        className="btn btn-outline btn-sm"
                      >
                        <Sparkles size={14} />
                        <span>Remind Client to Release</span>
                      </button>
                    )}

                    {/* COMPLETED STAGE */}
                    {isCompleted && (
                      <button
                        type="button"
                        onClick={() => handleViewReceipt(job)}
                        className="btn btn-outline btn-sm text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                      >
                        <FileText size={14} />
                        <span>Escrow Receipt ({job.agreedPrice} ETB)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-jobs-box">
            <Briefcase size={44} className="text-slate-400" />
            <h3 className="empty-title">No orders matching "{activeFilter}"</h3>
            <p className="empty-sub">
              Browse public customer requests on the marketplace to submit proposals and secure new jobs.
            </p>
            <button
              type="button"
              onClick={() => navigate('/requests')}
              className="btn btn-primary mt-2"
            >
              Browse Job Market Leads 🌍
            </button>
          </div>
        )}
      </div>

      {/* ── MODAL: WORK COMPLETION & PROOF SUBMISSION ── */}
      {isCompletionModalOpen && selectedJobForModal && (
        <div className="modal-backdrop" onClick={closeCompletionModal}>
          <div className="modal-card modal-card-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge" style={{ background: '#ECFDF5', color: '#059669' }}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="modal-title">Submit Completion & Request Payout</h3>
                  <p className="modal-subtitle">For: {selectedJobForModal.title}</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={closeCompletionModal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmCompletion} className="modal-body">
              {/* Escrow Payout Amount Banner */}
              <div className="release-amount-banner">
                <span>Pending Escrow Release:</span>
                <strong className="release-amount-val">{selectedJobForModal.agreedPrice} ETB</strong>
              </div>

              {/* Work Summary Description */}
              <div className="form-group">
                <label className="form-label">Summary of Work Completed</label>
                <textarea
                  value={completionSummary}
                  onChange={(e) => setCompletionSummary(e.target.value)}
                  placeholder="Describe the diagnosis, repairs performed, and testing results..."
                  rows={3}
                  className="form-input form-textarea"
                  required
                />
              </div>

              {/* Parts & Materials Used */}
              <div className="form-group">
                <label className="form-label">Parts & Materials Itemization (Optional)</label>
                <input
                  type="text"
                  value={partsReplaced}
                  onChange={(e) => setPartsReplaced(e.target.value)}
                  placeholder="e.g. PPR valve 25mm, Teflon tape, rubber gasket"
                  className="form-input"
                />
              </div>

              {/* Verified Quality Check Chips */}
              <div className="form-group">
                <label className="form-label">Quality Checklist & Guarantees</label>
                <div className="flex flex-wrap gap-2">
                  {proofTagOptions.map((tag) => {
                    const isSelected = selectedProofTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleProofTag(tag)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photo Evidence Preview */}
              <div className="form-group">
                <label className="form-label">Photo Evidence / Proof (Verified in Addis Ababa)</label>
                <div className="proof-upload-box">
                  <Camera size={24} className="text-cyan-600 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">1 Completion photo attached</span>
                  <span className="text-[11px] text-slate-400">Timestamped & GPS tagged in {selectedJobForModal.clientSubCity}</span>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeCompletionModal} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? (
                    'Submitting Proof...'
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Request Escrow Release ({selectedJobForModal.agreedPrice} ETB)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: DIGITAL ETHIOPIAN TRANSACTION VOUCHER ── */}
      {isReceiptModalOpen && activeReceiptTx && (
        <div className="modal-backdrop" onClick={closeReceiptModal}>
          <div className="modal-card modal-card-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge" style={{ background: '#ECFDF5', color: '#059669' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="modal-title">Official Transaction Voucher</h3>
                  <p className="modal-subtitle">Verified Electronic Settlement</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={closeReceiptModal}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="receipt-paper-card">
                <div className="receipt-paper-header">
                  <div className="linc-logo-text">LINC SPECIALIST PAYOUT 🇪🇹</div>
                  <span className="paper-ref font-mono">{activeReceiptTx.ref}</span>
                </div>

                <div className="paper-rows-list">
                  <div className="paper-row">
                    <span className="paper-label">Transaction Type:</span>
                    <span className="paper-val">{activeReceiptTx.title}</span>
                  </div>
                  <div className="paper-row">
                    <span className="paper-label">Channel / Gateway:</span>
                    <span className="paper-val">{activeReceiptTx.gateway || 'EthSwitch'}</span>
                  </div>
                  <div className="paper-row">
                    <span className="paper-label">Destination / Origin:</span>
                    <span className="paper-val">{activeReceiptTx.destination || activeReceiptTx.clientName}</span>
                  </div>
                  <div className="paper-row">
                    <span className="paper-label">Date & Time:</span>
                    <span className="paper-val">{activeReceiptTx.date} {activeReceiptTx.time}</span>
                  </div>
                  <div className="paper-row">
                    <span className="paper-label">Settlement Status:</span>
                    <span className="paper-val font-bold text-emerald-600">Instant Settlement Completed ✓</span>
                  </div>
                  <div className="paper-divider" />
                  <div className="paper-row total">
                    <span className="paper-label">Net Amount:</span>
                    <span className="paper-val total-price">{activeReceiptTx.amount.toLocaleString()} ETB</span>
                  </div>
                </div>

                <div className="paper-footer">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>National Bank of Ethiopia & Chapa Escrow Compliance Verified</span>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    showToast('Voucher downloaded to device! 📄', 'success');
                    closeReceiptModal();
                  }}
                  className="btn-download-receipt"
                >
                  <Download size={14} />
                  <span>Download PDF Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
