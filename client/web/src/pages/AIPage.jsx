import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Send, User, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { MOCK_PROVIDERS } from '../data/mockData';
import { useAppStore } from '../stores/appStore';
import { useAuthStore } from '../stores/authStore';
import ProviderCard from '../components/provider/ProviderCard';

const INITIAL_MESSAGES = [
  {
    id: 'intro-1',
    role: 'assistant',
    text: 'Hello! I am **LINC AI Advisor** 🇪🇹\n\nTell me what service you need (in English or Amharic), your location in Addis Ababa, and your budget. I will find and verify the top available specialists for you in real-time.',
    time: 'Just now',
  },
];

const QUICK_PROMPTS = [
  'Need emergency plumber for pipe leak in Bole',
  'Looking for high school Math tutor near CMC',
  'Best house cleaning service with great reviews',
  'Electrician to fix circuit breaker in Kazanchis',
];

export default function AIPage() {
  const navigate = useNavigate();
  const { currentLocation, openAuthModal } = useAppStore();
  const { isAuthenticated } = useAuthStore();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [queryCount, setQueryCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputVal).trim();
    if (!text) return;

    if (!isAuthenticated && queryCount >= 2) {
      openAuthModal('Create a free account or sign in to continue chatting with LINC AI and book specialists.');
      return;
    }

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);
    setQueryCount((c) => c + 1);

    // AI Response matching simulation
    setTimeout(() => {
      setIsTyping(false);
      const lower = text.toLowerCase();
      let matched = MOCK_PROVIDERS;
      if (lower.includes('plumb') || lower.includes('pipe') || lower.includes('leak')) {
        matched = MOCK_PROVIDERS.filter((p) => p.category === 'plumbing');
      } else if (lower.includes('clean')) {
        matched = MOCK_PROVIDERS.filter((p) => p.category === 'cleaning');
      } else if (lower.includes('tutor') || lower.includes('math')) {
        matched = MOCK_PROVIDERS.filter((p) => p.category === 'tutoring');
      } else if (lower.includes('electr')) {
        matched = MOCK_PROVIDERS.filter((p) => p.category === 'electric');
      }

      const aiResponse = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: `I analyzed available verified professionals in **${currentLocation || 'Addis Ababa'}** and found ${matched.length} top-ranked specialist${matched.length > 1 ? 's' : ''} with high trust scores for your task:`,
        matchedProviders: matched.slice(0, 3),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiResponse]);
    }, 1200);
  };

  return (
    <div className="ai-container">
      {/* AI Header */}
      <div className="ai-chat-header">
        <div className="ai-header-left">
          <div className="ai-avatar-badge">
            <Sparkles size={22} className="text-cyan animate-pulse" />
          </div>
          <div>
            <div className="ai-header-title-row">
              <h1 className="ai-title">LINC AI Advisor</h1>
              <span className="ai-engine-tag">Autonomous Matchmaker</span>
            </div>
            <p className="ai-subtitle">Instant local matching with verified Ethiopian professionals</p>
          </div>
        </div>

        {!isAuthenticated && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/login" className="btn btn-outline btn-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#ffffff' }}>
              <LogIn size={13} />
              <span>Sign In</span>
            </Link>
            <Link to="/signup" className="btn btn-primary btn-sm">
              <UserPlus size={13} />
              <span>Join Free</span>
            </Link>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="ai-messages-scroll-area">
        <div className="ai-messages-list">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`ai-message-bubble-row ${msg.role === 'assistant' ? 'assistant-row' : 'user-row'}`}
            >
              <div className="ai-avatar-circle">
                {msg.role === 'assistant' ? <Sparkles size={16} className="text-cyan" /> : <User size={16} className="text-white" />}
              </div>

              <div className={`ai-message-bubble ${msg.role === 'assistant' ? 'assistant-bubble' : 'user-bubble'}`}>
                <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>

                {msg.matchedProviders && msg.matchedProviders.length > 0 && (
                  <div className="ai-matched-providers-grid">
                    {msg.matchedProviders.map((p) => (
                      <ProviderCard key={p.id} provider={p} />
                    ))}
                  </div>
                )}

                <span className="ai-message-time">{msg.time}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="ai-message-bubble-row assistant-row">
              <div className="ai-avatar-circle">
                <Sparkles size={16} className="text-cyan" />
              </div>
              <div className="ai-message-bubble assistant-bubble typing-bubble">
                <div className="typing-indicator">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Searching verified providers...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="suggested-prompts-bar">
        <span className="prompts-label">Quick Prompts:</span>
        <div className="prompts-carousel">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="prompt-chip"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="ai-input-form">
        <div className="ai-input-wrapper">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask AI to find a specialist or answer service questions..."
            className="ai-chat-input"
          />
          <button type="submit" disabled={!inputVal.trim()} className="ai-send-btn">
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
