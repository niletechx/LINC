import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Send, Sparkles, Phone, Video, MoreVertical, MessageSquare, ShieldCheck } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';

export default function MessagesPage() {
  const navigate = useNavigate();
  const { conversations, activeConversationId, setActiveConversation, sendMessage } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typedMessage, setTypedMessage] = useState('');

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const filtered = searchQuery.trim() === ''
    ? conversations
    : conversations.filter((c) => 
        c.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) || 
        c.lastMsg.toLowerCase().includes(searchQuery.trim().toLowerCase())
      );

  const handleSend = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeConv) return;
    sendMessage(activeConv.id, typedMessage.trim());
    setTypedMessage('');
  };

  return (
    <div className="messages-layout-container">
      {/* ── Left Column: Conversations List Sidebar ── */}
      <aside className="messages-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Direct Messages</h2>
          <div className="sidebar-search-box">
            <Search size={15} style={{ position: 'absolute', left: '12px', color: '#94A3B8' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="sidebar-search-input"
            />
          </div>
        </div>

        <div className="conversations-list">
          {filtered.length > 0 ? (
            filtered.map((conv) => {
              const isActive = activeConv?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversation(conv.id)}
                  className={`conversation-item ${isActive ? 'active' : ''}`}
                >
                  <div className="convo-avatar-wrapper">
                    <div className="convo-avatar" style={{ backgroundColor: conv.avatarColor || '#0284C7' }}>
                      <span>{conv.initials || conv.name?.slice(0, 2).toUpperCase()}</span>
                    </div>
                    {conv.online && <span className="convo-online-dot" />}
                  </div>

                  <div className="convo-info">
                    <div className="convo-top-row">
                      <span className="convo-name">{conv.name}</span>
                      <span className="convo-time">{conv.time || '12:45 PM'}</span>
                    </div>
                    <p className="convo-last-msg">{conv.lastMsg || 'Tap to open chat...'}</p>
                  </div>

                  {conv.unread > 0 && (
                    <span className="convo-unread-pill">{conv.unread}</span>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
              No conversations found
            </div>
          )}
        </div>
      </aside>

      {/* ── Right Column: Active Conversation Pane ── */}
      {activeConv ? (
        <section className="chat-thread-pane">
          {/* Thread Header */}
          <div className="chat-thread-header">
            <div className="chat-header-user">
              <div className="convo-avatar" style={{ width: '38px', height: '38px', backgroundColor: activeConv.avatarColor || '#0284C7' }}>
                <span>{activeConv.initials || activeConv.name?.slice(0, 2).toUpperCase()}</span>
              </div>
              <div>
                <h3 className="chat-header-name">{activeConv.name}</h3>
                <span className="chat-header-status">{activeConv.headline || 'Verified Specialist'} • Bole, Addis Ababa</span>
              </div>
            </div>

            <div className="chat-header-actions">
              <button
                type="button"
                onClick={() => navigate(`/booking/${activeConv.id}`)}
                className="btn btn-primary btn-sm"
              >
                <span>Book Service</span>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="chat-messages-area">
            <div className="chat-messages-list">
              {/* LINC AI Escrow Tip */}
              <div className="advisor-message-box">
                <div className="advisor-box-header">
                  <Sparkles size={14} className="text-cyan" />
                  <span className="advisor-box-title">LINC AI Escrow Shield</span>
                </div>
                <p className="advisor-box-body">
                  Always use LINC Escrow payments. Never make direct cash deposits outside the platform to stay protected against fraud or incomplete work.
                </p>
              </div>

              {(activeConv.messages || []).map((msg, index) => {
                const isMe = msg.sender === 'me' || msg.isMe;
                return (
                  <div key={index} className={`chat-bubble-row ${isMe ? 'from-me' : 'from-them'}`}>
                    <div className={`chat-bubble ${isMe ? 'bubble-me' : 'bubble-them'}`}>
                      <span>{msg.text}</span>
                      <span className="bubble-footer">{msg.time || 'Now'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSend} className="chat-input-form">
            <input
              type="text"
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              placeholder={`Message ${activeConv.name}...`}
              className="chat-input-field"
            />
            <button type="submit" disabled={!typedMessage.trim()} className="chat-send-btn">
              <Send size={16} />
            </button>
          </form>
        </section>
      ) : (
        <section className="chat-thread-pane" style={{ alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
          <MessageSquare size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p style={{ fontWeight: 600 }}>Select a conversation on the left to start messaging</p>
        </section>
      )}
    </div>
  );
}
