const supabase = require('../../config/supabase');
const { getDistanceKm } = require('../../utils/geoUtils');

/**
 * Retrieves and scores providers/businesses matching the extracted intent.
 * Returns top 5 sorted by match score.
 */
async function retrieveMatches(intent, userLat, userLng) {
  const { service_category, budget_max, keywords } = intent;

  // Fetch active providers with their categories
  const { data: providers, error } = await supabase
    .from('provider_profiles')
    .select(`
      id, headline, bio, hourly_rate, currency, location_city,
      location_lat, location_lng, availability_status, is_verified,
      avg_rating, total_reviews, completed_jobs,
      users!inner(full_name, username, avatar_url)
    `)
    .eq('is_active', true)
    .eq('availability_status', 'available')
    .limit(50);

  if (error) throw error;

  // Score each provider
  const scored = providers.map((p) => {
    let score = 0;

    // Rating score (0-0.35)
    score += (p.avg_rating / 5) * 0.35;

    // Verification bonus (0-0.15)
    if (p.is_verified) score += 0.15;

    // Distance score (0-0.25) — closer is better
    if (userLat && userLng && p.location_lat && p.location_lng) {
      const dist = getDistanceKm(userLat, userLng, p.location_lat, p.location_lng);
      const distScore = Math.max(0, 1 - dist / 50); // 0 score at 50km+
      score += distScore * 0.25;
    }

    // Budget score (0-0.15)
    if (budget_max && p.hourly_rate) {
      if (p.hourly_rate <= budget_max) score += 0.15;
    }

    // Experience score (0-0.10)
    const expScore = Math.min(p.completed_jobs / 100, 1);
    score += expScore * 0.10;

    return { ...p, match_score: parseFloat(score.toFixed(4)) };
  });

  // Sort by score descending, return top 5
  return scored.sort((a, b) => b.match_score - a.match_score).slice(0, 5);
}

module.exports = { retrieveMatches };
