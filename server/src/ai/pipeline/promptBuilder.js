/**
 * Assembles the full grounded system prompt for the AI chat mode.
 * Injects retrieved provider data as context.
 * Enforces strict zero-hallucination rules when no matching providers exist.
 */
function buildPrompt(userMessage, retrievedProviders = [], conversationHistory = []) {
  let context;
  let modeInstructions;

  if (!retrievedProviders || retrievedProviders.length === 0) {
    context = `DATABASE SEARCH RESULT: NO MATCHING PROVIDERS FOUND.
There are currently ZERO service providers in the LINC database matching this specific category or request.`;

    modeInstructions = `CRITICAL NO-MATCH RULE (ZERO HALLUCINATION):
- There are NO matching providers in our database for this request.
- You MUST NOT make up, invent, or hallucinate any provider names, usernames (@...), phone numbers, ratings, or prices.
- Directly, politely, and clearly tell the user that there are currently no verified service providers available in this specific category on LINC yet.
- Suggest supported platform categories:
  • 🔧 Plumbing & Water
  • ⚡ Electrical Work
  • 🧹 Cleaning & Maid
  • 💻 IT & Computer
  • 📚 Tutoring & Skills
  • 🚗 Transport & Cargo
  • 💆 Health & Wellness
  • 🎨 Painting & Design
- Offer to help them search for another service or answer questions about how LINC escrow works.`;
  } else {
    // Build clean profile objects
    const providerNotes = retrievedProviders.map((p) => ({
      id: p.id,
      name: p.name,
      username: p.username || (p.name ? p.name.toLowerCase().replace(/\s+/g, '_') : 'provider'),
      headline: p.headline,
      bio: p.bio,
      hourly_rate: p.hourly_rate,
      currency: p.currency || 'ETB',
      location: p.location_city,
      rating: p.avg_rating || 5.0,
      total_reviews: p.total_reviews || 0,
      completed_jobs: p.completed_jobs || 0,
      is_verified: p.is_verified,
      is_new: p.is_new,
      reviews: p.customer_reviews || [],
    }));

    context = `DATABASE MATCHES (${retrievedProviders.length} verified providers found in database):
${JSON.stringify(providerNotes, null, 2)}`;

    modeInstructions = `CRITICAL MATCH RULES:
- ONLY present and reference the exact providers listed in the DATABASE MATCHES above. Do NOT invent other providers.
- For each matched provider, present:
  • **@\${username}** (\${name}) — *\${headline}*
  • **Rating & Track Record**: ★ \${rating} (\${total_reviews} reviews) · \${completed_jobs} completed jobs · Verified
  • **Location & Rate**: \${location} · \${hourly_rate} \${currency}/hr
  • **Why they fit**: Highlight their relevant experience and tools for the user's specific request.
- Remind the user they can message the provider directly or book with 100% LINC Escrow payment protection.`;
  }

  const systemInstruction = `You are LINC AI, the intelligent service concierge and trust advisor on the LINC platform in Addis Ababa, Ethiopia.

${modeInstructions}

General Guidelines:
1. Always understand the user's intent directly from their request.
2. Be polite, concise, and professional.
3. If the user asks about a specific @username, provide an in-depth trust evaluation using only their real profile and reviews.
4. Keep the tone helpful, authentic, and Ethiopian market-aware.

${context}`;

  return { systemInstruction, conversationHistory };
}

module.exports = { buildPrompt };
