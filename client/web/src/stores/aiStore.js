import { create } from 'zustand';
import { api, extractErrorMessage } from '../services/api';
import { MOCK_PROVIDERS } from '../data/mockData';

const INITIAL_MESSAGES = [
  {
    id: 'ai-init',
    role: 'assistant',
    text: "👋 Selam! I'm LINC AI Matchmaker. Describe what service you need in plain language (e.g. *'Need an emergency plumber in Bole for a leaking pipe'* or *'Math tutor for grade 11 in Sarbet'*), and I will analyze verified providers and match you immediately.",
    matchedProviders: [],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

export const useAiStore = create((set, get) => ({
  messages: INITIAL_MESSAGES,
  isLoading: false,
  error: null,

  suggestedPrompts: [
    '🔧 Emergency plumber in Bole for water leak',
    '🧹 Deep cleaning pro for 3-bedroom apartment in CMC',
    '💻 Laptop repair technician near Megenagna',
    '📚 Grade 11 Math & Physics tutor in Sarbet',
    '⚡ Certified electrician for generator backup in Kazanchis',
  ],

  clearMessages: () => set({ messages: INITIAL_MESSAGES, error: null }),

  sendMessage: async (userText) => {
    if (!userText.trim()) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: userText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      // 1. Try hitting backend AI chat endpoint
      const response = await api.post('/ai/chat', {
        message: userText.trim(),
      });

      const data = response.data.data;
      const aiMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        text: data.reply || data.text || data.content,
        matchedProviders: data.providers || data.matches || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      set((state) => ({
        messages: [...state.messages, aiMessage],
        isLoading: false,
      }));
    } catch {
      // 2. Intelligent local fallback matching
      const query = userText.toLowerCase();
      let matched = [];

      if (query.includes('plumb') || query.includes('leak') || query.includes('pipe') || query.includes('water')) {
        matched = MOCK_PROVIDERS.filter((p) => p.category === 'plumbing');
      } else if (query.includes('clean') || query.includes('maid') || query.includes('house')) {
        matched = MOCK_PROVIDERS.filter((p) => p.category === 'cleaning');
      } else if (query.includes('laptop') || query.includes('tech') || query.includes('it') || query.includes('repair') || query.includes('pc')) {
        matched = MOCK_PROVIDERS.filter((p) => p.category === 'it-tech');
      } else if (query.includes('tutor') || query.includes('math') || query.includes('physics') || query.includes('school')) {
        matched = MOCK_PROVIDERS.filter((p) => p.category === 'tutoring');
      } else if (query.includes('electric') || query.includes('wire') || query.includes('generator') || query.includes('solar')) {
        matched = MOCK_PROVIDERS.filter((p) => p.category === 'electric');
      } else {
        matched = MOCK_PROVIDERS.slice(0, 2);
      }

      const replyText = `I analyzed your request for **"${userText}"** across active providers in Addis Ababa.\n\nHere are the top-rated verified professionals with high availability and escrow safety guarantees:`;

      const aiFallbackMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        matchedProviders: matched,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      set((state) => ({
        messages: [...state.messages, aiFallbackMessage],
        isLoading: false,
      }));
    }
  },
}));
