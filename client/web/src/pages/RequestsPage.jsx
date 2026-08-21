import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  MapPin, 
  Clock, 
  Briefcase, 
  ShieldCheck, 
  Zap, 
  DollarSign, 
  MessageSquare, 
  Calendar, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  Filter, 
  X, 
  Phone, 
  FileText, 
  Edit2, 
  Trash2, 
  Check, 
  ArrowUpRight, 
  Tag, 
  PackageCheck
} from 'lucide-react';
import { useRequestStore } from '../stores/requestStore';
import { useAppStore } from '../stores/appStore';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import { SERVICE_CATEGORIES, ADDIS_SUB_CITIES } from '../config/constants';
import MatchingDrawer from '../components/matching/MatchingDrawer';

const ETHIOPIAN_PAYMENT_METHODS = [
  { id: 'telebirr', name: 'Telebirr', icon: '📱', color: '#0072BC' },
  { id: 'cbe', name: 'CBE Birr', icon: '🏦', color: '#781145' },
  { id: 'awash', name: 'Awash Birr', icon: '🟡', color: '#FFB81C' },
  { id: 'dashen', name: 'Dashen Amole', icon: '🔵', color: '#00529B' },
  { id: 'card', name: 'Bank Card (Visa/MC)', icon: '💳', color: '#1E293B' },
];

