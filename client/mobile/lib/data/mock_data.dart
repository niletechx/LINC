import '../models/provider_model.dart';
import '../models/service_model.dart';
import '../models/booking_model.dart';
import '../models/conversation_model.dart';
import '../models/chat_message_model.dart';
import '../config/colors.dart';

/// All mock data ported 1:1 from LINC-REEACT/src/App.tsx
class MockData {
  // ── Providers ──────────────────────────────────────────────────────────────
  static final List<ProviderModel> providers = [
    ProviderModel(
      id: 1, initials: 'AG', color: AppColors.avatarTeal,
      name: 'Abebe Girma', headline: 'Senior Plumber & Pipe Specialist',
      rating: 4.9, reviews: 42, distance: '1.8 km', price: '300 ETB/hr',
      verified: true, match: 96, jobs: 85, response: '~5 min',
      about: 'Licensed plumber with 8 years of experience across residential and commercial properties in Addis. Specializes in leak detection, pipe installations, and emergency repairs. Fast, clean, and reliable.',
      services: [
        ServiceModel(name: 'Leak Detection & Repair', tags: ['Emergency', 'Same-day'], duration: '1–3 hrs', price: '300 ETB/hr', fixed: false),
        ServiceModel(name: 'Full Pipe Installation', tags: ['Residential', 'Commercial'], duration: 'Half day', price: '1,500 ETB', fixed: true),
        ServiceModel(name: 'Bathroom Fitting', tags: ['Renovation'], duration: '1–2 days', price: 'From 3,000 ETB', fixed: true),
      ],
    ),
    ProviderModel(
      id: 2, initials: 'SM', color: AppColors.avatarCyan,
      name: 'Sara Mekonnen', headline: 'House Cleaning Pro',
      rating: 4.8, reviews: 67, distance: '0.9 km', price: '250 ETB/hr',
      verified: true, match: 91, jobs: 120, response: '~8 min',
      about: 'Professional cleaner offering deep-cleaning, post-construction cleaning, and regular maintenance packages. Uses eco-friendly products. Trusted by over 120 families in Bole and CMC area.',
      services: [
        ServiceModel(name: 'Standard Home Cleaning', tags: ['Weekly', 'Bi-weekly'], duration: '2–4 hrs', price: '250 ETB/hr', fixed: false),
        ServiceModel(name: 'Deep Cleaning', tags: ['One-time'], duration: 'Full day', price: '1,800 ETB', fixed: true),
        ServiceModel(name: 'Move-in / Move-out', tags: ['Post-construction'], duration: 'Full day', price: '2,500 ETB', fixed: true),
      ],
    ),
    ProviderModel(
      id: 3, initials: 'DT', color: AppColors.avatarGreen,
      name: 'Dawit Tadesse', headline: 'IT Support & Repair',
      rating: 4.7, reviews: 38, distance: '3.1 km', price: '400 ETB/hr',
      verified: true, match: 88, jobs: 64, response: '~12 min',
      about: 'IT technician specializing in laptop/PC repairs, networking, and software troubleshooting. Worked with 50+ businesses in Addis. Offers remote support and on-site visits.',
      services: [
        ServiceModel(name: 'Laptop / PC Repair', tags: ['Hardware', 'Software'], duration: '1–4 hrs', price: '400 ETB/hr', fixed: false),
        ServiceModel(name: 'Network Setup', tags: ['Office', 'Home'], duration: '2–6 hrs', price: '1,200 ETB', fixed: true),
        ServiceModel(name: 'Remote IT Support', tags: ['Remote'], duration: '30–60 min', price: '200 ETB', fixed: true),
      ],
    ),
    ProviderModel(
      id: 4, initials: 'HB', color: AppColors.avatarViolet,
      name: 'Helen Bekele', headline: 'Math & Science Tutor',
      rating: 5.0, reviews: 23, distance: '2.2 km', price: '350 ETB/hr',
      verified: true, match: 94, jobs: 46, response: '~3 min',
      about: 'MSc graduate in Applied Mathematics. Tutors grades 7–12 and university entrance prep. Known for making complex concepts simple and building genuine understanding.',
      services: [
        ServiceModel(name: 'Secondary School Math', tags: ['Grade 7–12'], duration: '1 hr', price: '350 ETB/hr', fixed: false),
        ServiceModel(name: 'University Entrance Prep', tags: ['Intensive'], duration: '2 hrs', price: '600 ETB/hr', fixed: false),
        ServiceModel(name: 'Group Sessions (up to 4)', tags: ['Group', 'Discounted'], duration: '1.5 hrs', price: '200 ETB/person', fixed: true),
      ],
    ),
  ];

