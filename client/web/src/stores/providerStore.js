import { create } from 'zustand';
import { providerService } from '../services/providerService';

const LOCAL_STORAGE_KEY = 'linc_provider_store_v3';

const INITIAL_SERVICES = [
  {
    id: 'ps-1',
    name: 'Emergency Pipe Leak & Burst Repair',
    description: 'Acoustic leak pinpointing, pressure testing, pipe welding, and immediate shutoff replacement.',
    duration: '1–2 hours',
    price: '350 ETB/hr',
    fixed: false,
    amount: 350,
    emergencyAvailable: true,
    active: true,
    tags: ['Emergency', 'Leak Detection', 'PPR'],
  },
  {
    id: 'ps-2',
    name: 'Bathroom Sanitary & Fixture Installation',
    description: 'Complete hookup of mixers, sinks, shower heads, hidden drainage traps, and water pressure valves.',
    duration: 'Half day',
    price: '1,800 ETB',
    fixed: true,
    amount: 1800,
    emergencyAvailable: false,
    active: true,
    tags: ['Sanitary', 'Fixtures', 'Renovation'],
  },
  {
    id: 'ps-3',
    name: 'Water Tank & Booster Pump Automation',
    description: 'Installation of rooftop water tanks, automatic float switches, booster pumps, and sediment filtration.',
    duration: '1 day',
    price: '2,800 ETB',
    fixed: true,
    amount: 2800,
    emergencyAvailable: false,
    active: true,
    tags: ['Water Tank', 'Pumps', 'Automation'],
  },
  {
    id: 'ps-4',
    name: 'Drainage Snaking & Deep Unclogging',
    description: 'Heavy-duty electric rotary snaking for blocked main sewers, grease traps, and bathroom lines.',
    duration: '2–3 hours',
    price: '900 ETB',
    fixed: true,
    amount: 900,
    emergencyAvailable: true,
    active: true,
    tags: ['Drainage', 'Unclogging', 'Sewers'],
  },
];

const INITIAL_PORTFOLIO = [
  {
    id: 'pp-1',
    title: 'Emergency High-Pressure Pipe Burst & Valve Replacement',
    subCity: 'Bole Medhanealem',
    duration: '1.5 hours',
    cost: '650 ETB',
    clientFeedback: '“Arrived in 20 minutes and stopped our apartment from flooding. Exceptional craftsmanship!” — Beza T.',
    description: 'Acoustic leak pinpointing and replacement of a ruptured 32mm PPR mainline shutoff valve in a 4th floor apartment with zero collateral tile damage.',
    tags: ['Plumbing', 'Emergency', 'PPR Pipe', 'Leak Detection'],
    beforeAfterPhotos: { before: '/assets/bg-city.jpg', after: '/assets/hero.png' },
    verifiedEscrow: true,
    pinned: true,
  },
  {
    id: 'pp-2',
    title: 'Complete Rooftop Water Tank & Booster Automation',
    subCity: 'Kazanchis Commercial Complex',
    duration: '2 days',
    cost: '4,200 ETB',
    clientFeedback: '“High quality work and very transparent pricing. Abebe handled all fittings with zero issues.” — Michael A.',
    description: 'Installed twin 3,000L rooftop water tanks, automatic float switches, booster pumps, and dual sediment filtration.',
    tags: ['Water Tank', 'Booster Pump', 'Automation'],
    beforeAfterPhotos: { before: '/assets/bg-city.jpg', after: '/assets/hero.png' },
    verifiedEscrow: true,
    pinned: false,
  },
  {
    id: 'pp-3',
    title: 'Luxury Bathroom Concealed Drainage & Mixer Modernization',
    subCity: 'Old Airport Residential Villa',
    duration: '3 days',
    cost: '5,500 ETB',
    clientFeedback: '“Cleanest plumbing finish we have seen in Addis. Highly recommended!” — Senait B.',
    description: 'Fitted concealed cisterns, linear floor drains, and thermostatic brass mixer showers with pressure balance.',
    tags: ['Sanitary', 'Modern Fitting', 'Renovation'],
    beforeAfterPhotos: { before: '/assets/bg-city.jpg', after: '/assets/hero.png' },
    verifiedEscrow: true,
    pinned: false,
  },
];

