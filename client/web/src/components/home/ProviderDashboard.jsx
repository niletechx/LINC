import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  DollarSign, 
  Eye, 
  Zap, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User, 
  Settings, 
  ArrowRight,
  ShieldCheck, 
  Lock, 
  Wallet, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Sparkles, 
  Camera, 
  Play, 
  Navigation, 
  FileText, 
  TrendingUp, 
  Star,
  X,
  Check,
  Send,
  AlertCircle
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { useProviderStore } from '../../stores/providerStore';
import { useChatStore } from '../../stores/chatStore';
import { requestService } from '../../services/requestService';
import { socketService } from '../../services/socketService';
import { MOCK_OPEN_REQUESTS } from '../../data/mockData';

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { setAppMode, showToast } = useAppStore();
  const { user } = useAuthStore();
  const { startConversationWithProvider } = useChatStore();

  const { 
    profile, 
    wallet, 
    jobs, 
    toggleAvailability, 
    acceptJob, 
    declineJob, 
    advanceJobStage,
    syncWithBackend,
    openQuoteModal,
    closeQuoteModal,
    isQuoteModalOpen,
    selectedLeadForQuote,
    submitQuoteToLead,
    submitJobCompletion
  } = useProviderStore();

  // Local state for market leads & real-time alerts
  const [marketLeads, setMarketLeads] = useState(MOCK_OPEN_REQUESTS);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);

  // Quote modal form state
  const [quoteAmount, setQuoteAmount] = useState('650');
  const [quoteEta, setQuoteEta] = useState('Within 45 mins');
  const [quoteProposal, setQuoteProposal] = useState('');
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  // In-place Completion modal state
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [activeProofJob, setActiveProofJob] = useState(null);
  const [completionSummary, setCompletionSummary] = useState('');
  const [partsReplaced, setPartsReplaced] = useState('');
  const [selectedProofTags, setSelectedProofTags] = useState(['Leak Sealed', 'Pressure Tested']);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  const proofTagOptions = [
    'Leak Sealed',
    'Pressure Tested',
    'New Parts Fitted',
    'Work Area Cleaned',
    'Client Inspected',
    '6-Month Guarantee Given',
  ];

  // Lifecycle: fetch live data & listen to socket notifications
  useEffect(() => {
    // 1. Sync provider profile with backend
    syncWithBackend();

    // 2. Fetch live open requests
    let isMounted = true;
    const fetchLeads = async () => {
      setIsLoadingLeads(true);
      try {
        const liveRequests = await requestService.getRequests();
        if (isMounted && liveRequests && liveRequests.length > 0) {
          setMarketLeads(liveRequests);
        }
      } catch {
        // Keeps initial fallback
      } finally {
        if (isMounted) setIsLoadingLeads(false);
      }
    };
    fetchLeads();

    // 3. Socket real-time listener for incoming booking notifications
    socketService.onNotification((notif) => {
      if (notif?.type === 'booking_request' || notif?.type === 'booking') {
        showToast(`🔔 New Client Request: ${notif.title || 'Urgent Service Required'}`, 'info');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [syncWithBackend, showToast]);

  const toggleMode = () => {
    setAppMode('client');
    showToast('Switched to Client Mode 👤', 'info');
  };

  const handleToggleAvailability = () => {
    toggleAvailability();
    showToast(
      profile.isAvailable ? 'Status set to Busy / Unavailable' : 'Status set to Available for Bookings! 🟢',
      profile.isAvailable ? 'info' : 'success'
    );
  };

  // Group jobs by stage
  const incomingJobs = jobs.filter((j) => j.stage === 'incoming');
  const activeOngoingJobs = jobs.filter((j) => ['accepted', 'en_route', 'in_progress', 'completion_submitted'].includes(j.stage));

  const displayName = user?.full_name || profile.name || 'Yonas Molla';

  // ── Open In-Place Quote Modal ──
  const handleOpenQuote = (lead) => {
    const defaultAmount = lead.budget ? lead.budget.replace(/[^0-9]/g, '') : '600';
    setQuoteAmount(defaultAmount || '600');
    setQuoteEta('Within 45 mins');
    setQuoteProposal(`Hello! I am a certified specialist in ${profile.tradeTitle || 'this trade'}. I carry all required diagnostic tools and can resolve this today.`);
    openQuoteModal(lead);
  };

  // ── Submit Quote ──
  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    if (!selectedLeadForQuote || !quoteAmount) return;

    setIsSubmittingQuote(true);
    try {
      await requestService.submitQuote(selectedLeadForQuote.id, {
        amount: Number(quoteAmount),
        eta: quoteEta,
        proposal: quoteProposal,
        leadTitle: selectedLeadForQuote.title,
      });

      submitQuoteToLead(selectedLeadForQuote.id, {
        amount: quoteAmount,
        eta: quoteEta,
        proposal: quoteProposal,
        leadTitle: selectedLeadForQuote.title,
      });

      showToast(`🎉 Quote of ${quoteAmount} ETB submitted to ${selectedLeadForQuote.title}!`, 'success');
    } catch {
      showToast('Failed to submit quote. Please try again.', 'error');
    } finally {
      setIsSubmittingQuote(false);
      closeQuoteModal();
    }
  };

  // ── In-Place Proof of Completion Handlers ──
  const handleOpenProofModal = (job) => {
    setActiveProofJob(job);
    setCompletionSummary(`Completed ${job.title} to full specifications. Verified zero leaks and pressure tested all connections.`);
    setPartsReplaced('Genuine brass shutoff valve, PPR 25mm connector (2x), high-temp sealant tape.');
    setIsProofModalOpen(true);
  };

  const toggleProofTag = (tag) => {
    setSelectedProofTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleConfirmCompletion = (e) => {
    e.preventDefault();
    if (!activeProofJob || !completionSummary.trim()) return;

    setIsSubmittingProof(true);
    setTimeout(() => {
      submitJobCompletion(activeProofJob.id, {
        summary: completionSummary,
        partsUsed: partsReplaced,
        proofPhotos: ['/assets/bg-city.jpg'],
      });
      setIsSubmittingProof(false);
      setIsProofModalOpen(false);
      setActiveProofJob(null);
      showToast(`🎉 Work submitted! Client has been pinged to inspect and release the ${activeProofJob.agreedPrice} ETB escrow payment.`, 'success');
    }, 600);
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

  return (
    <div className="provider-dashboard-view">
      {/* ── 1. Provider Hero Status Banner ── */}
      <section className="provider-dashboard-hero">
        <div className="provider-hero-top">
          <div>
            <div className="provider-hero-badge">
              <ShieldCheck size={14} />
              <span>VERIFIED ETHIOPIAN SPECIALIST • FAYDA ID VERIFIED</span>
            </div>
            <h1 className="provider-hero-title">
              Welcome back, {displayName}
            </h1>
            <p className="provider-hero-headline">
              {profile.headline}
            </p>
          </div>

          <div className="provider-availability-box">
            <span className="availability-label">Availability Status</span>
            <button
              type="button"
              onClick={handleToggleAvailability}
              className={`availability-toggle-btn ${profile.isAvailable ? 'available' : 'busy'}`}
            >
              <span className="status-dot" />
              <span>{profile.isAvailable ? 'Online & Available' : 'Currently Busy'}</span>
            </button>
          </div>
        </div>

        {/* Quick Mode Switch & Profile Setup Bar */}
        <div className="provider-hero-actions-bar">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={toggleMode}
              className="provider-action-btn primary"
            >
              <User size={14} />
              <span>Switch to Client Mode</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/provider/services')}
              className="provider-action-btn secondary"
            >
              <Settings size={14} />
              <span>Services, Rates & Sub-Cities</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/provider/showcase')}
              className="provider-action-btn secondary"
            >
              <Sparkles size={14} />
              <span>Portfolio & Reviews</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/provider/wallet')}
              className="provider-action-btn wallet-btn"
            >
              <Wallet size={14} className="text-cyan" />
              <span>Wallet: <strong>{wallet.availableBalance.toLocaleString()} ETB</strong></span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. Performance Metrics 4-Column Grid ── */}
      <section className="provider-metrics-grid">
        <div 
          onClick={() => navigate('/provider/wallet')}
          className="provider-metric-card cursor-pointer hover:border-cyan-400 transition-all"
        >
          <div className="p-metric-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#0284C7' }}>
            <DollarSign size={22} />
          </div>
          <div className="p-metric-data">
            <span className="p-metric-value">{wallet.availableBalance.toLocaleString()} ETB</span>
            <span className="p-metric-label">Available Balance (Withdraw)</span>
          </div>
        </div>

        <div 
          onClick={() => navigate('/provider/jobs')}
          className="provider-metric-card cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div className="p-metric-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
            <Briefcase size={22} />
          </div>
          <div className="p-metric-data">
            <span className="p-metric-value">{activeOngoingJobs.length} Active</span>
            <span className="p-metric-label">Ongoing Escrow Jobs</span>
          </div>
        </div>

        <div className="provider-metric-card">
          <div className="p-metric-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706' }}>
            <Zap size={22} />
          </div>
          <div className="p-metric-data">
            <span className="p-metric-value">{profile.acceptanceRate || 98}%</span>
            <span className="p-metric-label">Job Acceptance Rate</span>
          </div>
        </div>

        <div 
          onClick={() => navigate('/provider/showcase')}
          className="provider-metric-card cursor-pointer hover:border-purple-400 transition-all"
        >
          <div className="p-metric-icon" style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#7C3AED' }}>
            <Star size={22} />
          </div>
          <div className="p-metric-data">
            <span className="p-metric-value">4.9 ★</span>
            <span className="p-metric-label">{profile.reviewsCount || 58} Verified Reviews</span>
          </div>
        </div>
      </section>

      {/* ── 3. Incoming Direct Client Requests ── */}
      {incomingJobs.length > 0 && (
        <section style={{ marginTop: '4px' }}>
          <div className="section-title-row">
            <div className="flex items-center gap-2">
              <h2 className="section-heading text-rose-600">🚨 Incoming Urgent Client Requests</h2>
              <span className="badge-pulse-rose">{incomingJobs.length} new</span>
            </div>
            <button 
              type="button" 
              onClick={() => navigate('/provider/jobs')}
              className="view-all-link"
            >
              <span>Manage All Jobs</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="provider-jobs-list">
            {incomingJobs.map((job) => (
              <div key={job.id} className="provider-job-card incoming-highlight">
                <div className="job-card-header">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="job-title">{job.title}</h3>
                      {job.urgency === 'urgent' && (
                        <span className="urgent-badge">⚡ URGENT</span>
                      )}
                    </div>
                    <p className="job-client">
                      Client: <strong>{job.clientName}</strong> • {job.address}
                    </p>
                  </div>
                  <div className="job-price-badge">
                    <span>{job.agreedPrice} {job.currency || 'ETB'}</span>
                    <span className="escrow-pill">🛡️ Escrow Funded</span>
                  </div>
                </div>

                {job.notes && (
                  <p className="text-slate-600 text-xs my-2 italic">
                    "{job.notes}"
                  </p>
                )}

                <div className="job-card-meta">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} />
                    <span>Requested {job.requestedAt}</span>
                  </span>
                  <span>•</span>
                  <span>Scheduled: <strong>{job.scheduledTime}</strong></span>
                </div>

                <div className="job-card-actions">
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
                      navigate('/provider/jobs');
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <CheckCircle2 size={14} />
                    <span>Accept & Lock Escrow ({job.agreedPrice} ETB)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 4. Active Ongoing Tasks Tracker ── */}
      <section style={{ marginTop: '4px' }}>
        <div className="section-title-row">
          <div className="flex items-center gap-2">
            <h2 className="section-heading">Active Ongoing Tasks ({activeOngoingJobs.length})</h2>
            <span className="text-xs text-slate-500">• 100% Chapa Escrow Secured</span>
          </div>
          <button 
            type="button" 
            onClick={() => navigate('/provider/jobs')}
            className="view-all-link"
          >
            <span>View Full Jobs Queue</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {activeOngoingJobs.length > 0 ? (
          <div className="provider-jobs-list">
            {activeOngoingJobs.map((job) => {
              const isEnRoute = job.stage === 'en_route';
              const isInProgress = job.stage === 'in_progress';
              const isSubmitted = job.stage === 'completion_submitted';

              return (
                <div key={job.id} className="provider-job-card active-job-card">
                  <div className="job-card-header">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="job-title">{job.title}</h3>
                        <span className={`p-status-pill stage-${job.stage}`}>
                          {isEnRoute && '🚗 En Route'}
                          {isInProgress && '⚙️ In Progress'}
                          {isSubmitted && '⏱️ Pending Client Release'}
                          {!isEnRoute && !isInProgress && !isSubmitted && '✓ Accepted'}
                        </span>
                      </div>
                      <p className="job-client">
                        Client: <strong>{job.clientName}</strong> • {job.address}
                      </p>
                    </div>

                    <div className="job-price-badge">
                      <span>{job.agreedPrice} {job.currency || 'ETB'}</span>
                      <span className="escrow-pill">🛡️ Escrow Locked</span>
                    </div>
                  </div>

                  {/* Stage Advance Actions */}
                  <div className="job-card-actions mt-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${job.clientPhone}`}
                        className="btn btn-outline btn-sm"
                      >
                        <Phone size={13} />
                        <span>Call Client</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleStartChatWithClient(job)}
                        className="btn btn-outline btn-sm"
                      >
                        <MessageSquare size={13} />
                        <span>Chat</span>
                      </button>
                    </div>

                    <div>
                      {job.stage === 'accepted' && (
                        <button
                          type="button"
                          onClick={() => {
                            advanceJobStage(job.id, 'en_route');
                            showToast(`🚗 En route to ${job.clientSubCity}!`, 'success');
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          <Navigation size={14} />
                          <span>Mark En Route 🚗</span>
                        </button>
                      )}

                      {isEnRoute && (
                        <button
                          type="button"
                          onClick={() => {
                            advanceJobStage(job.id, 'in_progress');
                            showToast(`⚙️ Started work for ${job.clientName}!`, 'info');
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          <Play size={14} />
                          <span>Arrived & Start Work ⚙️</span>
                        </button>
                      )}

                      {isInProgress && (
                        <button
                          type="button"
                          onClick={() => handleOpenProofModal(job)}
                          className="btn btn-primary btn-sm animate-pulse"
                        >
                          <Camera size={14} />
                          <span>Submit Completion & Proof 📸</span>
                        </button>
                      )}

                      {isSubmitted && (
                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 size={14} />
                          <span>Awaiting client inspection & release</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 bg-white/60 border border-slate-200 rounded-xl text-center text-slate-500">
            <p>No active jobs in progress. Check new leads below or browse the open marketplace.</p>
          </div>
        )}
      </section>

      {/* ── 5. Market Leads Radar ── */}
      <section style={{ marginTop: '8px' }}>
        <div className="section-title-row">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-cyan-600" />
            <h2 className="section-heading">Open Job Requests in Addis Ababa (Market Leads)</h2>
          </div>
          <button 
            type="button" 
            onClick={() => navigate('/requests')}
            className="view-all-link"
          >
            <span>View All Leads</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {marketLeads.slice(0, 4).map((lead, i) => (
            <div key={lead.id || i} className="bg-white/80 border border-slate-200/80 p-4 rounded-xl shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded-md">
                    {lead.category || 'Specialist Need'}
                  </span>
                  <strong className="text-slate-900 font-extrabold text-sm">{lead.budget || 'Custom Quote'}</strong>
                </div>

                <h4 className="font-bold text-slate-800 text-sm mb-1">{lead.title}</h4>
                <p className="text-slate-600 text-xs mb-3 line-clamp-2">{lead.description}</p>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-cyan-600" />
                  <span>{lead.location || 'Addis Ababa'}</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleOpenQuote(lead)}
                  className="btn btn-primary btn-sm text-xs py-1 px-3"
                >
                  <Zap size={12} />
                  <span>Submit Quote ⚡</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── IN-PLACE MODAL: SUBMIT QUOTE ON MARKET LEAD ──                     */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isQuoteModalOpen && selectedLeadForQuote && (
        <div className="modal-backdrop" onClick={closeQuoteModal}>
          <div className="modal-card modal-card-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="modal-title">Submit Quote / Bid</h3>
                  <p className="modal-subtitle">{selectedLeadForQuote.title}</p>
                </div>
              </div>
              <button type="button" onClick={closeQuoteModal} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitQuote}>
              <div className="modal-body">
                {/* Lead Summary Pill */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-800">Client's Budget:</span>{' '}
                    <span className="font-bold text-emerald-600">{selectedLeadForQuote.budget || 'Open for quotes'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin size={11} className="text-cyan-600" />
                    <span>{selectedLeadForQuote.location}</span>
                  </div>
                </div>

                {/* Proposed Amount */}
                <div className="form-group">
                  <label className="form-label font-bold text-xs">
                    Your Proposed Price (ETB) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      value={quoteAmount}
                      onChange={(e) => setQuoteAmount(e.target.value)}
                      placeholder="e.g. 650"
                      className="form-input text-base font-extrabold"
                      required
                    />
                    <span className="absolute right-3 text-xs font-bold text-slate-400 pointer-events-none">
                      ETB (Escrow Locked)
                    </span>
                  </div>
                  <div className="flex gap-2 mt-1.5">
                    {['450', '650', '950', '1500'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setQuoteAmount(preset)}
                        className="px-2 py-0.5 text-xs bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 rounded border border-slate-200"
                      >
                        {preset} ETB
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimated Arrival / Duration */}
                <div className="form-group">
                  <label className="form-label font-bold text-xs">Estimated Arrival / ETA</label>
                  <input
                    type="text"
                    value={quoteEta}
                    onChange={(e) => setQuoteEta(e.target.value)}
                    placeholder="e.g. Within 45 mins / Today 3:00 PM"
                    className="form-input text-xs"
                    required
                  />
                </div>

                {/* Custom Proposal Message */}
                <div className="form-group">
                  <label className="form-label font-bold text-xs">Introductory Message to Client</label>
                  <textarea
                    rows={3}
                    value={quoteProposal}
                    onChange={(e) => setQuoteProposal(e.target.value)}
                    placeholder="Describe how you will solve their problem, what tools you have, and your warranty..."
                    className="form-input text-xs"
                  />
                </div>

                {/* Chapa Escrow Safety Notice */}
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    When client accepts, their <strong>{quoteAmount || 0} ETB</strong> is locked in Chapa Escrow before you travel. 100% payout guaranteed upon work completion.
                  </span>
                </div>
              </div>

              <div className="modal-footer-sticky">
                <button type="button" onClick={closeQuoteModal} className="btn btn-outline btn-sm">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingQuote || !quoteAmount}
                  className="btn btn-primary btn-sm flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>{isSubmittingQuote ? 'Submitting...' : 'Send Official Quote ⚡'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── IN-PLACE MODAL: SUBMIT PROOF OF COMPLETION ──                      */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {isProofModalOpen && activeProofJob && (
        <div className="modal-backdrop" onClick={() => setIsProofModalOpen(false)}>
          <div className="modal-card modal-card-md animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge" style={{ background: '#ECFDF5', color: '#059669' }}>
                  <Camera size={18} />
                </div>
                <div>
                  <h3 className="modal-title">Submit Proof of Completion</h3>
                  <p className="modal-subtitle">{activeProofJob.title} • {activeProofJob.clientName}</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsProofModalOpen(false)} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmCompletion}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label font-bold text-xs">
                    Summary of Work Performed <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={completionSummary}
                    onChange={(e) => setCompletionSummary(e.target.value)}
                    placeholder="Describe the fix or service provided in detail..."
                    className="form-input text-xs"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label font-bold text-xs">Parts or Materials Replaced (If Any)</label>
                  <input
                    type="text"
                    value={partsReplaced}
                    onChange={(e) => setPartsReplaced(e.target.value)}
                    placeholder="e.g. PPR valve 25mm, brass connector, Teflon seal"
                    className="form-input text-xs"
                  />
                </div>

                {/* Proof Checklist Chips */}
                <div className="form-group">
                  <label className="form-label font-bold text-xs">Quality & Guarantee Verification</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {proofTagOptions.map((tag) => {
                      const isSelected = selectedProofTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleProofTag(tag)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 ${
                            isSelected
                              ? 'bg-emerald-500 text-white border-emerald-600'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && <Check size={11} />}
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Escrow Release Notice */}
                <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-xs text-cyan-900 flex items-start gap-2">
                  <ShieldCheck size={16} className="text-cyan-700 flex-shrink-0 mt-0.5" />
                  <span>
                    Submitting opens the 72-hour inspection window. Client will be prompted to release your <strong>{activeProofJob.agreedPrice} ETB</strong> payment directly to your wallet.
                  </span>
                </div>
              </div>

              <div className="modal-footer-sticky">
                <button type="button" onClick={() => setIsProofModalOpen(false)} className="btn btn-outline btn-sm">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingProof || !completionSummary.trim()}
                  className="btn btn-primary btn-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 size={13} />
                  <span>{isSubmittingProof ? 'Submitting...' : `Submit & Request ${activeProofJob.agreedPrice} ETB`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
