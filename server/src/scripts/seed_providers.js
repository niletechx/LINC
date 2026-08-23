require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 16 Categories definition
const CATEGORIES = [
  { name: 'Plumbing', slug: 'plumbing', icon: '🔧', description: 'Pipes, leaks, drainage, fixture repairs & installations' },
  { name: 'Electrical', slug: 'electrical', icon: '⚡', description: 'Wiring, circuit breakers, backup generators & solar systems' },
  { name: 'Cleaning & Housekeeping', slug: 'cleaning', icon: '🧹', description: 'Home deep cleaning, office sanitization, post-construction cleaning' },
  { name: 'Carpet & Upholstery Cleaning', slug: 'carpet-cleaning', icon: '🛋️', description: 'Steam & foam cleaning for sofas, mattresses, rugs and car interiors' },
  { name: 'Pest Control & Fumigation', slug: 'pest-control', icon: '🐜', description: 'Pest eradication, termite treatment, bedbug & rodent control' },
  { name: 'Carpentry & Woodwork', slug: 'carpentry', icon: '🪚', description: 'Custom furniture, kitchen cabinets, wooden partitions & door repairs' },
  { name: 'Painting & Finishing', slug: 'painting', icon: '🎨', description: 'Interior/exterior wall painting, gypsum decor & waterproofing' },
  { name: 'Appliance Repair', slug: 'appliance-repair', icon: '🧺', description: 'Washing machines, refrigerators, microwaves, ovens & water heaters' },
  { name: 'Tech & Electronics Repair', slug: 'tech', icon: '💻', description: 'Laptops, smartphones, micro-soldering & display replacements' },
  { name: 'Network & CCTV Installation', slug: 'network-cctv', icon: '📹', description: 'WiFi router config, structured network cabling & security cameras' },
  { name: 'Software & Web Development', slug: 'software-dev', icon: '🌐', description: 'Full-stack websites, mobile apps, UI/UX design & IT consulting' },
  { name: 'Academic & Language Tutoring', slug: 'tutoring', icon: '📚', description: 'STEM tutoring, national exam prep, English, French & Amharic lessons' },
  { name: 'Beauty, Barber & Spa', slug: 'beauty', icon: '💇', description: 'Hairstyling, braiding, barber grooming, bridal makeup & skincare' },
  { name: 'Auto Mechanic & Towing', slug: 'auto', icon: '🚗', description: 'Mobile auto mechanics, computerized diagnostics, brake repair & towing' },
  { name: 'Moving & Cargo Transport', slug: 'moving', icon: '📦', description: 'Household relocation, heavy cargo transport & packing services' },
  { name: 'Events, Catering & Media', slug: 'events', icon: '📸', description: 'Traditional Ethiopian catering, event decoration & professional photography' },
];

