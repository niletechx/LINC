import { create } from 'zustand';
import { useBookingStore } from './bookingStore';

const INITIAL_REQUESTS = [
  {
    id: 'req-1',
    isMine: true,
    clientName: 'Yonas Molla (You)',
    clientPhone: '+251 911 234 567',
    clientVerified: true,
    title: 'Emergency Kitchen Pipe Leak Under Sink',
    category: 'Plumbing',
    categoryEmoji: '🔧',
    subCity: 'Bole (Rwanda)',
    landmark: 'Near Japanese Embassy / Rwanda Market',
    budget: '600–900 ETB',
    urgency: 'urgent', // 'urgent' | 'scheduled' | 'flexible'
    urgencyLabel: '⚡ Immediate (Today)',
    description: 'PPR pipe fitting under the main kitchen sink burst. Water is actively leaking into the cabinet. Need a licensed plumber with replacement pipes and compression tools today.',
    timeAgo: '15 mins ago',
    status: 'open', // 'open' | 'funded_escrow' | 'completed'
    bids: [
      {
        id: 'bid-101',
        providerId: '1',
        providerName: 'Abebe Girma',
        providerHeadline: 'Master Plumber & Pipe Specialist',
        providerInitials: 'AG',
        providerAvatarColor: '#0284C7',
        rating: 4.9,
        reviewsCount: 48,
        completedJobs: 85,
        isVerified: true,
        proposedPrice: 650,
        estimatedArrival: '20–30 mins',
        estimatedDuration: '1–2 hours',
        coverNote: 'Selam Yonas! I am currently in Bole near Edna Mall with PPR welding gear and replacement 20mm/25mm pipes. I can resolve this immediately.',
        timeAgo: '8 mins ago',
      },
      {
        id: 'bid-102',
        providerId: '4',
        providerName: 'Tariku Bekele',
        providerHeadline: 'Senior Sanitary & Water Systems Tech',
        providerInitials: 'TB',
        providerAvatarColor: '#D97706',
        rating: 4.8,
        reviewsCount: 32,
        completedJobs: 64,
        isVerified: true,
        proposedPrice: 700,
        estimatedArrival: '45 mins',
        estimatedDuration: '1 hour',
        coverNote: 'I carry high-grade Italian pipe fittings and provide a 6-month leak-free guarantee under Chapa Escrow.',
        timeAgo: '4 mins ago',
      },
      {
        id: 'bid-103',
        providerId: '7',
        providerName: 'Samuel Haile',
        providerHeadline: 'Emergency Plumbing Pro',
        providerInitials: 'SH',
        providerAvatarColor: '#059669',
        rating: 4.7,
        reviewsCount: 19,
        completedJobs: 40,
        isVerified: false,
        proposedPrice: 550,
        estimatedArrival: '1 hour',
        estimatedDuration: '2 hours',
        coverNote: 'Affordable same-day repair service with complete diagnosis.',
        timeAgo: 'Just now',
      },
    ],
  },
  {
    id: 'req-2',
    isMine: false,
    clientName: 'Meron Tesfaye',
    clientPhone: '+251 922 456 789',
    clientVerified: true,
    title: 'Main Circuit Breaker Keeps Tripping with Stove',
    category: 'Electrical',
    categoryEmoji: '⚡',
    subCity: 'Kazanchis',
    landmark: 'Behind UNECA / Inter Luxury Hotel',
    budget: '800–1,200 ETB',
    urgency: 'urgent',
    urgencyLabel: '⚡ Immediate (Today)',
    description: 'Whenever we turn on our electric stove or oven, the main 32A distribution breaker trips. Need a certified electrician to check the wiring load and breaker health.',
    timeAgo: '35 mins ago',
    status: 'open',
    bids: [
      {
        id: 'bid-201',
        providerId: '3',
        providerName: 'Dawit Mengistu',
        providerHeadline: 'Senior Electrical Engineer & Wireman',
        providerInitials: 'DM',
        providerAvatarColor: '#0284C7',
        rating: 5.0,
        reviewsCount: 54,
        completedJobs: 110,
        isVerified: true,
        proposedPrice: 950,
        estimatedArrival: '30 mins',
        estimatedDuration: '2 hours',
        coverNote: 'I will test circuit continuity and load capacity with digital multimeters to eliminate fire hazards.',
        timeAgo: '15 mins ago',
      },
    ],
  },
  {
    id: 'req-3',
    isMine: true,
    clientName: 'Yonas Molla (You)',
    clientPhone: '+251 911 234 567',
    clientVerified: true,
    title: '3-Bedroom Apartment Deep Sanitization & Cleaning',
    category: 'Cleaning',
    categoryEmoji: '🧹',
    subCity: 'CMC (Ayat)',
    landmark: 'Near Real Estate Gate 2 / Michael Church',
    budget: '2,000–3,500 ETB',
    urgency: 'scheduled',
    urgencyLabel: '📅 Within 2-3 Days',
    description: 'Full move-in deep cleaning for a 3-bedroom, 2-bathroom flat. Requires floor scrubbing, window cleaning, kitchen grease extraction, and steam sanitization.',
    timeAgo: '2 hours ago',
    status: 'open',
    bids: [
      {
        id: 'bid-301',
        providerId: '2',
        providerName: 'Bethlehem Tadesse',
        providerHeadline: 'Eco-Friendly Residential Cleaning Lead',
        providerInitials: 'BT',
        providerAvatarColor: '#10B981',
        rating: 4.9,
        reviewsCount: 76,
        completedJobs: 140,
        isVerified: true,
        proposedPrice: 2800,
        estimatedArrival: 'Tomorrow 9:00 AM',
        estimatedDuration: '5–6 hours',
        coverNote: 'My 3-person team will bring full organic detergents, heavy-duty steam extractors, and microfiber kits.',
        timeAgo: '1 hour ago',
      },
    ],
  },
  {
    id: 'req-4',
    isMine: false,
    clientName: 'Kidus Alemayehu',
    clientPhone: '+251 933 112 233',
    clientVerified: true,
    title: 'Gaming Laptop Thermal Repasting & Fan Dusting',
    category: 'IT Tech',
    categoryEmoji: '💻',
    subCity: 'Sarbet',
    landmark: 'Near International Community School (ICS)',
    budget: '600–1,000 ETB',
    urgency: 'flexible',
    urgencyLabel: '✨ Flexible Timing',
    description: 'ASUS ROG laptop is hitting 95°C under load. Need thermal paste repasting with Arctic MX-4 or Noctua NT-H1 and internal dual-fan heat sink cleaning.',
    timeAgo: '3 hours ago',
    status: 'open',
    bids: [],
  },
  {
    id: 'req-5',
    isMine: false,
    clientName: 'Senait Kebede',
    clientPhone: '+251 944 887 766',
    clientVerified: true,
    title: 'Living Room Accent Wall & Geometric Texture Painting',
    category: 'Painting',
    categoryEmoji: '🎨',
    subCity: 'Piassa (Arada)',
    landmark: 'Near Churchill Avenue / Taitu Hotel',
    budget: '1,500–2,800 ETB',
    urgency: 'scheduled',
    urgencyLabel: '🌴 This Weekend',
    description: 'Want a modern matte charcoal/teal geometric accent wall painted in our main living area (approx 4m x 2.8m). Paint will be provided.',
    timeAgo: '5 hours ago',
    status: 'open',
    bids: [],
  },
];

