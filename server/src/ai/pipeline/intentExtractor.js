const { chat } = require('../llm/geminiClient');

const SYSTEM_PROMPT = `You are an intent extraction engine for LINC, a service discovery platform.
Given a user message and optional previous intent context, extract the following as JSON:
- service_category: string (e.g. 'plumbing', 'laptop repair', 'tutoring') or null
- location: string or null
- budget_max: number or null (in ETB)
- urgency: 'low' | 'medium' | 'high' | 'urgent'
- keywords: string[]

Rules:
- If the user's new message refines a field (e.g. "make it urgent", "under 300 ETB"), update that field.
- If the user's new message does NOT mention a field, inherit it from the previousIntent if provided.
- Respond ONLY with valid JSON. No explanation. No markdown.`;

/**
 * Extracts and accumulates intent from the user message.
 * @param {string} userMessage - The current message
 * @param {object|null} previousIntent - Intent from the previous turn (if any)
 * @returns {object} Merged intent
 */
async function extractIntent(userMessage, previousIntent = null) {
  const contextNote = previousIntent
    ? `Previous intent context (inherit unmentioned fields): ${JSON.stringify(previousIntent)}`
    : 'No previous intent context.';

  const messages = [
    {
      role: 'user',
      parts: [{ text: `${contextNote}\n\nNew message: ${userMessage}` }],
    },
  ];

  const raw = await chat(messages, SYSTEM_PROMPT);

  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const extracted = JSON.parse(cleaned);

    // Merge: fill any null fields from previousIntent as safety net
    if (previousIntent) {
      return {
        service_category: extracted.service_category ?? previousIntent.service_category ?? null,
        location:         extracted.location         ?? previousIntent.location         ?? null,
        budget_max:       extracted.budget_max       ?? previousIntent.budget_max       ?? null,
        urgency:          extracted.urgency          ?? previousIntent.urgency          ?? 'medium',
        keywords:         extracted.keywords?.length > 0
                            ? extracted.keywords
                            : (previousIntent.keywords || []),
      };
    }

    return extracted;
  } catch {
    // Fallback: if JSON parse fails, return previousIntent or defaults
    return previousIntent || {
      service_category: null,
      location: null,
      budget_max: null,
      urgency: 'medium',
      keywords: [],
    };
  }
}

module.exports = { extractIntent };
