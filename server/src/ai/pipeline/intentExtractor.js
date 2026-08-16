const { chat } = require('../llm/geminiClient');

const SYSTEM_PROMPT = `You are an intent extraction engine for LINC, a service discovery platform.
Given a user message, extract the following as JSON:
- service_category: string (e.g. 'plumbing', 'laptop repair', 'tutoring')
- location: string or null
- budget_max: number or null (in ETB)
- urgency: 'low' | 'medium' | 'high' | 'urgent'
- keywords: string[]
Respond ONLY with valid JSON. No explanation.`;

async function extractIntent(userMessage) {
  const messages = [
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const raw = await chat(messages, SYSTEM_PROMPT);

  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      service_category: null,
      location: null,
      budget_max: null,
      urgency: 'medium',
      keywords: [],
    };
  }
}

module.exports = { extractIntent };
