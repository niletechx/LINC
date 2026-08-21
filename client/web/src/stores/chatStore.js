import { create } from 'zustand';
import { MOCK_PROVIDERS } from '../data/mockData';

const ENRICHED_CONVERSATIONS = [
  {
    id: 'conv-1',
    providerId: '1',
    name: 'Abebe Girma',
    headline: 'Master Plumber & Pipe Specialist',
    initials: 'AG',
    avatarColor: '#0284C7',
    online: true,
    isVerified: true,
    lastMsg: 'Here is the custom quote for your PPR pipe repair.',
    time: '2:15 PM',
    unread: 0,
    messages: [
      {
        id: 'm-1',
        fromMe: true,
        text: 'Selam Abebe, I have a leaking pipe under my kitchen sink in Bole Rwanda. Are you available today?',
        time: '2:10 PM',
      },
      {
        id: 'm-2',
        fromMe: false,
        text: 'Selam! Yes, I am currently near Edna Mall and can arrive in about 20 minutes with PPR fittings and tools.',
        time: '2:12 PM',
      },
      {
        id: 'm-3',
        fromMe: false,
        type: 'quote',
        serviceName: 'Emergency Pipe Leak & Fitting Replacement',
        price: 650,
        currency: 'ETB',
        duration: '1–2 hours',
        validUntil: 'Today, 6:00 PM',
        time: '2:14 PM',
      },
      {
        id: 'm-4',
        fromMe: false,
        text: 'You can accept the quote above to lock your deposit in Chapa Escrow. I will only be paid once you inspect the repair.',
        time: '2:15 PM',
      },
    ],
  },
  {
    id: 'conv-2',
    providerId: '2',
    name: 'Bethlehem Tadesse',
    headline: 'Eco-Friendly Residential Cleaning Lead',
    initials: 'BT',
    avatarColor: '#10B981',
    online: true,
    isVerified: true,
    lastMsg: 'Great! My 3-person team will arrive at 9:00 AM tomorrow.',
    time: '11:30 AM',
    unread: 1,
    messages: [
      {
        id: 'm-201',
        fromMe: true,
        text: 'Hello Bethlehem, does your deep cleaning package include steam sanitization for carpets?',
        time: '11:20 AM',
      },
      {
        id: 'm-202',
        fromMe: false,
        text: 'Yes! We bring our own organic supplies and steam machines. It covers all 3 bedrooms, living room, and kitchen.',
        time: '11:25 AM',
      },
      {
        id: 'm-203',
        fromMe: false,
        text: 'Great! My 3-person team will arrive at 9:00 AM tomorrow.',
        time: '11:30 AM',
      },
    ],
  },
  {
    id: 'conv-3',
    providerId: '3',
    name: 'Dawit Mengistu',
    headline: 'Senior Computer & Electronics Technician',
    initials: 'DM',
    avatarColor: '#D97706',
    online: false,
    isVerified: true,
    lastMsg: 'I recovered all data from your SSD. Working perfectly!',
    time: 'Yesterday',
    unread: 0,
    messages: [
      {
        id: 'm-301',
        fromMe: true,
        text: 'Hi Dawit, my laptop shut down after a water spill. Can you diagnose it?',
        time: 'Yesterday',
      },
      {
        id: 'm-302',
        fromMe: false,
        text: 'I recovered all data from your SSD. Working perfectly!',
        time: 'Yesterday',
      },
    ],
  },
];