const INITIAL_REVIEWS = [
  {
    id: 'pr-1',
    author: 'Helen Bekele',
    rating: 5,
    date: '3 days ago',
    subCity: 'Bole Olympia',
    serviceName: 'Water Heater Valve Replacement',
    comment: 'Yonas was prompt, replaced the safety valve with a genuine Italian part, and gave a 6-month guarantee! Excellent service.',
    providerReply: {
      text: 'Thank you Helen! Always happy to help keep your water heating safe and efficient. Do not hesitate to call if you ever need maintenance!',
      repliedAt: '2 days ago',
    },
    pinned: true,
  },
  {
    id: 'pr-2',
    author: 'Beza Tesfaye',
    rating: 5,
    date: '1 week ago',
    subCity: 'Bole Rwanda',
    serviceName: 'Emergency Pipe Burst Repair',
    comment: 'Arrived in less than 20 minutes during an emergency leak. Fixed it cleanly with zero mess and fair pricing.',
    providerReply: null,
    pinned: false,
  },
  {
    id: 'pr-3',
    author: 'Michael Alemu',
    rating: 5,
    date: '2 weeks ago',
    subCity: 'Kazanchis',
    serviceName: 'Bathroom Fixture Installation',
    comment: 'Very professional, arrived with all necessary tools and replaced our bathroom plumbing fixtures. Highly recommended specialist in Addis!',
    providerReply: {
      text: 'Glad to assist with your apartment remodel, Michael! Enjoy your new bathroom fixtures.',
      repliedAt: '1 week ago',
    },
    pinned: false,
  },
  {
    id: 'pr-4',
    author: 'Dawit Kebede',
    rating: 5,
    date: '3 weeks ago',
    subCity: 'Sarbet',
    serviceName: 'Main Sewer Line Snaking',
    comment: 'Snaked our ground floor sewer lines and cleared a heavy grease blockage quickly. Fair rate and great attitude.',
    providerReply: null,
    pinned: false,
  },
];

const INITIAL_CREDENTIALS = [
  {
    id: 'c-1',
    title: 'Fayda Digital National ID',
    status: 'Verified',
    issuer: 'National ID Program Ethiopia',
    date: '2025–2030',
    docRef: 'FAN-2025-9821-ADD',
    verifiedByFayda: true,
  },
  {
    id: 'c-2',
    title: 'Ministry of Urban & Infrastructure Trade License',
    status: 'Active',
    issuer: 'FDRE Ministry of Trade',
    date: '2024–2026',
    docRef: 'TL-ADD-8812',
    verifiedByFayda: true,
  },
  {
    id: 'c-3',
    title: 'Addis Ababa Police Criminal Clearance Certificate',
    status: 'Clean Record',
    issuer: 'Federal Police Commission',
    date: '2025',
    docRef: 'PCC-AA-2025-412',
    verifiedByFayda: true,
  },
  {
    id: 'c-4',
    title: 'Certified Master Plumber & Hydraulic Technician',
    status: 'Certified',
    issuer: 'Entoto TVET College',
    date: '2019',
    docRef: 'TVET-ENT-0921',
    verifiedByFayda: true,
  },
];

