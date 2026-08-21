const supabase = require('../../config/supabase');
const { getDistanceKm } = require('../../utils/geoUtils');

// ── Cold-start constants ─────────────────────────────────────────────────────
const BAYESIAN_PRIOR_MEAN   = 3.5;  // assumed platform-wide avg rating
const BAYESIAN_CONFIDENCE   = 10;   // trust the prior until 10 reviews are in
const NEW_ENTITY_DAYS       = 60;   // "new" = joined within 60 days
const NEW_ENTITY_MAX_REVIEWS = 5;   // "new" = fewer than 5 reviews
const NEW_ENTITY_BOOST      = 0.10; // score bonus for new entities

/**
 * Bayesian-smoothed rating.
 * Blends a provider's actual rating toward the platform mean when they have
 * few reviews. Converges to the real rating once review count >> BAYESIAN_CONFIDENCE.
 *
 *   bayesian = (C × m + n × r) / (C + n)
 *
 * Examples:
 *   0 reviews  → 3.5 / 5  (platform mean, neutral)
 *   1 review @ 5★ → 3.636 / 5
 *   10 reviews @ 5★ → 4.375 / 5
 *   50 reviews @ 5★ → 4.833 / 5
 */
function bayesianRating(avg_rating, total_reviews) {
  const r = avg_rating || 0;
  const n = total_reviews || 0;
  return (BAYESIAN_CONFIDENCE * BAYESIAN_PRIOR_MEAN + n * r) / (BAYESIAN_CONFIDENCE + n);
}

/**
 * Returns true if the entity qualifies as "new" (cold-start state).
 */
function isNewEntity(created_at, total_reviews) {
  if (!created_at) return false;
  const daysSince = (Date.now() - new Date(created_at).getTime()) / 86_400_000;
  return daysSince <= NEW_ENTITY_DAYS && (total_reviews || 0) < NEW_ENTITY_MAX_REVIEWS;
}

/**
 * Retrieves and scores providers, businesses, and organizations matching the
 * extracted intent. Returns up to 5 results.
 *
 * Cold-start strategy:
 *   1. Bayesian-smoothed rating — new providers start at neutral (3.5★), not 0★
 *   2. New entity boost — +0.10 score bonus for entities < 60 days old with < 5 reviews
 *   3. Guaranteed visibility slot — if no new entities make the organic top 5,
 *      the best-scoring new entity is injected at position 4 so they can earn reviews
 */
