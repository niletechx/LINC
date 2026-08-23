require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  console.log('🌱 Starting LINC Database Seed...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Categories
  const categoriesData = [
    { name: 'Cleaning', slug: 'cleaning', icon: '🧹', description: 'Professional home & office cleaning' },
    { name: 'Plumbing', slug: 'plumbing', icon: '🔧', description: 'Pipes, leaks, drainage & fixture repair' },
    { name: 'Electrical', slug: 'electrical', icon: '⚡', description: 'Wiring, appliances, breaker boxes' },
    { name: 'Tutoring', slug: 'tutoring', icon: '📚', description: 'Academic & language tutoring' },
    { name: 'Beauty', slug: 'beauty', icon: '💇', description: 'Hair styling, barbers, skincare' },
    { name: 'Moving', slug: 'moving', icon: '📦', description: 'Relocation & heavy cargo transport' },
    { name: 'Tech & Repair', slug: 'tech', icon: '💻', description: 'Laptop, smartphone & electronics repair' },
    { name: 'Auto Mechanic', slug: 'auto', icon: '🚗', description: 'Mechanics, towing & car inspection' },
  ];

  console.log('Inserting categories...');
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .upsert(categoriesData, { onConflict: 'slug' })
    .select();

  if (catError) {
    console.error('Error inserting categories:', catError.message);
  } else {
    console.log(`✓ Inserted/Updated ${categories?.length} categories`);
  }

  // 2. Demo Users — mark provider users with role='provider'
  const usersData = [
    {
      email: 'yonas.molla@email.com',
      password_hash: passwordHash,
      full_name: 'Yonas Molla',
      username: 'yonas_m',
      location_city: 'Addis Ababa',
      role: 'client',
      is_admin: false,
    },
    {
      email: 'samuel.girma@email.com',
      password_hash: passwordHash,
      full_name: 'Samuel Girma',
      username: 'samuel_plumbing',
      location_city: 'Addis Ababa',
      role: 'provider',
      is_admin: false,
    },
    {
      email: 'helen.tadesse@email.com',
      password_hash: passwordHash,
      full_name: 'Helen Tadesse',
      username: 'helen_clean',
      location_city: 'Addis Ababa',
      role: 'provider',
      is_admin: false,
    },
    {
      email: 'dawit.bekele@email.com',
      password_hash: passwordHash,
      full_name: 'Dawit Bekele',
      username: 'dawit_tech',
      location_city: 'Addis Ababa',
      role: 'provider',
      is_admin: false,
    },
    {
      email: 'bethelhem.hailu@email.com',
      password_hash: passwordHash,
      full_name: 'Bethelhem Hailu',
      username: 'bethelhem_tutor',
      location_city: 'Addis Ababa',
      role: 'provider',
      is_admin: false,
    },
    {
      email: 'abebe.kebede@email.com',
      password_hash: passwordHash,
      full_name: 'Abebe Kebede',
      username: 'abebe_electric',
      location_city: 'Addis Ababa',
      role: 'provider',
      is_admin: false,
    },
  ];

  console.log('Inserting demo users...');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .upsert(usersData, { onConflict: 'email' })
    .select();

  if (usersError) {
    console.error('Error inserting users:', usersError.message);
  } else {
    console.log(`✓ Inserted/Updated ${users?.length} users`);
  }

  // Map users
  const userMap = {};
  (users || []).forEach((u) => {
    userMap[u.username] = u.id;
  });

  // 3. Provider Profiles
  const providerProfiles = [
    {
      user_id: userMap['samuel_plumbing'],
      headline: 'Master Plumber & Pipe Specialist',
      bio: 'Certified plumber with 8+ years experience in residential and commercial pipe fittings. Fast emergency response across Bole and surrounding areas.',
      hourly_rate: 350,
      currency: 'ETB',
      location_city: 'Addis Ababa',
      location_lat: 9.0105,
      location_lng: 38.7612,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.9,
      total_reviews: 38,
      completed_jobs: 142,
    },
    {
      user_id: userMap['helen_clean'],
      headline: 'Professional Home & Office Cleaner',
      bio: 'Eco-friendly deep cleaning, sanitization, and organization specialist. Background-checked and trusted by over 100 households.',
      hourly_rate: 280,
      currency: 'ETB',
      location_city: 'Addis Ababa',
      location_lat: 9.0200,
      location_lng: 38.7700,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 5.0,
      total_reviews: 52,
      completed_jobs: 210,
    },
    {
      user_id: userMap['dawit_tech'],
      headline: 'Senior Laptop & Electronics Technician',
      bio: 'Hardware micro-soldering, motherboard repair, liquid damage recovery, and original screen replacements with 6-month warranty.',
      hourly_rate: 450,
      currency: 'ETB',
      location_city: 'Addis Ababa',
      location_lat: 9.0300,
      location_lng: 38.7500,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.8,
      total_reviews: 29,
      completed_jobs: 88,
    },
    {
      user_id: userMap['bethelhem_tutor'],
      headline: 'English & Mathematics Private Tutor',
      bio: 'Dedicated educator with 5+ years tutoring high school & preparatory students. Proven results in national exam preparations.',
      hourly_rate: 200,
      currency: 'ETB',
      location_city: 'Addis Ababa',
      location_lat: 9.0150,
      location_lng: 38.7650,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.9,
      total_reviews: 44,
      completed_jobs: 95,
    },
    {
      user_id: userMap['abebe_electric'],
      headline: 'Certified Electrician & Wiring Expert',
      bio: 'Short circuit troubleshooting, generator setup, safety switches, and full house electrical wiring.',
      hourly_rate: 320,
      currency: 'ETB',
      location_city: 'Addis Ababa',
      location_lat: 9.0250,
      location_lng: 38.7550,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.7,
      total_reviews: 19,
      completed_jobs: 63,
    },
  ].filter((p) => p.user_id);

  console.log('Inserting provider profiles...');
  const { data: providers, error: provError } = await supabase
    .from('provider_profiles')
    .upsert(providerProfiles, { onConflict: 'user_id' })
    .select();

  if (provError) {
    console.error('Error inserting provider profiles:', provError.message);
  } else {
    console.log(`✓ Inserted/Updated ${providers?.length} provider profiles`);
  }

  // 4. Seed a default service for each provider (needed for bookings FK)
  const categorySlugMap = {};
  (categories || []).forEach((c) => { categorySlugMap[c.slug] = c.id; });

  const providerServiceMap = {}; // provider.id → service.id
  if (providers && providers.length > 0 && categories && categories.length > 0) {
    const categoryForProvider = {
      'samuel_plumbing': 'plumbing',
      'helen_clean':     'cleaning',
      'dawit_tech':      'tech',
      'bethelhem_tutor': 'tutoring',
      'abebe_electric':  'electrical',
    };

    const serviceSeeds = providers.map((prov) => {
      const provUsername = Object.keys(userMap).find((k) => userMap[k] === prov.user_id) || '';
      const slug = categoryForProvider[provUsername] || 'cleaning';
      const catId = categorySlugMap[slug] || categories[0].id;
      return {
        provider_id: prov.id,
        category_id: catId,
        title: prov.headline,
        description: prov.bio,
        price_type: 'hourly',
        price_amount: prov.hourly_rate,
        currency: prov.currency,
        location_city: prov.location_city,
        is_available: true,
        is_active: true,
      };
    });

    console.log('Inserting provider services...');
    const { data: services, error: svcErr } = await supabase
      .from('services')
      .insert(serviceSeeds)
      .select();

    if (svcErr) {
      console.warn('Warning seeding services (may already exist):', svcErr.message);
      // Fetch existing ones
      const { data: existingServices } = await supabase
        .from('services')
        .select('id, provider_id')
        .in('provider_id', providers.map((p) => p.id));
      (existingServices || []).forEach((s) => { providerServiceMap[s.provider_id] = s.id; });
    } else {
      (services || []).forEach((s) => { providerServiceMap[s.provider_id] = s.id; });
      console.log(`✓ Inserted ${services?.length} provider services`);
    }
  }

  // 5. Open Requests
  if (userMap['yonas_m']) {
    const requestsData = [
      {
        user_id: userMap['yonas_m'],
        title: 'Emergency Pipe Leak Under Kitchen Sink',
        description: 'Water is dripping rapidly under the kitchen sink cabinet. Need an urgent repair within 2 hours.',
        budget_min: 300,
        budget_max: 600,
        currency: 'ETB',
        location_city: 'Addis Ababa',
        urgency: 'urgent',
        status: 'open',
      },
      {
        user_id: userMap['yonas_m'],
        title: 'MacBook Pro Screen Glitch Repair',
        description: 'Screen has horizontal lines flickering after a minor fall. Need hardware diagnostic and screen replacement quote.',
        budget_min: 1500,
        budget_max: 3000,
        currency: 'ETB',
        location_city: 'Addis Ababa',
        urgency: 'high',
        status: 'open',
      },
      {
        user_id: userMap['yonas_m'],
        title: '3-Bedroom Apartment Deep Cleaning',
        description: 'Moving into a new apartment near Bole Medhanealem. Require full deep cleaning and window washing before Sunday.',
        budget_min: 1000,
        budget_max: 1800,
        currency: 'ETB',
        location_city: 'Addis Ababa',
        urgency: 'medium',
        status: 'open',
      },
    ];

    console.log('Inserting demo requests...');
    const { error: reqsError } = await supabase
      .from('requests')
      .insert(requestsData);
    if (reqsError) {
      console.warn('Warning inserting requests (may already exist):', reqsError.message);
    } else {
      console.log(`✓ Inserted ${requestsData.length} demo requests`);
    }

    // 6. Seed Bookings & Customer Reviews — FIXED field names per schema
    console.log('Inserting demo bookings & customer reviews...');
    const reviewerId = userMap['yonas_m'];

    for (const prov of (providers || [])) {
      const serviceId = providerServiceMap[prov.id] || null;

      const { data: booking, error: bookErr } = await supabase
        .from('bookings')
        .insert({
          requester_id: reviewerId,
          service_id: serviceId,       // FK — required by schema
          entity_type: 'provider',
          entity_id: prov.id,
          scheduled_at: new Date(Date.now() - 86400000 * 3).toISOString(),
          duration_hours: 2,
          agreed_price: prov.hourly_rate * 2,
          currency: 'ETB',
          status: 'completed',
        })
        .select()
        .single();

      if (bookErr) {
        console.warn(`Warning booking for provider ${prov.id}:`, bookErr.message);
        continue;
      }

      if (booking) {
        let reviewComment = 'Excellent work, very professional and punctual!';
        if (prov.headline.includes('Plumber')) {
          reviewComment = 'Samuel arrived within 25 minutes during our urgent pipe leak in Bole. Fixed the burst joint cleanly and tested everything thoroughly. Highly recommended for emergencies!';
        } else if (prov.headline.includes('Cleaner')) {
          reviewComment = 'Helen did a spotless deep clean of our 3-bedroom apartment. Super thorough, trustworthy, and brought eco-friendly supplies!';
        } else if (prov.headline.includes('Laptop')) {
          reviewComment = 'Dawit diagnosed my motherboard issue and replaced my damaged display with a 6-month warranty. Honest and master technician!';
        } else if (prov.headline.includes('Tutor')) {
          reviewComment = 'Bethelhem is an amazing tutor! Helped my younger brother raise his calculus score to an A in just 6 weeks.';
        } else if (prov.headline.includes('Electrician')) {
          reviewComment = 'Abebe solved an intricate circuit trip in our main distribution board safely and quickly. True professional.';
        }

        // FIXED: entity_type / entity_id (not target_entity_type / target_entity_id)
        const { error: revErr } = await supabase.from('reviews').insert({
          booking_id: booking.id,
          reviewer_id: reviewerId,
          entity_type: 'provider',
          entity_id: prov.id,
          rating: 5,
          comment: reviewComment,
        });

        if (revErr) {
          console.warn(`Warning review for booking ${booking.id}:`, revErr.message);
        }
      }
    }
    console.log('✓ Inserted demo bookings and customer reviews');
  }

  console.log('🎉 Database Seeding Completed Successfully!');
}

seed()
  .catch((err) => {
    console.error('Seed script error:', err);
  })
  .finally(() => {
    process.exit();
  });
