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
    <div className="min-h-screen bg-slate-50/50 pb-24 text-slate-900">
      
      {/* ── 1. Provider Hero Status Banner ── */}
      <section className="bg-white border-b border-slate-200/80 pt-8 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-2">
                <ShieldCheck size={13} className="text-teal-600" />
                <span>FAYDA ID VERIFIED SPECIALIST • ADDIS ABABA</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {displayName}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {profile.headline}
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-1.5">
              <span className="text-xs font-bold text-slate-400">Live Status</span>
              <button
                type="button"
                onClick={handleToggleAvailability}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-xs ${
                  profile.isAvailable
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${profile.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>{profile.isAvailable ? 'Online & Ready for Bookings' : 'Currently Busy / Offline'}</span>
              </button>
            </div>
          </div>

          {/* Quick Actions & Escrow Balance Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={toggleMode}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <User size={13} />
                <span>Switch to Client Mode</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/provider/services')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <Settings size={13} />
                <span>Services & Rates</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/provider/showcase')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <Sparkles size={13} className="text-amber-500" />
                <span>Portfolio & Reviews</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate('/provider/wallet')}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 text-xs font-bold transition-colors cursor-pointer"
            >
              <Wallet size={13} className="text-teal-700" />
              <span>Wallet: <strong>{wallet.availableBalance.toLocaleString()} ETB</strong></span>
            </button>
          </div>

        </div>
      </section>

      {/* ── 2. Ramp-Style Performance Metrics 4-Column Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div 
            onClick={() => navigate('/provider/wallet')}
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1 hover:border-teal-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Available to Withdraw</span>
              <DollarSign size={15} className="text-teal-600" />
            </div>
            <div className="text-xl font-black text-slate-900">{wallet.availableBalance.toLocaleString()} ETB</div>
            <div className="text-[11px] font-semibold text-emerald-600">
              Instant CBE / Telebirr Payout
            </div>
          </div>

          <div 
            onClick={() => navigate('/provider/jobs')}
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1 hover:border-teal-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Active Escrow Tasks</span>
              <Briefcase size={15} className="text-amber-500" />
            </div>
            <div className="text-xl font-black text-slate-900">{activeOngoingJobs.length} Active</div>
            <div className="text-[11px] font-semibold text-slate-500">
              100% Escrow Protected
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Acceptance Rate</span>
              <Zap size={15} className="text-amber-500" />
            </div>
            <div className="text-xl font-black text-slate-900">{profile.acceptanceRate || 98}%</div>
            <div className="text-[11px] font-bold text-amber-600">
              Top 5% in Bole & Yeka
            </div>
          </div>

          <div 
            onClick={() => navigate('/provider/showcase')}
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1 hover:border-teal-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Verified Rating</span>
              <Star size={15} className="text-amber-500 fill-amber-500" />
            </div>
            <div className="text-xl font-black text-slate-900">4.9 ★</div>
            <div className="text-[11px] font-semibold text-slate-500">
              {profile.reviewsCount || 58} verified clients
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. Incoming Direct Client Requests ── */}
      {incomingJobs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-red-600">🚨 Incoming Urgent Client Requests</h2>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                {incomingJobs.length} new
              </span>
            </div>
            <button 
              type="button" 
              onClick={() => navigate('/provider/jobs')}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 cursor-pointer"
            >
              Manage All Jobs →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            {incomingJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-3xl p-5 border-2 border-red-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-slate-900 text-base">{job.title}</h3>
                      {job.urgency === 'urgent' && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-100 text-red-700">
                          ⚡ URGENT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      Client: <strong>{job.clientName}</strong> • {job.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900">{job.agreedPrice} {job.currency || 'ETB'}</span>
                    <span className="block text-[10px] font-bold text-teal-700">🛡️ Escrow Funded</span>
                  </div>
                </div>

                {job.notes && (
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg">
                    "{job.notes}"
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>Requested {job.requestedAt}</span>
                  </span>
                  <span>Scheduled: <strong>{job.scheduledTime}</strong></span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button 
                    type="button" 
                    onClick={() => {
                      declineJob(job.id);
                      showToast('Request declined', 'info');
                    }}
                    className="flex-1 py-2 rounded-full border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    Decline
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      acceptJob(job.id);
                      showToast(`Accepted booking from ${job.clientName}! Escrow funded in vault.`, 'success');
                      navigate('/provider/jobs');
                    }}
                    className="flex-2 py-2 rounded-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Accept & Lock ({job.agreedPrice} ETB)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 4. Active Ongoing Tasks Tracker (Linear / ClickUp Inspiration) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900">Active Ongoing Tasks ({activeOngoingJobs.length})</h2>
            <span className="text-xs text-slate-500">• 100% Chapa Escrow Secured</span>
          </div>
          <button 
            type="button" 
            onClick={() => navigate('/provider/jobs')}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 cursor-pointer"
          >
            View Full Queue →
          </button>
        </div>

        {activeOngoingJobs.length > 0 ? (
          <div className="space-y-4 mt-3">
            {activeOngoingJobs.map((job) => {
              const isEnRoute = job.stage === 'en_route';
              const isInProgress = job.stage === 'in_progress';
              const isSubmitted = job.stage === 'completion_submitted';

              return (
                <div key={job.id} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-stripe-card space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800">
                          {isEnRoute && '🚗 En Route'}
                          {isInProgress && '⚙️ In Progress'}
                          {isSubmitted && '⏱️ Pending Client Release'}
                          {!isEnRoute && !isInProgress && !isSubmitted && '✓ Accepted'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Client: <strong>{job.clientName}</strong> • {job.address}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900">{job.agreedPrice} {job.currency || 'ETB'}</span>
                      <span className="block text-xs font-bold text-emerald-600">🛡️ Escrow Locked</span>
                    </div>
                  </div>

                  {/* Stage Advance & Client Interaction Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${job.clientPhone}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                      >
                        <Phone size={12} />
                        <span>Call Client</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleStartChatWithClient(job)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <MessageSquare size={12} />
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
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        >
                          <Navigation size={13} />
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
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                        >
                          <Play size={13} />
                          <span>Arrived & Start Work ⚙️</span>
                        </button>
                      )}

                      {isInProgress && (
                        <button
                          type="button"
                          onClick={() => handleOpenProofModal(job)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs animate-pulse"
                        >
                          <Camera size={13} />
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
          <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center text-slate-500 mt-3">
            <p className="text-sm font-medium">No active jobs in progress. Check new leads below or browse open requests.</p>
          </div>
        )}
      </section>

      {/* ── 5. Market Leads Radar ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-teal-600" />
            <h2 className="text-lg font-extrabold text-slate-900">Open Job Requests in Addis Ababa (Market Leads)</h2>
          </div>
          <button 
            type="button" 
            onClick={() => navigate('/requests')}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 cursor-pointer"
          >
            View All Leads →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          {marketLeads.slice(0, 4).map((lead, i) => (
            <div key={lead.id || i} className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                    {lead.category || 'Specialist Need'}
                  </span>
                  <strong className="text-slate-900 font-black text-sm">{lead.budget || 'Custom Quote'}</strong>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mb-1">{lead.title}</h4>
                <p className="text-slate-500 text-xs mb-3 line-clamp-2">{lead.description}</p>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-teal-600" />
                  <span>{lead.location || 'Addis Ababa'}</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleOpenQuote(lead)}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <Zap size={11} />
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={closeQuoteModal}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Submit Quote / Bid</h3>
                  <p className="text-xs text-slate-500 truncate max-w-[280px]">{selectedLeadForQuote.title}</p>
                </div>
              </div>
              <button type="button" onClick={closeQuoteModal} className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitQuote} className="space-y-4">
              <div className="space-y-3">
                {/* Lead Summary Pill */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-700">Client's Budget:</span>{' '}
                    <span className="font-bold text-emerald-600">{selectedLeadForQuote.budget || 'Open for quotes'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin size={11} className="text-teal-600" />
                    <span>{selectedLeadForQuote.location}</span>
                  </div>
                </div>

                {/* Proposed Amount */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Your Proposed Price (ETB) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      value={quoteAmount}
                      onChange={(e) => setQuoteAmount(e.target.value)}
                      placeholder="e.g. 650"
                      className="w-full px-4 py-2.5 text-base font-extrabold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
                      required
                    />
                    <span className="absolute right-3 text-xs font-bold text-slate-400 pointer-events-none">
                      ETB Escrow
                    </span>
                  </div>
                  <div className="flex gap-2 mt-1.5">
                    {['450', '650', '950', '1500'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setQuoteAmount(preset)}
                        className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-teal-50 hover:text-teal-700 rounded-lg border border-slate-200 font-semibold cursor-pointer"
                      >
                        {preset} ETB
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimated Arrival */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Estimated Arrival / ETA</label>
                  <input
                    type="text"
                    value={quoteEta}
                    onChange={(e) => setQuoteEta(e.target.value)}
                    placeholder="e.g. Within 45 mins / Today 3:00 PM"
                    className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
                    required
                  />
                </div>

                {/* Custom Proposal Message */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Introductory Message to Client</label>
                  <textarea
                    rows={3}
                    value={quoteProposal}
                    onChange={(e) => setQuoteProposal(e.target.value)}
                    placeholder="Describe how you will solve their problem, what tools you have, and your warranty..."
                    className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
                  />
                </div>

                {/* Chapa Escrow Safety Notice */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    When client accepts, their <strong>{quoteAmount || 0} ETB</strong> is locked in Chapa Escrow before you travel. 100% payout guaranteed upon work completion.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={closeQuoteModal} className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingQuote || !quoteAmount}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsProofModalOpen(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Camera size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Submit Proof of Completion</h3>
                  <p className="text-xs text-slate-500 truncate max-w-[280px]">{activeProofJob.title} • {activeProofJob.clientName}</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsProofModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmCompletion} className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Summary of Work Performed <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={completionSummary}
                    onChange={(e) => setCompletionSummary(e.target.value)}
                    placeholder="Describe the fix or service provided in detail..."
                    className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Parts or Materials Replaced (If Any)</label>
                  <input
                    type="text"
                    value={partsReplaced}
                    onChange={(e) => setPartsReplaced(e.target.value)}
                    placeholder="e.g. PPR valve 25mm, brass connector, Teflon seal"
                    className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
                  />
                </div>

                {/* Proof Checklist Chips */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Quality & Guarantee Verification</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {proofTagOptions.map((tag) => {
                      const isSelected = selectedProofTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleProofTag(tag)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600'
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
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-900 flex items-start gap-2">
                  <ShieldCheck size={16} className="text-teal-700 shrink-0 mt-0.5" />
                  <span>
                    Submitting opens the 72-hour inspection window. Client will be prompted to release your <strong>{activeProofJob.agreedPrice} ETB</strong> payment directly to your wallet.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsProofModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingProof || !completionSummary.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
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
