/**
 * LINC Web — Design Tokens & Configuration Constants
 * Matches mobile Flutter theme in client/mobile/lib/config/colors.dart
 */

export const APP_CONFIG = {
  appName: 'LINC',
  appAmharicName: 'ሊንክ',
  appTagline: 'Life Infrastructure Network',
  appDescription: 'Connect with verified professionals, businesses, and clients across Ethiopia with AI matching and secure escrow payments.',
  defaultApiUrl: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'),
  storageKeys: {
    token: 'linc_auth_token',
    user: 'linc_auth_user',
    apiUrl: 'linc_custom_api_url',
    theme: 'linc_theme_mode',
  },
};

export const APP_COLORS = {
  primaryBlue: '#7EC8E3',
  deepMidnight: '#0F172A',
  slateBlue: '#1E5F7A',
  cyan: '#06B6D4',
  emerald: '#10B981',
  emeraldLight: '#34D399',
  indigo: '#4338CA',
  amber: '#F59E0B',
  amberDark: '#D97706',
  red: '#EF4444',
  violet: '#7C3AED',
  appBackground: '#F8FAFC',
  cardSurface: '#FFFFFF',
  offWhite: '#F1F5F9',
  border: '#E2E8F0',
  borderFocus: '#7EC8E3',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textSlate: '#334155',
};

export const DEMO_ACCOUNTS = [
  {
    id: 'client-yonas',
    role: 'client',
    roleLabel: 'Client',
    name: 'Yonas Molla',
    email: 'yonas.molla@email.com',
    password: 'password123',
    headline: 'Homeowner in Bole',
    city: 'Addis Ababa, Bole',
    avatar: '👤',
    tag: 'Looking for pros',
  },
  {
    id: 'provider-samuel',
    role: 'provider',
    roleLabel: 'Provider',
    name: 'Samuel Girma',
    email: 'samuel.girma@email.com',
    password: 'password123',
    headline: 'Master Plumber & Pipe Specialist',
    category: 'plumbing',
    avatar: '🔧',
    tag: '5.0 ★ Top Rated',
  },
  {
    id: 'admin-superuser',
    role: 'admin',
    roleLabel: 'Super Admin',
    name: 'Super Admin',
    email: 'admin@linc.et',
    password: 'password123',
    headline: 'System Administrator & Governance',
    city: 'Addis Ababa',
    avatar: '👑',
    tag: '👑 Super Admin',
    is_admin: true,
  },
];

export const SERVICE_CATEGORIES = [
  { id: 'plumbing', slug: 'plumbing', name: 'Plumbing', icon: '🔧', emoji: '🔧', suggestedHeadline: 'Master Plumber & Pipe Specialist' },
  { id: 'cleaning', slug: 'cleaning', name: 'Cleaning', icon: '🧹', emoji: '🧹', suggestedHeadline: 'Professional Deep Cleaning Specialist' },
  { id: 'electric', slug: 'electric', name: 'Electrical', icon: '⚡', emoji: '⚡', suggestedHeadline: 'Certified Electrician & Wiring Pro' },
  { id: 'it-tech', slug: 'it-tech', name: 'IT & Tech', icon: '💻', emoji: '💻', suggestedHeadline: 'Computer Repair & IT Technician' },
  { id: 'tutoring', slug: 'tutoring', name: 'Tutoring', icon: '📚', emoji: '📚', suggestedHeadline: 'Experienced Academic & Language Tutor' },
  { id: 'transport', slug: 'transport', name: 'Transport', icon: '🚗', emoji: '🚗', suggestedHeadline: 'Safe Driver & Moving Logistics Pro' },
  { id: 'wellness', slug: 'wellness', name: 'Wellness', icon: '💆', emoji: '💆', suggestedHeadline: 'Certified Personal Trainer & Wellness Pro' },
  { id: 'creative', slug: 'creative', name: 'Creative', icon: '🎨', emoji: '🎨', suggestedHeadline: 'Interior Painter & Decorating Specialist' },
];

export const CATEGORIES = SERVICE_CATEGORIES;

export const ADDIS_SUB_CITIES = [
  'Bole, Addis Ababa',
  'Kazanchis, Addis Ababa',
  'Sarbet, Addis Ababa',
  'CMC / Ayat, Addis Ababa',
  'Piassa / Arada, Addis Ababa',
  'Megenagna, Addis Ababa',
  'Mexico / Lideta, Addis Ababa',
  'Akaki Kality, Addis Ababa',
];

export const TRUST_PILLARS = [
  {
    icon: 'ShieldCheck',
    title: 'Verified Professionals',
    description: 'National ID & background checks',
  },
  {
    icon: 'Sparkles',
    title: 'AI Smart Matching',
    description: 'Instant recommendations & trust advisor',
  },
  {
    icon: 'Lock',
    title: 'Chapa Escrow Safe',
    description: 'Funds held securely until job is done',
  },
  {
    icon: 'MessageSquare',
    title: 'Real-time Direct Chat',
    description: 'Direct communication & quote negotiation',
  },
];
