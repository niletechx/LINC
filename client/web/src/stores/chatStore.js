import { create } from 'zustand';
import { MOCK_CONVERSATIONS, MOCK_PROVIDERS } from '../data/mockData';

export const useChatStore = create((set, get) => ({
  conversations: MOCK_CONVERSATIONS,
  activeConversationId: MOCK_CONVERSATIONS[0]?.id || '1',
  isAiAdvisorAnalyzing: false,

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
    return conversations.find((c) => c.id === activeConversationId) || conversations[0];
  },

  /**
   * Start or open DM with a provider
   */
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
      headline: provider.headline,
      initials: provider.initials || provider.name.split(' ').map((n) => n[0]).join(''),
      avatarColor: provider.avatarColor || '#7EC8E3',
      lastMsg: `Started conversation with ${provider.name}`,
      time: 'Just now',
      unread: 0,
      online: true,
      isVerified: provider.verified,
      messages: [
        {
          id: `m-init-${Date.now()}`,
          fromMe: false,
          text: `Hello! Thanks for reaching out. How can I help you today?`,
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

  /**
   * Send a direct message in the active conversation
   */
  sendMessage: async (text) => {
    if (!text.trim()) return;

    const { activeConversationId, getActiveConversation } = get();
    const activeConvo = getActiveConversation();
    if (!activeConvo) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: `m-${Date.now()}`,
      fromMe: true,
      text: text.trim(),
      time: timeStr,
    };

    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              lastMsg: text.trim(),
              time: 'Just now',
              messages: [...c.messages, userMsg],
            }
          : c
      ),
    }));

    // Detect @AI or Trust Advisor keyword in chat
    if (text.includes('@AI') || text.includes('@ai') || text.toLowerCase().includes('trust advisor')) {
      set({ isAiAdvisorAnalyzing: true });

      setTimeout(() => {
        const providerData = MOCK_PROVIDERS.find(
          (p) => p.id === activeConvo.providerId || p.name === activeConvo.name
        ) || {
          name: activeConvo.name,
          rating: 4.9,
          completedJobs: 50,
          verified: true,
          matchScore: 95,
        };

        const advisorMsg = {
          id: `m-ai-advisor-${Date.now()}`,
          fromMe: false,
          isAiAdvisor: true,
          text: `🛡️ **LINC Trust Advisor Report on ${providerData.name}**:\n• **Identity Status**: National ID & Skill Verified ✅\n• **Platform Track Record**: ${providerData.completedJobs || 85} completed jobs with ${(providerData.rating || 4.9).toFixed(1)}★ rating.\n• **Safety Recommendation**: Agree on scope and initiate **Chapa Escrow Booking** before work starts to protect your payment.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        set((state) => ({
          isAiAdvisorAnalyzing: false,
          conversations: state.conversations.map((c) =>
            c.id === activeConversationId
              ? {
                  ...c,
                  messages: [...c.messages, advisorMsg],
                }
              : c
          ),
        }));
      }, 1000);
    }
  },
}));