export default function RequestsPage() {
  const navigate = useNavigate();
  const {
    requests,
    myProposals,
    activeTab,
    setActiveTab,
    selectedSubCity,
    setSelectedSubCity,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    bidSubmissionModal,
    openBidSubmission,
    closeBidSubmission,
    submitBid,
    reviseProposalModal,
    openReviseProposal,
    closeReviseProposal,
    reviseProposal,
    withdrawProposal,
    escrowDepositModal,
    openEscrowDeposit,
    closeEscrowDeposit,
    confirmEscrowDeposit,
  } = useRequestStore();

  const { appMode, setPostRequestOpen, showToast } = useAppStore();
  const { isAuthenticated, user } = useAuthStore();
  const { startConversationWithProvider } = useChatStore();

  const [expandedBidsMap, setExpandedBidsMap] = useState({ 'req-1': true });
  const [proposalStatusFilter, setProposalStatusFilter] = useState('all'); // 'all' | 'under_review' | 'accepted_funded'
  const [matchingRequest, setMatchingRequest] = useState(null);

  // Bid submission form local state
  const [proposedPrice, setProposedPrice] = useState('650');
  const [estimatedArrival, setEstimatedArrival] = useState('30 mins');
  const [estimatedDuration, setEstimatedDuration] = useState('1–2 hours');
  const [includesMaterials, setIncludesMaterials] = useState(true);
  const [coverNote, setCoverNote] = useState('');

  // Revise proposal local state
  const [revisedPrice, setRevisedPrice] = useState('');
  const [revisedArrival, setRevisedArrival] = useState('');
  const [revisedDuration, setRevisedDuration] = useState('');
  const [revisedMaterials, setRevisedMaterials] = useState(true);
  const [revisedNote, setRevisedNote] = useState('');

  // Escrow payment local state
  const [paymentMethod, setPaymentMethod] = useState('Telebirr');
  const [paymentPhone, setPaymentPhone] = useState(user?.phone || '+251 911 234 567');
  const [isProcessingEscrow, setIsProcessingEscrow] = useState(false);

  const toggleExpandBids = (reqId) => {
    setExpandedBidsMap((prev) => ({
      ...prev,
      [reqId]: !prev[reqId],
    }));
  };

  const handleStartChatWithClient = (e, clientName, clientPhone) => {
    e.stopPropagation();
    startConversationWithProvider({
      id: `client-${Date.now()}`,
      name: clientName,
      headline: 'LINC Customer (Addis Ababa)',
      initials: clientName.slice(0, 2).toUpperCase(),
      avatarColor: '#0284C7',
      verified: true,
    });
    navigate('/messages');
  };

  const handleStartChatWithBidder = (e, bidder) => {
    e.stopPropagation();
    startConversationWithProvider({
      id: bidder.providerId,
      name: bidder.providerName,
      headline: bidder.providerHeadline,
      initials: bidder.providerInitials,
      avatarColor: bidder.providerAvatarColor,
      verified: bidder.isVerified,
    });
    navigate(`/dm/${bidder.providerId}`);
  };

  const handleBidSubmitAction = (e) => {
    e.preventDefault();
    if (!proposedPrice || !bidSubmissionModal.request) return;

    submitBid(bidSubmissionModal.request.id, {
      proposedPrice,
      estimatedArrival,
      estimatedDuration,
      includesMaterials,
      coverNote,
      request: bidSubmissionModal.request,
    });

    showToast('🎉 Your quote & proposal has been sent to the client!', 'success');
    setCoverNote('');
  };

  const handleOpenReviseModal = (prop) => {
    setRevisedPrice(String(prop.proposedPrice));
    setRevisedArrival(prop.estimatedArrival);
    setRevisedDuration(prop.estimatedDuration);
    setRevisedMaterials(prop.includesMaterials);
    setRevisedNote(prop.coverNote);
    openReviseProposal(prop);
  };

  const handleReviseSubmit = (e) => {
    e.preventDefault();
    if (!reviseProposalModal.proposal) return;

    reviseProposal(reviseProposalModal.proposal.id, {
      proposedPrice: revisedPrice,
      estimatedArrival: revisedArrival,
      estimatedDuration: revisedDuration,
      includesMaterials: revisedMaterials,
      coverNote: revisedNote,
    });

    showToast('Proposal & quotation updated successfully! ⚡', 'success');
  };

  const handleConfirmEscrowAction = () => {
    setIsProcessingEscrow(true);

    setTimeout(() => {
      confirmEscrowDeposit(paymentMethod, paymentPhone);
      setIsProcessingEscrow(false);
      showToast(`🔒 Funds deposited into Chapa Escrow via ${paymentMethod}! Specialist notified.`, 'success');
      navigate('/bookings');
    }, 1200);
  };

  // Filter requests for browse tab
  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'my_requests' && !r.isMine) return false;
    if (activeTab === 'browse' && r.isMine && appMode !== 'provider') return false;

    if (selectedCategory !== 'All Categories' && r.category !== selectedCategory) return false;
    if (selectedSubCity !== 'All Addis Ababa' && !r.subCity.toLowerCase().includes(selectedSubCity.toLowerCase())) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.subCity.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  // Filter proposals for provider
  const filteredProposals = myProposals.filter((p) => {
    if (proposalStatusFilter === 'all') return true;
    return p.status === proposalStatusFilter;
  });

  const myRequestsCount = requests.filter((r) => r.isMine).length;
  const browseCount = requests.filter((r) => !r.isMine).length;
  const activeProposalsCount = myProposals.filter((p) => p.status === 'under_review').length;
  const wonProposalsCount = myProposals.filter((p) => p.status === 'accepted_funded').length;
  const pipelineETB = myProposals.reduce((acc, p) => acc + (p.status !== 'withdrawn' ? p.proposedPrice : 0), 0);

  return (
    <div className="requests-marketplace-wrapper">
      {/* ── 1. Frosted Glass Hero Banner ── */}
      <section className="requests-hero-banner">
        <div className="requests-hero-content">
          <div className="requests-hero-left">
            <div className="requests-icon-badge">
              <FileText size={26} />
            </div>
            <div>
              <h1 className="requests-hero-title">
                {appMode === 'provider' ? 'Addis Ababa Specialist Job Market & Leads' : 'Addis Ababa Job Requests Marketplace'}
              </h1>
              <p className="requests-hero-subtitle">
                {appMode === 'provider'
                  ? 'Browse live customer repair leads in your sub-city, submit competitive price quotes, and lock in Chapa Escrow payouts.'
                  : 'Post custom household tasks or receive competitive specialist bids with 100% Chapa Escrow security.'}
              </p>
            </div>
          </div>

          <div className="requests-hero-actions">
            {appMode === 'provider' ? (
              <button
                type="button"
                onClick={() => navigate('/provider/jobs')}
                className="btn btn-primary"
              >
                <Briefcase size={16} />
                <span>View Active Jobs Queue</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPostRequestOpen(true)}
                className="post-request-hero-btn"
              >
                <PlusCircle size={16} />
                <span>Post a Work Request</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Marketplace Badges */}
        <div className="requests-stats-strip">
          <div className="stat-chip">
            <Sparkles size={13} className="text-cyan" />
            <span><strong>{requests.length}+</strong> Open Tasks in Addis</span>
          </div>
          <div className="stat-chip">
            <Clock size={13} className="text-cyan" />
            <span><strong>~12 min</strong> Average Specialist Bid Time</span>
          </div>
          <div className="stat-chip">
            <Lock size={13} className="text-emerald" />
            <span><strong>100% Chapa Escrow</strong> Protected Vault</span>
          </div>
        </div>
      </section>

      {/* ── 2. Perspective Tab Switcher ── */}
      <div className="requests-tab-switch-bar">
        <button
          type="button"
          onClick={() => setActiveTab('browse')}
          className={`requests-tab-pill ${activeTab === 'browse' ? 'active' : ''}`}
        >
          <span>🌍 {appMode === 'provider' ? 'Browse Market Leads' : 'Browse Available Jobs'}</span>
          <span className="tab-counter-badge">{browseCount}</span>
        </button>

        {appMode === 'provider' ? (
          <button
            type="button"
            onClick={() => setActiveTab('my_proposals')}
            className={`requests-tab-pill ${activeTab === 'my_proposals' ? 'active' : ''}`}
          >
            <span>⚡ My Submitted Proposals & Quotes</span>
            <span className="tab-counter-badge">{myProposals.length}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setActiveTab('my_requests')}
            className={`requests-tab-pill ${activeTab === 'my_requests' ? 'active' : ''}`}
          >
            <span>📋 My Posted Requests</span>
            <span className="tab-counter-badge">{myRequestsCount}</span>
          </button>
        )}
      </div>

      {/* ── TAB 1: BROWSE OPEN MARKET LEADS ── */}
      {activeTab === 'browse' && (
        <>
          {/* Filters & Search Bar */}
          <div className="requests-filters-glass-card">
            <div className="filters-search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search job title, keywords, or sub-city..."
                className="filter-search-input"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="clear-filter-btn">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="filters-selectors-row">
              <div className="filter-dropdown-wrap">
                <Filter size={13} className="filter-icon" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="All Categories">All Trade Categories</option>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.emoji} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-dropdown-wrap">
                <MapPin size={13} className="filter-icon" />
                <select
                  value={selectedSubCity}
                  onChange={(e) => setSelectedSubCity(e.target.value)}
                  className="filter-select"
                >
                  <option value="All Addis Ababa">All Addis Ababa Sub-Cities</option>
                  {ADDIS_SUB_CITIES.map((sub, i) => (
                    <option key={i} value={sub.split(',')[0]}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Requests Feed Stream */}
          <div className="requests-feed-stack">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req) => {
                const isUrgent = req.urgency === 'urgent';
                const isFunded = req.status === 'funded_escrow';

                return (
                  <div key={req.id} className={`marketplace-request-card ${isFunded ? 'funded-card' : ''}`}>
                    {/* Request Header */}
                    <div className="req-card-top">
                      <div className="req-header-left">
                        <span className="req-category-tag">
                          <span>{req.categoryEmoji}</span>
                          <span>{req.category}</span>
                        </span>

                        <span className="req-time-tag">
                          <Clock size={11} />
                          <span>{req.timeAgo}</span>
                        </span>

                        {isUrgent && (
                          <span className="req-urgent-pill">
                            <Zap size={11} />
                            <span>URGENT</span>
                          </span>
                        )}

                        {isFunded && (
                          <span className="req-escrow-pill">
                            <Lock size={11} />
                            <span>Funded in Escrow</span>
                          </span>
                        )}
                      </div>

                      <div className="req-budget-tag">
                        <span className="budget-label">ESTIMATED BUDGET</span>
                        <strong className="budget-value">{req.budget}</strong>
                      </div>
                    </div>

                    {/* Request Body */}
                    <div className="req-body-content">
                      <h3 className="req-title">{req.title}</h3>
                      <p className="req-desc">{req.description}</p>
                    </div>

                    {/* Request Meta Info */}
                    <div className="req-meta-footer">
                      <div className="req-location-badge">
                        <MapPin size={12} className="text-cyan" />
                        <span><strong>{req.subCity}</strong> • {req.landmark}</span>
                      </div>

                      <div className="req-client-verification">
                        <ShieldCheck size={13} className="text-emerald" />
                        <span>{req.clientName} (Fayda Verified Client)</span>
                      </div>
                    </div>

                    {/* Specialist Action Bar */}
                    <div className="req-specialist-action-bar">
                      <div className="bids-count-note">
                        <span>⚡ {req.bids?.length || 0} specialists have submitted quotes</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => openBidSubmission(req)}
                        className="submit-quote-action-btn"
                      >
                        <Zap size={14} />
                        <span>Submit Quote / Bid</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-requests-pane">
                <FileText size={44} className="text-muted" />
                <h3 className="empty-title">No job requests found</h3>
                <p className="empty-sub">Try changing your search filters or sub-city selection.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── TAB 2: PROVIDER MY PROPOSALS & QUOTES ── */}
      {activeTab === 'my_proposals' && (
        <div className="provider-proposals-container">
          {/* KPI Strip */}
          <div className="provider-metrics-four-grid mb-4">
            <div className="provider-kpi-card">
              <span className="kpi-label">Active Quotes Under Review</span>
              <strong className="kpi-number text-cyan">{activeProposalsCount}</strong>
              <span className="kpi-sub">Awaiting customer selection</span>
            </div>

            <div className="provider-kpi-card">
              <span className="kpi-label">Won & Escrow Funded</span>
              <strong className="kpi-number text-emerald">{wonProposalsCount}</strong>
              <span className="kpi-sub">Ready for execution</span>
            </div>

            <div className="provider-kpi-card">
              <span className="kpi-label">Quote Pipeline Value</span>
              <strong className="kpi-number text-slate-900">{pipelineETB} ETB</strong>
              <span className="kpi-sub">Total active bidding value</span>
            </div>

            <div className="provider-kpi-card">
              <span className="kpi-label">Proposal Win Rate</span>
              <strong className="kpi-number text-amber-500">67%</strong>
              <span className="kpi-sub">Top 5% in Addis Ababa</span>
            </div>
          </div>

          {/* Status Filter Chips */}
          <div className="provider-filter-tabs-bar mb-3">
            <button
              type="button"
              onClick={() => setProposalStatusFilter('all')}
              className={`p-tab-btn ${proposalStatusFilter === 'all' ? 'active' : ''}`}
            >
              <span>All Quotes ({myProposals.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setProposalStatusFilter('under_review')}
              className={`p-tab-btn ${proposalStatusFilter === 'under_review' ? 'active' : ''}`}
            >
              <span>⏱️ Under Review ({activeProposalsCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setProposalStatusFilter('accepted_funded')}
              className={`p-tab-btn ${proposalStatusFilter === 'accepted_funded' ? 'active' : ''}`}
            >
              <span>🛡️ Accepted & Funded ({wonProposalsCount})</span>
            </button>
          </div>

          {/* Proposals Feed */}
          <div className="proposals-feed-stack">
            {filteredProposals.length > 0 ? (
              filteredProposals.map((prop) => {
                const isUnderReview = prop.status === 'under_review';
                const isAccepted = prop.status === 'accepted_funded';

                return (
                  <div key={prop.id} className={`provider-proposal-card ${isAccepted ? 'accepted-proposal' : ''}`}>
                    {/* Proposal Card Header */}
                    <div className="prop-card-header">
                      <div className="prop-header-left">
                        <span className="req-category-tag">
                          <span>{prop.categoryEmoji}</span>
                          <span>{prop.category}</span>
                        </span>
                        <span className="prop-date-tag">Submitted {prop.submittedAt}</span>
                      </div>

                      {isUnderReview && (
                        <span className="status-pill-under-review">
                          <Clock size={12} />
                          <span>Under Client Review</span>
                        </span>
                      )}

                      {isAccepted && (
                        <span className="status-pill-accepted">
                          <ShieldCheck size={12} />
                          <span>Accepted & Escrow Locked</span>
                        </span>
                      )}

                      {prop.status === 'withdrawn' && (
                        <span className="status-pill-withdrawn">Withdrawn</span>
                      )}
                    </div>

                    {/* Job Title & Client */}
                    <div className="prop-job-info">
                      <h3 className="prop-job-title">{prop.requestTitle}</h3>
                      <div className="prop-client-line">
                        <span>👤 Client: <strong>{prop.clientName}</strong></span>
                        <span>•</span>
                        <span>📍 {prop.subCity}</span>
                        <span>•</span>
                        <span>Client Budget: <strong>{prop.clientBudget}</strong></span>
                      </div>
                    </div>

                    {/* Proposal Financial & Logistics Strip */}
                    <div className="prop-logistics-strip">
                      <div className="prop-metric-col">
                        <span className="p-met-label">Your Proposed Price</span>
                        <strong className="p-met-val text-emerald">{prop.proposedPrice} ETB</strong>
                      </div>

                      <div className="prop-metric-col">
                        <span className="p-met-label">Estimated Arrival</span>
                        <strong className="p-met-val">{prop.estimatedArrival}</strong>
                      </div>

                      <div className="prop-metric-col">
                        <span className="p-met-label">Job Duration</span>
                        <strong className="p-met-val">{prop.estimatedDuration}</strong>
                      </div>

                      <div className="prop-metric-col">
                        <span className="p-met-label">Materials & Parts</span>
                        <span className={`materials-chip ${prop.includesMaterials ? 'included' : 'labor-only'}`}>
                          {prop.includesMaterials ? '✓ Parts Included' : 'Labor Only'}
                        </span>
                      </div>
                    </div>

                    {/* Proposal Cover Note */}
                    <div className="prop-note-box">
                      <p className="prop-note-text">"{prop.coverNote}"</p>
                    </div>

                    {/* Proposal Actions Bar */}
                    <div className="prop-actions-bar">
                      <div className="prop-actions-left">
                        {isAccepted ? (
                          <button
                            type="button"
                            onClick={() => navigate('/provider/jobs')}
                            className="btn btn-primary btn-sm"
                          >
                            <Briefcase size={14} />
                            <span>Open in Active Jobs Queue</span>
                          </button>
                        ) : (
                          <span className="text-slate-500 text-xs flex items-center gap-1">
                            <Clock size={12} />
                            <span>Client is reviewing your quotation</span>
                          </span>
                        )}
                      </div>

                      <div className="prop-actions-right">
                        <button
                          type="button"
                          onClick={(e) => handleStartChatWithClient(e, prop.clientName, prop.clientPhone)}
                          className="btn btn-outline btn-sm"
                        >
                          <MessageSquare size={13} />
                          <span>Chat with Client</span>
                        </button>

                        {isUnderReview && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenReviseModal(prop)}
                              className="btn btn-outline btn-sm"
                            >
                              <Edit2 size={13} />
                              <span>Revise Quote</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                withdrawProposal(prop.id);
                                showToast('Proposal withdrawn', 'info');
                              }}
                              className="btn btn-outline btn-sm text-rose-500 hover:text-rose-600"
                            >
                              <Trash2 size={13} />
                              <span>Withdraw</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-requests-pane">
                <FileText size={44} className="text-muted" />
                <h3 className="empty-title">No proposals found</h3>
                <p className="empty-sub">Switch to "Browse Market Leads" and submit competitive quotes on open jobs in Addis Ababa.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('browse')}
                  className="btn btn-primary"
                >
                  Browse Market Leads →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: CLIENT MY POSTED REQUESTS (Client Mode) ── */}
      {activeTab === 'my_requests' && (
        <div className="requests-feed-stack">
          {filteredRequests.map((req) => {
            const isExpanded = expandedBidsMap[req.id];
            const isFunded = req.status === 'funded_escrow';

            return (
              <div key={req.id} className={`marketplace-request-card ${isFunded ? 'funded-card' : ''}`}>
                <div className="req-card-top">
                  <div className="req-header-left">
                    <span className="req-category-tag">
                      <span>{req.categoryEmoji}</span>
                      <span>{req.category}</span>
                    </span>
                    <span className="req-time-tag">
                      <Clock size={11} />
                      <span>{req.timeAgo}</span>
                    </span>
                    {isFunded && (
                      <span className="req-escrow-pill">
                        <Lock size={11} />
                        <span>Funded in Escrow</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setMatchingRequest(req)}
                      className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <Sparkles size={12} className="text-cyan-600 animate-pulse" />
                      <span>View AI Matches</span>
                    </button>
                  </div>

                  <div className="req-budget-tag">
                    <span className="budget-label">YOUR BUDGET</span>
                    <strong className="budget-value">{req.budget}</strong>
                  </div>
                </div>

                <div className="req-body-content">
                  <h3 className="req-title">{req.title}</h3>
                  <p className="req-desc">{req.description}</p>
                </div>

                <div className="req-bids-management-section">
                  <div 
                    onClick={() => toggleExpandBids(req.id)}
                    className="bids-accordion-toggle-header"
                  >
                    <div className="toggle-title-wrap">
                      <strong className="bids-toggle-title">
                        Incoming Specialist Quotes ({req.bids?.length || 0})
                      </strong>
                      <span className="bids-toggle-sub">
                        {req.bids?.length > 0 
                          ? 'Compare quotes, inspect ratings, and lock in Chapa Escrow' 
                          : 'Waiting for local specialists to submit proposals...'}
                      </span>
                    </div>

                    <button type="button" className="accordion-chevron-btn">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>

                  {isExpanded && req.bids?.length > 0 && (
                    <div className="bids-comparison-stack">
                      {req.bids.map((bid) => (
                        <div key={bid.id} className="specialist-bid-card">
                          <div className="bid-specialist-profile">
                            <div 
                              className="bid-avatar"
                              style={{ backgroundColor: bid.providerAvatarColor || '#0284C7' }}
                            >
                              <span>{bid.providerInitials}</span>
                            </div>

                            <div className="bid-specialist-info">
                              <div className="bid-name-row">
                                <strong className="bid-provider-name">{bid.providerName}</strong>
                                {bid.isVerified && (
                                  <span className="bid-verified-chip">
                                    <ShieldCheck size={11} />
                                    <span>Verified</span>
                                  </span>
                                )}
                              </div>
                              <span className="bid-headline">{bid.providerHeadline}</span>

                              <div className="bid-metrics-line">
                                <span className="bid-rating">
                                  <Star size={11} fill="#F59E0B" className="text-amber" />
                                  <strong>{bid.rating}</strong> ({bid.reviewsCount})
                                </span>
                                <span>•</span>
                                <span>💼 {bid.completedJobs}+ jobs</span>
                                <span>•</span>
                                <span>⏱️ Arrival: <strong>{bid.estimatedArrival}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="bid-proposal-note-box">
                            <p className="bid-note-text">"{bid.coverNote}"</p>
                          </div>

                          <div className="bid-footer-actions">
                            <div className="bid-price-tag">
                              <span className="bid-price-num">{bid.proposedPrice}</span>
                              <span className="bid-price-currency">ETB</span>
                            </div>

                            <div className="bid-buttons-group">
                              <button
                                type="button"
                                onClick={(e) => handleStartChatWithBidder(e, bid)}
                                className="bid-chat-btn"
                              >
                                <MessageSquare size={13} />
                                <span>Chat</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => openEscrowDeposit(req, bid)}
                                className="bid-accept-escrow-btn"
                              >
                                <Lock size={13} />
                                <span>Accept & Pay Escrow ({bid.proposedPrice} ETB)</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL 1: SPECIALIST BID SUBMISSION MODAL ── */}
      {bidSubmissionModal.isOpen && bidSubmissionModal.request && (
        <div className="modal-backdrop" onClick={closeBidSubmission}>
          <div className="modal-card modal-card-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge">
                  <Zap size={20} className="text-cyan" />
                </div>
                <div>
                  <h3 className="modal-title">Submit Quote / Bid</h3>
                  <p className="modal-subtitle">For: {bidSubmissionModal.request.title}</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={closeBidSubmission}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBidSubmitAction} className="modal-body">
              <div className="form-group">
                <label className="form-label">Your Proposed Price (ETB)</label>
                <div className="rate-input-wrap">
                  <span className="rate-prefix">ETB</span>
                  <input
                    type="number"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    className="rate-field"
                    required
                  />
                </div>
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label className="form-label">Estimated Arrival Time</label>
                  <input
                    type="text"
                    value={estimatedArrival}
                    onChange={(e) => setEstimatedArrival(e.target.value)}
                    placeholder="e.g. 25–30 mins"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Duration</label>
                  <input
                    type="text"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    placeholder="e.g. 1–2 hours"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includesMaterials}
                    onChange={(e) => setIncludesMaterials(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Includes Materials & Replacement Parts in Quoted Price
                  </span>
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Proposal Message to Client</label>
                <textarea
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Explain your approach, tools you carry, parts included, or quality guarantee..."
                  rows={3}
                  className="form-input form-textarea"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeBidSubmission} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Zap size={16} />
                  <span>Send Proposal ({proposedPrice} ETB)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: REVISE PROPOSAL MODAL ── */}
      {reviseProposalModal.isOpen && reviseProposalModal.proposal && (
        <div className="modal-backdrop" onClick={closeReviseProposal}>
          <div className="modal-card modal-card-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                  <Edit2 size={20} />
                </div>
                <div>
                  <h3 className="modal-title">Revise Proposal & Quotation</h3>
                  <p className="modal-subtitle">For: {reviseProposalModal.proposal.requestTitle}</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={closeReviseProposal}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReviseSubmit} className="modal-body">
              <div className="form-group">
                <label className="form-label">Revised Price (ETB)</label>
                <div className="rate-input-wrap">
                  <span className="rate-prefix">ETB</span>
                  <input
                    type="number"
                    value={revisedPrice}
                    onChange={(e) => setRevisedPrice(e.target.value)}
                    className="rate-field"
                    required
                  />
                </div>
              </div>

              <div className="form-row-two">
                <div className="form-group">
                  <label className="form-label">Estimated Arrival</label>
                  <input
                    type="text"
                    value={revisedArrival}
                    onChange={(e) => setRevisedArrival(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Duration</label>
                  <input
                    type="text"
                    value={revisedDuration}
                    onChange={(e) => setRevisedDuration(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={revisedMaterials}
                    onChange={(e) => setRevisedMaterials(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Includes Materials & Replacement Parts
                  </span>
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Updated Proposal Note</label>
                <textarea
                  value={revisedNote}
                  onChange={(e) => setRevisedNote(e.target.value)}
                  rows={3}
                  className="form-input form-textarea"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeReviseProposal} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={16} />
                  <span>Update & Re-Submit Quote</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: CHAPA ESCROW DEPOSIT (Client Acceptance) ── */}
      {escrowDepositModal.isOpen && escrowDepositModal.request && escrowDepositModal.bid && (
        <div className="modal-backdrop" onClick={closeEscrowDeposit}>
          <div className="modal-card modal-card-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-badge">
                  <Lock size={20} className="text-emerald" />
                </div>
                <div>
                  <h3 className="modal-title">Lock Funds in Chapa Escrow</h3>
                  <p className="modal-subtitle">Accept quote from {escrowDepositModal.bid.providerName}</p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={closeEscrowDeposit}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Summary Card */}
              <div className="escrow-modal-summary">
                <div className="summary-row">
                  <span className="summary-label">Task:</span>
                  <strong className="summary-val">{escrowDepositModal.request.title}</strong>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Accepted Specialist:</span>
                  <strong className="summary-val">{escrowDepositModal.bid.providerName}</strong>
                </div>
                <div className="summary-row total-row">
                  <span className="summary-label">Deposit Amount:</span>
                  <strong className="summary-price text-emerald">{escrowDepositModal.bid.proposedPrice} ETB</strong>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="form-group mt-3">
                <label className="form-label">Select Ethiopian Payment Gateway</label>
                <div className="payment-gateways-grid">
                  {ETHIOPIAN_PAYMENT_METHODS.map((pm) => {
                    const isSelected = paymentMethod === pm.name;
                    return (
                      <div
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.name)}
                        className={`payment-option-card ${isSelected ? 'selected' : ''}`}
                      >
                        <span className="payment-icon">{pm.icon}</span>
                        <span className="payment-name">{pm.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Phone Input */}
              <div className="form-group">
                <label className="form-label">Phone Number for {paymentMethod} Prompt</label>
                <div className="phone-input-wrap">
                  <Phone size={14} className="phone-icon" />
                  <input
                    type="text"
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    className="form-input pl-9"
                    required
                  />
                </div>
              </div>

              <div className="escrow-guarantee-note">
                <ShieldCheck size={16} className="text-emerald flex-shrink-0" />
                <p className="guarantee-text">
                  Your payment of <strong>{escrowDepositModal.bid.proposedPrice} ETB</strong> is locked in the Chapa Escrow Vault and will only be released to {escrowDepositModal.bid.providerName} after you inspect and approve the completed repair.
                </p>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeEscrowDeposit} className="btn btn-outline">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEscrowAction}
                  disabled={isProcessingEscrow}
                  className="btn btn-primary"
                >
                  {isProcessingEscrow ? (
                    'Processing Deposit...'
                  ) : (
                    <>
                      <Lock size={15} />
                      <span>Deposit {escrowDepositModal.bid.proposedPrice} ETB to Escrow</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: MATCHING DRAWER ── */}
      {matchingRequest && (
        <MatchingDrawer
          isOpen={!!matchingRequest}
          onClose={() => setMatchingRequest(null)}
          request={matchingRequest}
        />
      )}
    </div>
  );
}