const INITIAL_PROPOSALS = [
  {
    id: 'prop-101',
    requestId: 'req-2',
    requestTitle: 'Main Circuit Breaker Keeps Tripping with Stove',
    category: 'Electrical',
    categoryEmoji: '⚡',
    subCity: 'Kazanchis',
    clientName: 'Meron Tesfaye',
    clientPhone: '+251 922 456 789',
    clientBudget: '800–1,200 ETB',
    proposedPrice: 950,
    estimatedArrival: '25–30 mins',
    estimatedDuration: '1–2 hours',
    includesMaterials: true,
    coverNote: 'Selam Meron! I am currently in Kazanchis with digital load multimeters and 32A/40A ABB breakers. I can diagnose and replace the breaker immediately with escrow protection.',
    status: 'under_review', // 'under_review' | 'accepted_funded' | 'declined' | 'withdrawn'
    submittedAt: '35 mins ago',
  },
  {
    id: 'prop-102',
    requestId: 'req-1',
    requestTitle: 'Emergency Kitchen Pipe Leak Under Sink',
    category: 'Plumbing',
    categoryEmoji: '🔧',
    subCity: 'Bole Rwanda',
    clientName: 'Beza Tesfaye',
    clientPhone: '+251 911 234 567',
    clientBudget: '600–900 ETB',
    proposedPrice: 650,
    estimatedArrival: '20 mins',
    estimatedDuration: '1 hour',
    includesMaterials: true,
    coverNote: 'I have 20mm/25mm PPR replacement shutoff fittings and hot welder ready in Bole Rwanda.',
    status: 'accepted_funded',
    submittedAt: '1 hour ago',
  },
  {
    id: 'prop-103',
    requestId: 'req-5',
    requestTitle: 'Living Room Accent Wall & Geometric Texture Painting',
    category: 'Painting',
    categoryEmoji: '🎨',
    subCity: 'Piassa (Arada)',
    clientName: 'Senait Kebede',
    clientPhone: '+251 944 887 766',
    clientBudget: '1,500–2,800 ETB',
    proposedPrice: 1800,
    estimatedArrival: 'Tomorrow 9:00 AM',
    estimatedDuration: '1 day',
    includesMaterials: false,
    coverNote: 'I specialize in clean geometric masking lines, sharp edges, and dustless wall preparation.',
    status: 'under_review',
    submittedAt: '2 hours ago',
  },
];