async function retrieveMatches(intent, userLat, userLng) {
  const { service_category, budget_max, keywords = [] } = intent;

  // ── 1. Resolve category IDs ───────────────────────────────────────────────
  let categoryIds = [];
  if (service_category) {
    const slug = service_category.toLowerCase().replace(/\s+/g, '-');
    const { data: cats } = await supabase
      .from('categories')
      .select('id')
      .or(`slug.ilike.%${slug}%,name.ilike.%${service_category}%`);
    categoryIds = (cats || []).map((c) => c.id);
  }

  // ── 2. Resolve entity IDs via services table & provider_categories table ──
  let providerIds = [], businessIds = [], orgIds = [];

  if (categoryIds.length > 0) {
    const { data: services } = await supabase
      .from('services')
      .select('provider_id, business_id, organization_id')
      .in('category_id', categoryIds)
      .eq('is_active', true)
      .eq('is_available', true);

    (services || []).forEach((s) => {
      if (s.provider_id)     providerIds.push(s.provider_id);
      if (s.business_id)     businessIds.push(s.business_id);
      if (s.organization_id) orgIds.push(s.organization_id);
    });

    // Also look up provider_categories table
    try {
      const { data: provCats } = await supabase
        .from('provider_categories')
        .select('provider_id')
        .in('category_id', categoryIds);

      (provCats || []).forEach((pc) => {
        if (pc.provider_id) providerIds.push(pc.provider_id);
      });
    } catch (_) {}

    providerIds = [...new Set(providerIds)];
    businessIds = [...new Set(businessIds)];
    orgIds      = [...new Set(orgIds)];
  }

  // ── 3. Fetch entity profiles (include created_at for cold-start detection) ─
  const PROVIDER_SELECT = `
    id, headline, bio, hourly_rate, currency, location_city,
    location_lat, location_lng, availability_status, is_verified,
    avg_rating, total_reviews, completed_jobs, created_at,
    users!inner(full_name, username, avatar_url)
  `;
  const BUSINESS_SELECT = `
    id, name, description, location_city, location_lat, location_lng,
    is_verified, avg_rating, total_reviews, business_type, created_at
  `;
  const ORG_SELECT = `
    id, name, description, location_city, location_lat, location_lng,
    is_verified, avg_rating, total_reviews, org_type, created_at
  `;

  // Providers
  let rawProviders = [];
  if (providerIds.length > 0) {
    const { data } = await supabase
      .from('provider_profiles').select(PROVIDER_SELECT)
      .in('id', providerIds).eq('is_active', true)
      .eq('availability_status', 'available').limit(30);
    rawProviders = data || [];
  }
  // If category-linked services didn't find anyone, try headline/bio keyword search
  if (rawProviders.length === 0 && service_category) {
    let query = supabase
      .from('provider_profiles').select(PROVIDER_SELECT)
      .eq('is_active', true).eq('availability_status', 'available');
    query = query.or(`headline.ilike.%${service_category}%,bio.ilike.%${service_category}%`);
    const { data } = await query.limit(30);
    rawProviders = data || [];
  }
  // Also try matching against individual keywords if category search still found nothing
  if (rawProviders.length === 0 && keywords.length > 0) {
    const kw = keywords[0];
    const { data } = await supabase
      .from('provider_profiles').select(PROVIDER_SELECT)
      .eq('is_active', true).eq('availability_status', 'available')
      .or(`headline.ilike.%${kw}%,bio.ilike.%${kw}%`)
      .limit(20);
    rawProviders = data || [];
  }
  // NOTE: We intentionally do NOT load all providers as a catch-all fallback.
  // If nothing relevant is found, we return an empty list and the AI explains
  // that it couldn't find matching providers rather than showing unrelated results.

  // Businesses
  let rawBusinesses = [];
  if (businessIds.length > 0) {
    const { data } = await supabase
      .from('businesses').select(BUSINESS_SELECT)
      .in('id', businessIds).eq('is_active', true).limit(30);
    rawBusinesses = data || [];
  }
  // Only load businesses if no specific category was searched (avoid unrelated results)
  else if (!service_category && categoryIds.length === 0 && keywords.length === 0) {
    const { data } = await supabase
      .from('businesses').select(BUSINESS_SELECT)
      .eq('is_active', true).limit(15);
    rawBusinesses = data || [];
  }

  // Organizations
  let rawOrgs = [];
  if (orgIds.length > 0) {
    const { data } = await supabase
      .from('organizations').select(ORG_SELECT)
      .in('id', orgIds).eq('is_active', true).limit(30);
    rawOrgs = data || [];
  }
  // Only load orgs if no specific category was searched
  else if (!service_category && categoryIds.length === 0 && keywords.length === 0) {
    const { data } = await supabase
      .from('organizations').select(ORG_SELECT)
      .eq('is_active', true).limit(10);
    rawOrgs = data || [];
  }

  // ── 4. Normalize to common shape ──────────────────────────────────────────
  const normalize = (entity, type) => ({
    id:             entity.id,
    entity_type:    type,
    name:           type === 'provider' ? entity.users?.full_name : entity.name,
    headline:       type === 'provider' ? entity.headline : (entity.business_type || entity.org_type || type),
    bio:            entity.bio || entity.description || '',
    hourly_rate:    entity.hourly_rate || null,
    currency:       entity.currency || 'ETB',
    location_city:  entity.location_city,
    location_lat:   entity.location_lat || null,
    location_lng:   entity.location_lng || null,
    is_verified:    entity.is_verified || false,
    avg_rating:     entity.avg_rating || 0,
    total_reviews:  entity.total_reviews || 0,
    completed_jobs: entity.completed_jobs || 0,
    created_at:     entity.created_at || null,
    avatar_url:     type === 'provider' ? entity.users?.avatar_url : null,
    username:       type === 'provider' ? entity.users?.username : null,
  });

  const allEntities = [
    ...rawProviders.map((p) => normalize(p, 'provider')),
    ...rawBusinesses.map((b) => normalize(b, 'business')),
    ...rawOrgs.map((o) => normalize(o, 'organization')),
  ];

  // ── 5. Score (with cold-start adjustments) ────────────────────────────────
  const keywordLower = keywords.map((k) => k.toLowerCase());

  const scored = allEntities.map((e) => {
    let score = 0;
    const isNew = isNewEntity(e.created_at, e.total_reviews);

    // ① Rating — Bayesian smoothed (0–0.30)
    //    New providers default to 3.5★ instead of 0★
    const smoothedRating = bayesianRating(e.avg_rating, e.total_reviews);
    score += (smoothedRating / 5) * 0.30;

    // ② Verification (0–0.15)
    if (e.is_verified) score += 0.15;

    // ③ Distance (0–0.25)
    if (userLat && userLng && e.location_lat && e.location_lng) {
      const dist = getDistanceKm(userLat, userLng, e.location_lat, e.location_lng);
      score += Math.max(0, 1 - dist / 50) * 0.25;
    }

    // ④ Budget fit (0–0.15)
    if (budget_max && e.hourly_rate) {
      if (e.hourly_rate <= budget_max)            score += 0.15;
      else if (e.hourly_rate <= budget_max * 1.2) score += 0.07;
    }

    // ⑤ Experience (0–0.10)
    score += Math.min((e.completed_jobs || 0) / 100, 1) * 0.10;

    // ⑥ Keyword relevance (0–0.05)
    if (keywordLower.length > 0) {
      const text = `${e.headline || ''} ${e.bio || ''}`.toLowerCase();
      const hits = keywordLower.filter((kw) => text.includes(kw)).length;
      score += (hits / keywordLower.length) * 0.05;
    }

    // ⑦ New entity boost (+0.10) — temporary visibility lift
    if (isNew) score += NEW_ENTITY_BOOST;

    return {
      ...e,
      is_new: isNew,
      match_score: parseFloat(score.toFixed(4)),
    };
  });

  // ── 6. Sort and apply guaranteed visibility slot ──────────────────────────
  scored.sort((a, b) => b.match_score - a.match_score);

  // Separate new entities so we can manage their slot explicitly
  const newEntities        = scored.filter((e) => e.is_new);
  const establishedEntities = scored.filter((e) => !e.is_new);

  // Take top 10 from the full sorted list
  let top10 = scored.slice(0, 10);

  // If the query specifically targeted a @username or specific name, prioritize them
  const targetMention = (keywords || []).find((k) => k.startsWith('@') || /^[a-zA-Z0-9_]{3,}$/.test(k));
  if (targetMention) {
    const cleanMention = targetMention.replace('@', '').toLowerCase();
    const exactMatchIndex = top10.findIndex(
      (e) => (e.username && e.username.toLowerCase() === cleanMention) ||
             (e.name && e.name.toLowerCase().includes(cleanMention))
    );
    if (exactMatchIndex > 0) {
      const [matched] = top10.splice(exactMatchIndex, 1);
      top10.unshift(matched);
    }
  }

  // ── 7. Enrich with authentic client reviews and feedback ─────────────────
  const topProviderIds = top10.filter((e) => e.entity_type === 'provider').map((e) => e.id);
  if (topProviderIds.length > 0) {
    try {
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('target_entity_id, rating, comment, created_at, reviewer:users(full_name)')
        .eq('target_entity_type', 'provider')
        .in('target_entity_id', topProviderIds)
        .order('created_at', { ascending: false })
        .limit(40);

      const reviewsByProvider = {};
      (reviewsData || []).forEach((r) => {
        if (!reviewsByProvider[r.target_entity_id]) reviewsByProvider[r.target_entity_id] = [];
        reviewsByProvider[r.target_entity_id].push({
          rating: r.rating,
          comment: r.comment,
          reviewer: r.reviewer?.full_name || 'Verified Client',
        });
      });

      top10.forEach((e) => {
        if (reviewsByProvider[e.id]) {
          e.customer_reviews = reviewsByProvider[e.id];
        }
      });
    } catch (_) {}
  }

  return top10.slice(0, 10);
}

module.exports = { retrieveMatches };