const INITIAL_JOBS = [
  {
    id: 'pj-101',
    title: 'Emergency Kitchen Pipe Leak Repair',
    clientName: 'Beza Tesfaye',
    clientPhone: '+251 91 234 5678',
    clientSubCity: 'Bole Rwanda',
    address: 'Bole Rwanda, Near Edna Mall, House 204, Addis Ababa',
    agreedPrice: 650,
    currency: 'ETB',
    escrowStatus: 'funded_locked',
    escrowRef: 'ESC-2026-9812',
    scheduledTime: 'ASAP (Emergency)',
    urgency: 'urgent',
    stage: 'incoming', // 'incoming' | 'accepted' | 'en_route' | 'in_progress' | 'completion_submitted' | 'completed'
    notes: 'Kitchen sink pipe burst under the cabinet, water overflowing quickly!',
    requestedAt: '15 mins ago',
    etaMinutes: 20,
    completionDetails: null,
  },
  {
    id: 'pj-102',
    title: 'Complete Bathroom Fixture Installation',
    clientName: 'Michael Alemu',
    clientPhone: '+251 92 888 1234',
    clientSubCity: 'Kazanchis',
    address: 'Kazanchis, Guinea Conakry St., Building 3B, Addis Ababa',
    agreedPrice: 2200,
    currency: 'ETB',
    escrowStatus: 'funded_locked',
    escrowRef: 'ESC-2026-9844',
    scheduledTime: 'Today, 3:30 PM',
    urgency: 'normal',
    stage: 'en_route',
    notes: 'Need shower mixer and 2 washbasins installed in newly remodeled apartment.',
    requestedAt: '45 mins ago',
    etaMinutes: 15,
    completionDetails: null,
  },
  {
    id: 'pj-103',
    title: 'Water Tank Booster Pump Electrical & Pipe Hookup',
    clientName: 'Selamawit Desta',
    clientPhone: '+251 94 555 7890',
    clientSubCity: 'CMC / Ayat',
    address: 'CMC Michael, Tsehay Real Estate Villa 18, Addis Ababa',
    agreedPrice: 1800,
    currency: 'ETB',
    escrowStatus: 'funded_locked',
    escrowRef: 'ESC-2026-9799',
    scheduledTime: 'Today, 11:00 AM',
    urgency: 'high',
    stage: 'in_progress',
    notes: 'Pump is delivered on site, need electrical wiring and PPR manifold connections.',
    requestedAt: '2 hours ago',
    etaMinutes: 0,
    startedAt: '11:15 AM',
    completionDetails: null,
  },
  {
    id: 'pj-104',
    title: 'Main Sewer Line Snaking & Pressure Cleaning',
    clientName: 'Dawit Kebede',
    clientPhone: '+251 91 777 4321',
    clientSubCity: 'Sarbet',
    address: 'Sarbet, Behind Canadian Embassy, Compound 12, Addis Ababa',
    agreedPrice: 950,
    currency: 'ETB',
    escrowStatus: 'work_completed',
    escrowRef: 'ESC-2026-9650',
    scheduledTime: 'Aug 20, 2026',
    urgency: 'normal',
    stage: 'completion_submitted',
    notes: 'Ground floor drainage backed up.',
    requestedAt: 'Yesterday',
    completionDetails: {
      summary: 'Used 20m rotary drum snake to clear grease blockage. Inspected with flow camera. Zero leaks.',
      partsUsed: 'Heavy duty rubber gaskets (2x), PVC solvent weld',
      submittedAt: 'Aug 20, 4:45 PM',
      proofPhotos: ['/assets/bg-city.jpg'],
    },
  },
  {
    id: 'pj-105',
    title: 'Water Heater (Geyser) High Pressure Valve Replacement',
    clientName: 'Helen Bekele',
    clientPhone: '+251 93 111 6543',
    clientSubCity: 'Bole Olympia',
    address: 'Bole Olympia, Delina Building, Apt 402, Addis Ababa',
    agreedPrice: 1400,
    currency: 'ETB',
    escrowStatus: 'released',
    escrowRef: 'ESC-2026-9501',
    scheduledTime: 'Aug 18, 2026',
    urgency: 'urgent',
    stage: 'completed',
    notes: 'Water heater leaking steaming water from safety valve.',
    requestedAt: '3 days ago',
    rating: 5,
    clientReview: 'Yonas was prompt, replaced the safety valve with a genuine Italian part, and gave a 6-month guarantee!',
    completionDetails: {
      summary: 'Replaced 0.8 MPa safety pressure valve, descaled heating element, tested hot water flow.',
      submittedAt: 'Aug 18, 2:30 PM',
      releasedAt: 'Aug 18, 3:00 PM',
    },
  },
];

const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-101',
    type: 'escrow_payout',
    title: 'Escrow Payout: Water Heater Valve Replacement',
    clientName: 'Helen Bekele',
    amount: 1400,
    currency: 'ETB',
    date: 'Aug 18, 2026',
    time: '3:00 PM',
    status: 'completed',
    ref: 'PAY-ESC-2026-9501',
    gateway: 'Chapa Escrow Vault',
    icon: '🛡️',
  },
  {
    id: 'tx-102',
    type: 'withdrawal',
    title: 'Instant Payout to Telebirr Wallet',
    destination: 'Telebirr (+251 911 234 567)',
    amount: 4500,
    currency: 'ETB',
    date: 'Aug 16, 2026',
    time: '5:10 PM',
    status: 'completed',
    ref: 'WIT-TB-2026-4412',
    gateway: 'Ethio Telecom Telebirr',
    icon: '📱',
  },
  {
    id: 'tx-103',
    type: 'escrow_payout',
    title: 'Escrow Payout: PPR Mainline Renovation',
    clientName: 'Bereket Tadesse',
    amount: 3200,
    currency: 'ETB',
    date: 'Aug 14, 2026',
    time: '1:45 PM',
    status: 'completed',
    ref: 'PAY-ESC-2026-9320',
    gateway: 'Chapa Escrow Vault',
    icon: '🛡️',
  },
  {
    id: 'tx-104',
    type: 'withdrawal',
    title: 'Transfer to Commercial Bank of Ethiopia (CBE)',
    destination: 'CBE Birr (A/C: 1000****7812)',
    amount: 6000,
    currency: 'ETB',
    date: 'Aug 10, 2026',
    time: '10:30 AM',
    status: 'completed',
    ref: 'WIT-CBE-2026-1188',
    gateway: 'Commercial Bank of Ethiopia',
    icon: '🏦',
  },
];

