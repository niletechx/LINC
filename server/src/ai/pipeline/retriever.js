const supabase = require('../../config/supabase');
const { getDistanceKm } = require('../../utils/geoUtils');

/**
 * Retrieves and scores providers matching the extracted intent.
 *
 * Strategy:
 * 1. If a service_category was extracted, first look for providers that have
 *    a matching service listing (via the `services` table → `categories` slug).
 * 2. Fall back to all active available providers if no category match found.
 * 3. Score each provider on: rating, verification, distance, budget fit,
 *    experience, and keyword relevance.
 * 4. Return the top 5.
 */
async function retrieveMatches(intent, userLat, userLng) {
  const { service_category, budget_max, keywords = [] } = intent;

  const PROVIDER_SELECT = `
    id, headline, bio, hourly_rate, currency, location_city,
    location_lat, location_lng, availability_status, is_verified,
    avg_rating, total_reviews, completed_jobs,
    users!inner(full_name, username, avatar_url)
  `;

  let providers = [];

  // --- Step 1: Try category-filtered lookup via services table ---
  if (service_category) {
    const slug = service_category.toLowerCase().replace(/\s+/g, '-');

    // Find categories whose name or slug matches the extracted intent
    const { data: matchedCategories } = await supabase
      .from('categories')
      .select('id, name, slug')
      .or(`slug.ilike.%${slug}%,name.ilike.%${service_category}%`);

    const categoryIds = (matchedCategories || []).map((c) => c.id);

    if (categoryIds.length > 0) {
      // Find provider IDs that have active services in those categories
      const { data: services } = await supabase
        .from('services')
        .select('provider_id')
        .in('category_id', categoryIds)
        .eq('is_active', true)
        .eq('is_available', true)
        .not('provider_id', 'is', null);

      const providerIds = [...new Set((services || []).map((s) => s.provider_id).filter(Boolean))];

      if (providerIds.length > 0) {
        const { data, error } = await supabase
          .from('provider_profiles')
          .select(PROVIDER_SELECT)
          .in('id', providerIds)
          .eq('is_active', true)
          .eq('availability_status', 'available')
          .limit(50);

        if (!error && data) providers = data;
      }
    }
  }

  // --- Step 2: Fallback — all active available providers ---
  if (providers.length === 0) {
    const { data, error } = await supabase
      .from('provider_profiles')
      .select(PROVIDER_SELECT)
      .eq('is_active', true)
      .eq('availability_status', 'available')
      .limit(50);

    if (error) throw error;
    providers = data || [];
  }

  // --- Step 3: Score each provider ---
  const keywordLower = keywords.map((k) => k.toLowerCase());

  const scored = providers.map((p) => {
    let score = 0;

    // Rating score (0–0.30)
    if (p.avg_rating) score += (p.avg_rating / 5) * 0.30;

    // Verification bonus (0–0.15)
    if (p.is_verified) score += 0.15;

    // Distance score (0–0.25) — closer is better, 0 at 50 km+
    if (userLat && userLng && p.location_lat && p.location_lng) {
      const dist = getDistanceKm(userLat, userLng, p.location_lat, p.location_lng);
      const distScore = Math.max(0, 1 - dist / 50);
      score += distScore * 0.25;
    }

    // Budget fit (0–0.15)
    if (budget_max && p.hourly_rate) {
      if (p.hourly_rate <= budget_max) score += 0.15;
      else if (p.hourly_rate <= budget_max * 1.2) score += 0.07; // within 20% over budget
    }

    // Experience score (0–0.10)
    const expScore = Math.min((p.completed_jobs || 0) / 100, 1);
    score += expScore * 0.10;

    // Keyword relevance (0–0.05) — bonus if keywords match bio or headline
    if (keywordLower.length > 0) {
      const text = `${p.headline || ''} ${p.bio || ''}`.toLowerCase();
      const hits = keywordLower.filter((kw) => text.includes(kw)).length;
      const kwScore = Math.min(hits / keywordLower.length, 1);
      score += kwScore * 0.05;
    }

    return {
      ...p,
      match_score: parseFloat(score.toFixed(4)),
    };
  });

  // --- Step 4: Sort by score descending, return top 5 ---
  return scored.sort((a, b) => b.match_score - a.match_score).slice(0, 5);
}

module.exports = { retrieveMatches };
