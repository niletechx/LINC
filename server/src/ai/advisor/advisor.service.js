const supabase = require('../../config/supabase');
const { chat } = require('../llm/geminiClient');
const { extractQuestion } = require('./mentionDetector');
const { ADVISOR_SYSTEM_PROMPT } = require('./advisorPrompts');
const logger = require('../../utils/logger');

/**
 * Handles @AI mentions inside human DM conversations.
 * Fetches context about the other party and answers the user's question.
 */
async function respond({ message, conversationId, requesterId }) {
  try {
    const question = extractQuestion(message);

    // Fetch conversation to find the other party
    const { data: convo } = await supabase
      .from('conversations')
      .select('participant_a_type, participant_a_id, participant_b_type, participant_b_id')
      .eq('id', conversationId)
      .single();

    if (!convo) return 'I could not find this conversation.';

    // Determine which participant is the provider (not the requester)
    let providerType, providerId;
    if (convo.participant_a_id === requesterId) {
      providerType = convo.participant_b_type;
      providerId = convo.participant_b_id;
    } else {
      providerType = convo.participant_a_type;
      providerId = convo.participant_a_id;
    }

    // Fetch provider data based on type
    let providerData = null;
    if (providerType === 'provider') {
      const { data } = await supabase
        .from('provider_profiles')
        .select('headline, avg_rating, total_reviews, completed_jobs, is_verified, hourly_rate')
        .eq('id', providerId)
        .single();
      providerData = data;
    } else if (providerType === 'business') {
      const { data } = await supabase
        .from('businesses')
        .select('name, avg_rating, total_reviews, is_verified')
        .eq('id', providerId)
        .single();
      providerData = data;
    }

    const contextText = providerData
      ? `Provider data: ${JSON.stringify(providerData)}`
      : 'No provider data found.';

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
