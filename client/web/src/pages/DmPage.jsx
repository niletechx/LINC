import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Phone, Video, Send, Paperclip, CheckCircle, X } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';

export default function DmPage() {
  const { id } = useParams(); // conversation id
  const navigate = useNavigate();
  const { conversations, messages, sendMessage, fetchConversations, activeConversationId, setActiveConversation } = useChatStore();
  
  const [inputText, setInputText] = useState('');
  const [showAITrust, setShowAITrust] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    setActiveConversation(id);
  }, [id, fetchConversations, setActiveConversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeConversationId]);

  const conv = conversations.find(c => c.id === id) || {
    id, providerId: '1', name: 'Provider', initials: 'P', color: '#0284C7', online: true
  };

  const msgs = messages[id] || [];

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    if (inputText.trim() === '@AI trust check') {
      setShowAITrust(true);
      setInputText('');
      return;
    }

    sendMessage(id, inputText);
    setInputText('');
  };

  const quickReplies = ['@AI trust check', 'Are you available today?', 'Is price negotiable?', 'What is your location?', 'I paid via Escrow 🛡️'];

  return (
    <div className="bg-[#F1F5F9] h-screen flex flex-col">
      {/* App Bar */}
      <header className="bg-[#7EC8E3] px-3 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate('/messages')} className="p-1 -ml-1">
            <ChevronLeft className="text-[#1E5F7A]" size={24} />
          </button>
          <div 
            className="w-[34px] h-[34px] rounded-[11px] ml-1 mr-2.5 flex justify-center items-center text-white text-[12px] font-bold"
            style={{ backgroundColor: conv.color || '#0284C7' }}
          >
            {conv.initials}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className="text-[#0F172A] text-[14px] font-semibold">{conv.name}</span>
              <CheckCircle size={13} className="text-blue-500 ml-1" />
            </div>
            <div className="flex items-center">
              {conv.online && <div className="w-[6px] h-[6px] bg-[#059669] rounded-full mr-1"></div>}
              <span className={`text-[11px] ${conv.online ? 'text-[#059669]' : 'text-[#1E5F7A]'}`}>
                {conv.online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex">
          <button className="w-[34px] h-[34px] m-1 rounded-[9px] bg-white/35 flex justify-center items-center">
            <Phone size={16} className="text-[#1E5F7A]" />
          </button>
          <button className="w-[34px] h-[34px] m-1 rounded-[9px] bg-white/35 flex justify-center items-center">
            <Video size={16} className="text-[#1E5F7A]" />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3.5 pt-3.5 flex flex-col" ref={scrollRef}>
        <div className="flex items-center my-2">
          <div className="flex-1 h-[1px] bg-[#E2E8F0]"></div>
          <span className="px-2 text-[10.5px] font-semibold text-[#94A3B8]">Today</span>
          <div className="flex-1 h-[1px] bg-[#E2E8F0]"></div>
        </div>

        {msgs.length === 0 && (
          <div className="py-10 flex flex-col items-center">
            <span className="text-[36px]">👋</span>
            <span className="text-[13px] font-semibold text-[#64748B] mt-2">Say hello to {conv.name}!</span>
            <span className="text-[11px] text-[#94A3B8] text-center mt-1 max-w-[250px]">
              Start discussing your project requirements, schedule, or pricing.
            </span>
          </div>
        )}

        {msgs.map((msg, i) => (
          <div key={i} className={`flex mb-1.5 items-end ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
            {!msg.fromMe && (
              <div 
                className="w-6 h-6 rounded-[8px] flex justify-center items-center text-white text-[8px] font-extrabold mr-1.5 shrink-0"
                style={{ backgroundColor: conv.color || '#0284C7' }}
              >
                {conv.initials}
              </div>
            )}
            <div className={`flex flex-col ${msg.fromMe ? 'items-end' : 'items-start'}`}>
              <div 
                className={`max-w-[248px] px-3 py-2 rounded-t-[14px] ${msg.fromMe ? 'bg-[#7EC8E3] rounded-bl-[14px] rounded-br-[4px] text-white' : 'bg-white rounded-bl-[4px] rounded-br-[14px] text-[#1E293B]'} text-[13px] font-medium leading-[1.5] shadow-[0_1px_2px_rgba(0,0,0,0.05)]`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-[#94A3B8] mt-0.5">{msg.time}</span>
            </div>
          </div>
        ))}

        {showAITrust && (
          <div className="mt-3 mb-4 bg-[#0F172A]/90 backdrop-blur-sm rounded-[16px] border border-[#7EC8E3]/20 p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <div className="w-[28px] h-[28px] rounded-full bg-gradient-to-r from-[#7EC8E3] to-[#06B6D4] flex justify-center items-center">
                  <span className="text-white text-[10px]">✨</span>
                </div>
                <div className="ml-2 flex flex-col">
                  <span className="text-[12px] font-bold text-[#E2E8F0]">AI Trust Advisor</span>
                  <span className="text-[10px] text-[#94A3B8]">🔒 Only visible to you</span>
                </div>
              </div>
              <button onClick={() => setShowAITrust(false)}>
                <X size={16} className="text-[#94A3B8]" />
              </button>
            </div>

            <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-[10px] px-3 py-2.5 mb-3 flex items-center">
              <span className="text-[20px] mr-2">🛡️</span>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-[#34D399]">Strong Trust Score</span>
                <span className="text-[11px] text-[#6EE7B7]">This provider has a clean record</span>
              </div>
            </div>

            <StatRow emoji="⏱️" label="On-time completion" value="98%" />
            <StatRow emoji="📉" label="Complaints / Reports" value="0" />
            <StatRow emoji="💬" label="Avg. response time" value="~5 min" />
            <StatRow emoji="💰" label="Market rate check" value="Fair (280–350 ETB/hr)" />
            
            <p className="text-[11px] text-[#64748B] text-center mt-2">Based on verified bookings and platform data</p>
          </div>
        )}
      </div>

      {/* AI Suggestion Banner */}
      {!showAITrust && (
        <div className="bg-white px-3.5 pt-1.5 flex items-center">
          <div className="w-3.5 h-3.5 rounded-[4px] bg-gradient-to-r from-[#7EC8E3] to-[#06B6D4] flex justify-center items-center">
            <span className="text-[7px]">✨</span>
          </div>
          <span className="ml-1.5 text-[10.5px] text-[#94A3B8]">
            Type <span className="font-bold text-[#0284C7]">@AI</span> for a private trust insight
          </span>
        </div>
      )}

      {/* Quick Replies */}
      <div className="bg-white px-3 py-1.5 flex overflow-x-auto hide-scrollbar gap-1.5">
        {quickReplies.map((text, i) => (
          <button 
            key={i}
            onClick={() => setInputText(text)}
            className="whitespace-nowrap px-2.5 py-1.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-[16px] text-[11.5px] font-medium text-[#475569]"
          >
            {text}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-white p-3">
        <div className="bg-[#F1F5F9] rounded-[14px] pr-1 pl-3 py-1 flex items-center">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Message or type @AI…"
            className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#0F172A] placeholder-[#94A3B8]"
          />
          <button className="w-[34px] h-[34px] bg-[#F8FAFC] rounded-[10px] flex justify-center items-center ml-1">
            <Paperclip size={16} className="text-[#94A3B8]" />
          </button>
          <button 
            onClick={handleSend}
            className="w-[34px] h-[34px] bg-[#7EC8E3] rounded-[10px] flex justify-center items-center ml-1"
          >
            <Send size={14} className="text-white -ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatRow({ emoji, label, value }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
      <div className="flex items-center">
        <span className="text-[13px]">{emoji}</span>
        <span className="text-[12px] text-[#94A3B8] ml-2">{label}</span>
      </div>
      <span className="text-[12px] font-semibold text-[#E2E8F0]">{value}</span>
    </div>
  );
}
