import { create } from 'zustand';
import { api, extractErrorMessage } from '../services/api';
import { MOCK_PROVIDERS } from '../data/mockData';

const INITIAL_WELCOME_MESSAGE = {
  id: 'ai-init',
  role: 'assistant',
  text: "👋 **Selam! I'm LINC AI Advisor & Matchmaker.**\n\nDescribe what service you need in English or Amharic (e.g. *'Need emergency plumber for pipe leak in Bole'* or *'የመኖሪያ ቤት ጽዳት በሲኤምሲ'*). I will analyze verified providers in Addis Ababa and calculate the fair market price range for you.",
  matchedProviders: [],
  priceEstimate: null,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const BILINGUAL_PROMPTS = [
  '🔧 Emergency plumber for pipe leak in Bole',
  '🧹 የ3 መኝታ ቤት ሙሉ ጽዳት በሲኤምሲ (Deep cleaning)',
  '💻 Laptop motherboard & SSD repair in Megenagna',
  '📚 የ11ኛ ክፍል የሂሳብና ፊዚክስ መምህር በሳርቤት (Tutor)',
  '⚡ Electrician for solar inverter & backup in Kazanchis',
  '🚗 Mobile mechanic for battery jump & diagnostics in Gerji',
];

const INITIAL_CONVERSATIONS = [
  { id: 'conv-1', title: 'Plumbing Repair in Bole', date: 'Today' },
  { id: 'conv-2', title: 'Apartment Deep Cleaning', date: 'Yesterday' },
];

export const useAiStore = create((set, get) => ({
  conversations: INITIAL_CONVERSATIONS,
  activeConversationId: 'conv-1',
  activeTitle: 'Plumbing Repair in Bole',
  messages: [INITIAL_WELCOME_MESSAGE],
  isLoading: false,
  error: null,
  suggestedPrompts: BILINGUAL_PROMPTS,

  loadSessions: async () => {
    try {
      const res = await api.get('/ai/conversations');
      const list = res.data.data;
      if (list && list.length > 0) {
        set({ conversations: list });
      }
    } catch {
      // Fallback to local sessions
    }
  },

  switchSession: async (session) => {
    const sessionId = session.id || session;
    const title = session.title || 'Conversation';
    set({
      activeConversationId: sessionId,
      activeTitle: title,
      isLoading: true,
      error: null,
    });

    try {
      const res = await api.get(`/ai/conversations/${sessionId}/messages`);
      const msgs = res.data.data;
      if (msgs && msgs.length > 0) {
        set({
          messages: msgs.map(m => ({
            id: m.id,
            role: m.role,
            text: m.content || m.text,
            matchedProviders: m.metadata?.providers || [],
            priceEstimate: m.metadata?.priceEstimate || null,
            timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Earlier',
          })),
          isLoading: false,
        });
        return;
      }
    } catch {
      // Local fallback
    }

    set({
      messages: [INITIAL_WELCOME_MESSAGE],
      isLoading: false,
    });
  },

  startNewSession: () => {
    const newId = `conv-${Date.now()}`;
    const newSession = {
      id: newId,
      title: 'New Conversation',
      date: 'Just now',
    };

    set((state) => ({
      conversations: [newSession, ...state.conversations],
      activeConversationId: newId,
      activeTitle: 'New Conversation',
      messages: [
        {
          ...INITIAL_WELCOME_MESSAGE,
          id: `ai-init-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ],
      error: null,
    }));
  },

  deleteSession: (sessionId) => {
    set((state) => {
      const updated = state.conversations.filter(c => c.id !== sessionId);
      const isCurrent = state.activeConversationId === sessionId;
      const nextActive = updated[0];

      return {
        conversations: updated,
        activeConversationId: isCurrent ? (nextActive ? nextActive.id : null) : state.activeConversationId,
        activeTitle: isCurrent ? (nextActive ? nextActive.title : 'New Conversation') : state.activeTitle,
        messages: isCurrent ? [INITIAL_WELCOME_MESSAGE] : state.messages,
      };
    });
  },

  sendMessage: async (userText) => {
    const text = userText.trim();
    if (!text) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    // Update conversation title if it was "New Conversation"
    const currentTitle = get().activeTitle;
    if (currentTitle === 'New Conversation') {
      const shortTitle = text.slice(0, 32) + (text.length > 32 ? '...' : '');
      set((state) => ({
        activeTitle: shortTitle,
        conversations: state.conversations.map(c => 
          c.id === state.activeConversationId ? { ...c, title: shortTitle } : c
        ),
      }));
    }

    try {
      // 1. Attempt call to server AI API
      const response = await api.post('/ai/chat', {
        message: text,
        conversationId: get().activeConversationId,
      });

      const data = response.data.data;
      const aiMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        text: data.reply || data.text || data.message || data.content,
        matchedProviders: data.providers || data.matches || [],
        priceEstimate: data.priceEstimate || data.intent?.budget_max ? {
          range: `300 – ${data.intent.budget_max || 600} ETB`,
          duration: '1–2 hours',
          urgency: data.intent.urgency || 'medium',
        } : null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      set((state) => ({
        messages: [...state.messages, aiMessage],
        isLoading: false,
      }));
    } catch {
      // 2. Intelligent local rule-based matching & price estimation engine
      setTimeout(() => {
        const query = text.toLowerCase();
        let matched = [];
        let priceEst = {
          category: 'General Service',
          minPrice: 250,
          maxPrice: 600,
          unit: 'ETB',
          duration: '1–3 hours',
          urgency: 'Standard',
          subCityAvg: 'Bole / Kazanchis area average',
        };

        if (query.includes('plumb') || query.includes('leak') || query.includes('pipe') || query.includes('ቧንቧ') || query.includes('water')) {
          matched = MOCK_PROVIDERS.filter((p) => p.category === 'plumbing');
          priceEst = {
            category: 'Plumbing & Pipe Repair',
            minPrice: 300,
            maxPrice: 800,
            unit: 'ETB',
            duration: '1–2 hours',
            urgency: query.includes('urgent') || query.includes('emergency') || query.includes('አስቸኳይ') ? '🚨 Emergency (Same-day)' : '⚡ Available Today',
            subCityAvg: 'Typical in Addis: 300 ETB/hr labor + materials',
          };
        } else if (query.includes('clean') || query.includes('maid') || query.includes('ጽዳት') || query.includes('house')) {
          matched = MOCK_PROVIDERS.filter((p) => p.category === 'cleaning');
          priceEst = {
            category: 'Residential Deep Cleaning',
            minPrice: 500,
            maxPrice: 1800,
            unit: 'ETB',
            duration: '3–6 hours',
            urgency: 'Flexible Schedule',
            subCityAvg: 'Typical in Addis: 250 ETB/hr (Packages from 1,200 ETB)',
          };
        } else if (query.includes('laptop') || query.includes('tech') || query.includes('it') || query.includes('repair') || query.includes('ላፕቶፕ') || query.includes('pc')) {
          matched = MOCK_PROVIDERS.filter((p) => p.category === 'it-tech');
          priceEst = {
            category: 'IT & Hardware Diagnostics',
            minPrice: 400,
            maxPrice: 1200,
            unit: 'ETB',
            duration: '1–4 hours',
            urgency: 'Same-day Onsite',
            subCityAvg: 'Diagnostics from 400 ETB + component costs',
          };
        } else if (query.includes('tutor') || query.includes('math') || query.includes('physics') || query.includes('ትምህርት') || query.includes('መምህር')) {
          matched = MOCK_PROVIDERS.filter((p) => p.category === 'tutoring');
          priceEst = {
            category: 'Academic Tutoring (Grade 7–12)',
            minPrice: 350,
            maxPrice: 600,
            unit: 'ETB/session',
            duration: '1.5 hours',
            urgency: 'Weekly Plan Available',
            subCityAvg: '350 ETB per 1-on-1 session',
          };
        } else if (query.includes('electric') || query.includes('wire') || query.includes('ኤሌክትሪክ') || query.includes('solar') || query.includes('generator')) {
          matched = MOCK_PROVIDERS.filter((p) => p.category === 'electric');
          priceEst = {
            category: 'Electrical & Backup Installation',
            minPrice: 350,
            maxPrice: 1500,
            unit: 'ETB',
            duration: '2–4 hours',
            urgency: '⚡ Certified Inspection',
            subCityAvg: 'Short circuit troubleshooting ~350 ETB/hr',
          };
        } else if (query.includes('mechanic') || query.includes('car') || query.includes('መኪና') || query.includes('jump')) {
          matched = MOCK_PROVIDERS.filter((p) => p.category === 'transport');
          priceEst = {
            category: 'Mobile Automotive Diagnostics',
            minPrice: 400,
            maxPrice: 900,
            unit: 'ETB',
            duration: '30–60 mins',
            urgency: '🚨 Mobile Roadside Support',
            subCityAvg: 'Onsite scan ~600 ETB with live OBD report',
          };
        } else {
          matched = MOCK_PROVIDERS.slice(0, 3);
        }

        const replyText = `I analyzed your request: **"${text}"** across verified specialists in Addis Ababa.\n\nHere is the estimated fair market price breakdown and the top matching professionals with high customer ratings and Chapa Escrow protection:`;

        const aiFallbackMessage = {
          id: `msg-ai-${Date.now()}`,
          role: 'assistant',
          text: replyText,
          matchedProviders: matched,
          priceEstimate: priceEst,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        set((state) => ({
          messages: [...state.messages, aiFallbackMessage],
          isLoading: false,
        }));
      }, 750);
    }
  },
}));
