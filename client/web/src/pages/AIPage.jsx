import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Send, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  UserPlus, 
  LogIn, 
  History, 
  Plus, 
  Trash2, 
  Clock, 
  MapPin, 
  Star, 
  Briefcase, 
  Zap, 
  DollarSign, 
  CheckCircle2, 
  Menu, 
  X,
  MessageSquare
} from 'lucide-react';
import { useAiStore } from '../stores/aiStore';
import { useAppStore } from '../stores/appStore';
import { useAuthStore } from '../stores/authStore';

export default function AIPage() {
  const navigate = useNavigate();
  const { 
    conversations, 
    activeConversationId, 
    activeTitle, 
    messages, 
    isLoading, 
    suggestedPrompts,
    loadSessions,
    switchSession,
    startNewSession,
    deleteSession,
    sendMessage
  } = useAiStore();

  const { currentLocation, openAuthModal } = useAppStore();
  const { isAuthenticated } = useAuthStore();
  
  const [inputVal, setInputVal] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = (textToSend) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    sendMessage(text);
    setInputVal('');
  };

  const handleAskAboutProvider = (username, name) => {
    const prompt = `Tell me more about @${username || name?.toLowerCase().replace(/\s+/g, '_')}: what are their verified credentials, typical response time, and past customer reviews?`;
    handleSend(prompt);
  };

  return (
    <div className="ai-page-wrapper">
      {/* ── 1. Sessions History Sidebar ── */}
      <aside className={`ai-sessions-sidebar ${showSidebar ? 'open' : ''}`}>
        <div className="sidebar-header-row">
          <div className="sidebar-title-group">
            <div className="sidebar-icon-wrap">
              <History size={16} />
            </div>
            <h3 className="sidebar-title">Chat Sessions</h3>
          </div>
          <button 
            type="button" 
            onClick={() => setShowSidebar(false)} 
            className="sidebar-close-btn md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Start New Chat Action */}
        <button
          type="button"
          onClick={() => {
            startNewSession();
            setShowSidebar(false);
          }}
          className="start-new-chat-btn"
        >
          <Plus size={16} />
          <span>Start New Chat</span>
        </button>

        <div className="sessions-list-header">
          <span>Previous Sessions</span>
        </div>

        {/* Sessions Scroll List */}
        <div className="sessions-scroll-list">
          {conversations.map((c) => {
            const isCurrent = c.id === activeConversationId;
            return (
              <div
                key={c.id}
                onClick={() => {
                  switchSession(c);
                  setShowSidebar(false);
                }}
                className={`session-list-item ${isCurrent ? 'active' : ''}`}
              >
                <div className="session-item-content">
                  <MessageSquare size={14} className={isCurrent ? 'text-cyan' : 'text-slate'} />
                  <span className="session-item-title">{c.title}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(c.id);
                  }}
                  className="session-delete-btn"
                  title="Delete session"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── 2. Main Chat Workspace ── */}
      <main className="ai-chat-workspace">
        {/* Workspace Header */}
        <header className="ai-chat-header-bar">
          <div className="ai-header-left">
            <button
              type="button"
              onClick={() => setShowSidebar(!showSidebar)}
              className="toggle-sidebar-btn"
              title="Toggle chat sessions"
            >
              <History size={18} />
            </button>

            <div className="ai-avatar-badge">
              <Sparkles size={20} className="text-cyan animate-pulse" />
            </div>

            <div>
              <div className="ai-header-title-row">
                <h1 className="ai-title">LINC AI Advisor & Price Estimator</h1>
                <span className="ai-engine-tag">Autonomous RAG</span>
              </div>
              <p className="ai-subtitle">
                {activeTitle || 'Instant local matching & Addis market price estimation'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={startNewSession}
            className="header-new-chat-btn"
          >
            <Plus size={14} />
            <span>New Chat</span>
          </button>
        </header>

        {/* Messages Canvas */}
        <div className="ai-messages-scroll-area">
          <div className="ai-messages-stack">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`ai-message-row ${msg.role === 'assistant' ? 'assistant-row' : 'user-row'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="ai-bot-avatar">
                    <Sparkles size={16} className="text-cyan" />
                  </div>
                )}

                <div className={`ai-bubble ${msg.role === 'assistant' ? 'assistant-bubble' : 'user-bubble'}`}>
                  <div className="bubble-text-content" style={{ whiteSpace: 'pre-line' }}>
                    {msg.text}
                  </div>

                  {/* ── PRICE ESTIMATE CARD ── */}
                  {msg.priceEstimate && (
                    <div className="ai-price-estimate-card">
                      <div className="estimate-header-row">
                        <div className="estimate-title-group">
                          <DollarSign size={16} className="text-emerald" />
                          <span className="estimate-category-title">{msg.priceEstimate.category}</span>
                        </div>
                        <span className="estimate-urgency-pill">{msg.priceEstimate.urgency}</span>
                      </div>

                      <div className="estimate-main-body">
                        <div className="estimate-price-range-box">
                          <span className="estimate-range-label">Estimated Fair Market Range</span>
                          <span className="estimate-range-val">
                            {msg.priceEstimate.minPrice} – {msg.priceEstimate.maxPrice} {msg.priceEstimate.unit}
                          </span>
                        </div>

                        <div className="estimate-meta-row">
                          <span className="est-meta-item">⏱️ Duration: <strong>{msg.priceEstimate.duration}</strong></span>
                          <span className="est-meta-divider">•</span>
                          <span className="est-meta-item">📍 {msg.priceEstimate.subCityAvg}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── MATCHED PROVIDERS CARDS (UP TO 10) ── */}
                  {msg.matchedProviders && msg.matchedProviders.length > 0 && (
                    <div className="ai-providers-recommendation-section">
                      <div className="recs-header-row">
                        <Zap size={14} className="text-cyan" />
                        <span className="recs-title">
                          Fitted Verified Specialists ({msg.matchedProviders.length})
                        </span>
                      </div>

                      <div className="ai-matched-cards-grid">
                        {msg.matchedProviders.map((p) => {
                          const username = p.username || p.name?.toLowerCase().replace(/\s+/g, '_');
                          return (
                            <div key={p.id} className="ai-provider-card">
                              <div className="card-top-info-row">
                                <div 
                                  className="ai-card-avatar"
                                  style={{ backgroundColor: p.avatarColor || '#0284C7' }}
                                >
                                  <span>{p.initials || p.name?.slice(0, 2).toUpperCase()}</span>
                                  {p.verified && (
                                    <span className="ai-verified-check">✓</span>
                                  )}
                                </div>

                                <div className="ai-card-identity">
                                  <div className="ai-card-name-row">
                                    <strong className="ai-card-name">{p.name}</strong>
                                    <span className="ai-card-username">@{username}</span>
                                  </div>
                                  <p className="ai-card-headline">{p.headline}</p>

                                  <div className="ai-card-meta-strip">
                                    <span className="ai-rating">
                                      <Star size={12} fill="#F59E0B" className="text-amber" />
                                      <span>{(p.rating || 4.9).toFixed(1)}</span>
                                      <span className="meta-sub">({p.reviewsCount || 42})</span>
                                    </span>
                                    <span className="meta-dot">•</span>
                                    <span className="ai-location">
                                      <MapPin size={11} className="text-muted" />
                                      <span>{p.locationCity?.split(',')[0] || 'Addis'}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Price & Ask AI Chip Row */}
                              <div className="ai-card-pricing-ask-row">
                                <span className="ai-card-price-pill">
                                  {p.priceLabel || `${p.hourlyRate || 300} ETB/hr`}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleAskAboutProvider(username, p.name)}
                                  className="ask-ai-specialist-chip"
                                  title="Ask AI about this pro's background and past jobs"
                                >
                                  <Sparkles size={11} />
                                  <span>Ask AI about @{username}</span>
                                </button>
                              </div>

                              {/* Action Buttons */}
                              <div className="ai-card-actions-row">
                                <button
                                  type="button"
                                  onClick={() => navigate(`/booking/${p.id}`)}
                                  className="ai-card-book-btn"
                                >
                                  <Zap size={13} />
                                  <span>Book with Escrow</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => navigate(`/provider/${p.id}`)}
                                  className="ai-card-profile-btn"
                                >
                                  <span>View Profile</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <span className="message-timestamp">{msg.timestamp}</span>
                </div>

                {msg.role === 'user' && (
                  <div className="user-avatar-wrap">
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="ai-message-row assistant-row">
                <div className="ai-bot-avatar">
                  <Sparkles size={16} className="text-cyan animate-spin" />
                </div>
                <div className="ai-bubble assistant-bubble typing-bubble">
                  <div className="typing-dots-anim">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                  <span className="typing-text">Analyzing Addis providers & market prices...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggested Quick Prompts Carousel */}
        <div className="ai-suggested-prompts-bar">
          <span className="prompts-label">Quick Prompts:</span>
          <div className="prompts-scroll-container">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                className="ai-prompt-chip"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="ai-input-form-bar">
          <div className="ai-input-container">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Describe your issue in English or Amharic (e.g. 'Emergency plumber in Bole' or 'የቤት ጽዳት')..."
              className="ai-main-input"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="ai-send-action-btn"
              title="Send message to AI"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