export const useRequestStore = create((set, get) => ({
  requests: INITIAL_REQUESTS,
  myProposals: INITIAL_PROPOSALS,
  activeTab: 'browse', // 'browse' | 'my_requests' | 'my_proposals'
  selectedSubCity: 'All Addis Ababa',
  selectedCategory: 'All Categories',
  searchQuery: '',

  // Modals state
  bidSubmissionModal: { isOpen: false, request: null },
  reviseProposalModal: { isOpen: false, proposal: null },
  escrowDepositModal: { isOpen: false, request: null, bid: null },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedSubCity: (subCity) => set({ selectedSubCity: subCity }),
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  // Bid submission drawer / modal handlers
  openBidSubmission: (request) => {
    set({ bidSubmissionModal: { isOpen: true, request } });
  },

  closeBidSubmission: () => {
    set({ bidSubmissionModal: { isOpen: false, request: null } });
  },

  submitBid: (requestId, bidData) => {
    const targetReq = get().requests.find((r) => r.id === requestId) || bidData.request;

    const newBid = {
      id: `bid-${Date.now()}`,
      providerId: 'my-pro-id',
      providerName: 'Yonas Molla (Specialist Pro)',
      providerHeadline: 'Senior Certified Specialist',
      providerInitials: 'YM',
      providerAvatarColor: '#0284C7',
      rating: 4.9,
      reviewsCount: 58,
      completedJobs: 89,
      isVerified: true,
      proposedPrice: Number(bidData.proposedPrice),
      estimatedArrival: bidData.estimatedArrival || '30 mins',
      estimatedDuration: bidData.estimatedDuration || '2 hours',
      includesMaterials: !!bidData.includesMaterials,
      coverNote: bidData.coverNote || 'I am available to start work and complete this job with 100% escrow guarantee.',
      timeAgo: 'Just now',
    };

    const newProposal = {
      id: `prop-${Date.now()}`,
      requestId,
      requestTitle: targetReq?.title || 'Specialist Repair Task',
      category: targetReq?.category || 'General',
      categoryEmoji: targetReq?.categoryEmoji || '⚡',
      subCity: targetReq?.subCity || 'Addis Ababa',
      clientName: targetReq?.clientName || 'Customer',
      clientPhone: targetReq?.clientPhone || '+251 911 000 000',
      clientBudget: targetReq?.budget || 'Negotiable',
      proposedPrice: Number(bidData.proposedPrice),
      estimatedArrival: bidData.estimatedArrival || '30 mins',
      estimatedDuration: bidData.estimatedDuration || '2 hours',
      includesMaterials: !!bidData.includesMaterials,
      coverNote: bidData.coverNote || 'Available with professional tools and warranty.',
      status: 'under_review',
      submittedAt: 'Just now',
    };

    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === requestId ? { ...r, bids: [newBid, ...r.bids] } : r
      ),
      myProposals: [newProposal, ...state.myProposals],
      bidSubmissionModal: { isOpen: false, request: null },
    }));

    return newProposal;
  },

  // Revise proposal modal
  openReviseProposal: (proposal) => {
    set({ reviseProposalModal: { isOpen: true, proposal } });
  },

  closeReviseProposal: () => {
    set({ reviseProposalModal: { isOpen: false, proposal: null } });
  },

  reviseProposal: (proposalId, updates) => {
    set((state) => ({
      myProposals: state.myProposals.map((p) =>
        p.id === proposalId
          ? {
              ...p,
              ...updates,
              proposedPrice: Number(updates.proposedPrice) || p.proposedPrice,
              status: 'under_review',
              submittedAt: 'Revised just now',
            }
          : p
      ),
      reviseProposalModal: { isOpen: false, proposal: null },
    }));
  },

  withdrawProposal: (proposalId) => {
    set((state) => ({
      myProposals: state.myProposals.map((p) =>
        p.id === proposalId ? { ...p, status: 'withdrawn' } : p
      ),
    }));
  },

  // Escrow acceptance modal handlers
  openEscrowDeposit: (request, bid) => {
    set({ escrowDepositModal: { isOpen: true, request, bid } });
  },

  closeEscrowDeposit: () => {
    set({ escrowDepositModal: { isOpen: false, request: null, bid: null } });
  },

  confirmEscrowDeposit: (paymentMethod = 'Telebirr', phone = '+251 911 234 567') => {
    const { escrowDepositModal, requests } = get();
    const { request, bid } = escrowDepositModal;
    if (!request || !bid) return;

    // 1. Mark request as funded in escrow
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === request.id ? { ...r, status: 'funded_escrow', acceptedBid: bid } : r
      ),
      myProposals: state.myProposals.map((p) =>
        p.requestId === request.id ? { ...p, status: 'accepted_funded' } : p
      ),
      escrowDepositModal: { isOpen: false, request: null, bid: null },
    }));

    // 2. Add to global bookingStore so it shows in the Escrow Vault (/bookings)
    const { createBookingFromCheckout } = useBookingStore.getState();
    createBookingFromCheckout({
      provider: {
        id: bid.providerId,
        name: bid.providerName,
        headline: bid.providerHeadline,
        avatarColor: bid.providerAvatarColor,
        locationCity: request.subCity,
        verified: bid.isVerified,
      },
      selectedService: {
        title: request.title,
        price: bid.proposedPrice,
        priceType: 'fixed',
      },
      date: 'Today',
      timeSlot: bid.estimatedArrival || 'Within 1 hour',
      location: request.subCity,
      addressLandmark: request.landmark,
      jobNotes: request.description,
      paymentMethod,
      phone,
    });
  },

  postNewRequest: (data) => {
    const newReq = {
      id: `req-${Date.now()}`,
      isMine: true,
      clientName: 'Yonas Molla (You)',
      clientPhone: '+251 911 234 567',
      clientVerified: true,
      title: data.title,
      category: data.category || 'General',
      categoryEmoji: data.categoryEmoji || '🔨',
      subCity: data.subCity || 'Bole, Addis Ababa',
      landmark: data.landmark || 'Addis Ababa',
      budget: data.budget || '500–1,500 ETB',
      urgency: data.urgency || 'urgent',
      urgencyLabel: data.urgency === 'urgent' ? '⚡ Immediate (Today)' : '📅 Within 2-3 Days',
      description: data.description,
      timeAgo: 'Just now',
      status: 'open',
      bids: [],
    };

    set((state) => ({
      requests: [newReq, ...state.requests],
      activeTab: 'my_requests',
    }));
  },
}));
