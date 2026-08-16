const supabase = require('../../config/supabase');
const { chat } = require('../llm/geminiClient');
const { extractQuestion } = require('./mentionDetector');
const { ADVISOR_SYSTEM_PROMPT } = require('./advisorPrompts');
const logger = require('../../utils/logger');

/**
 * Handles @AI mentions inside human DM conversations.
 * Fetches provider profile data AND active reports to give the user a
 * complete trust picture — including any red flags.
 */
async function respond({ message, conversationId, requesterId }) {
  try {
    const question = extractQuestion(message);

    // ── 1. Fetch conversation to identify the other party ─────────────────────
    const { data: convo } = await supabase
      .from('conversations')
      .select('participant_a_type, participant_a_id, participant_b_type, participant_b_id')
      .eq('id', conversationId)
      .single();

    if (!convo) return 'I could not find this conversation.';

    // Determine which participant is NOT the requester
    let providerType, providerId;
    if (convo.participant_a_id === requesterId) {
      providerType = convo.participant_b_type;
      providerId   = convo.participant_b_id;
    } else {
      providerType = convo.participant_a_type;
      providerId   = convo.participant_a_id;
    }

    // ── 2. Fetch profile data ─────────────────────────────────────────────────
    let providerData = null;

    if (providerType === 'provider') {
      const { data } = await supabase
        .from('provider_profiles')
        .select(`
          headline, avg_rating, total_reviews, completed_jobs,
          is_verified, hourly_rate, currency, availability_status,
          users!inner(full_name)
        `)
        .eq('id', providerId)
        .single();
      providerData = data;
    } else if (providerType === 'business') {
      const { data } = await supabase
        .from('businesses')
        .select('name, avg_rating, total_reviews, is_verified, business_type')
        .eq('id', providerId)
        .single();
      providerData = data;
    } else if (providerType === 'organization') {
      const { data } = await supabase
        .from('organizations')
        .select('name, avg_rating, total_reviews, is_verified, org_type')
        .eq('id', providerId)
        .single();
      providerData = data;
    }

    // ── 3. Fetch active reports against this entity ───────────────────────────
    const { data: reports, count: reportCount } = await supabase
      .from('reports')
      .select('reason', { count: 'exact', head: false })
      .eq('entity_type', providerType)
      .eq('entity_id', providerId)
      .in('status', ['pending', 'reviewed'])
      .limit(5);

    const reportSummary = reportCount > 0
      ? `${reportCount} active report(s) against this entity. Reasons: ${(reports || []).map(r => r.reason).join(', ')}.`
      : 'No active reports. Clean record.';

    // ── 4. Build context text for Gemini ────────────────────────────────────
    const contextText = providerData
      ? `Provider profile: ${JSON.stringify(providerData)}\nTrust & Safety: ${reportSummary}`
      : `No provider profile found. Trust & Safety: ${reportSummary}`;

    // ── 5. Call Gemini ────────────────────────────────────────────────────────
    const messages = [
      { role: 'user', parts: [{ text: `${contextText}\n\nUser question: ${question}` }] },
    ];

    return await chat(messages, ADVISOR_SYSTEM_PROMPT);
  } catch (err) {
    logger.error('advisor.service error: ' + err.message);
    return 'Sorry, I could not process that right now.';
  }
}

module.exports = { respond };