  static final List<ProviderModel> extraProviders = [
    ProviderModel(id: 5, initials: 'KA', color: AppColors.avatarTeal, name: 'Kalid Ahmed', headline: 'Licensed Electrician', rating: 4.6, reviews: 31, distance: '2.7 km', price: '350 ETB/hr', verified: true, match: 82, jobs: 0, response: '~15 min', about: '', services: []),
    ProviderModel(id: 6, initials: 'FG', color: AppColors.avatarAmber, name: 'Frehiwot Girma', headline: 'Interior Designer', rating: 4.8, reviews: 19, distance: '4.1 km', price: '600 ETB/hr', verified: false, match: 76, jobs: 0, response: '~15 min', about: '', services: []),
    ProviderModel(id: 7, initials: 'BT', color: AppColors.avatarDarkTeal, name: 'Biruk Tesfaye', headline: 'AC & HVAC Technician', rating: 4.5, reviews: 44, distance: '1.2 km', price: '450 ETB/hr', verified: true, match: 85, jobs: 0, response: '~15 min', about: '', services: []),
  ];

  static List<ProviderModel> get allProviders => [...providers, ...extraProviders];

  // ── Conversations ──────────────────────────────────────────────────────────
  static final List<ConversationModel> conversations = [
    ConversationModel(id: '1', providerId: '1', name: 'Abebe Girma', initials: 'AG', color: AppColors.avatarTeal, lastMsg: 'I can be there by 3pm, does that work?', time: '2m', unread: 2, online: true),
    ConversationModel(id: '2', providerId: '2', name: 'Sara Mekonnen', initials: 'SM', color: AppColors.avatarCyan, lastMsg: 'Thank you for the booking! See you tomorrow.', time: '1h', unread: 0, online: false),
    ConversationModel(id: '3', providerId: '3', name: 'Dawit Tadesse', initials: 'DT', color: AppColors.avatarGreen, lastMsg: 'The laptop repair is complete. You can pick it up.', time: '3h', unread: 0, online: true),
    ConversationModel(id: '4', providerId: '4', name: 'Helen Bekele', initials: 'HB', color: AppColors.avatarViolet, lastMsg: 'Our next session is Thursday at 4pm.', time: '1d', unread: 0, online: false),
  ];

  // ── DM Seed ────────────────────────────────────────────────────────────────
  static final Map<dynamic, List<DMMessage>> dmSeed = {
    '1': [
      DMMessage(fromMe: false, text: 'Hello! I saw your request for plumbing help in Bole. I\'m available today.', time: '10:12'),
      DMMessage(fromMe: true, text: 'Great! Can you come at around 3pm? It\'s a pipe leak in the kitchen.', time: '10:14'),
      DMMessage(fromMe: false, text: 'Yes, 3pm works perfectly. My rate is 300 ETB/hr, and most kitchen leaks take 1–2 hours.', time: '10:15'),
      DMMessage(fromMe: true, text: 'Sounds good. I\'ll book you now.', time: '10:16'),
      DMMessage(fromMe: false, text: 'I can be there by 3pm, does that work?', time: '10:20'),
    ],
  };

  // ── Bookings ───────────────────────────────────────────────────────────────
  static final List<BookingModel> bookings = [
    BookingModel(id: 1, title: 'Pipe Leak Repair', provider: 'Abebe Girma', initials: 'AG', color: AppColors.avatarTeal, date: 'Today, 3:00 PM', price: '600 ETB', status: BookingStatus.confirmed),
    BookingModel(id: 2, title: 'Deep House Cleaning', provider: 'Sara Mekonnen', initials: 'SM', color: AppColors.avatarCyan, date: 'Aug 18, 9:00 AM', price: '750 ETB', status: BookingStatus.upcoming),
    BookingModel(id: 3, title: 'Laptop Screen Repair', provider: 'Dawit Tadesse', initials: 'DT', color: AppColors.avatarGreen, date: 'Aug 12, 11:00 AM', price: '800 ETB', status: BookingStatus.completed),
  ];

  // ── AI initial message ─────────────────────────────────────────────────────
  static final List<ChatMessage> initialAiMessages = [
    ChatMessage(role: MessageRole.ai, text: 'Hi! I\'m LINC AI. Describe what you need in plain language — location, budget, urgency — and I\'ll match you with the best verified providers nearby.'),
  ];
}