// Load persisted state or fallback to defaults
const loadSavedState = () => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to load provider store from localStorage', err);
  }
  return null;
};

const savedData = loadSavedState();

export const useProviderStore = create((set, get) => ({
  // Provider Profile Info
  profile: savedData?.profile || {
    id: '1',
    name: 'Yonas Molla',
    tradeTitle: 'Master Plumber & Pipe Specialist',
    tradeCategory: 'plumbing',
    headline: 'Senior Certified Plumber & Leak Detection Pro • Bole & Kazanchis, Addis Ababa',
    location: 'Bole, Addis Ababa',
    phone: '+251 911 234 567',
    email: 'yonas.molla@linc.et',
    hourlyRate: 350,
    emergencySurcharge: 250,
    isAvailable: true,
    rating: 4.9,
    reviewsCount: 58,
    completedJobsCount: 89,
    acceptanceRate: 98,
    responseTime: '~4 mins',
    matchScore: 97,
    faydaVerified: true,
    faydaRef: 'FAN-2025-9821-ADD',
    bio: 'Licensed plumbing and hydraulic specialist with 7+ years of hands-on experience across high-rises and residential villas in Addis Ababa. Equipped with acoustic leak detectors, PPR pipe welders, and heavy-duty unblocking tools. 100% committed to quality workmanship with escrow guarantee.',
    coverageSubCities: ['Bole', 'Kazanchis', 'Sarbet', 'CMC / Ayat', 'Megenagna', 'Gerji', 'Piassa / Arada'],
    workingHours: {
      weekdays: 'Mon – Fri: 8:00 AM – 7:00 PM',
      saturday: 'Sat: 8:30 AM – 5:00 PM',
      sunday: 'Sun: Emergency Calls Only (24/7)',
    },
  },

  // Service Catalog
  services: savedData?.services || INITIAL_SERVICES,

  // Portfolio & Project Case Studies
  portfolio: savedData?.portfolio || INITIAL_PORTFOLIO,

  // Customer Reviews with Provider Replies
  reviews: savedData?.reviews || INITIAL_REVIEWS,

  // Credentials & Verified Badges
  credentials: savedData?.credentials || INITIAL_CREDENTIALS,

  // Jobs Queue & Stages
  jobs: savedData?.jobs || INITIAL_JOBS,

  // Ethiopian Financial Wallet & Escrow Ledger
  wallet: savedData?.wallet || {
    availableBalance: 12400,
    escrowPendingBalance: 4650,
    totalLifetimeEarnings: 58200,
    defaultPayoutChannel: 'telebirr',
    payoutAccounts: [
      { id: 'pa-1', channel: 'telebirr', name: 'Telebirr Wallet', account: '+251 911 234 567', isDefault: true, icon: '📱' },
      { id: 'pa-2', channel: 'cbe', name: 'Commercial Bank of Ethiopia (CBE Birr)', account: '1000 2938 4719', isDefault: false, icon: '🏦' },
      { id: 'pa-3', channel: 'awash', name: 'Awash Birr Wallet', account: '+251 911 234 567', isDefault: false, icon: '🟡' },
      { id: 'pa-4', channel: 'dashen', name: 'Dashen Amole', account: '+251 911 234 567', isDefault: false, icon: '🔵' },
    ],
    transactions: INITIAL_TRANSACTIONS,
  },

  // UI / Modal Controls
  selectedJobForModal: null,
  isCompletionModalOpen: false,
  isWithdrawalModalOpen: false,
  isAddServiceModalOpen: false,
  isReceiptModalOpen: false,
  activeReceiptTx: null,
  isQuoteModalOpen: false,
  selectedLeadForQuote: null,
  submittedQuotes: savedData?.submittedQuotes || [],
  incomingAlert: null,

  // Persist helper
  _persist: () => {
    try {
      const state = get();
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          profile: state.profile,
          services: state.services,
          portfolio: state.portfolio,
          reviews: state.reviews,
          credentials: state.credentials,
          jobs: state.jobs,
          wallet: state.wallet,
          submittedQuotes: state.submittedQuotes,
        })
      );
    } catch (e) {
      console.error('Error saving provider store', e);
    }
  },

  // ── Real-time Alert & Quote Modal Actions ──
  openQuoteModal: (lead) => set({ isQuoteModalOpen: true, selectedLeadForQuote: lead }),
  closeQuoteModal: () => set({ isQuoteModalOpen: false, selectedLeadForQuote: null }),
  setIncomingAlert: (alert) => set({ incomingAlert: alert }),
  dismissIncomingAlert: () => set({ incomingAlert: null }),

  submitQuoteToLead: (leadId, quoteData) => {
    const newQuote = {
      id: `q-${Date.now()}`,
      leadId,
      leadTitle: quoteData.leadTitle || 'Custom Service',
      amount: Number(quoteData.amount) || 500,
      currency: 'ETB',
      eta: quoteData.eta || 'Within 1 hour',
      proposal: quoteData.proposal || '',
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
    };

    set((state) => ({
      submittedQuotes: [newQuote, ...state.submittedQuotes],
      isQuoteModalOpen: false,
      selectedLeadForQuote: null,
    }));
    get()._persist();
    return newQuote;
  },

  // ── Sync with Backend APIs ──
  syncWithBackend: async () => {
    try {
      const profileData = await providerService.getMyProfile();
      if (profileData) {
        set((state) => ({
          profile: {
            ...state.profile,
            ...profileData,
            name: profileData.name || profileData.users?.full_name || state.profile.name,
            headline: profileData.headline || state.profile.headline,
            isAvailable: profileData.is_available !== undefined ? profileData.is_available : state.profile.isAvailable,
          },
        }));
      }
    } catch {
      // Keep local mock data fallback intact
    }
  },

  // ── Profile & Availability Actions ──
  toggleAvailability: async () => {
    const nextVal = !get().profile.isAvailable;
    set((state) => ({
      profile: {
        ...state.profile,
        isAvailable: nextVal,
      },
    }));
    get()._persist();

    try {
      await providerService.toggleAvailability(nextVal);
    } catch {
      // Local state already updated
    }
  },

  updateProfile: (updates) => {
    set((state) => ({
      profile: {
        ...state.profile,
        ...updates,
      },
    }));
    get()._persist();
  },

  toggleCoverageSubCity: (subCity) => {
    set((state) => {
      const current = state.profile.coverageSubCities;
      const exists = current.includes(subCity);
      const next = exists ? current.filter((c) => c !== subCity) : [...current, subCity];
      return {
        profile: {
          ...state.profile,
          coverageSubCities: next,
        },
      };
    });
    get()._persist();
  },

  // ── Service Catalog CRUD ──
  addService: (newService) => {
    const serviceObj = {
      id: `ps-${Date.now()}`,
      name: newService.name,
      description: newService.description,
      duration: newService.duration || '1–2 hours',
      price: newService.fixed ? `${newService.amount} ETB` : `${newService.amount} ETB/hr`,
      fixed: !!newService.fixed,
      amount: Number(newService.amount) || 300,
      emergencyAvailable: !!newService.emergencyAvailable,
      active: true,
      tags: newService.tags || ['Specialist'],
    };

    set((state) => ({
      services: [serviceObj, ...state.services],
    }));
    get()._persist();
    return serviceObj;
  },

  updateService: (id, updates) => {
    set((state) => ({
      services: state.services.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
    get()._persist();
  },

  deleteService: (id) => {
    set((state) => ({
      services: state.services.filter((s) => s.id !== id),
    }));
    get()._persist();
  },

  toggleServiceActive: (id) => {
    set((state) => ({
      services: state.services.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
    }));
    get()._persist();
  },

  // ── Portfolio Projects & Case Studies CRUD ──
  addPortfolioProject: (newProject) => {
    const projectObj = {
      id: `pp-${Date.now()}`,
      title: newProject.title,
      subCity: newProject.subCity || 'Bole, Addis Ababa',
      duration: newProject.duration || '1 day',
      cost: `${newProject.cost} ETB`,
      clientFeedback: newProject.clientFeedback ? `“${newProject.clientFeedback}”` : '',
      description: newProject.description,
      tags: newProject.tags || ['Verified Repair'],
      beforeAfterPhotos: newProject.beforeAfterPhotos || { before: '/assets/bg-city.jpg', after: '/assets/hero.png' },
      verifiedEscrow: true,
      pinned: !!newProject.pinned,
    };

    set((state) => ({
      portfolio: [projectObj, ...state.portfolio],
    }));
    get()._persist();
    return projectObj;
  },

  updatePortfolioProject: (id, updates) => {
    set((state) => ({
      portfolio: state.portfolio.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
    get()._persist();
  },

  deletePortfolioProject: (id) => {
    set((state) => ({
      portfolio: state.portfolio.filter((p) => p.id !== id),
    }));
    get()._persist();
  },

  togglePinProject: (id) => {
    set((state) => ({
      portfolio: state.portfolio.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p)),
    }));
    get()._persist();
  },

  // ── Customer Reviews & Provider Replies ──
  replyToReview: (reviewId, replyText) => {
    set((state) => ({
      reviews: state.reviews.map((r) => {
        if (r.id !== reviewId) return r;
        return {
          ...r,
          providerReply: {
            text: replyText,
            repliedAt: 'Just now',
          },
        };
      }),
    }));
    get()._persist();
  },

  togglePinReview: (reviewId) => {
    set((state) => ({
      reviews: state.reviews.map((r) => (r.id === reviewId ? { ...r, pinned: !r.pinned } : r)),
    }));
    get()._persist();
  },

  // ── Credentials Management ──
  addCredential: (newCred) => {
    const credObj = {
      id: `c-${Date.now()}`,
      title: newCred.title,
      status: newCred.status || 'Verified',
      issuer: newCred.issuer,
      date: newCred.date || '2025–2028',
      docRef: newCred.docRef || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      verifiedByFayda: true,
    };

    set((state) => ({
      credentials: [credObj, ...state.credentials],
    }));
    get()._persist();
    return credObj;
  },

  removeCredential: (id) => {
    set((state) => ({
      credentials: state.credentials.filter((c) => c.id !== id),
    }));
    get()._persist();
  },

  // ── Job Lifecycle & Progression Actions ──
  acceptJob: (jobId) => {
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId
          ? {
              ...j,
              stage: 'accepted',
              acceptedAt: new Date().toISOString(),
            }
          : j
      ),
    }));
    get()._persist();
  },

  declineJob: (jobId, reason = '') => {
    set((state) => ({
      jobs: state.jobs.filter((j) => j.id !== jobId),
    }));
    get()._persist();
  },

  advanceJobStage: (jobId, targetStage) => {
    set((state) => ({
      jobs: state.jobs.map((j) => {
        if (j.id !== jobId) return j;
        const updates = { stage: targetStage };
        if (targetStage === 'en_route') updates.enRouteAt = new Date().toISOString();
        if (targetStage === 'in_progress') updates.startedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return { ...j, ...updates };
      }),
    }));
    get()._persist();
  },

  openCompletionModal: (job) => {
    set({ selectedJobForModal: job, isCompletionModalOpen: true });
  },

  closeCompletionModal: () => {
    set({ selectedJobForModal: null, isCompletionModalOpen: false });
  },

  submitJobCompletion: (jobId, { summary, partsUsed, proofPhotos = [] }) => {
    set((state) => {
      const updatedJobs = state.jobs.map((j) => {
        if (j.id !== jobId) return j;
        return {
          ...j,
          stage: 'completion_submitted',
          escrowStatus: 'work_completed',
          completionDetails: {
            summary,
            partsUsed: partsUsed || 'None (Labor only)',
            proofPhotos: proofPhotos.length > 0 ? proofPhotos : ['/assets/bg-city.jpg'],
            submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        };
      });

      return {
        jobs: updatedJobs,
        isCompletionModalOpen: false,
        selectedJobForModal: null,
      };
    });
    get()._persist();
  },

  // ── Ethiopian Wallet & Payout Actions ──
  openWithdrawalModal: () => set({ isWithdrawalModalOpen: true }),
  closeWithdrawalModal: () => set({ isWithdrawalModalOpen: false }),

  openReceiptModal: (tx) => set({ isReceiptModalOpen: true, activeReceiptTx: tx }),
  closeReceiptModal: () => set({ isReceiptModalOpen: false, activeReceiptTx: null }),

  withdrawEarnings: ({ amount, channelId, destinationAccount }) => {
    const numAmount = Number(amount);
    const state = get();

    if (numAmount <= 0 || numAmount > state.wallet.availableBalance) {
      throw new Error('Invalid withdrawal amount');
    }

    const channelNames = {
      telebirr: 'Ethio Telecom Telebirr',
      cbe: 'Commercial Bank of Ethiopia (CBE Birr)',
      awash: 'Awash Birr Wallet',
      dashen: 'Dashen Amole Wallet',
    };

    const newTx = {
      id: `tx-${Date.now()}`,
      type: 'withdrawal',
      title: `Instant Transfer to ${channelNames[channelId] || 'Mobile Wallet'}`,
      destination: `${channelNames[channelId] || 'Wallet'} (${destinationAccount})`,
      amount: numAmount,
      currency: 'ETB',
      date: 'Just now',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      ref: `WIT-${channelId.toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      gateway: channelNames[channelId] || 'Ethiopian National Switch (EthSwitch)',
      icon: channelId === 'cbe' ? '🏦' : '📱',
    };

    set((s) => ({
      wallet: {
        ...s.wallet,
        availableBalance: s.wallet.availableBalance - numAmount,
        transactions: [newTx, ...s.wallet.transactions],
      },
      isWithdrawalModalOpen: false,
      activeReceiptTx: newTx,
      isReceiptModalOpen: true,
    }));

    get()._persist();
    return newTx;
  },

  // Reset store to default demo state
  resetProviderData: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    set({
      profile: {
        id: '1',
        name: 'Yonas Molla',
        tradeTitle: 'Master Plumber & Pipe Specialist',
        tradeCategory: 'plumbing',
        headline: 'Senior Certified Plumber & Leak Detection Pro • Bole & Kazanchis, Addis Ababa',
        location: 'Bole, Addis Ababa',
        phone: '+251 911 234 567',
        email: 'yonas.molla@linc.et',
        hourlyRate: 350,
        emergencySurcharge: 250,
        isAvailable: true,
        rating: 4.9,
        reviewsCount: 58,
        completedJobsCount: 89,
        acceptanceRate: 98,
        responseTime: '~4 mins',
        matchScore: 97,
        faydaVerified: true,
        faydaRef: 'FAN-2025-9821-ADD',
        bio: 'Licensed plumbing and hydraulic specialist with 7+ years of hands-on experience across high-rises and residential villas in Addis Ababa.',
        coverageSubCities: ['Bole', 'Kazanchis', 'Sarbet', 'CMC / Ayat', 'Megenagna', 'Gerji'],
        workingHours: {
          weekdays: 'Mon – Fri: 8:00 AM – 7:00 PM',
          saturday: 'Sat: 8:30 AM – 5:00 PM',
          sunday: 'Sun: Emergency Calls Only (24/7)',
        },
      },
      services: INITIAL_SERVICES,
      portfolio: INITIAL_PORTFOLIO,
      reviews: INITIAL_REVIEWS,
      credentials: INITIAL_CREDENTIALS,
      jobs: INITIAL_JOBS,
      wallet: {
        availableBalance: 12400,
        escrowPendingBalance: 4650,
        totalLifetimeEarnings: 58200,
        defaultPayoutChannel: 'telebirr',
        payoutAccounts: [
          { id: 'pa-1', channel: 'telebirr', name: 'Telebirr Wallet', account: '+251 911 234 567', isDefault: true, icon: '📱' },
          { id: 'pa-2', channel: 'cbe', name: 'Commercial Bank of Ethiopia (CBE Birr)', account: '1000 2938 4719', isDefault: false, icon: '🏦' },
          { id: 'pa-3', channel: 'awash', name: 'Awash Birr Wallet', account: '+251 911 234 567', isDefault: false, icon: '🟡' },
          { id: 'pa-4', channel: 'dashen', name: 'Dashen Amole', account: '+251 911 234 567', isDefault: false, icon: '🔵' },
        ],
        transactions: INITIAL_TRANSACTIONS,
      },
    });
  },
}));