// 5 Demo Reviewers / Customers
const REVIEWER_USERS = [
  {
    email: 'yonas.molla@linc.et',
    full_name: 'Yonas Molla',
    username: 'yonas_m',
    location_city: 'Addis Ababa (Bole)',
    phone: '+251911223344',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    email: 'tigist.alemu@linc.et',
    full_name: 'Tigist Alemu',
    username: 'tigist_a',
    location_city: 'Addis Ababa (Kazanchis)',
    phone: '+251911334455',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
  {
    email: 'dawit.haile@linc.et',
    full_name: 'Dawit Haile',
    username: 'dawit_h',
    location_city: 'Addis Ababa (CMC)',
    phone: '+251911445566',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    email: 'meron.worku@linc.et',
    full_name: 'Meron Worku',
    username: 'meron_w',
    location_city: 'Addis Ababa (Sarbet)',
    phone: '+251911556677',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
  {
    email: 'bereket.tesfaye@linc.et',
    full_name: 'Bereket Tesfaye',
    username: 'bereket_t',
    location_city: 'Hawassa',
    phone: '+251911667788',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  }
];

// 75 Realistic Service Providers with Profiles, Categories, Services & Reviews
const PROVIDERS_DATA = [
  // ─── 1. PLUMBING (5 providers) ───
  {
    user: {
      email: 'samuel.girma.plumb@linc.et',
      full_name: 'Samuel Girma',
      username: 'samuel_plumb',
      phone: '+251911882201',
      location_city: 'Addis Ababa (Bole)',
      location_lat: 9.0012,
      location_lng: 38.7845,
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Certified Master Plumber & Emergency Leak Specialist',
      bio: 'Over 9 years of experience in residential and commercial plumbing. Specialized in high-pressure leak detection, water heater installation, and PPR pipe fittings across Bole and CMC.',
      hourly_rate: 400,
      location_city: 'Addis Ababa (Bole)',
      location_lat: 9.0012,
      location_lng: 38.7845,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.92,
      total_reviews: 47,
      completed_jobs: 168,
    },
    categorySlugs: ['plumbing'],
    services: [
      {
        title: 'Emergency Pipe Leak Detection & Burst Pipe Repair',
        description: 'Rapid on-site response for burst pipes, hidden wall leaks, high-pressure PVC/PPR joint soldering and fixture repairs with pressure testing.',
        price_type: 'fixed',
        price_amount: 850,
        tags: ['emergency', 'pipe leak', 'plumbing', 'bole', 'water pressure'],
      },
      {
        title: 'Water Tank & Booster Pump Installation',
        description: 'Complete installation of overhead Rotomold water tanks, automated float switches, and electric booster pumps with 1-year workmanship warranty.',
        price_type: 'fixed',
        price_amount: 3200,
        tags: ['water tank', 'booster pump', 'installation', 'water supply'],
      },
      {
        title: 'Bathroom Fixture & Toilet Drainage Unblocking',
        description: 'Motorized drain auger unclogging for toilets, showers, and kitchen grease traps without damaging tiles or pipework.',
        price_type: 'fixed',
        price_amount: 600,
        tags: ['drain unblocking', 'toilet repair', 'bathroom', 'sanitary'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Samuel arrived in Bole Medhanealem within 30 minutes of our kitchen pipe bursting. Repaired the joint cleanly and tested thoroughly. Top professional!',
    }
  },
  {
    user: {
      email: 'tariku.lemma.plumb@linc.et',
      full_name: 'Tariku Lemma',
      username: 'tariku_plumb',
      phone: '+251912883302',
      location_city: 'Addis Ababa (Kazanchis)',
      location_lat: 9.0195,
      location_lng: 38.7680,
      avatar_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Commercial Sanitary & Water Line Contractor',
      bio: 'Licensed sanitary engineer handling large apartment buildings, hotel drainage overhauls, and solar water heater installations in Kirkos and Arada.',
      hourly_rate: 450,
      location_city: 'Addis Ababa (Kazanchis)',
      location_lat: 9.0195,
      location_lng: 38.7680,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.85,
      total_reviews: 32,
      completed_jobs: 110,
    },
    categorySlugs: ['plumbing'],
    services: [
      {
        title: 'Solar Water Heater Installation & Maintenance',
        description: 'Sizing, mounting, and connecting solar vacuum tube water heaters with anti-freeze valves and electric backup coils.',
        price_type: 'fixed',
        price_amount: 4500,
        tags: ['solar water heater', 'energy efficient', 'sanitary', 'plumbing'],
      },
      {
        title: 'Full Apartment Rough-In Plumbing',
        description: 'Complete water supply and waste drainage pipe laying for new construction and renovation projects.',
        price_type: 'negotiable',
        price_amount: 12000,
        tags: ['rough-in', 'construction', 'renovation', 'piping'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Tariku installed our solar water heater on the roof. Very neat work, no leaks, and hot water pressure is fantastic.',
    }
  },
  {
    user: {
      email: 'abiy.kebede.plumb@linc.et',
      full_name: 'Abiy Kebede',
      username: 'abiy_plumbing',
      phone: '+251911994403',
      location_city: 'Addis Ababa (CMC & Ayat)',
      location_lat: 9.0280,
      location_lng: 38.8350,
      avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Residential Plumbing & Geyser / Boiler Repair',
      bio: 'Expert in Italian & Turkish water heaters, Ariston geyser element replacement, sink installations, and bathroom redesigns.',
      hourly_rate: 350,
      location_city: 'Addis Ababa (CMC & Ayat)',
      location_lat: 9.0280,
      location_lng: 38.8350,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.78,
      total_reviews: 28,
      completed_jobs: 94,
    },
    categorySlugs: ['plumbing', 'appliance-repair'],
    services: [
      {
        title: 'Ariston & Electric Geyser Heating Element Replacement',
        description: 'Diagnostics, element de-scaling, thermostat calibration, and safety valve replacement for all electric boilers.',
        price_type: 'fixed',
        price_amount: 750,
        tags: ['geyser', 'ariston', 'water heater', 'boiler repair'],
      },
      {
        title: 'Kitchen Sink & Faucet Installation',
        description: 'Granite and stainless sink mounting, pull-out mixer tap installation, and P-trap drain alignment.',
        price_type: 'fixed',
        price_amount: 550,
        tags: ['kitchen sink', 'mixer faucet', 'drainage', 'fitting'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Fixed our Ariston heater which had stopped heating water completely. Replaced the coil quickly and charged a fair rate.',
    }
  },
  {
    user: {
      email: 'mulugeta.tadesse@linc.et',
      full_name: 'Mulugeta Tadesse',
      username: 'mulugeta_plumb',
      phone: '+251913115504',
      location_city: 'Hawassa',
      location_lat: 7.0504,
      location_lng: 38.4855,
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Hawassa Premier Plumbing & Water Filtration Specialist',
      bio: 'Serving Hawassa and surrounding resorts with industrial water filtration, resort pipe systems, borehole pump connectivity, and residential plumbing.',
      hourly_rate: 300,
      location_city: 'Hawassa',
      location_lat: 7.0504,
      location_lng: 38.4855,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.88,
      total_reviews: 22,
      completed_jobs: 78,
    },
    categorySlugs: ['plumbing'],
    services: [
      {
        title: 'Whole-House Water Filtration & Softener Setup',
        description: 'Multi-stage sediment and carbon filtration system assembly for clean, odor-free drinking water.',
        price_type: 'fixed',
        price_amount: 2800,
        tags: ['water filter', 'clean water', 'hawassa', 'plumbing'],
      },
      {
        title: 'Borehole Submersible Pump Connection & Servicing',
        description: 'Deep well pump wiring, non-return valve installation, and pipeline connection to storage tanks.',
        price_type: 'negotiable',
        price_amount: 5000,
        tags: ['borehole', 'pump', 'hawassa', 'water supply'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Installed our 3-stage filtration unit in Hawassa. Water clarity is night and day. Very satisfied.',
    }
  },
  {
    user: {
      email: 'kassahun.worku.plumb@linc.et',
      full_name: 'Kassahun Worku',
      username: 'kassahun_plumb',
      phone: '+251911446605',
      location_city: 'Addis Ababa (Sarbet & Mexico)',
      location_lat: 8.9950,
      location_lng: 38.7420,
      avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Emergency Drainage & Sewer Line Technician',
      bio: 'High-pressure hydro-jetting and motorized sewer unclogging specialist. Available for 24/7 callouts across Lideta, Sarbet, and Nifas Silk.',
      hourly_rate: 380,
      location_city: 'Addis Ababa (Sarbet & Mexico)',
      location_lat: 8.9950,
      location_lng: 38.7420,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.82,
      total_reviews: 35,
      completed_jobs: 125,
    },
    categorySlugs: ['plumbing'],
    services: [
      {
        title: 'Main Sewer Line Hydro-Jet Cleaning',
        description: 'Heavy duty hydro-jetting to clear tree roots, grease clogs, and debris from external sewer pipes.',
        price_type: 'fixed',
        price_amount: 1800,
        tags: ['sewer', 'hydro-jetting', 'drainage', 'emergency'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Cleared our compound sewer blockage that other plumbers could not fix. Punctual and professional.',
    }
  },

  // ─── 2. ELECTRICAL (5 providers) ───
  {
    user: {
      email: 'abebe.kebede.elec@linc.et',
      full_name: 'Abebe Kebede',
      username: 'abebe_electric',
      phone: '+251911778806',
      location_city: 'Addis Ababa (Bole & Sarbet)',
      location_lat: 9.0060,
      location_lng: 38.7710,
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Senior Certified Electrician & Solar Backup Specialist',
      bio: '12 years experience in 3-phase commercial wiring, domestic short-circuit diagnosis, ATS generator changeovers, and lithium hybrid inverter systems.',
      hourly_rate: 420,
      location_city: 'Addis Ababa (Bole & Sarbet)',
      location_lat: 9.0060,
      location_lng: 38.7710,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.95,
      total_reviews: 64,
      completed_jobs: 240,
    },
    categorySlugs: ['electrical'],
    services: [
      {
        title: 'Hybrid Solar Inverter & Battery Backup Setup',
        description: 'Complete 3kW–10kW solar hybrid inverter mounting, lithium battery bank wiring, DC disconnects, and seamless power backup configuration.',
        price_type: 'fixed',
        price_amount: 5500,
        tags: ['solar', 'inverter', 'battery backup', 'power outage', 'green energy'],
      },
      {
        title: 'Electrical Distribution Board & Breaker Box Rewiring',
        description: 'Circuit breaker upgrade, RCD safety switch installation, earth ground rod testing, and load balancing across phases.',
        price_type: 'fixed',
        price_amount: 1400,
        tags: ['breaker box', 'circuit breaker', 'safety switch', 'distribution board'],
      },
      {
        title: 'Automatic Generator Transfer Switch (ATS) Wiring',
        description: 'Automatic transfer switch integration connecting backup diesel/petrol generators to household electrical panels.',
        price_type: 'fixed',
        price_amount: 2200,
        tags: ['generator', 'ATS', 'backup power', 'electrician'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Abebe wired our 5kW Growatt solar inverter and Felicity lithium battery. Power transitions seamlessly without lights flickering during Addis blackouts!',
    }
  },
  {
    user: {
      email: 'yared.teshome.elec@linc.et',
      full_name: 'Yared Teshome',
      username: 'yared_elec',
      phone: '+251912665507',
      location_city: 'Addis Ababa (Gerji & Ayat)',
      location_lat: 9.0120,
      location_lng: 38.8050,
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Residential Wiring, Modern Lighting & Chandelier Specialist',
      bio: 'Specialist in false ceiling LED strip lighting, high-end crystal chandelier mounting, smart switches, and full-house electrical rough-ins.',
      hourly_rate: 350,
      location_city: 'Addis Ababa (Gerji & Ayat)',
      location_lat: 9.0120,
      location_lng: 38.8050,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.87,
      total_reviews: 41,
      completed_jobs: 153,
    },
    categorySlugs: ['electrical'],
    services: [
      {
        title: 'Heavy Crystal Chandelier & Pendant Light Mounting',
        description: 'Reinforced ceiling anchor installation, intricate crystal assembly, and dimmable wiring for luxury living rooms and staircases.',
        price_type: 'fixed',
        price_amount: 1100,
        tags: ['chandelier', 'lighting', 'interior design', 'pendant light'],
      },
      {
        title: 'Cove LED Profile & Smart Dimmer Installation',
        description: 'Hidden architectural LED strip lighting installation with Tuya/Sonoff WiFi smart app switches.',
        price_type: 'fixed',
        price_amount: 950,
        tags: ['smart home', 'led strip', 'lighting', 'smart switch'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Mounted our 15kg crystal chandelier on a 4-meter double-height ceiling securely. Beautiful illumination and clean wiring.',
    }
  },
  {
    user: {
      email: 'solomon.asfaw.elec@linc.et',
      full_name: 'Solomon Asfaw',
      username: 'solomon_elec',
      phone: '+251911332208',
      location_city: 'Bahir Dar',
      location_lat: 11.5936,
      location_lng: 37.3908,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Bahir Dar Electrical Contractor & Motor Rewinding',
      bio: 'Industrial & domestic electrical services in Bahir Dar. Water pump motor rewinding, factory line wiring, and solar irrigation systems.',
      hourly_rate: 320,
      location_city: 'Bahir Dar',
      location_lat: 11.5936,
      location_lng: 37.3908,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.89,
      total_reviews: 26,
      completed_jobs: 88,
    },
    categorySlugs: ['electrical'],
    services: [
      {
        title: 'Electric Motor & Water Pump Rewinding',
        description: 'Copper coil rewinding, insulation varnish baking, and bearing replacements for 1HP–20HP electric induction motors.',
        price_type: 'fixed',
        price_amount: 2400,
        tags: ['motor rewinding', 'pump repair', 'bahir dar', 'industrial'],
      },
      {
        title: 'Complete Commercial Power Distribution Setup',
        description: 'Main switchgear installation, metering cabinets, and certified electrical schematics.',
        price_type: 'negotiable',
        price_amount: 8000,
        tags: ['commercial electrical', 'switchgear', 'bahir dar'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Rewound our 5HP hotel water supply pump in Bahir Dar. Works smoothly with zero overheating.',
    }
  },
  {
    user: {
      email: 'fasil.demissie.elec@linc.et',
      full_name: 'Fasil Demissie',
      username: 'fasil_elec',
      phone: '+251911559909',
      location_city: 'Addis Ababa (Piassa & Arat Kilo)',
      location_lat: 9.0350,
      location_lng: 38.7520,
      avatar_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Emergency Electrical Troubleshooting & Short-Circuit Fixes',
      bio: 'Fast-response electrician for burnt wire tracing, power tripping resolution, socket replacements, and surge protector installation.',
      hourly_rate: 380,
      location_city: 'Addis Ababa (Piassa & Arat Kilo)',
      location_lat: 9.0350,
      location_lng: 38.7520,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.79,
      total_reviews: 33,
      completed_jobs: 119,
    },
    categorySlugs: ['electrical'],
    services: [
      {
        title: 'Emergency Power Tripping & Burnt Wire Diagnosis',
        description: 'Insulation resistance Megger testing to identify grounded or burnt lines causing safety switches to trip.',
        price_type: 'fixed',
        price_amount: 750,
        tags: ['short circuit', 'emergency', 'power tripping', 'electrician'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Traced a dangerous short circuit inside our wall conduits that was tripping the main breaker constantly. Very thorough.',
    }
  },
  {
    user: {
      email: 'elias.mengesha.elec@linc.et',
      full_name: 'Elias Mengesha',
      username: 'elias_elec',
      phone: '+251912448810',
      location_city: 'Adama',
      location_lat: 8.5400,
      location_lng: 39.2700,
      avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Adama Solar & Renewable Energy Installation Specialist',
      bio: 'Specialized in solar water pumps, rooftop PV arrays, and off-grid battery systems throughout Oromia and Adama.',
      hourly_rate: 350,
      location_city: 'Adama',
      location_lat: 8.5400,
      location_lng: 39.2700,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.86,
      total_reviews: 19,
      completed_jobs: 67,
    },
    categorySlugs: ['electrical'],
    services: [
      {
        title: 'Solar PV Rooftop Array Mounting & Inverter Calibration',
        description: 'High-efficiency monocrystalline solar panel roof mounting with aluminum rails and MC4 waterproof cable crimping.',
        price_type: 'fixed',
        price_amount: 4800,
        tags: ['solar panels', 'offgrid', 'adama', 'clean energy'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Elias installed 8 solar panels on our farmhouse near Adama. Clean work and very knowledgeable.',
    }
  },

  // ─── 3. CLEANING & HOUSEKEEPING (5 providers) ───
  {
    user: {
      email: 'helen.tadesse.clean@linc.et',
      full_name: 'Helen Tadesse',
      username: 'helen_clean',
      phone: '+251911993311',
      location_city: 'Addis Ababa (Bole & Old Airport)',
      location_lat: 8.9880,
      location_lng: 38.7460,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Eco-Friendly Residential Deep Cleaning & Sanitization Specialist',
      bio: 'Leading a vetted team of 6 trained cleaners. Specializing in move-in/move-out deep cleans, embassy villa sanitization, and high-standard kitchen steam cleaning.',
      hourly_rate: 300,
      location_city: 'Addis Ababa (Bole & Old Airport)',
      location_lat: 8.9880,
      location_lng: 38.7460,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.97,
      total_reviews: 89,
      completed_jobs: 320,
    },
    categorySlugs: ['cleaning'],
    services: [
      {
        title: 'Complete Move-In / Move-Out Apartment Deep Cleaning',
        description: 'Comprehensive scrub of all rooms, kitchen cabinet degreasing, bathroom descaling, balcony washing, and window interior/exterior cleaning.',
        price_type: 'fixed',
        price_amount: 2500,
        tags: ['deep cleaning', 'move in cleaning', 'apartment', 'sanitization', 'bole'],
      },
      {
        title: 'Post-Construction & Renovation Dust Scrubbing',
        description: 'Heavy paint splatter scraping, cement residue removal from tiles, and fine gypsum dust filtration.',
        price_type: 'fixed',
        price_amount: 3800,
        tags: ['post-construction', 'paint removal', 'heavy cleaning', 'tiles'],
      },
      {
        title: 'Routine Bi-Weekly Housekeeping & Organization',
        description: 'Dusting, vacuuming, mopping, laundry folding, and bed sheet changing with non-toxic detergents.',
        price_type: 'hourly',
        price_amount: 250,
        tags: ['housekeeping', 'routine clean', 'maid service'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Helen and her team transformed our dusty new apartment into a spotless home in just 5 hours. Kitchen and bathrooms smelled incredible!',
    }
  },
  {
    user: {
      email: 'selamawit.hailu.clean@linc.et',
      full_name: 'Selamawit Hailu',
      username: 'selam_clean',
      phone: '+251912774412',
      location_city: 'Addis Ababa (CMC, Summit & Ayat)',
      location_lat: 9.0250,
      location_lng: 38.8510,
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Commercial Office & Corporate Facility Cleaning',
      bio: 'Professional corporate cleaning services for tech offices, clinics, and embassies. Trained in OSHA sanitization and green cleaning protocols.',
      hourly_rate: 320,
      location_city: 'Addis Ababa (CMC, Summit & Ayat)',
      location_lat: 9.0250,
      location_lng: 38.8510,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.89,
      total_reviews: 45,
      completed_jobs: 172,
    },
    categorySlugs: ['cleaning'],
    services: [
      {
        title: 'Office Sanitization & Desk Deep Clean Package',
        description: 'Disinfection of keyboards, screens, conference tables, glass partitions, and restroom sterilization.',
        price_type: 'fixed',
        price_amount: 3200,
        tags: ['office cleaning', 'corporate', 'disinfection', 'sanitization'],
      },
      {
        title: 'Exterior & High-Rise Window Squeegee Cleaning',
        description: 'Streak-free window washing using telescopic extension poles and professional mineral-free glass cleaner.',
        price_type: 'fixed',
        price_amount: 1500,
        tags: ['window cleaning', 'glass washing', 'streak-free'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Our tech startup office in CMC is cleaned weekly by Selamawit. Reliable, quiet, and very detail-oriented.',
    }
  },
  {
    user: {
      email: 'eden.berhane.clean@linc.et',
      full_name: 'Eden Berhane',
      username: 'eden_clean',
      phone: '+251911663313',
      location_city: 'Addis Ababa (Kazanchis & Megenagna)',
      location_lat: 9.0210,
      location_lng: 38.7890,
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Kitchen Degreasing & Exhaust Hood Steam Cleaning',
      bio: 'Commercial and residential kitchen cleaning specialist. We remove tough burnt oils, carbon deposits from stove tops, ovens, and extractors.',
      hourly_rate: 280,
      location_city: 'Addis Ababa (Kazanchis & Megenagna)',
      location_lat: 9.0210,
      location_lng: 38.7890,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.91,
      total_reviews: 38,
      completed_jobs: 140,
    },
    categorySlugs: ['cleaning'],
    services: [
      {
        title: 'Heavy Kitchen Hood & Oven Carbon Removal',
        description: 'Industrial steam degreaser treatment of extractor filters, oven interiors, and kitchen backsplash tiles.',
        price_type: 'fixed',
        price_amount: 1400,
        tags: ['kitchen cleaning', 'degreasing', 'oven clean', 'steam'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Our restaurant exhaust hood looked brand new after Eden’s deep steam clean. Saved us from buying a new filter!',
    }
  },
  {
    user: {
      email: 'tsion.assefa.clean@linc.et',
      full_name: 'Tsion Assefa',
      username: 'tsion_clean',
      phone: '+251913884414',
      location_city: 'Hawassa',
      location_lat: 7.0580,
      location_lng: 38.4720,
      avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Hawassa Villa & Guest House Housekeeping Services',
      bio: 'Trusted cleaning provider for Hawassa lakeside guest houses, short-stay Airbnbs, and private residences.',
      hourly_rate: 250,
      location_city: 'Hawassa',
      location_lat: 7.0580,
      location_lng: 38.4720,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.84,
      total_reviews: 24,
      completed_jobs: 85,
    },
    categorySlugs: ['cleaning'],
    services: [
      {
        title: 'Airbnb & Short-Stay Villa Turnover Cleaning',
        description: 'Express turnaround cleaning, linen change, toiletry restocking, and guest-ready quality inspection.',
        price_type: 'fixed',
        price_amount: 1200,
        tags: ['airbnb cleaning', 'guest house', 'hawassa', 'turnover'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Handles turnover for our Hawassa vacation rental. Guests constantly praise the cleanliness in their reviews.',
    }
  },
  {
    user: {
      email: 'rahel.mesfin.clean@linc.et',
      full_name: 'Rahel Mesfin',
      username: 'rahel_clean',
      phone: '+251911442215',
      location_city: 'Addis Ababa (Lebu & Jomo)',
      location_lat: 8.9620,
      location_lng: 38.7180,
      avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Affordable Residential Cleaning & Laundry Care',
      bio: 'Detail-focused residential cleaner serving Lebu, Jomo, and Betel. Expert in hand washing delicate garments, ironing, and deep mopping.',
      hourly_rate: 200,
      location_city: 'Addis Ababa (Lebu & Jomo)',
      location_lat: 8.9620,
      location_lng: 38.7180,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.75,
      total_reviews: 29,
      completed_jobs: 98,
    },
    categorySlugs: ['cleaning'],
    services: [
      {
        title: 'Full Day House Cleaning & Ironing Bundle',
        description: '6 hours of thorough domestic cleaning, floor scrubbing, kitchen sanitizing, and steam ironing clothes.',
        price_type: 'fixed',
        price_amount: 1100,
        tags: ['house cleaning', 'ironing', 'laundry', 'affordable'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Rahel is very trustworthy and diligent. She cleaned our 2-bedroom home in Lebu thoroughly.',
    }
  },

  // ─── 4. CARPET & UPHOLSTERY CLEANING (5 providers) ───
  {
    user: {
      email: 'biruk.solomon.carpet@linc.et',
      full_name: 'Biruk Solomon',
      username: 'biruk_carpet',
      phone: '+251911227716',
      location_city: 'Addis Ababa (Bole & Kazanchis)',
      location_lat: 9.0150,
      location_lng: 38.7750,
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Steam Carpet & Upholstery Extraction Specialist',
      bio: 'Equipped with Italian Kärcher hot-water soil extractors. We remove stubborn coffee, tea, and pet stains from wool rugs, Persian carpets, and velvet sofas.',
      hourly_rate: 350,
      location_city: 'Addis Ababa (Bole & Kazanchis)',
      location_lat: 9.0150,
      location_lng: 38.7750,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.94,
      total_reviews: 58,
      completed_jobs: 215,
    },
    categorySlugs: ['carpet-cleaning', 'cleaning'],
    services: [
      {
        title: '7-Seater Living Room Sofa Shampoo & Steam Extraction',
        description: 'Deep foam injection, agitation of fabric fibers, hot steam extraction, and quick 3-hour drying blower treatment.',
        price_type: 'fixed',
        price_amount: 1800,
        tags: ['sofa cleaning', 'steam extraction', 'couch shampoo', 'stain removal'],
      },
      {
        title: 'Large Persian / Wool Area Rug Deep Washing',
        description: 'Color-safe antimicrobial wash, fringe detangling, and moisture extraction for delicate woven rugs.',
        price_type: 'fixed',
        price_amount: 900,
        tags: ['rug cleaning', 'persian carpet', 'wool rug', 'carpet cleaning'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Brought our light grey L-shaped sofa back to brand-new condition. Removed deep coffee stains completely!',
    }
  },
  {
    user: {
      email: 'nahom.tesfaye.upholstery@linc.et',
      full_name: 'Nahom Tesfaye',
      username: 'nahom_upholstery',
      phone: '+251912558817',
      location_city: 'Addis Ababa (CMC & Ayat)',
      location_lat: 9.0310,
      location_lng: 38.8410,
      avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Car Interior Detailing & Mattress Sanitization Specialist',
      bio: 'Mobile upholstery cleaning unit equipped with professional steam generators. We clean car seats, headliners, and sanitize mattresses from dust mites.',
      hourly_rate: 320,
      location_city: 'Addis Ababa (CMC & Ayat)',
      location_lat: 9.0310,
      location_lng: 38.8410,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.88,
      total_reviews: 36,
      completed_jobs: 130,
    },
    categorySlugs: ['carpet-cleaning'],
    services: [
      {
        title: 'Full Vehicle Interior Deep Shampoo & Detailing',
        description: 'Fabric & leather seat deep cleaning, carpet extraction, roof lining wipe-down, dashboard UV protectant.',
        price_type: 'fixed',
        price_amount: 1600,
        tags: ['car detailing', 'car interior', 'upholstery', 'leather care'],
      },
      {
        title: 'King Size Mattress UV-C Sanitization & Steam Clean',
        description: 'Dust mite extraction, allergen removal, and antimicrobial deodorization for hygienic sleeping.',
        price_type: 'fixed',
        price_amount: 850,
        tags: ['mattress cleaning', 'anti-allergen', 'dust mite removal', 'steam'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Did full detailing on my Toyota RAV4 seats and sanitized our master mattress. Smell is fresh and clean.',
    }
  },
  {
    user: {
      email: 'anteneh.bekele.carpet@linc.et',
      full_name: 'Anteneh Bekele',
      username: 'anteneh_carpet',
      phone: '+251911771118',
      location_city: 'Addis Ababa (Gotera & Sarbet)',
      location_lat: 8.9910,
      location_lng: 38.7560,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Wall-to-Wall Office Carpet Shampooing & Maintenance',
      bio: 'Rotary scrubber and industrial vacuum operator for corporate halls, churches, and hotel ballrooms.',
      hourly_rate: 300,
      location_city: 'Addis Ababa (Gotera & Sarbet)',
      location_lat: 8.9910,
      location_lng: 38.7560,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.81,
      total_reviews: 27,
      completed_jobs: 104,
    },
    categorySlugs: ['carpet-cleaning'],
    services: [
      {
        title: 'Wall-to-Wall Office Carpet Rotary Scrub (per sq meter)',
        description: 'Heavy duty rotary scrubbing with fast drying low-moisture encapsulation shampoo.',
        price_type: 'fixed',
        price_amount: 45,
        tags: ['office carpet', 'rotary scrubber', 'commercial carpet'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Cleaned over 300 sqm of carpet in our NGO office over the weekend. Ready for Monday morning with no damp smell.',
    }
  },
  {
    user: {
      email: 'ferehiwot.gebre.carpet@linc.et',
      full_name: 'Ferehiwot Gebre',
      username: 'ferehiwot_clean',
      phone: '+251913337719',
      location_city: 'Dire Dawa',
      location_lat: 9.5931,
      location_lng: 41.8661,
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Dire Dawa Rug & Velvet Upholstery Care',
      bio: 'Trusted cleaner in Dire Dawa for traditional handmade carpets, majlis seating cushions, and curtains.',
      hourly_rate: 260,
      location_city: 'Dire Dawa',
      location_lat: 9.5931,
      location_lng: 41.8661,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.86,
      total_reviews: 21,
      completed_jobs: 74,
    },
    categorySlugs: ['carpet-cleaning'],
    services: [
      {
        title: 'Arabic / Majlis Floor Cushion & Carpet Washing',
        description: 'Deep soaking, gentle brush scrubbing, and fragrant fabric softener rinse for traditional floor seating sets.',
        price_type: 'fixed',
        price_amount: 1400,
        tags: ['majlis', 'cushion cleaning', 'dire dawa', 'carpet washing'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Cleaned our complete family majlis seating in Dire Dawa. Very fresh and bright colors restored.',
    }
  },
  {
    user: {
      email: 'kaleab.solomon.carpet@linc.et',
      full_name: 'Kaleab Solomon',
      username: 'kaleab_carpet',
      phone: '+251912889920',
      location_city: 'Addis Ababa (Megenagna & Gerji)',
      location_lat: 9.0180,
      location_lng: 38.8020,
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Curtain & Drapery Steam Cleaning On-Site',
      bio: 'Clean heavy blackout curtains and delicate sheer drapes without the hassle of taking them down from rods.',
      hourly_rate: 290,
      location_city: 'Addis Ababa (Megenagna & Gerji)',
      location_lat: 9.0180,
      location_lng: 38.8020,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.79,
      total_reviews: 25,
      completed_jobs: 88,
    },
    categorySlugs: ['carpet-cleaning'],
    services: [
      {
        title: 'On-Site Hanging Curtain Dust & Allergen Steam Cleaning',
        description: 'Vertical steamer deodorization, wrinkle removal, and fine dust extraction without taking down curtains.',
        price_type: 'fixed',
        price_amount: 700,
        tags: ['curtains', 'drapery', 'steam cleaning', 'dust removal'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Steamed our 3 sets of floor-to-ceiling curtains in place. Saved us so much time and effort.',
    }
  },

  // ─── 5. PEST CONTROL & FUMIGATION (4 providers) ───
  {
    user: {
      email: 'getachew.alemu.pest@linc.et',
      full_name: 'Getachew Alemu',
      username: 'getachew_pest',
      phone: '+251911440021',
      location_city: 'Addis Ababa (Bole & Kirkos)',
      location_lat: 9.0080,
      location_lng: 38.7690,
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Certified Pest Exterminator & Bedbug Thermal Fumigation',
      bio: 'Licensed pest control operator with 8 years experience. Using Ministry of Agriculture approved odorless chemicals for cockroach gel baiting, bedbug eradication, and rodent management.',
      hourly_rate: 380,
      location_city: 'Addis Ababa (Bole & Kirkos)',
      location_lat: 9.0080,
      location_lng: 38.7690,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.93,
      total_reviews: 51,
      completed_jobs: 198,
    },
    categorySlugs: ['pest-control'],
    services: [
      {
        title: 'Complete 2-Session Bedbug Eradication Package',
        description: 'Deep micro-spraying of mattresses, bed frames, baseboards, followed by follow-up inspection at 14 days with 6-month guarantee.',
        price_type: 'fixed',
        price_amount: 2800,
        tags: ['bedbugs', 'fumigation', 'pest control', 'guarantee', 'eradication'],
      },
      {
        title: 'Odorless German Cockroach Gel Baiting for Kitchens',
        description: 'Targeted Maxforce gel bait application in electrical sockets, cupboards, and hinges without needing to empty kitchen items.',
        price_type: 'fixed',
        price_amount: 1200,
        tags: ['cockroach gel', 'odorless', 'kitchen pest', 'safe'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Getachew completely eradicated a severe bedbug infestation that two other companies failed to solve. Honest and guaranteed work.',
    }
  },
  {
    user: {
      email: 'dagnachew.tadesse.pest@linc.et',
      full_name: 'Dagnachew Tadesse',
      username: 'dagnachew_pest',
      phone: '+251912336622',
      location_city: 'Addis Ababa (Sarbet & Gullele)',
      location_lat: 9.0420,
      location_lng: 38.7290,
      avatar_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Termite Barrier & Commercial Rodent Exclusion Specialist',
      bio: 'Soil termiticide injection for new foundations, wooden roof treatment, and tamper-resistant bait stations for food warehouses.',
      hourly_rate: 350,
      location_city: 'Addis Ababa (Sarbet & Gullele)',
      location_lat: 9.0420,
      location_lng: 38.7290,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.85,
      total_reviews: 33,
      completed_jobs: 115,
    },
    categorySlugs: ['pest-control'],
    services: [
      {
        title: 'Pre-Construction Anti-Termite Soil Treatment',
        description: 'Trenching and pressure barrier injection to protect foundation wood and electrical conduits from termite damage.',
        price_type: 'negotiable',
        price_amount: 5500,
        tags: ['termite', 'anti-termite', 'foundation', 'pest control'],
      },
      {
        title: 'Compound Rodent & Rat Trapping System',
        description: 'Placement of secure, tamper-proof exterior bait boxes and interior glue boards to clear rats permanently.',
        price_type: 'fixed',
        price_amount: 1500,
        tags: ['rat control', 'rodent', 'compound', 'extermination'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Treated our roof rafters for wood-boring insects and termites. Very professional safety equipment used.',
    }
  },
  {
    user: {
      email: 'bisrat.kebede.pest@linc.et',
      full_name: 'Bisrat Kebede',
      username: 'bisrat_pest',
      phone: '+251911881123',
      location_city: 'Hawassa',
      location_lat: 7.0620,
      location_lng: 38.4810,
      avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Hawassa Mosquito & General Insect Thermal Fogging',
      bio: 'Outdoor thermal fogging for gardens, lakeside hotels, schools, and private estates across Hawassa and SNNPR.',
      hourly_rate: 300,
      location_city: 'Hawassa',
      location_lat: 7.0620,
      location_lng: 38.4810,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.88,
      total_reviews: 24,
      completed_jobs: 82,
    },
    categorySlugs: ['pest-control'],
    services: [
      {
        title: 'Outdoor Garden & Compound Mosquito Thermal Fogging',
        description: 'Smoke fogging to eliminate adult mosquitoes, lake flies, and flies around compound vegetation.',
        price_type: 'fixed',
        price_amount: 1800,
        tags: ['mosquito fogging', 'hawassa', 'garden pest', 'fly control'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Thermal fogged our lakeside hotel garden. Mosquito count dropped dramatically for our guests.',
    }
  },
  {
    user: {
      email: 'tamirat.girma.pest@linc.et',
      full_name: 'Tamirat Girma',
      username: 'tamirat_pest',
      phone: '+251912992224',
      location_city: 'Addis Ababa (CMC & Ayat)',
      location_lat: 9.0290,
      location_lng: 38.8380,
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Residential Pest Inspection & Flea / Tick Eradication',
      bio: 'Pet-safe flea and tick treatment for carpets and outdoor kennels, plus full-home insect barrier spraying.',
      hourly_rate: 320,
      location_city: 'Addis Ababa (CMC & Ayat)',
      location_lat: 9.0290,
      location_lng: 38.8380,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.82,
      total_reviews: 29,
      completed_jobs: 95,
    },
    categorySlugs: ['pest-control'],
    services: [
      {
        title: 'Pet Flea & Tick Yard and Carpet Disinfestation',
        description: 'Safe insect growth regulator spraying to stop flea and tick life cycles in gardens and rugs.',
        price_type: 'fixed',
        price_amount: 1600,
        tags: ['flea control', 'tick spray', 'pet safe', 'pest control'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Solved a bad flea issue from our puppy quickly and safely without hurting our pets.',
    }
  },

  // ─── 6. CARPENTRY & WOODWORK (5 providers) ───
  {
    user: {
      email: 'ermias.worku.wood@linc.et',
      full_name: 'Ermias Worku',
      username: 'ermias_carpentry',
      phone: '+251911773325',
      location_city: 'Addis Ababa (Bole & Kazanchis)',
      location_lat: 9.0140,
      location_lng: 38.7720,
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Master Cabinet Maker & Custom MDF / Solid Wood Craftsman',
      bio: '14 years crafting bespoke modern kitchens, walk-in closets, TV media wall units, and solid oak dining tables with Blum soft-close hardware.',
      hourly_rate: 450,
      location_city: 'Addis Ababa (Bole & Kazanchis)',
      location_lat: 9.0140,
      location_lng: 38.7720,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.96,
      total_reviews: 62,
      completed_jobs: 210,
    },
    categorySlugs: ['carpentry'],
    services: [
      {
        title: 'Custom High-Gloss / Matte Kitchen Cabinet Design & Installation',
        description: '3D CAD visualization, moisture-resistant Turkish MDF cutting, quartz countertop fitting, and soft-close hinge alignment.',
        price_type: 'negotiable',
        price_amount: 35000,
        tags: ['kitchen cabinet', 'custom furniture', 'woodwork', 'carpentry', 'mdf'],
      },
      {
        title: 'Modern TV Wall Acoustic Slat Panel & Floating Console',
        description: 'Wood veneer fluted wall panelling, hidden cable raceways, LED backlighting, and floating TV shelf mounting.',
        price_type: 'fixed',
        price_amount: 8500,
        tags: ['tv unit', 'fluted panel', 'floating console', 'interior carpentry'],
      },
      {
        title: 'Solid Wood Door & Lock Fitting / Repair',
        description: 'Hardwood door trimming, weatherstripping, mortise lock installation, and hinge adjustment.',
        price_type: 'fixed',
        price_amount: 750,
        tags: ['door repair', 'lock fitting', 'carpentry', 'woodwork'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Ermias built our dream kitchen cabinets and island table. Precision cuts, smooth soft-close drawers, and flawless finish!',
    }
  },
  {
    user: {
      email: 'habtamu.girma.wood@linc.et',
      full_name: 'Habtamu Girma',
      username: 'habtamu_wood',
      phone: '+251912664426',
      location_city: 'Addis Ababa (Sarbet & Mexico)',
      location_lat: 8.9970,
      location_lng: 38.7490,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Wardrobe & Walk-in Closet Specialist',
      bio: 'Maximizing bedroom storage with sliding-door wardrobes, built-in shoe racks, jewelry drawers, and mirror integrations.',
      hourly_rate: 380,
      location_city: 'Addis Ababa (Sarbet & Mexico)',
      location_lat: 8.9970,
      location_lng: 38.7490,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.88,
      total_reviews: 39,
      completed_jobs: 142,
    },
    categorySlugs: ['carpentry'],
    services: [
      {
        title: 'Custom Built-in Wardrobe with Sliding Mirror Doors',
        description: 'Full-height bedroom closet with smooth aluminum top-hung sliding rails and internal LED illumination.',
        price_type: 'negotiable',
        price_amount: 22000,
        tags: ['wardrobe', 'closet', 'sliding door', 'bedroom furniture'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Built a gorgeous 3-meter walk-in wardrobe in our master bedroom. Excellent storage layout.',
    }
  },
  {
    user: {
      email: 'yonatan.assefa.wood@linc.et',
      full_name: 'Yonatan Assefa',
      username: 'yonatan_wood',
      phone: '+251911447727',
      location_city: 'Addis Ababa (CMC & Ayat)',
      location_lat: 9.0260,
      location_lng: 38.8320,
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Furniture Restoration, Re-polishing & Wood Repairs',
      bio: 'Restoring antique wooden chairs, dining tables, refinishing scratched veneer, and re-gluing wobbly joints.',
      hourly_rate: 320,
      location_city: 'Addis Ababa (CMC & Ayat)',
      location_lat: 9.0260,
      location_lng: 38.8320,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.81,
      total_reviews: 28,
      completed_jobs: 96,
    },
    categorySlugs: ['carpentry'],
    services: [
      {
        title: 'Solid Wood Table & Chair Sanding & Polyurethane Polish',
        description: 'Machine sanding of water marks and scratches, wood stain coloring, and 3-coat high-durability polyurethane seal.',
        price_type: 'fixed',
        price_amount: 2200,
        tags: ['furniture polish', 'wood restoration', 'antique repair'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Restored my grandmother’s vintage Wanza dining table. It looks as rich and beautiful as new.',
    }
  },
  {
    user: {
      email: 'mulu.gebremedhin.wood@linc.et',
      full_name: 'Mulu Gebremedhin',
      username: 'mulu_carpenter',
      phone: '+251913551128',
      location_city: 'Gondar',
      location_lat: 12.6030,
      location_lng: 37.4650,
      avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Traditional & Modern Wooden Craftsmanship in Gondar',
      bio: 'Handcrafted traditional Ethiopian coffee tables (Rekebot stands), carved timber pillars, wooden pergolas, and roof trusses.',
      hourly_rate: 280,
      location_city: 'Gondar',
      location_lat: 12.6030,
      location_lng: 37.4650,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.87,
      total_reviews: 23,
      completed_jobs: 79,
    },
    categorySlugs: ['carpentry'],
    services: [
      {
        title: 'Hand-Carved Wooden Rekebot & Traditional Coffee Stand',
        description: 'Authentic Wanza and Zigba wood carved coffee ceremony furniture with polished bronze inlays.',
        price_type: 'fixed',
        price_amount: 3500,
        tags: ['rekebot', 'traditional wood', 'gondar', 'coffee stand'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Superb wood carving skills. Our traditional coffee set stand is the center of attention in our living room.',
    }
  },
  {
    user: {
      email: 'tewodros.hailu.wood@linc.et',
      full_name: 'Tewodros Hailu',
      username: 'teddy_carpentry',
      phone: '+251911995529',
      location_city: 'Addis Ababa (Lebu & Jomo)',
      location_lat: 8.9680,
      location_lng: 38.7230,
      avatar_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Hardwood Parquet Flooring Installation & Sanding',
      bio: 'Specialist in solid oak parquet laying, tongue-and-groove laminate flooring, skirting boards, and moisture barrier underlayment.',
      hourly_rate: 360,
      location_city: 'Addis Ababa (Lebu & Jomo)',
      location_lat: 8.9680,
      location_lng: 38.7230,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.84,
      total_reviews: 31,
      completed_jobs: 108,
    },
    categorySlugs: ['carpentry', 'painting'],
    services: [
      {
        title: 'German Laminate Flooring & Skirting Board Installation',
        description: 'Leveling subfloor, laying sound-damping underlay foam, click-lock laminate fitting, and corner skirting trim.',
        price_type: 'fixed',
        price_amount: 180,
        tags: ['laminate flooring', 'parquet', 'flooring installation', 'skirting'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Installed laminate flooring in our entire 3-bedroom flat in 2 days. Seamless joints and clean edges.',
    }
  },

  // ─── 7. PAINTING & FINISHING (5 providers) ───
  {
    user: {
      email: 'fikadu.tsegaye.paint@linc.et',
      full_name: 'Fikadu Tsegaye',
      username: 'fikadu_paint',
      phone: '+251911883330',
      location_city: 'Addis Ababa (Bole & CMC)',
      location_lat: 9.0160,
      location_lng: 38.7910,
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Master Interior & Exterior Painter | Gypsum Board & Stucco Finishes',
      bio: '11 years experience in premium interior painting (Dulux, Jotun, Rainbow), Italian stucco / stucco antico effects, gypsum ceiling installation, and exterior weatherproofing.',
      hourly_rate: 350,
      location_city: 'Addis Ababa (Bole & CMC)',
      location_lat: 9.0160,
      location_lng: 38.7910,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.93,
      total_reviews: 56,
      completed_jobs: 195,
    },
    categorySlugs: ['painting'],
    services: [
      {
        title: 'Full Villa / Apartment Interior Painting (Washable Silk Paint)',
        description: 'Surface wall putty preparation, sanding, primer coat, and 2 coats of premium washable silk emulsion with clean masking tape edges.',
        price_type: 'negotiable',
        price_amount: 8500,
        tags: ['interior painting', 'washable paint', 'wall putty', 'house painter'],
      },
      {
        title: 'Gypsum Board Ceiling Installation & Cove Light Framing',
        description: 'Galvanized metal stud framing, 12.5mm Knauf gypsum board mounting, mesh joint taping, and smooth skim plastering.',
        price_type: 'fixed',
        price_amount: 650,
        tags: ['gypsum ceiling', 'false ceiling', 'plastering', 'interior decor'],
      },
      {
        title: 'Luxury Italian Stucco / Velvet Texture Accent Wall',
        description: 'Trowel-applied Venetian marble plastering and wax burnishing for stunning feature walls in living rooms and salons.',
        price_type: 'fixed',
        price_amount: 3500,
        tags: ['stucco', 'venetian plaster', 'feature wall', 'luxury paint'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Fikadu painted our 4-bedroom house and installed gypsum light troughs. Crisp lines, zero paint drips on floors, and completed ahead of schedule.',
    }
  },
  {
    user: {
      email: 'birhanu.alemayehu.paint@linc.et',
      full_name: 'Birhanu Alemayehu',
      username: 'birhanu_paint',
      phone: '+251912551131',
      location_city: 'Addis Ababa (Kazanchis & Arat Kilo)',
      location_lat: 9.0270,
      location_lng: 38.7610,
      avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Exterior Weatherproof Spray Painting & Wall Crack Repair',
      bio: 'Specialist in exterior elastomeric waterproofing paint, scaffolding setup, concrete crack epoxy injection, and anti-fungal wall treatments.',
      hourly_rate: 380,
      location_city: 'Addis Ababa (Kazanchis & Arat Kilo)',
      location_lat: 9.0270,
      location_lng: 38.7610,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.87,
      total_reviews: 38,
      completed_jobs: 135,
    },
    categorySlugs: ['painting'],
    services: [
      {
        title: 'Exterior Building Elastomeric Waterproof Coating',
        description: 'Pressure washing facade, sealing hairline cracks, and applying 2 thick coats of UV-resistant waterproof exterior paint.',
        price_type: 'negotiable',
        price_amount: 14000,
        tags: ['exterior painting', 'waterproofing', 'weatherproof', 'building facade'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Fixed our rainy season wall dampness and repainted our entire villa exterior. No more water seepage!',
    }
  },
  {
    user: {
      email: 'samson.teshome.paint@linc.et',
      full_name: 'Samson Teshome',
      username: 'samson_paint',
      phone: '+251911449932',
      location_city: 'Bahir Dar',
      location_lat: 11.5980,
      location_lng: 37.3850,
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Bahir Dar Residential Painter & Decorative Wall Finishes',
      bio: 'Trusted residential painter across Bahir Dar. Specializing in vibrant color consultations, wood staining, and oil-based gate/fence enamels.',
      hourly_rate: 270,
      location_city: 'Bahir Dar',
      location_lat: 11.5980,
      location_lng: 37.3850,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.84,
      total_reviews: 26,
      completed_jobs: 89,
    },
    categorySlugs: ['painting'],
    services: [
      {
        title: 'Wrought Iron Gate & Compound Fence Enamel Painting',
        description: 'Rust wire-brushing, anti-corrosive red oxide primer, and gloss alkyd enamel finish in black/gold/bronze.',
        price_type: 'fixed',
        price_amount: 1900,
        tags: ['gate painting', 'anti-rust', 'fence paint', 'bahir dar'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Painted our compound metal gate and window grilles. Smooth glossy finish and very clean worker.',
    }
  },
  {
    user: {
      email: 'negash.wolde.paint@linc.et',
      full_name: 'Negash Wolde',
      username: 'negash_paint',
      phone: '+251913662233',
      location_city: 'Addis Ababa (Gerji & Summit)',
      location_lat: 9.0090,
      location_lng: 38.8250,
      avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Wallpaper Installation & 3D Wall Panel Specialist',
      bio: 'Expert installer of vinyl wallpapers, photo murals, peel-and-stick geometric patterns, and PVC 3D decorative wall panels.',
      hourly_rate: 300,
      location_city: 'Addis Ababa (Gerji & Summit)',
      location_lat: 9.0090,
      location_lng: 38.8250,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.80,
      total_reviews: 30,
      completed_jobs: 102,
    },
    categorySlugs: ['painting'],
    services: [
      {
        title: 'Luxury Wallpaper Hanging & Pattern Matching',
        description: 'Wall sizing primer, heavy-duty starch adhesive pasting, bubble-free smoothing, and seam trimming.',
        price_type: 'fixed',
        price_amount: 450,
        tags: ['wallpaper', 'interior design', 'wall decor', 'accent wall'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Hung textured wallpaper in our master bedroom and salon. Pattern matches are seamless.',
    }
  },
  {
    user: {
      email: 'dawit.mulugeta.paint@linc.et',
      full_name: 'Dawit Mulugeta',
      username: 'dawit_painter',
      phone: '+251911991134',
      location_city: 'Addis Ababa (Sarbet & Old Airport)',
      location_lat: 8.9920,
      location_lng: 38.7380,
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Epoxy Floor Coating & Concrete Sealing Specialist',
      bio: 'Industrial and garage 3D epoxy floor installations, metallic resin finishes, and anti-dust warehouse floor sealing.',
      hourly_rate: 400,
      location_city: 'Addis Ababa (Sarbet & Old Airport)',
      location_lat: 8.9920,
      location_lng: 38.7380,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.90,
      total_reviews: 35,
      completed_jobs: 118,
    },
    categorySlugs: ['painting'],
    services: [
      {
        title: 'Garage & Workshop High-Gloss Epoxy Floor Coating',
        description: 'Diamond floor grinding, self-leveling epoxy primer, decorative color flakes, and chemical-resistant topcoat.',
        price_type: 'negotiable',
        price_amount: 9500,
        tags: ['epoxy floor', 'garage floor', 'resin', 'industrial coating'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Turned our dusty garage concrete into a mirror-gloss grey epoxy floor. Easy to clean and looks fantastic.',
    }
  },

  // ─── 8. APPLIANCE REPAIR (5 providers) ───
  {
    user: {
      email: 'bereket.tesfaye.appliance@linc.et',
      full_name: 'Bereket Tesfaye',
      username: 'bereket_appliance',
      phone: '+251911330035',
      location_city: 'Addis Ababa (Bole & Kazanchis)',
      location_lat: 9.0110,
      location_lng: 38.7770,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Senior Washing Machine & Refrigerator Technician',
      bio: '10 years experience repairing LG, Samsung, Bosch, Beko, and Whirlpool appliances. Direct inverter motor diagnostics, PCB board repair, and R600a gas refilling.',
      hourly_rate: 400,
      location_city: 'Addis Ababa (Bole & Kazanchis)',
      location_lat: 9.0110,
      location_lng: 38.7770,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.94,
      total_reviews: 67,
      completed_jobs: 260,
    },
    categorySlugs: ['appliance-repair'],
    services: [
      {
        title: 'Automatic Washing Machine Drum & Motor Repair',
        description: 'Fixing spin cycle failure, drain pump blockage, bearing replacement, error codes (OE, DE, LE), and main PCB repairs.',
        price_type: 'fixed',
        price_amount: 950,
        tags: ['washing machine', 'appliance repair', 'samsung', 'lg', 'bosch'],
      },
      {
        title: 'Refrigerator Inverter Compressor & Gas Recharge (R600a/R134a)',
        description: 'Refrigerant leak detection, capillary tube flushing, compressor relay replacement, and digital thermostat calibration.',
        price_type: 'fixed',
        price_amount: 1600,
        tags: ['refrigerator', 'fridge repair', 'gas refill', 'cooling problem'],
      },
      {
        title: 'Microwave & Convection Oven High-Voltage Repair',
        description: 'Magnetron replacement, door switch interlock repair, high-voltage diode & capacitor testing.',
        price_type: 'fixed',
        price_amount: 650,
        tags: ['microwave repair', 'oven', 'kitchen appliance'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Bereket fixed our LG front-load washer that was throwing an OE error code and leaking water. Fast diagnosis and genuine parts used.',
    }
  },
  {
    user: {
      email: 'yonas.alemu.appliance@linc.et',
      full_name: 'Yonas Alemu',
      username: 'yonas_appliances',
      phone: '+251912443336',
      location_city: 'Addis Ababa (CMC & Ayat)',
      location_lat: 9.0290,
      location_lng: 38.8340,
      avatar_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Commercial Freezer & Cold Room Maintenance Specialist',
      bio: 'Servicing supermarket chillers, bakery convection ovens, ice machines, and residential double-door American refrigerators.',
      hourly_rate: 450,
      location_city: 'Addis Ababa (CMC & Ayat)',
      location_lat: 9.0290,
      location_lng: 38.8340,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.89,
      total_reviews: 42,
      completed_jobs: 145,
    },
    categorySlugs: ['appliance-repair'],
    services: [
      {
        title: 'Commercial Walk-in Chiller & Cold Room Servicing',
        description: 'Condenser coil chemical cleaning, expansion valve tuning, defrost timer replacement, and fan motor overhaul.',
        price_type: 'fixed',
        price_amount: 3500,
        tags: ['cold room', 'commercial refrigeration', 'chiller repair'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Repaired our bakery’s deep freezer before all our dairy spoiled. Emergency response on a Sunday!',
    }
  },
  {
    user: {
      email: 'henok.girma.appliance@linc.et',
      full_name: 'Henok Girma',
      username: 'henok_appliances',
      phone: '+251911885537',
      location_city: 'Addis Ababa (Sarbet & Mexico)',
      location_lat: 8.9980,
      location_lng: 38.7440,
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Dishwasher, Water Dispenser & Kitchen Range Repair',
      bio: 'Experienced in built-in dishwashers, hot/cold water dispensers, induction cooktops, and Italian gas stove burners.',
      hourly_rate: 350,
      location_city: 'Addis Ababa (Sarbet & Mexico)',
      location_lat: 8.9980,
      location_lng: 38.7440,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.83,
      total_reviews: 31,
      completed_jobs: 112,
    },
    categorySlugs: ['appliance-repair'],
    services: [
      {
        title: 'Built-in Dishwasher Pump & Heating Element Service',
        description: 'Circulation impeller unblocking, water inlet solenoid valve replacement, and descaling spray arms.',
        price_type: 'fixed',
        price_amount: 850,
        tags: ['dishwasher', 'kitchen repair', 'bosch dishwasher', 'appliance'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Repaired our Bosch dishwasher that wouldn’t drain. Came with the right spare pump on hand.',
    }
  },
  {
    user: {
      email: 'dinknesh.teshome.appliance@linc.et',
      full_name: 'Dinknesh Teshome',
      username: 'dinknesh_repair',
      phone: '+251913774438',
      location_city: 'Hawassa',
      location_lat: 7.0540,
      location_lng: 38.4790,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Hawassa Home Appliance & Espresso Machine Technician',
      bio: 'Specialized in domestic washing machines, blenders, juicers, and commercial Italian espresso coffee machines in Hawassa.',
      hourly_rate: 300,
      location_city: 'Hawassa',
      location_lat: 7.0540,
      location_lng: 38.4790,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.88,
      total_reviews: 25,
      completed_jobs: 86,
    },
    categorySlugs: ['appliance-repair'],
    services: [
      {
        title: 'Commercial Espresso Machine Descaling & Gasket Service',
        description: 'Group head gasket replacement, steam wand pressure calibration, boiler scale flush, and pump rebuild.',
        price_type: 'fixed',
        price_amount: 2200,
        tags: ['espresso machine', 'coffee machine', 'hawassa', 'commercial'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Serviced our cafe’s 2-group espresso machine. Steam pressure is now consistent and no portafilter leaks.',
    }
  },
  {
    user: {
      email: 'meles.assefa.appliance@linc.et',
      full_name: 'Meles Assefa',
      username: 'meles_appliances',
      phone: '+251911226639',
      location_city: 'Adama',
      location_lat: 8.5440,
      location_lng: 39.2680,
      avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Adama Refrigerator & Water Heater Service Expert',
      bio: 'Over 8 years solving cooling and heating appliance issues across Adama and Mojo. Quality workmanship guaranteed.',
      hourly_rate: 280,
      location_city: 'Adama',
      location_lat: 8.5440,
      location_lng: 39.2680,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.81,
      total_reviews: 20,
      completed_jobs: 72,
    },
    categorySlugs: ['appliance-repair'],
    services: [
      {
        title: 'Home Refrigerator Gas Top-Up & Thermostat Fix',
        description: 'Fast refrigerant recharge and thermostat sensor change to stop food spoilage in Adama.',
        price_type: 'fixed',
        price_amount: 1200,
        tags: ['refrigerator', 'adama', 'fridge gas', 'cooling'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Fixed our Samsung double-door fridge in Adama within 2 hours of calling.',
    }
  },

  // ─── 9. TECH & ELECTRONICS REPAIR (5 providers) ───
  {
    user: {
      email: 'dawit.bekele.tech@linc.et',
      full_name: 'Dawit Bekele',
      username: 'dawit_tech',
      phone: '+251911448840',
      location_city: 'Addis Ababa (Bole & Piassa)',
      location_lat: 9.0300,
      location_lng: 38.7500,
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Senior Apple Mac & Laptop Hardware Micro-Soldering Specialist',
      bio: 'Apple Certified Mac Technician (ACMT). Specialized in MacBook logic board chip-level repair, short-circuit power IC replacement, liquid damage recovery, and GPU reballing with 6-month warranty.',
      hourly_rate: 500,
      location_city: 'Addis Ababa (Bole & Piassa)',
      location_lat: 9.0300,
      location_lng: 38.7500,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.96,
      total_reviews: 78,
      completed_jobs: 310,
    },
    categorySlugs: ['tech'],
    services: [
      {
        title: 'MacBook M1/M2/M3 & Intel Logic Board Micro-Soldering',
        description: 'Microscope diagnosis of shorted capacitors, CD3217 / USB-C power controller IC replacement, back-light fuse repairs, and liquid corrosion ultrasonic cleaning.',
        price_type: 'fixed',
        price_amount: 3200,
        tags: ['macbook repair', 'logic board', 'micro soldering', 'apple', 'liquid damage'],
      },
      {
        title: 'Original Laptop Screen & Hinge Replacement (Dell, HP, Lenovo, Apple)',
        description: 'Original OEM display panel replacement with true-tone calibration and reinforced steel hinge bracket repair.',
        price_type: 'fixed',
        price_amount: 1800,
        tags: ['screen replacement', 'laptop display', 'hinge repair', 'dell', 'hp'],
      },
      {
        title: 'Corrupted NVMe / SSD Chip-Off Data Recovery',
        description: 'Emergency retrieval of critical files from dead laptops, unreadable external hard drives, and formatted flash storage.',
        price_type: 'fixed',
        price_amount: 2500,
        tags: ['data recovery', 'ssd', 'hard drive', 'file recovery'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Dawit saved my MacBook Pro after a full cup of coffee spilled on it. Other shops said the motherboard was dead; Dawit replaced two burnt PMICs under a microscope. Master technician!',
    }
  },
  {
    user: {
      email: 'natnael.getachew.tech@linc.et',
      full_name: 'Natnael Getachew',
      username: 'natnael_tech',
      phone: '+251912882241',
      location_city: 'Addis Ababa (Bole & Kazanchis)',
      location_lat: 9.0170,
      location_lng: 38.7730,
      avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'iPhone & Samsung Galaxy Flagship Screen & Battery Repair',
      bio: 'Clean-room mobile device technician. OLED glass separation, TrueTone serialization, battery health reset, and Face ID flex repair.',
      hourly_rate: 450,
      location_city: 'Addis Ababa (Bole & Kazanchis)',
      location_lat: 9.0170,
      location_lng: 38.7730,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.91,
      total_reviews: 61,
      completed_jobs: 245,
    },
    categorySlugs: ['tech'],
    services: [
      {
        title: 'iPhone OLED Screen Replacement with TrueTone & IC Transfer',
        description: 'Original color accuracy retention, no "Important Display Message" warnings, and waterproof adhesive reseal.',
        price_type: 'fixed',
        price_amount: 2200,
        tags: ['iphone screen', 'oled', 'samsung display', 'mobile repair', 'truetone'],
      },
      {
        title: 'Original OEM Battery Replacement & Health Calibration',
        description: 'High-capacity genuine lithium-ion cell installation with battery health calibration and 6-month warranty.',
        price_type: 'fixed',
        price_amount: 1400,
        tags: ['iphone battery', 'battery replacement', 'mobile repair'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Replaced my iPhone 14 Pro cracked screen in 40 minutes. TrueTone works, touch is buttery smooth.',
    }
  },
  {
    user: {
      email: 'surafel.kebede.tech@linc.et',
      full_name: 'Surafel Kebede',
      username: 'surafel_tech',
      phone: '+251911776642',
      location_city: 'Addis Ababa (Megenagna & Gerji)',
      location_lat: 9.0150,
      location_lng: 38.8040,
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'PlayStation, Xbox & Gaming PC Custom Build / Repair',
      bio: 'Thermal liquid metal re-application for PS5, HDMI port micro-soldering, joystick drift hall-effect sensor modding, and gaming PC assembly.',
      hourly_rate: 400,
      location_city: 'Addis Ababa (Megenagna & Gerji)',
      location_lat: 9.0150,
      location_lng: 38.8040,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.88,
      total_reviews: 44,
      completed_jobs: 160,
    },
    categorySlugs: ['tech'],
    services: [
      {
        title: 'PS5 / PS4 HDMI Port Replacement & APU Liquid Metal Service',
        description: 'Overcoming overheating shutdowns, replacing damaged HDMI ports, and fixing blue light of death (BLOD).',
        price_type: 'fixed',
        price_amount: 1800,
        tags: ['ps5 repair', 'hdmi port', 'console repair', 'gaming pc'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Fixed my PS5 HDMI port after my nephew yanked the cable. Plays 4K 120Hz flawlessly now.',
    }
  },
  {
    user: {
      email: 'amanuel.yirga.tech@linc.et',
      full_name: 'Amanuel Yirga',
      username: 'amanuel_tech',
      phone: '+251913448843',
      location_city: 'Bahir Dar',
      location_lat: 11.5950,
      location_lng: 37.3880,
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Bahir Dar Computer & Laser Printer Service Expert',
      bio: 'Hardware repairs for HP LaserJet printers, toner cartridge refilling, POS thermal printers, and desktop computer upgrades.',
      hourly_rate: 300,
      location_city: 'Bahir Dar',
      location_lat: 11.5950,
      location_lng: 37.3880,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.82,
      total_reviews: 28,
      completed_jobs: 94,
    },
    categorySlugs: ['tech'],
    services: [
      {
        title: 'LaserJet Printer Fuser Film & Roller Mechanism Overhaul',
        description: 'Fixing paper jams, repeating smudge streaks, gear grinding, and main formatter board issues in Bahir Dar.',
        price_type: 'fixed',
        price_amount: 1200,
        tags: ['printer repair', 'laserjet', 'bahir dar', 'office hardware'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Repaired our office HP multi-function printer in Bahir Dar within half a day. Very dependable.',
    }
  },
  {
    user: {
      email: 'eyob.girma.tech@linc.et',
      full_name: 'Eyob Girma',
      username: 'eyob_tech',
      phone: '+251911993344',
      location_city: 'Addis Ababa (CMC & Summit)',
      location_lat: 9.0280,
      location_lng: 38.8470,
      avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Windows OS Optimization, Virus Removal & SSD Clones',
      bio: 'Software specialist for removing ransomware, migrating old HDDs to lightning-fast NVMe SSDs without losing data, and Office setups.',
      hourly_rate: 300,
      location_city: 'Addis Ababa (CMC & Summit)',
      location_lat: 9.0280,
      location_lng: 38.8470,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.79,
      total_reviews: 32,
      completed_jobs: 115,
    },
    categorySlugs: ['tech', 'software-dev'],
    services: [
      {
        title: 'HDD to High-Speed SSD Migration & Windows 11 Fresh Install',
        description: 'Complete 1-to-1 disk cloning, Windows activation, driver updates, and thermal paste reapplication on CPU/GPU.',
        price_type: 'fixed',
        price_amount: 800,
        tags: ['ssd upgrade', 'windows 11', 'pc speedup', 'virus removal'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'My sluggish Dell laptop boots in 8 seconds now after Eyob upgraded it to an SSD and cleaned the fan. Feels like a new machine!',
    }
  },

  // ─── 10. NETWORK & CCTV INSTALLATION (4 providers) ───
  {
    user: {
      email: 'kaleab.assefa.cctv@linc.et',
      full_name: 'Kaleab Assefa',
      username: 'kaleab_cctv',
      phone: '+251911660045',
      location_city: 'Addis Ababa (Bole & Kazanchis)',
      location_lat: 9.0120,
      location_lng: 38.7760,
      avatar_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Hikvision & Dahua CCTV Security System Engineer',
      bio: 'Cisco & Hikvision certified installer. Design and deployment of IP PoE security cameras, color-at-night AI human detection, NVR storage, and mobile live streaming.',
      hourly_rate: 420,
      location_city: 'Addis Ababa (Bole & Kazanchis)',
      location_lat: 9.0120,
      location_lng: 38.7760,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.95,
      total_reviews: 54,
      completed_jobs: 185,
    },
    categorySlugs: ['network-cctv'],
    services: [
      {
        title: '4-Camera 4K ColorVu IP CCTV System Complete Installation',
        description: 'Conduit pipe routing, Cat6 shielded cabling, PoE switch setup, 2TB hard drive NVR configuration, and phone remote app linking.',
        price_type: 'fixed',
        price_amount: 4500,
        tags: ['cctv installation', 'security camera', 'hikvision', 'poe', 'ip camera'],
      },
      {
        title: 'Smart Video Intercom & Biometric Door Access Control',
        description: 'RFID card and fingerprint reader integration with electromagnetic magnetic lock for secure entrance doors.',
        price_type: 'fixed',
        price_amount: 3200,
        tags: ['access control', 'intercom', 'biometric', 'magnetic lock'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Installed 8 Hikvision ColorVu cameras around our commercial building in Bole. Crisp night vision and mobile app notifications work instantly.',
    }
  },
  {
    user: {
      email: 'nahom.tadesse.net@linc.et',
      full_name: 'Nahom Tadesse',
      username: 'nahom_net',
      phone: '+251912884446',
      location_city: 'Addis Ababa (CMC & Gerji)',
      location_lat: 9.0180,
      location_lng: 38.8150,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Ubiquiti UniFi & MikroTik Mesh WiFi Network Architect',
      bio: 'Eliminating dead WiFi zones in large villas, guest houses, and offices. Multi-gigabit mesh access points, VLAN segmentation, and Ethio Telecom fiber router setup.',
      hourly_rate: 450,
      location_city: 'Addis Ababa (CMC & Gerji)',
      location_lat: 9.0180,
      location_lng: 38.8150,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.90,
      total_reviews: 46,
      completed_jobs: 160,
    },
    categorySlugs: ['network-cctv'],
    services: [
      {
        title: 'Whole-Home Seamless Mesh WiFi Setup (Ubiquiti / TP-Link Deco)',
        description: 'Ceiling mounted access points with seamless roaming so video calls never drop between floors.',
        price_type: 'fixed',
        price_amount: 2800,
        tags: ['wifi setup', 'mesh network', 'unifi', 'networking', 'internet'],
      },
      {
        title: 'Office Structured Cat6 Cabling & Patch Panel Termination',
        description: 'Server rack assembly, patch panel cable dressing, RJ45 fluke testing, and cable label management.',
        price_type: 'fixed',
        price_amount: 3800,
        tags: ['structured cabling', 'cat6', 'server rack', 'patch panel'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Nahom installed a 3-unit UniFi mesh WiFi system in our 3-story villa in CMC. 100Mbps speed in every room including the garden!',
    }
  },
  {
    user: {
      email: 'tsedeke.alemu.cctv@linc.et',
      full_name: 'Tsedeke Alemu',
      username: 'tsedeke_cctv',
      phone: '+251911337747',
      location_city: 'Hawassa',
      location_lat: 7.0510,
      location_lng: 38.4840,
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Hawassa Security Camera & Compound Electric Fence Specialist',
      bio: 'Commercial perimeter electric security fencing, solar-powered CCTV installations for farms and warehouses around Hawassa.',
      hourly_rate: 350,
      location_city: 'Hawassa',
      location_lat: 7.0510,
      location_lng: 38.4840,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.86,
      total_reviews: 29,
      completed_jobs: 98,
    },
    categorySlugs: ['network-cctv'],
    services: [
      {
        title: 'Perimeter Wall Electric Fence Installation (Energizer + Siren)',
        description: 'High-tensile aluminum wire stringing on wall brackets, strobe siren alarm, and backup battery box setup.',
        price_type: 'negotiable',
        price_amount: 16000,
        tags: ['electric fence', 'perimeter security', 'hawassa', 'alarm'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Installed electric perimeter fencing on our compound wall in Hawassa. Very safe and dependable.',
    }
  },
  {
    user: {
      email: 'biruk.tsegaye.net@linc.et',
      full_name: 'Biruk Tsegaye',
      username: 'biruk_network',
      phone: '+251912995548',
      location_city: 'Addis Ababa (Sarbet & Mexico)',
      location_lat: 8.9960,
      location_lng: 38.7480,
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Point-to-Point Long Range Wireless Bridge Installation',
      bio: 'Connecting separate branch buildings up to 10km using Ubiquiti AirFiber / LiteBeam radios without paying monthly telecom leased lines.',
      hourly_rate: 400,
      location_city: 'Addis Ababa (Sarbet & Mexico)',
      location_lat: 8.9960,
      location_lng: 38.7480,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.83,
      total_reviews: 25,
      completed_jobs: 88,
    },
    categorySlugs: ['network-cctv'],
    services: [
      {
        title: 'Building-to-Building Wireless Link (Ubiquiti PtP Bridge)',
        description: 'Mast mounting, line-of-sight alignment, and high-throughput encrypted wireless network link.',
        price_type: 'fixed',
        price_amount: 5500,
        tags: ['wireless bridge', 'point to point', 'ubiquiti', 'long range'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Bridged our warehouse and main office network across 2 kilometers. Saved us enormous telecom fees.',
    }
  },

  // ─── 11. SOFTWARE & WEB DEVELOPMENT (5 providers) ───
  {
    user: {
      email: 'abenezer.kassahun.dev@linc.et',
      full_name: 'Abenezer Kassahun',
      username: 'abenezer_dev',
      phone: '+251911442249',
      location_city: 'Addis Ababa (Bole)',
      location_lat: 9.0040,
      location_lng: 38.7810,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Full-Stack Web & Mobile App Developer | React, Node.js & Flutter',
      bio: '6+ years building production web applications, Telebirr & Chapa payment integrations, e-commerce stores, and high-performance mobile apps with modern UI.',
      hourly_rate: 600,
      location_city: 'Addis Ababa (Bole)',
      location_lat: 9.0040,
      location_lng: 38.7810,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.98,
      total_reviews: 49,
      completed_jobs: 140,
    },
    categorySlugs: ['software-dev'],
    services: [
      {
        title: 'Custom Corporate Website Development (Next.js & Tailwind CSS)',
        description: 'SEO optimized, lightning-fast responsive website with CMS integration, WhatsApp chat button, and Google Maps location.',
        price_type: 'fixed',
        price_amount: 15000,
        tags: ['web development', 'nextjs', 'react', 'website design', 'corporate'],
      },
      {
        title: 'Telebirr, CBE Birr & Chapa Payment Gateway Integration',
        description: 'Secure webhook handling, QR code generation, and automated receipt delivery for Ethiopian digital payment platforms.',
        price_type: 'fixed',
        price_amount: 6000,
        tags: ['telebirr', 'chapa', 'payment gateway', 'cbe birr', 'fintech'],
      },
      {
        title: 'Cross-Platform Flutter iOS & Android Mobile App',
        description: 'Native performance mobile application with push notifications, offline caching, and REST/GraphQL API connection.',
        price_type: 'negotiable',
        price_amount: 32000,
        tags: ['flutter', 'mobile app', 'ios', 'android'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Abenezer integrated Chapa and Telebirr into our travel booking platform smoothly. Clean code and great communicator!',
    }
  },
  {
    user: {
      email: 'selamawit.mengesha.ui@linc.et',
      full_name: 'Selamawit Mengesha',
      username: 'selam_uiux',
      phone: '+251912778850',
      location_city: 'Addis Ababa (Kazanchis)',
      location_lat: 9.0200,
      location_lng: 38.7660,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Senior UI/UX Product Designer | Figma & Design Systems',
      bio: 'Crafting user-centric mobile and web app designs with interactive Figma prototypes, usability testing, and ready-to-code design system tokens.',
      hourly_rate: 550,
      location_city: 'Addis Ababa (Kazanchis)',
      location_lat: 9.0200,
      location_lng: 38.7660,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.93,
      total_reviews: 37,
      completed_jobs: 110,
    },
    categorySlugs: ['software-dev'],
    services: [
      {
        title: 'Complete Mobile App UI/UX Design & Clickable Figma Prototype',
        description: 'User personas, wireframes, 20+ polished UI screens, dark/light modes, and interactive component prototypes.',
        price_type: 'fixed',
        price_amount: 14000,
        tags: ['ui ux design', 'figma', 'mobile design', 'prototype', 'product design'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Selamawit created our e-commerce app UI in Figma. The design was modern, intuitive, and our developers loved her handoff documentation.',
    }
  },
  {
    user: {
      email: 'yonas.tefera.dev@linc.et',
      full_name: 'Yonas Tefera',
      username: 'yonas_wp',
      phone: '+251911884451',
      location_city: 'Addis Ababa (CMC & Ayat)',
      location_lat: 9.0270,
      location_lng: 38.8370,
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'WordPress & WooCommerce E-Commerce Specialist',
      bio: 'Quick turnaround business websites, WooCommerce online shops with local delivery rate calculation, SSL certificates, and speed caching.',
      hourly_rate: 400,
      location_city: 'Addis Ababa (CMC & Ayat)',
      location_lat: 9.0270,
      location_lng: 38.8370,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.86,
      total_reviews: 40,
      completed_jobs: 135,
    },
    categorySlugs: ['software-dev'],
    services: [
      {
        title: 'Full WooCommerce Online Store Setup & Product Catalog',
        description: 'Product variants, shopping cart, coupon codes, automated invoices, and Telegram order notification bot.',
        price_type: 'fixed',
        price_amount: 9500,
        tags: ['wordpress', 'woocommerce', 'ecommerce', 'online store'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Launched our clothing boutique website on WooCommerce in under 5 days. Very easy to manage products myself.',
    }
  },
  {
    user: {
      email: 'kirubel.debebe.ai@linc.et',
      full_name: 'Kirubel Debebe',
      username: 'kirubel_ai',
      phone: '+251913559952',
      location_city: 'Addis Ababa (Sarbet)',
      location_lat: 8.9950,
      location_lng: 38.7460,
      avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'AI & Automation Engineer | Telegram Bots & LLM Integrations',
      bio: 'Building custom Telegram customer support bots with Amharic NLP, automated lead generation, and Google Gemini / OpenAI RAG integrations.',
      hourly_rate: 550,
      location_city: 'Addis Ababa (Sarbet)',
      location_lat: 8.9950,
      location_lng: 38.7460,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.95,
      total_reviews: 33,
      completed_jobs: 92,
    },
    categorySlugs: ['software-dev'],
    services: [
      {
        title: 'Custom Telegram Business & Order Management Bot',
        description: 'Automated order taking, product catalog browsing, customer verification, and live admin dashboard.',
        price_type: 'fixed',
        price_amount: 7500,
        tags: ['telegram bot', 'automation', 'ai bot', 'customer service'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Kirubel built a Telegram bot for our delivery business that automatically processes orders and sends location coordinates to our drivers.',
    }
  },
  {
    user: {
      email: 'rediet.hailu.seo@linc.et',
      full_name: 'Rediet Hailu',
      username: 'rediet_marketing',
      phone: '+251911331153',
      location_city: 'Hawassa',
      location_lat: 7.0560,
      location_lng: 38.4770,
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Google Business Profile & Social Media Growth Consultant',
      bio: 'Helping Ethiopian businesses get to #1 on Google Search & Maps, run profitable Facebook/Instagram Ads, and build high-converting landing pages.',
      hourly_rate: 350,
      location_city: 'Hawassa',
      location_lat: 7.0560,
      location_lng: 38.4770,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.88,
      total_reviews: 29,
      completed_jobs: 90,
    },
    categorySlugs: ['software-dev'],
    services: [
      {
        title: 'Google My Business Verification & Local Maps SEO Optimization',
        description: 'Complete profile setup, keyword-rich description, geotagged photos, and review strategy to rank top in local searches.',
        price_type: 'fixed',
        price_amount: 3500,
        tags: ['seo', 'google maps', 'local business', 'digital marketing'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Got our Hawassa hotel verified on Google Maps and ranking first for local tourism searches. Direct phone inquiries doubled!',
    }
  },

  // ─── 12. ACADEMIC & LANGUAGE TUTORING (5 providers) ───
  {
    user: {
      email: 'bethelhem.hailu.tutor@linc.et',
      full_name: 'Bethelhem Hailu',
      username: 'bethelhem_tutor',
      phone: '+251911440054',
      location_city: 'Addis Ababa (Bole & Kazanchis)',
      location_lat: 9.0150,
      location_lng: 38.7650,
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'High School Mathematics, Physics & SAT Private Tutor',
      bio: 'B.Sc. in Physics from Addis Ababa University with 6+ years tutoring preparatory and international school students (Sandford, ICS, Bingham). Proven track record of boosting national exam scores from 70s to 90s.',
      hourly_rate: 300,
      location_city: 'Addis Ababa (Bole & Kazanchis)',
      location_lat: 9.0150,
      location_lng: 38.7650,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.96,
      total_reviews: 58,
      completed_jobs: 175,
    },
    categorySlugs: ['tutoring'],
    services: [
      {
        title: 'Grade 9–12 Mathematics & Physics Home Tutoring (per month / 8 sessions)',
        description: 'Step-by-step problem solving, past exam paper practice, concept simplification, and regular progress reports for parents.',
        price_type: 'fixed',
        price_amount: 3200,
        tags: ['math tutor', 'physics', 'national exam', 'high school', 'tutoring'],
      },
      {
        title: 'SAT Math & College Entrance Exam Intensive Prep',
        description: 'Algebra, geometry, advanced math drills, time management strategies, and official College Board practice exams.',
        price_type: 'fixed',
        price_amount: 4500,
        tags: ['sat prep', 'college entrance', 'sat math', 'international school'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Bethelhem tutored our son for his 12th grade national exams in Physics and Math. He achieved a 94 in mathematics! Patient, punctual, and highly skilled teacher.',
    }
  },
  {
    user: {
      email: 'michael.berhanu.tutor@linc.et',
      full_name: 'Michael Berhanu',
      username: 'michael_english',
      phone: '+251912885555',
      location_city: 'Addis Ababa (CMC & Ayat)',
      location_lat: 9.0260,
      location_lng: 38.8350,
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'IELTS, TOEFL & Spoken English Fluency Coach',
      bio: 'IELTS Band 8.5 certified trainer. Specializing in accent reduction, professional corporate writing, and fast-track IELTS Academic preparation for study abroad.',
      hourly_rate: 350,
      location_city: 'Addis Ababa (CMC & Ayat)',
      location_lat: 9.0260,
      location_lng: 38.8350,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.92,
      total_reviews: 44,
      completed_jobs: 140,
    },
    categorySlugs: ['tutoring'],
    services: [
      {
        title: '1-on-1 IELTS Academic 4-Week Crash Course (Band 7.5+ Target)',
        description: 'Full coverage of Listening, Reading, Task 1 & 2 Writing corrections, and simulated mock Speaking interviews with feedback.',
        price_type: 'fixed',
        price_amount: 5000,
        tags: ['ielts tutor', 'toefl', 'english lessons', 'study abroad'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Scored an 8.0 on my IELTS Academic after 1 month of Michael’s coaching. His writing feedback was crucial for my Canadian master’s application.',
    }
  },
  {
    user: {
      email: 'genet.assefa.amharic@linc.et',
      full_name: 'Genet Assefa',
      username: 'genet_amharic',
      phone: '+251911779956',
      location_city: 'Addis Ababa (Sarbet & Old Airport)',
      location_lat: 8.9900,
      location_lng: 38.7420,
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Amharic Language Instructor for Expats, Diplomats & Diaspora',
      bio: 'Over 8 years teaching conversational Amharic (Fidel script reading, writing, and cultural etiquette) to embassy staff, UN personnel, and diaspora children.',
      hourly_rate: 380,
      location_city: 'Addis Ababa (Sarbet & Old Airport)',
      location_lat: 8.9900,
      location_lng: 38.7420,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.97,
      total_reviews: 52,
      completed_jobs: 165,
    },
    categorySlugs: ['tutoring'],
    services: [
      {
        title: 'Conversational Amharic for Beginners (8 Sessions Package)',
        description: 'Everyday dialogue, market negotiation, restaurant ordering, and Fidel alphabet recognition with custom workbook materials.',
        price_type: 'fixed',
        price_amount: 3800,
        tags: ['amharic tutor', 'learn amharic', 'expat tutor', 'fidel', 'diplomat'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Genet has been teaching our diplomat family Amharic in Old Airport. Her lessons are engaging, culturally rich, and very practical.',
    }
  },
  {
    user: {
      email: 'solomon.dagne.tutor@linc.et',
      full_name: 'Solomon Dagne',
      username: 'solomon_chemistry',
      phone: '+251913227757',
      location_city: 'Hawassa',
      location_lat: 7.0530,
      location_lng: 38.4820,
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Hawassa Chemistry & Biology High School Tutor',
      bio: 'Dedicated science educator in Hawassa helping preparatory students master organic chemistry, cellular biology, and medical entrance exams.',
      hourly_rate: 260,
      location_city: 'Hawassa',
      location_lat: 7.0530,
      location_lng: 38.4820,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.83,
      total_reviews: 26,
      completed_jobs: 84,
    },
    categorySlugs: ['tutoring'],
    services: [
      {
        title: 'Chemistry & Biology Exam Prep (Hawassa)',
        description: 'Simplifying chemical equations, reaction mechanisms, and biology diagrams for university entrance examinations.',
        price_type: 'fixed',
        price_amount: 2400,
        tags: ['chemistry tutor', 'biology tutor', 'hawassa', 'science'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Great chemistry teacher who makes difficult concepts clear and memorable.',
    }
  },
  {
    user: {
      email: 'marta.mengistu.piano@linc.et',
      full_name: 'Marta Mengistu',
      username: 'marta_music',
      phone: '+251911883358',
      location_city: 'Addis Ababa (Bole & CMC)',
      location_lat: 9.0190,
      location_lng: 38.8000,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Private Piano, Acoustic Guitar & Vocal Coach',
      bio: 'Classical and modern music teacher with 7 years experience teaching children and adults piano scales, music theory, and popular Ethiopian melodies at home.',
      hourly_rate: 350,
      location_city: 'Addis Ababa (Bole & CMC)',
      location_lat: 9.0190,
      location_lng: 38.8000,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.91,
      total_reviews: 35,
      completed_jobs: 110,
    },
    categorySlugs: ['tutoring'],
    services: [
      {
        title: 'In-Home Beginner Piano & Keyboard Lessons for Kids (Monthly)',
        description: 'Reading sheet music, hand posture, rhythm exercises, and playing beloved tunes with fun weekly practice sheets.',
        price_type: 'fixed',
        price_amount: 3000,
        tags: ['piano lessons', 'music teacher', 'guitar tutor', 'kids music'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Marta teaches piano to our two daughters at our home. She is so encouraging, patient, and the kids look forward to every lesson.',
    }
  },

  // ─── 13. BEAUTY, BARBER & SPA (5 providers) ───
  {
    user: {
      email: 'selam.tadesse.beauty@linc.et',
      full_name: 'Selam Tadesse',
      username: 'selam_beauty',
      phone: '+251911996659',
      location_city: 'Addis Ababa (Bole)',
      location_lat: 9.0020,
      location_lng: 38.7830,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Master Traditional Habesha Braiding & Modern Bridal Hair Stylist',
      bio: 'Celebrity hair stylist with 9 years experience. Specializing in intricate Albaso, Shuruba, knotless box braids, lace-front wig installs, and full bridal glam packages.',
      hourly_rate: 350,
      location_city: 'Addis Ababa (Bole)',
      location_lat: 9.0020,
      location_lng: 38.7830,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.97,
      total_reviews: 82,
      completed_jobs: 310,
    },
    categorySlugs: ['beauty'],
    services: [
      {
        title: 'Authentic Traditional Albaso / Shuruba Braiding for Weddings',
        description: 'Fine cornrow styling with bead accessories and gold ring embellishments for Melse and wedding celebrations.',
        price_type: 'fixed',
        price_amount: 1800,
        tags: ['albaso', 'shuruba', 'habesha braids', 'bridal hair', 'beauty'],
      },
      {
        title: 'Knotless Bohemian Box Braids (Waist Length)',
        description: 'Tension-free scalp-friendly knotless braiding with high-grade human hair curly strand inserts.',
        price_type: 'fixed',
        price_amount: 2200,
        tags: ['knotless braids', 'box braids', 'hair styling', 'beauty'],
      },
      {
        title: 'Lace Front Wig Customization & Flawless Melt Install',
        description: 'Bleaching knots, hairline plucking, skin-tone lace tinting, and sweat-proof adhesive hold.',
        price_type: 'fixed',
        price_amount: 1500,
        tags: ['wig install', 'lace front', 'hair salon'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Selam did my traditional Albaso braids for my Melse ceremony. So many compliments from all our guests! Gentle on the scalp and stayed neat for weeks.',
    }
  },
  {
    user: {
      email: 'tedros.worku.barber@linc.et',
      full_name: 'Tedros Worku',
      username: 'tedros_barber',
      phone: '+251912554460',
      location_city: 'Addis Ababa (Kazanchis & Bole)',
      location_lat: 9.0180,
      location_lng: 38.7690,
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'VIP Mobile Master Barber | Skin Fades & Hot Towel Beard Shave',
      bio: 'Executive mobile barber providing high-end grooming at your home or hotel. Precision razor line-ups, skin fades, beard sculpting, and charcoal face scrub.',
      hourly_rate: 300,
      location_city: 'Addis Ababa (Kazanchis & Bole)',
      location_lat: 9.0180,
      location_lng: 38.7690,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.94,
      total_reviews: 65,
      completed_jobs: 280,
    },
    categorySlugs: ['beauty'],
    services: [
      {
        title: 'VIP Home Visit Haircut, Beard Sculpting & Hot Towel Treatment',
        description: 'Scissor/clipper haircut, razor sharp edge-up, organic beard oil massage, and hot eucalyptus towel.',
        price_type: 'fixed',
        price_amount: 700,
        tags: ['barber', 'haircut', 'skin fade', 'beard trim', 'mobile barber'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Tedros comes to my home before all my business conferences. Best skin fade and razor line in Addis!',
    }
  },
  {
    user: {
      email: 'hermela.assefa.makeup@linc.et',
      full_name: 'Hermela Assefa',
      username: 'hermela_glam',
      phone: '+251911448861',
      location_city: 'Addis Ababa (Sarbet & Old Airport)',
      location_lat: 8.9940,
      location_lng: 38.7450,
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Certified Bridal & Editorial Makeup Artist (MUA)',
      bio: 'International standard makeup artistry using MAC, Fenty Beauty, and Anastasia Beverly Hills. Long-lasting, flashback-free bridal glam and photoshoot makeup.',
      hourly_rate: 450,
      location_city: 'Addis Ababa (Sarbet & Old Airport)',
      location_lat: 8.9940,
      location_lng: 38.7450,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.96,
      total_reviews: 57,
      completed_jobs: 195,
    },
    categorySlugs: ['beauty'],
    services: [
      {
        title: 'Full Bridal Makeup & Touch-Up Kit (Wedding Day)',
        description: 'Skin prep, flawless HD foundation, waterproof eye makeup, mink lash application, and emergency touch-up kit.',
        price_type: 'fixed',
        price_amount: 4500,
        tags: ['bridal makeup', 'wedding mua', 'makeup artist', 'glam'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Hermela did my wedding makeup and made me feel like royalty. Makeup looked fresh from morning church service until midnight dancing!',
    }
  },
  {
    user: {
      email: 'meklit.dagnachew.spa@linc.et',
      full_name: 'Meklit Dagnachew',
      username: 'meklit_spa',
      phone: '+251913772262',
      location_city: 'Hawassa',
      location_lat: 7.0520,
      location_lng: 38.4800,
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Hawassa Swedish Deep Tissue & Aromatherapy Massage',
      bio: 'Certified massage therapist offering in-villa relaxing Swedish massage, hot stone therapy, and foot reflexology with essential oils.',
      hourly_rate: 350,
      location_city: 'Hawassa',
      location_lat: 7.0520,
      location_lng: 38.4800,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.89,
      total_reviews: 32,
      completed_jobs: 110,
    },
    categorySlugs: ['beauty'],
    services: [
      {
        title: '60-Minute In-Home Full Body Deep Tissue & Aromatherapy Massage',
        description: 'Relieving muscle tension, improving blood circulation, and stress reduction using warm eucalyptus and lavender oils.',
        price_type: 'fixed',
        price_amount: 1200,
        tags: ['massage', 'deep tissue', 'spa', 'aromatherapy', 'hawassa'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Incredible deep tissue massage after a long hiking weekend in Hawassa. Professional portable massage table and soothing music.',
    }
  },
  {
    user: {
      email: 'sara.kebede.nails@linc.et',
      full_name: 'Sara Kebede',
      username: 'sara_nails',
      phone: '+251911881163',
      location_city: 'Addis Ababa (CMC & Ayat)',
      location_lat: 9.0280,
      location_lng: 38.8390,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Mobile Acrylic, Russian Gel Manicure & Pedicure Artist',
      bio: 'Russian cuticle dry manicure, builder gel extensions, 3D nail art designs, and spa paraffin foot treatments in the comfort of your home.',
      hourly_rate: 280,
      location_city: 'Addis Ababa (CMC & Ayat)',
      location_lat: 9.0280,
      location_lng: 38.8390,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.88,
      total_reviews: 41,
      completed_jobs: 150,
    },
    categorySlugs: ['beauty'],
    services: [
      {
        title: 'Full Set Acrylic / Builder Gel Nail Extensions with Custom Art',
        description: 'Clean cuticle work, nail tip shaping (almond, coffin, square), gel polish coating, and hand-painted nail designs.',
        price_type: 'fixed',
        price_amount: 950,
        tags: ['nails', 'gel manicure', 'acrylic nails', 'pedicure', 'nail art'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Sara did my French ombre gel nails at home. Lasted over 4 weeks without a single chip.',
    }
  },

  // ─── 14. AUTO MECHANIC & TOWING (5 providers) ───
  {
    user: {
      email: 'henok.teshome.auto@linc.et',
      full_name: 'Henok Teshome',
      username: 'henok_auto',
      phone: '+251911553364',
      location_city: 'Addis Ababa (Bole & Gotera)',
      location_lat: 8.9990,
      location_lng: 38.7620,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Master Toyota, Hyundai & Suzuki Mobile Auto Mechanic',
      bio: '13 years experience in computerized OBD2 diagnostics, engine overhaul, automatic transmission repair, brake pads, and roadside emergency breakdown rescue.',
      hourly_rate: 400,
      location_city: 'Addis Ababa (Bole & Gotera)',
      location_lat: 8.9990,
      location_lng: 38.7620,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.93,
      total_reviews: 73,
      completed_jobs: 290,
    },
    categorySlugs: ['auto'],
    services: [
      {
        title: 'Mobile Computerized Engine Diagnostic Scan & Check Engine Fix',
        description: 'Live sensor data stream readout, clearing fault codes, checking fuel trim, oxygen sensor, and injector performance on-site.',
        price_type: 'fixed',
        price_amount: 800,
        tags: ['car diagnostic', 'check engine', 'obd2', 'auto mechanic', 'roadside'],
      },
      {
        title: 'Brake Pad Replacement & Rotor Disc Skimming (Front & Rear)',
        description: 'Ceramic brake pad installation, caliper pin lubrication, brake fluid bleeding, and rotor surface leveling.',
        price_type: 'fixed',
        price_amount: 950,
        tags: ['brake repair', 'brake pads', 'car service', 'auto maintenance'],
      },
      {
        title: 'Alternator & Starter Motor Rebuild / Replacement',
        description: 'Fixing battery charging failure, clicking starter solenoid, carbon brush replacement, and voltage regulator calibration.',
        price_type: 'fixed',
        price_amount: 1400,
        tags: ['alternator', 'starter motor', 'auto electric', 'car battery'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'My Toyota Corolla stalled in Bole during rush hour. Henok arrived with his mobile diagnostic kit, diagnosed a dead fuel pump, and had it replaced on the spot. Lifesaver!',
    }
  },
  {
    user: {
      email: 'tamirat.bekele.auto@linc.et',
      full_name: 'Tamirat Bekele',
      username: 'tamirat_towing',
      phone: '+251912881165',
      location_city: 'Addis Ababa (All Subcities & Outskirts)',
      location_lat: 9.0100,
      location_lng: 38.7500,
      avatar_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: '24/7 Flatbed Towing Truck & Heavy Vehicle Recovery',
      bio: 'Modern hydraulic flatbed tow truck fleet. Safe transportation of low-clearance sedans, SUVs, non-starting vehicles, and accident recovery across Addis and highways.',
      hourly_rate: 450,
      location_city: 'Addis Ababa (All Subcities & Outskirts)',
      location_lat: 9.0100,
      location_lng: 38.7500,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.90,
      total_reviews: 62,
      completed_jobs: 275,
    },
    categorySlugs: ['auto', 'moving'],
    services: [
      {
        title: '24/7 Emergency Flatbed Towing Service (Within Addis Ababa)',
        description: 'Safe hydraulic wheel strapping, zero damage to bumpers or transmissions, direct transport to your mechanic or home.',
        price_type: 'fixed',
        price_amount: 2200,
        tags: ['towing', 'tow truck', 'flatbed', 'roadside assistance', 'emergency'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Towed my broken-down SUV from Bishoftu highway to my mechanic in Gerji safely at midnight.',
    }
  },
  {
    user: {
      email: 'yared.girma.autoelec@linc.et',
      full_name: 'Yared Girma',
      username: 'yared_autoelec',
      phone: '+251911446666',
      location_city: 'Addis Ababa (Sarbet & Mexico)',
      location_lat: 8.9950,
      location_lng: 38.7410,
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Automotive Electrician & Car Alarm / GPS Tracker Installer',
      bio: 'Specialist in vehicle security GPS trackers with remote engine cut-off, central lock installation, and car audio amplifiers.',
      hourly_rate: 350,
      location_city: 'Addis Ababa (Sarbet & Mexico)',
      location_lat: 8.9950,
      location_lng: 38.7410,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.87,
      total_reviews: 48,
      completed_jobs: 180,
    },
    categorySlugs: ['auto'],
    services: [
      {
        title: 'Real-Time Car GPS Tracker with Mobile App & Remote Kill-Switch',
        description: 'Concealed GPS installation, SIM card configuration, geofence alert setup, and SMS engine immobilizer switch.',
        price_type: 'fixed',
        price_amount: 2800,
        tags: ['gps tracker', 'car security', 'anti-theft', 'auto electrician'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Installed GPS trackers on our company’s 3 delivery vans. Real-time location tracking works flawlessly.',
    }
  },
  {
    user: {
      email: 'anteneh.haile.auto@linc.et',
      full_name: 'Anteneh Haile',
      username: 'anteneh_ac',
      phone: '+251913887767',
      location_city: 'Addis Ababa (CMC & Ayat)',
      location_lat: 9.0270,
      location_lng: 38.8320,
      avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Car AC Gas Recharge, Compressor & Climate Control Specialist',
      bio: 'Refrigerant leak detection with UV dye, compressor clutch coil replacement, cabin evaporator cleaning, and ice-cold AC performance.',
      hourly_rate: 320,
      location_city: 'Addis Ababa (CMC & Ayat)',
      location_lat: 9.0270,
      location_lng: 38.8320,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.85,
      total_reviews: 37,
      completed_jobs: 130,
    },
    categorySlugs: ['auto'],
    services: [
      {
        title: 'Car Air Conditioning R134a Gas Refill & Leak Vacuum Test',
        description: 'System vacuuming to remove moisture, pressure leak testing, compressor lubricant oil top-up, and pure R134a refrigerant charge.',
        price_type: 'fixed',
        price_amount: 1400,
        tags: ['car ac', 'ac gas refill', 'car climate control', 'auto repair'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Fixed my car AC that was blowing hot air. Ice cold within 30 minutes of gas recharge.',
    }
  },
  {
    user: {
      email: 'mulugeta.dagne.auto@linc.et',
      full_name: 'Mulugeta Dagne',
      username: 'mulugeta_mechanic',
      phone: '+251911772268',
      location_city: 'Adama',
      location_lat: 8.5420,
      location_lng: 39.2710,
      avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Adama Highway Emergency Auto Repair & Tire Service',
      bio: 'Prompt emergency breakdown assistance along the Addis-Adama Expressway and Mojo corridor. Tire vulcanizing, suspension and engine troubleshooting.',
      hourly_rate: 300,
      location_city: 'Adama',
      location_lat: 8.5420,
      location_lng: 39.2710,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.82,
      total_reviews: 29,
      completed_jobs: 105,
    },
    categorySlugs: ['auto'],
    services: [
      {
        title: 'Highway Roadside Assistance & Tire Change / Patching',
        description: 'Emergency jump-start, mobile tire plug and wheel change on the Adama expressway.',
        price_type: 'fixed',
        price_amount: 900,
        tags: ['roadside', 'adama', 'expressway', 'tire repair'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Assisted us near Adama toll gate with a flat tire and dead battery. Arrived quickly and very helpful.',
    }
  },

  // ─── 15. MOVING & CARGO TRANSPORT (5 providers) ───
  {
    user: {
      email: 'tadesse.alemu.moving@linc.et',
      full_name: 'Tadesse Alemu',
      username: 'tadesse_movers',
      phone: '+251911883369',
      location_city: 'Addis Ababa (Bole & Kazanchis)',
      location_lat: 9.0130,
      location_lng: 38.7750,
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Premier Residential & Office Relocation Services | Packing & Assembly',
      bio: 'Enclosed ISUZU NPR trucks, trained porters, bubble wrapping for TVs and glass, furniture disassembly and reassembly in your new home.',
      hourly_rate: 450,
      location_city: 'Addis Ababa (Bole & Kazanchis)',
      location_lat: 9.0130,
      location_lng: 38.7750,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.95,
      total_reviews: 71,
      completed_jobs: 280,
    },
    categorySlugs: ['moving'],
    services: [
      {
        title: 'Full 3-Bedroom Home Relocation with Packing & Dismantling',
        description: '2 enclosed Isuzu trucks, 6 experienced movers, bubble wrap for fragile goods, bed frame & wardrobe disassembly and setup.',
        price_type: 'fixed',
        price_amount: 8500,
        tags: ['home moving', 'relocation', 'movers', 'packing', 'isuzu truck'],
      },
      {
        title: 'Single Item / Heavy Appliance Delivery (Isuzu / Sino Truck)',
        description: 'Safe moving of large double-door refrigerators, heavy safes, and gym equipment with ratchet strap anchoring.',
        price_type: 'fixed',
        price_amount: 1800,
        tags: ['cargo transport', 'appliance delivery', 'heavy moving'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Tadesse and his crew moved our entire 4-bedroom villa from Bole to CMC in a single day. Zero scratches, beds reassembled neatly. Best movers in town!',
    }
  },
  {
    user: {
      email: 'yonatan.worku.moving@linc.et',
      full_name: 'Yonatan Worku',
      username: 'yonatan_transport',
      phone: '+251912557770',
      location_city: 'Addis Ababa (CMC & Ayat)',
      location_lat: 9.0290,
      location_lng: 38.8370,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Affordable Mini-Truck / Pick-up Cargo Transport',
      bio: 'Fleet of Toyota Hilux and Suzuki Carry pickups for apartment moves, bachelor pads, store stock transfers, and hardware store pickups.',
      hourly_rate: 300,
      location_city: 'Addis Ababa (CMC & Ayat)',
      location_lat: 9.0290,
      location_lng: 38.8370,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.88,
      total_reviews: 43,
      completed_jobs: 165,
    },
    categorySlugs: ['moving'],
    services: [
      {
        title: 'Studio / 1-Bedroom Apartment Express Move (Pickup + 2 Porters)',
        description: 'Fast, cost-effective transport for small apartments with 2 strong helpers to carry goods up/down stairs.',
        price_type: 'fixed',
        price_amount: 3200,
        tags: ['pickup truck', 'apartment move', 'affordable movers', 'cargo'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Moved my studio apartment goods smoothly. Fair price and very helpful porters.',
    }
  },
  {
    user: {
      email: 'solomon.bekele.freight@linc.et',
      full_name: 'Solomon Bekele',
      username: 'solomon_freight',
      phone: '+251911441171',
      location_city: 'Hawassa',
      location_lat: 7.0500,
      location_lng: 38.4850,
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Inter-City Freight & Relocation (Addis Ababa – Hawassa – Adama)',
      bio: 'Heavy commercial Isuzu FSR trucks transporting goods, industrial machinery, and family relocations between major Ethiopian cities.',
      hourly_rate: 500,
      location_city: 'Hawassa',
      location_lat: 7.0500,
      location_lng: 38.4850,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.91,
      total_reviews: 38,
      completed_jobs: 130,
    },
    categorySlugs: ['moving'],
    services: [
      {
        title: 'Addis Ababa to Hawassa / SNNPR Full Truckload Move',
        description: 'Direct door-to-door long-distance transport with waterproof tarpaulin cover and transit insurance.',
        price_type: 'fixed',
        price_amount: 1800,
        tags: ['intercity moving', 'long distance', 'hawassa', 'freight'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Relocated all our household furniture from Addis to our new home in Hawassa safely without a single broken item.',
    }
  },
  {
    user: {
      email: 'tamirat.assefa.moving@linc.et',
      full_name: 'Tamirat Assefa',
      username: 'tamirat_cargo',
      phone: '+251913993372',
      location_city: 'Addis Ababa (Sarbet & Mexico)',
      location_lat: 8.9970,
      location_lng: 38.7430,
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Office IT Equipment & Server Rack Specialist Movers',
      bio: 'Antistatic packaging, padded crates for monitors, and precision handling for corporate IT equipment and hospital diagnostic devices.',
      hourly_rate: 420,
      location_city: 'Addis Ababa (Sarbet & Mexico)',
      location_lat: 8.9970,
      location_lng: 38.7430,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.86,
      total_reviews: 31,
      completed_jobs: 105,
    },
    categorySlugs: ['moving', 'network-cctv'],
    services: [
      {
        title: 'Corporate Server & Delicate Electronics Secure Relocation',
        description: 'Custom antistatic wrapping, shockproof foam transport, and secure chain-of-custody transfer.',
        price_type: 'fixed',
        price_amount: 6500,
        tags: ['it moving', 'server transport', 'office relocation', 'electronics'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Handled our company’s server rack and 35 workstations relocation between offices. Zero downtime or damage.',
    }
  },
  {
    user: {
      email: 'birhanu.kebede.moving@linc.et',
      full_name: 'Birhanu Kebede',
      username: 'birhanu_movers',
      phone: '+251911775573',
      location_city: 'Bahir Dar',
      location_lat: 11.5940,
      location_lng: 37.3890,
      avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Bahir Dar City Moving & Construction Material Hauling',
      bio: 'Hauling furniture, cement, timber, and retail store inventory across Bahir Dar and Lake Tana surrounding areas.',
      hourly_rate: 320,
      location_city: 'Bahir Dar',
      location_lat: 11.5940,
      location_lng: 37.3890,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.80,
      total_reviews: 24,
      completed_jobs: 85,
    },
    categorySlugs: ['moving'],
    services: [
      {
        title: 'Citywide Home & Cargo Moving (Bahir Dar)',
        description: 'Reliable truck transport with loading and unloading porters.',
        price_type: 'fixed',
        price_amount: 3000,
        tags: ['bahir dar moving', 'cargo hauling', 'local movers'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Very helpful movers in Bahir Dar. Arrived on time and loaded everything carefully.',
    }
  },

  // ─── 16. EVENTS, CATERING & MEDIA (5 providers) ───
  {
    user: {
      email: 'almaz.mengistu.catering@linc.et',
      full_name: 'Almaz Mengistu',
      username: 'almaz_catering',
      phone: '+251911448874',
      location_city: 'Addis Ababa (Bole & Kazanchis)',
      location_lat: 9.0100,
      location_lng: 38.7740,
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Traditional Habesha Catering & Gourmet Event Chef',
      bio: '15 years preparing grand wedding buffets, Doro Wat, Siga Wat, Kitfo, Beyaynetu fasting spreads, and modern fusion banquets for up to 500 guests with serving staff.',
      hourly_rate: 450,
      location_city: 'Addis Ababa (Bole & Kazanchis)',
      location_lat: 9.0100,
      location_lng: 38.7740,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.98,
      total_reviews: 86,
      completed_jobs: 340,
    },
    categorySlugs: ['events'],
    services: [
      {
        title: 'Grand Wedding / Melse Traditional Banquet Catering (per person)',
        description: 'Authentic rich Doro Wat with free-range chicken, butter Kitfo, tender Tibs, soft Teff Injera, and dessert table.',
        price_type: 'fixed',
        price_amount: 450,
        tags: ['catering', 'doro wat', 'habesha food', 'wedding banquet', 'events'],
      },
      {
        title: 'Gourmet Corporate Fasting & Vegan Buffet Spread (per person)',
        description: '10-dish Beyaynetu, mushroom tibs, vegetable cutlets, salads, and freshly roasted Ethiopian coffee ceremony.',
        price_type: 'fixed',
        price_amount: 350,
        tags: ['vegan catering', 'fasting food', 'corporate lunch', 'coffee ceremony'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Almaz catered our wedding for 350 guests. The Doro Wat and Kitfo were legendary! Guests were asking for her contact all night.',
    }
  },
  {
    user: {
      email: 'yonas.kassahun.photo@linc.et',
      full_name: 'Yonas Kassahun',
      username: 'yonas_photo',
      phone: '+251912773375',
      location_city: 'Addis Ababa (Bole & Kazanchis)',
      location_lat: 9.0080,
      location_lng: 38.7780,
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Award-Winning Wedding & Portrait Photographer | 4K Drone Videography',
      bio: 'Sony Alpha & DJI Drone equipped visual storyteller. Capturing cinematic wedding love stories, corporate headshots, and luxury real estate media.',
      hourly_rate: 600,
      location_city: 'Addis Ababa (Bole & Kazanchis)',
      location_lat: 9.0080,
      location_lng: 38.7780,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.96,
      total_reviews: 68,
      completed_jobs: 230,
    },
    categorySlugs: ['events'],
    services: [
      {
        title: 'Full Wedding Photography, Cinematic Film & Drone Package',
        description: '2 senior photographers, 2 videographers, 4K aerial drone footage, luxury photo album, and 5-minute cinematic highlight video.',
        price_type: 'fixed',
        price_amount: 35000,
        tags: ['wedding photography', 'videography', 'drone', 'cinematic wedding', 'photo album'],
      },
      {
        title: 'Executive Corporate Portrait & Studio Headshots',
        description: 'Professional lighting setup, 5 high-end retouched digital portraits suitable for LinkedIn and annual reports.',
        price_type: 'fixed',
        price_amount: 2500,
        tags: ['headshots', 'corporate photo', 'portrait'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Yonas captured our wedding memories like a movie. The drone shots in Entoto and the candid reception photos are breathtaking.',
    }
  },
  {
    user: {
      email: 'mimi.tadesse.decor@linc.et',
      full_name: 'Mimi Tadesse',
      username: 'mimi_decor',
      phone: '+251911889976',
      location_city: 'Addis Ababa (CMC & Ayat)',
      location_lat: 9.0270,
      location_lng: 38.8360,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Luxury Wedding Stage Design, Floral Arches & Event Decorator',
      bio: 'Transforming halls and outdoor gardens with fresh flower centerpieces, LED backdrops, Chiavari chairs, and ambient mood lighting.',
      hourly_rate: 450,
      location_city: 'Addis Ababa (CMC & Ayat)',
      location_lat: 9.0270,
      location_lng: 38.8360,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.92,
      total_reviews: 47,
      completed_jobs: 160,
    },
    categorySlugs: ['events'],
    services: [
      {
        title: 'Complete Wedding Stage, Floral Arch & Head Table Decor',
        description: 'Custom backdrop with fairy lights, fresh rose and eucalyptus floral arrangements, and red carpet walkway.',
        price_type: 'negotiable',
        price_amount: 28000,
        tags: ['wedding decor', 'stage design', 'floral arch', 'event planning'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'Mimi designed our reception hall decor at Skylight Hotel. Pure elegance and breathtaking flowers!',
    }
  },
  {
    user: {
      email: 'dj.henok.sound@linc.et',
      full_name: 'Henok Abebe',
      username: 'dj_henok',
      phone: '+251912441177',
      location_city: 'Addis Ababa (Bole & Kazanchis)',
      location_lat: 9.0140,
      location_lng: 38.7710,
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Professional Event DJ, Sound System & Stage Lighting Setup',
      bio: 'JBL line array sound systems, wireless Shure microphones, moving-head beam lights, and dynamic DJ mixing across traditional Ethiopian, Afrobeat, and international hits.',
      hourly_rate: 400,
      location_city: 'Addis Ababa (Bole & Kazanchis)',
      location_lat: 9.0140,
      location_lng: 38.7710,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.90,
      total_reviews: 51,
      completed_jobs: 190,
    },
    categorySlugs: ['events'],
    services: [
      {
        title: 'Full Event DJ & JBL Sound System Package (6 Hours)',
        description: '2 high-output JBL speakers, 18-inch subwoofer, 2 cordless microphones, DJ mixing console, and party lighting.',
        price_type: 'fixed',
        price_amount: 8500,
        tags: ['dj', 'sound system', 'event sound', 'wedding dj', 'party'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'DJ Henok kept the dance floor packed all night at our anniversary party. Flawless audio and great song transitions.',
    }
  },
  {
    user: {
      email: 'eden.worku.cake@linc.et',
      full_name: 'Eden Worku',
      username: 'eden_cakes',
      phone: '+251913778878',
      location_city: 'Hawassa',
      location_lat: 7.0550,
      location_lng: 38.4790,
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    },
    profile: {
      headline: 'Custom Multi-Tier Wedding & Celebration Cakes in Hawassa',
      bio: 'Pastry chef baking artisanal fondant and buttercream wedding cakes, red velvet cupcakes, and dessert grazing tables in Hawassa.',
      hourly_rate: 300,
      location_city: 'Hawassa',
      location_lat: 7.0550,
      location_lng: 38.4790,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.93,
      total_reviews: 36,
      completed_jobs: 125,
    },
    categorySlugs: ['events'],
    services: [
      {
        title: '3-Tier Custom Fondant Wedding Cake with Sugar Flowers',
        description: 'Moist vanilla bean and Belgian chocolate tiers with custom sugar flower detailing and delivery to venue.',
        price_type: 'fixed',
        price_amount: 7500,
        tags: ['wedding cake', 'custom cake', 'pastry chef', 'hawassa'],
      }
    ],
    sampleReview: {
      rating: 5,
      comment: 'The 3-tier cake was not only gorgeous but tasted heavenly. Everyone loved the chocolate fudge tier.',
    }
  }
];

async function upsertUser(userPayload) {
  const { data: existing } = await supabase
    .from('users')
    .select('id, email, username')
    .or(`email.eq.${userPayload.email},username.eq.${userPayload.username}`)
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { data: updated, error } = await supabase
      .from('users')
      .update(userPayload)
      .eq('id', existing.id)
      .select('id, email, username')
      .single();
    if (error) throw error;
    return updated;
  } else {
    const { data: inserted, error } = await supabase
      .from('users')
      .insert(userPayload)
      .select('id, email, username')
      .single();
    if (error) throw error;
    return inserted;
  }
}

async function seed() {
  console.log('🚀 Starting Comprehensive LINC Database Mock Population...');
  console.log(`📋 Target: ${CATEGORIES.length} Categories, ${PROVIDERS_DATA.length} Diverse Providers, ~160+ Services`);

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Categories
  console.log('\n1. Upserting Categories...');
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .upsert(CATEGORIES, { onConflict: 'slug' })
    .select();

  if (catError) {
    throw new Error(`Failed to upsert categories: ${catError.message}`);
  }
  console.log(`✓ Inserted/Updated ${categories.length} categories.`);

  // Build category slug -> id mapping
  const categoryMap = {};
  categories.forEach((c) => {
    categoryMap[c.slug] = c.id;
  });

  // 2. Demo Reviewers
  console.log('\n2. Upserting Demo Reviewer Users...');
  const reviewers = [];
  for (const u of REVIEWER_USERS) {
    const payload = {
      ...u,
      password_hash: passwordHash,
      is_admin: false,
      is_active: true,
      email_verified: true,
    };
    const row = await upsertUser(payload);
    reviewers.push(row);
  }
  console.log(`✓ Inserted/Updated ${reviewers.length} reviewer accounts.`);

  // 3. Provider Users
  console.log('\n3. Upserting Provider Users...');
  const userEmailMap = {};
  for (const p of PROVIDERS_DATA) {
    const payload = {
      email: p.user.email,
      password_hash: passwordHash,
      full_name: p.user.full_name,
      username: p.user.username,
      phone: p.user.phone,
      avatar_url: p.user.avatar_url,
      bio: p.profile.bio.substring(0, 140),
      location_city: p.user.location_city,
      location_lat: p.user.location_lat || null,
      location_lng: p.user.location_lng || null,
      is_admin: false,
      is_active: true,
      email_verified: true,
    };
    const row = await upsertUser(payload);
    userEmailMap[p.user.email] = row.id;
  }
  console.log(`✓ Inserted/Updated ${Object.keys(userEmailMap).length} provider user accounts.`);

  // 4. Provider Profiles
  console.log('\n4. Upserting Provider Profiles...');
  const providerProfilesPayload = PROVIDERS_DATA.map((p) => {
    const userId = userEmailMap[p.user.email];
    return {
      user_id: userId,
      headline: p.profile.headline,
      bio: p.profile.bio,
      hourly_rate: p.profile.hourly_rate,
      currency: 'ETB',
      location_city: p.profile.location_city,
      location_lat: p.profile.location_lat || null,
      location_lng: p.profile.location_lng || null,
      availability_status: p.profile.availability_status || 'available',
      is_verified: p.profile.is_verified ?? true,
      avg_rating: p.profile.avg_rating || 4.85,
      total_reviews: p.profile.total_reviews || 25,
      completed_jobs: p.profile.completed_jobs || 80,
      is_active: true,
    };
  }).filter((p) => p.user_id);

  const { data: insertedProfiles, error: provError } = await supabase
    .from('provider_profiles')
    .upsert(providerProfilesPayload, { onConflict: 'user_id' })
    .select('id, user_id');

  if (provError) {
    throw new Error(`Failed to upsert provider profiles: ${provError.message}`);
  }
  console.log(`✓ Inserted/Updated ${insertedProfiles.length} provider profiles.`);

  const profileUserMap = {};
  insertedProfiles.forEach((prof) => {
    profileUserMap[prof.user_id] = prof.id;
  });

  // 5. Provider Categories Mapping
  console.log('\n5. Syncing Provider Categories...');
  const providerCategoryRows = [];
  PROVIDERS_DATA.forEach((p) => {
    const userId = userEmailMap[p.user.email];
    const profileId = profileUserMap[userId];
    if (!profileId) return;

    p.categorySlugs.forEach((slug) => {
      const catId = categoryMap[slug];
      if (catId) {
        providerCategoryRows.push({
          provider_id: profileId,
          category_id: catId,
        });
      }
    });
  });

  if (providerCategoryRows.length > 0) {
    const { error: pcatErr } = await supabase
      .from('provider_categories')
      .upsert(providerCategoryRows, { onConflict: 'provider_id,category_id' });
    if (pcatErr) console.warn('Provider categories upsert warning:', pcatErr.message);
  }
  console.log(`✓ Mapped ${providerCategoryRows.length} provider-category relations.`);

  // 6. Services
  console.log('\n6. Inserting / Updating Services...');
  const providerIds = Object.values(profileUserMap);
  const { data: existingServices } = await supabase
    .from('services')
    .select('id, provider_id, title')
    .in('provider_id', providerIds);

  const existingServiceMap = {};
  (existingServices || []).forEach((s) => {
    existingServiceMap[`${s.provider_id}:::${s.title}`] = s.id;
  });

  const servicesToInsert = [];
  const servicesToUpdate = [];

  for (const p of PROVIDERS_DATA) {
    const userId = userEmailMap[p.user.email];
    const profileId = profileUserMap[userId];
    if (!profileId || !p.services) continue;

    const primaryCatId = categoryMap[p.categorySlugs[0]] || Object.values(categoryMap)[0];

    for (const s of p.services) {
      const key = `${profileId}:::${s.title}`;
      const payload = {
        provider_id: profileId,
        category_id: primaryCatId,
        title: s.title,
        description: s.description,
        price_type: s.price_type || 'fixed',
        price_amount: s.price_amount,
        currency: 'ETB',
        location_city: p.profile.location_city,
        location_lat: p.profile.location_lat || null,
        location_lng: p.profile.location_lng || null,
        tags: s.tags || [],
        is_available: true,
        is_active: true,
      };

      if (existingServiceMap[key]) {
        servicesToUpdate.push({ id: existingServiceMap[key], ...payload });
      } else {
        servicesToInsert.push(payload);
      }
    }
  }

  // Batch insert new services in chunks of 50
  for (let i = 0; i < servicesToInsert.length; i += 50) {
    const chunk = servicesToInsert.slice(i, i + 50);
    const { error: insErr } = await supabase.from('services').insert(chunk);
    if (insErr) console.warn('Services insert chunk error:', insErr.message);
  }

  // Update existing services in parallel chunks of 10
  for (let i = 0; i < servicesToUpdate.length; i += 10) {
    const chunk = servicesToUpdate.slice(i, i + 10);
    await Promise.all(
      chunk.map((item) =>
        supabase.from('services').update(item).eq('id', item.id)
      )
    );
  }
  console.log(`✓ Populated ${servicesToInsert.length + servicesToUpdate.length} active services across all providers.`);

  // 7. Seed Sample Bookings & Customer Reviews
  console.log('\n7. Populating Verified Bookings & Customer Reviews...');
  const { data: allServicesList } = await supabase
    .from('services')
    .select('id, provider_id, price_amount')
    .in('provider_id', providerIds);

  const providerFirstServiceMap = {};
  (allServicesList || []).forEach((s) => {
    if (!providerFirstServiceMap[s.provider_id]) {
      providerFirstServiceMap[s.provider_id] = s;
    }
  });

  const { data: existingReviews } = await supabase
    .from('reviews')
    .select('id, entity_id')
    .eq('entity_type', 'provider')
    .in('entity_id', providerIds);

  const reviewedProviderIds = new Set((existingReviews || []).map((r) => r.entity_id));

  let reviewsCount = 0;
  for (let idx = 0; idx < PROVIDERS_DATA.length; idx++) {
    const p = PROVIDERS_DATA[idx];
    const userId = userEmailMap[p.user.email];
    const profileId = profileUserMap[userId];
    if (!profileId || !p.sampleReview || reviewedProviderIds.has(profileId)) continue;

    const service = providerFirstServiceMap[profileId];
    if (!service) continue;

    const reviewer = reviewers[idx % reviewers.length] || reviewers[0];

    const { data: booking, error: bError } = await supabase
      .from('bookings')
      .insert({
        requester_id: reviewer.id,
        service_id: service.id,
        entity_type: 'provider',
        entity_id: profileId,
        scheduled_at: new Date(Date.now() - Math.floor(Math.random() * 30 + 2) * 86400000).toISOString(),
        duration_hours: 2,
        agreed_price: service.price_amount || p.profile.hourly_rate * 2,
        currency: 'ETB',
        status: 'completed',
      })
      .select()
      .single();

    if (booking && !bError) {
      await supabase.from('reviews').insert({
        booking_id: booking.id,
        reviewer_id: reviewer.id,
        entity_type: 'provider',
        entity_id: profileId,
        rating: p.sampleReview.rating || 5,
        comment: p.sampleReview.comment,
        is_visible: true,
      });
      reviewsCount++;
    }
  }
  console.log(`✓ Inserted ${reviewsCount} verified customer reviews and completed bookings.`);

  console.log('\n======================================================');
  console.log('🎉 DATABASE MOCK POPULATION COMPLETED SUCCESSFULLY!');
  console.log(`• Categories: ${categories.length}`);
  console.log(`• Providers: ${insertedProfiles.length}`);
  console.log(`• Services: ${servicesToInsert.length + servicesToUpdate.length}`);
  console.log(`• Verified Reviews: ${reviewsCount + (existingReviews ? existingReviews.length : 0)}`);
  console.log('======================================================\n');
}

seed()
  .catch((err) => {
    console.error('❌ Seed script failed:', err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
