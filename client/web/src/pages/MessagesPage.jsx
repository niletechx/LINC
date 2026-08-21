import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Search, 
  Send, 
  Sparkles, 
  Phone, 
  Video, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  Paperclip, 
  ShieldCheck, 
  Check, 
  CheckCheck, 
  Lock, 
  Zap, 
  ChevronLeft, 
  Clock, 
  Star, 
  FileText,
  AlertCircle,
  X
} from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { useAppStore } from '../stores/appStore';

const QUICK_PROMPTS = [
  '✨ @AI trust check',
  'Are you available today?',
  'What are your service rates?',
  'Can you send a formal quote?',
  'I deposited to Chapa Escrow 🔒',
];

export default function MessagesPage() {
  const navigate = useNavigate();
  const { id: routeConvId } = useParams();
  const { 
    conversations, 
    activeConversationId, 
    setActiveConversationId, 
    getActiveConversation, 
    sendMessage, 
    isAiAdvisorAnalyzing,
    activeCall,
    startCall,
    endCall
  } = useChatStore();

  const { showToast } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [typedMessage, setTypedMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const messagesEndRef = useRef(null);

  // Sync route param if accessed via /dm/:id
  useEffect(() => {
    if (routeConvId) {
      const match = conversations.find(c => c.id === routeConvId || c.providerId === routeConvId);
      if (match) {
        setActiveConversationId(match.id);
      }
    }
  }, [routeConvId, conversations, setActiveConversationId]);

  const activeConv = getActiveConversation();

  // Scroll to bottom on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages, isAiAdvisorAnalyzing]);

  // Call timer simulation
  useEffect(() => {
    let interval;
    if (activeCall?.status === 'connected') {
      interval = setInterval(() => {
        setCallTimer((t) => t + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [activeCall?.status]);

  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.headline?.toLowerCase().includes(q) ||
      c.lastMsg?.toLowerCase().includes(q)
    );
  });

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!typedMessage.trim()) return;

    sendMessage(typedMessage.trim());
    setTypedMessage('');
  };

  const handleQuickPromptClick = (prompt) => {
    sendMessage(prompt);
  };

  const handleAttachmentClick = () => {
    showToast('📎 Photo/document attachment simulator: Image selected.', 'success');
    sendMessage('📷 [Attached photo: kitchen_sink_leak.jpg]');
  };

  const formatCallTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    setActiveConversationId(null);
    if (routeConvId) {
      navigate('/messages');
    }
  };

  return (
    <div className="messages-hub-wrapper">
      {/* ── 1. Left Column: Conversations List Pane ── */}
      <aside className={`messages-conversations-pane ${activeConv ? 'mobile-hidden' : ''}`}>
        <div className="conversations-pane-header">
          <h2 className="pane-title">Direct Messages</h2>
          <span className="active-convs-badge">{conversations.length} Active</span>
        </div>

        {/* Search Input */}
        <div className="conv-search-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search specialists or messages..."
            className="conv-search-input"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className="clear-search-btn">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Scrollable Conversation Cards */}
        <div className="conversations-scroll-feed">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((c) => {
              const isActive = c.id === activeConv?.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConversationId(c.id)}
                  className={`convo-item-card ${isActive ? 'active' : ''}`}
                >
                  <div className="convo-avatar-box">
                    <div 
                      className="convo-avatar"
                      style={{ backgroundColor: c.avatarColor || '#0284C7' }}
                    >
                      <span>{c.initials || c.name?.slice(0, 2).toUpperCase()}</span>
                    </div>
                    {c.online && <span className="convo-online-indicator" />}
                  </div>

                  <div className="convo-body-content">
                    <div className="convo-top-line">
                      <div className="convo-name-wrap">
                        <strong className="convo-name">{c.name}</strong>
                        {c.isVerified && (
                          <ShieldCheck size={13} className="text-emerald" title="Verified Ethiopian Pro" />
                        )}
                      </div>
                      <span className="convo-timestamp">{c.time}</span>
                    </div>

                    <p className="convo-preview-msg">{c.lastMsg}</p>
                  </div>

                  {c.unread > 0 && (
                    <span className="convo-unread-pill">{c.unread}</span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="empty-convs-box">
              <p>No conversations matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </aside>

      {/* ── 2. Right Column: Active Chat Stream Canvas ── */}
      {activeConv ? (
        <main className="active-chat-pane">
          {/* Chat Header Bar */}
          <header className="active-chat-header">
            <div className="chat-recipient-info">
              <button 
                type="button" 
                onClick={handleBack} 
                className="chat-back-btn"
                title="Go back"
              >
                <ChevronLeft size={20} />
              </button>

              <div 
                className="chat-header-avatar"
                style={{ backgroundColor: activeConv.avatarColor || '#0284C7' }}
              >
                <span>{activeConv.initials || activeConv.name?.slice(0, 2).toUpperCase()}</span>
                {activeConv.online && <span className="convo-online-indicator" />}
              </div>

              <div className="recipient-titles">
                <div className="recipient-name-row">
                  <h3 className="recipient-name">{activeConv.name}</h3>
                  {activeConv.isVerified && (
                    <span className="verified-chip">
                      <ShieldCheck size={12} />
                      <span>Verified</span>
                    </span>
                  )}
                </div>
                <span className="recipient-sub">
                  {activeConv.online ? '🟢 Online & Available' : '⚪ Offline'} • {activeConv.headline}
                </span>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="chat-header-actions">
              <button
                type="button"
                onClick={() => startCall(activeConv, 'voice')}
                className="header-call-btn"
                title="Voice Call"
              >
                <Phone size={16} />
              </button>

              <button
                type="button"
                onClick={() => startCall(activeConv, 'video')}
                className="header-call-btn"
                title="Video Call"
              >
                <Video size={16} />
              </button>

              <button
                type="button"
                onClick={() => navigate(`/booking/${activeConv.providerId || activeConv.id}`)}
                className="header-escrow-book-btn"
              >
                <Lock size={13} />
                <span>Book with Escrow</span>
              </button>
            </div>
          </header>

          {/* Chat Message Scroll Canvas */}
          <div className="chat-messages-area">
            {/* LINC Safety Notice */}
            <div className="chat-escrow-safety-banner">
              <div className="safety-banner-title">
                <Lock size={14} className="text-emerald" />
                <strong>100% Chapa Escrow Safe Pay</strong>
              </div>
              <p className="safety-banner-desc">
                For complete financial protection, never make direct off-platform cash deposits. Payments locked in Chapa Escrow are only released after you inspect and approve the job.
              </p>
            </div>

            {/* Messages Feed */}
            <div className="messages-stream-stack">
              {activeConv.messages?.map((msg) => {
                const isMe = msg.fromMe;

                // 1. CUSTOM QUOTE CARD
                if (msg.type === 'quote') {
                  return (
                    <div key={msg.id} className="quote-card-row">
                      <div className="chat-quote-card">
                        <div className="quote-header-row">
                          <div className="quote-title-group">
                            <FileText size={16} className="text-cyan" />
                            <span className="quote-header-label">Official Service Proposal</span>
                          </div>
                          <span className="quote-validity">Valid: {msg.validUntil}</span>
                        </div>

                        <div className="quote-main-content">
                          <h4 className="quote-service-title">{msg.serviceName}</h4>
                          <div className="quote-price-tag">
                            <span className="price-num">{msg.price}</span>
                            <span className="price-unit">{msg.currency || 'ETB'}</span>
                          </div>
                        </div>

                        <div className="quote-meta-row">
                          <span>⏱️ Estimated Duration: <strong>{msg.duration}</strong></span>
                          <span>•</span>
                          <span>🔒 100% Chapa Escrow Protected</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate(`/booking/${activeConv.providerId || activeConv.id}?hours=2`)}
                          className="quote-accept-btn"
                        >
                          <Zap size={15} />
                          <span>Accept Quote & Pay via Escrow ({msg.price} ETB)</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                // 2. AI TRUST ADVISOR REPORT
                if (msg.type === 'ai_trust') {
                  return (
                    <div key={msg.id} className="ai-trust-report-row">
                      <div className="ai-trust-report-card">
                        <div className="trust-card-header">
                          <div className="trust-header-left">
                            <div className="trust-icon-badge">
                              <Sparkles size={16} className="text-cyan" />
                            </div>
                            <div>
                              <strong className="trust-title">LINC AI Trust Advisor Report</strong>
                              <span className="trust-private-pill">🔒 Visible only to you</span>
                            </div>
                          </div>
                          <span className="trust-score-badge">{msg.trustScore}% Score</span>
                        </div>

                        <div className="trust-stats-grid">
                          <div className="trust-stat-box">
                            <span className="t-stat-label">Identity Check</span>
                            <span className="t-stat-val text-emerald">Verified Fayda ID ✓</span>
                          </div>
                          <div className="trust-stat-box">
                            <span className="t-stat-label">Jobs Completed</span>
                            <span className="t-stat-val">{msg.completedJobs} Tasks</span>
                          </div>
                          <div className="trust-stat-box">
                            <span className="t-stat-label">On-Time Rate</span>
                            <span className="t-stat-val">{msg.onTimeRate}</span>
                          </div>
                          <div className="trust-stat-box">
                            <span className="t-stat-label">Avg. Response</span>
                            <span className="t-stat-val">{msg.responseTime}</span>
                          </div>
                        </div>

                        <div className="trust-recommendation">
                          <ShieldCheck size={14} className="text-emerald flex-shrink-0" />
                          <span>Specialist has a clean track record. Safe to book via Chapa Escrow.</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                // 3. STANDARD TEXT MESSAGE
                return (
                  <div key={msg.id} className={`chat-message-row ${isMe ? 'from-me' : 'from-them'}`}>
                    {!isMe && (
                      <div 
                        className="msg-author-avatar"
                        style={{ backgroundColor: activeConv.avatarColor || '#0284C7' }}
                      >
                        <span>{activeConv.initials || activeConv.name?.slice(0, 2).toUpperCase()}</span>
                      </div>
                    )}

                    <div className={`chat-speech-bubble ${isMe ? 'bubble-me' : 'bubble-them'}`}>
                      <p className="bubble-text">{msg.text}</p>
                      <div className="bubble-footer-meta">
                        <span className="bubble-time">{msg.time}</span>
                        {isMe && <CheckCheck size={13} className="text-cyan ml-1" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* AI Advisor Analyzing Indicator */}
              {isAiAdvisorAnalyzing && (
                <div className="ai-analyzing-row">
                  <div className="trust-icon-badge animate-spin">
                    <Sparkles size={14} className="text-cyan" />
                  </div>
                  <span className="analyzing-text">LINC AI Advisor is analyzing {activeConv.name}'s verified credentials...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick Action Prompt Chips */}
          <div className="chat-quick-prompts-bar">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickPromptClick(prompt)}
                className="chat-prompt-chip"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar Form */}
          <form onSubmit={handleSend} className="chat-input-form-bar">
            <div className="chat-input-container">
              <button
                type="button"
                onClick={handleAttachmentClick}
                className="chat-attach-btn"
                title="Attach photo or document"
              >
                <Paperclip size={18} />
              </button>

              <input
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder={`Message ${activeConv.name} or type @AI for a trust check...`}
                className="chat-main-input"
              />

              <button
                type="submit"
                disabled={!typedMessage.trim()}
                className="chat-send-action-btn"
                title="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </main>
      ) : (
        <main className="empty-chat-pane">
          <div className="empty-chat-placeholder">
            <div className="empty-icon-bubble">
              <Sparkles size={36} className="text-cyan" />
            </div>
            <h3 className="empty-title">Select a conversation</h3>
            <p className="empty-sub">Choose a specialist on the left to start messaging, request custom quotes, or initiate Chapa Escrow bookings.</p>
            <div className="empty-hint-chip">
              <span>🛡️ Private, Encrypted & 100% Escrow Protected</span>
            </div>
          </div>
        </main>
      )}

      {/* ── 3. Simulated Audio / Video Call Modal ── */}
      {activeCall && (
        <div className="modal-backdrop">
          <div className="call-simulation-card">
            <div className="call-avatar-pulse-wrap">
              <div 
                className="call-avatar"
                style={{ backgroundColor: activeCall.provider.avatarColor || '#0284C7' }}
              >
                <span>{activeCall.provider.initials || activeCall.provider.name?.slice(0, 2).toUpperCase()}</span>
              </div>
              <div className="pulse-ring ring-1" />
              <div className="pulse-ring ring-2" />
            </div>

            <div className="call-info-group">
              <h3 className="call-name">{activeCall.provider.name}</h3>
              <p className="call-type-tag">
                {activeCall.type === 'video' ? '🎥 LINC HD Video Call' : '📞 LINC Secure Voice Call'}
              </p>
              <span className={`call-status-indicator ${activeCall.status}`}>
                {activeCall.status === 'ringing' ? 'Ringing...' : `Connected • ${formatCallTime(callTimer)}`}
              </span>
            </div>

            {/* Call Controls */}
            <div className="call-controls-row">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`call-control-btn ${isMuted ? 'muted' : ''}`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <button
                type="button"
                onClick={endCall}
                className="call-control-btn end-call"
                title="End Call"
              >
                <PhoneOff size={24} />
              </button>

              <button
                type="button"
                className="call-control-btn"
                title="Speaker"
              >
                <Volume2 size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