export const useChatStore = create((set, get) => ({
  conversations: ENRICHED_CONVERSATIONS,
  activeConversationId: 'conv-1',
  isAiAdvisorAnalyzing: false,

  // Call simulation state
  activeCall: null, // { provider, type: 'voice' | 'video', status: 'ringing' | 'connected' }

  setActiveConversationId: (id) => {
    set((state) => ({
      activeConversationId: id,
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, unread: 0 } : c
      ),
    }));
  },

  getActiveConversation: () => {
    const { conversations, activeConversationId } = get();
    if (!activeConversationId) return null;
    return conversations.find((c) => c.id === activeConversationId) || null;
  },

  startConversationWithProvider: (provider) => {
    const { conversations } = get();
    const existing = conversations.find(
      (c) => c.providerId === String(provider.id) || c.name === provider.name
    );

    if (existing) {
      set({ activeConversationId: existing.id });
      return existing.id;
    }

    const newConvo = {
      id: `conv-${Date.now()}`,
      providerId: String(provider.id),
      name: provider.name,
      headline: provider.headline || 'Verified Specialist',
      initials: provider.initials || provider.name?.slice(0, 2).toUpperCase(),
      avatarColor: provider.avatarColor || '#0284C7',
      lastMsg: `Started conversation with ${provider.name}`,
      time: 'Just now',
      unread: 0,
      online: true,
      isVerified: provider.verified !== false,
      messages: [
        {
          id: `m-init-${Date.now()}`,
          fromMe: false,
          text: `👋 Selam! Thanks for reaching out. How can I help you today?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    set({
      conversations: [newConvo, ...conversations],
      activeConversationId: newConvo.id,
    });

    return newConvo.id;
  },

  sendMessage: (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const { activeConversationId, getActiveConversation } = get();
    const activeConvo = getActiveConversation();
    if (!activeConvo) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Handle @AI Trust Check
    if (trimmed.toLowerCase().includes('@ai') || trimmed.toLowerCase().includes('trust check') || trimmed.toLowerCase().includes('trust advisor')) {
      const userMsg = {
        id: `m-${Date.now()}`,
        fromMe: true,
        text: trimmed,
        time: timeStr,
      };

      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === activeConversationId
            ? { ...c, lastMsg: trimmed, time: 'Just now', messages: [...c.messages, userMsg] }
            : c
        ),
        isAiAdvisorAnalyzing: true,
      }));

      setTimeout(() => {
        const providerData = MOCK_PROVIDERS.find(p => p.id === activeConvo.providerId) || {
          name: activeConvo.name,
          rating: 4.9,
          completedJobs: 85,
          responseTime: '~5 min',
          locationCity: 'Addis Ababa',
        };

        const aiTrustMsg = {
          id: `m-trust-${Date.now()}`,
          fromMe: false,
          type: 'ai_trust',
          providerName: providerData.name,
          trustScore: 98,
          completedJobs: providerData.completedJobs || 85,
          onTimeRate: '99%',
          complaints: 0,
          responseTime: providerData.responseTime || '~5 min',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        set((state) => ({
          isAiAdvisorAnalyzing: false,
          conversations: state.conversations.map((c) =>
            c.id === activeConversationId
              ? { ...c, messages: [...c.messages, aiTrustMsg] }
              : c
          ),
        }));
      }, 900);

      return;
    }

    const userMsg = {
      id: `m-${Date.now()}`,
      fromMe: true,
      text: trimmed,
      time: timeStr,
    };

    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              lastMsg: trimmed,
              time: 'Just now',
              messages: [...c.messages, userMsg],
            }
          : c
      ),
    }));

    // Simulated quick specialist auto-reply
    setTimeout(() => {
      const autoReplyText = `Thanks for the details! I received your message: "${trimmed}". Let me check my tools and schedule, or feel free to initiate the Chapa Escrow booking whenever you are ready.`;
      const replyMsg = {
        id: `m-reply-${Date.now()}`,
        fromMe: false,
        text: autoReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === activeConversationId
            ? {
                ...c,
                lastMsg: autoReplyText,
                time: 'Just now',
                messages: [...c.messages, replyMsg],
              }
            : c
        ),
      }));
    }, 1500);
  },

  startCall: (provider, type = 'voice') => {
    set({
      activeCall: {
        provider,
        type,
        status: 'ringing',
        startTime: Date.now(),
      },
    });

    // Auto-connect call after 2 seconds
    setTimeout(() => {
      const current = get().activeCall;
      if (current) {
        set({
          activeCall: {
            ...current,
            status: 'connected',
          },
        });
      }
    }, 2200);
  },

  endCall: () => {
    set({ activeCall: null });
  },
}));
