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
 * Uses fast-path token matching for sub-second responses,
 * falling back to Gemini only for ambiguous queries.
 */
async function extractIntent(userMessage, previousIntent = null) {
  const lower = userMessage.toLowerCase();

  // Fast-path 1: @username mentions
  const mentionMatch = userMessage.match(/@([a-zA-Z0-9_]+)/);
  if (mentionMatch) {
    const username = mentionMatch[1].toLowerCase();
    let detectedCategory = previousIntent?.service_category || null;
    if (username.includes('plumb')) detectedCategory = 'plumbing';
    else if (username.includes('clean')) detectedCategory = 'cleaning';
    else if (username.includes('tech') || username.includes('laptop')) detectedCategory = 'laptop repair';
    else if (username.includes('tutor')) detectedCategory = 'tutoring';
    else if (username.includes('electr')) detectedCategory = 'electrical';

    return {
      service_category: detectedCategory,
      location: previousIntent?.location || null,
      budget_max: previousIntent?.budget_max || null,
      urgency: previousIntent?.urgency || 'medium',
      keywords: [`@${username}`, username],
    };
  }

  // Fast-path 2: Common service keywords
  let fastCat = null;
  if (/plumb|pipe|leak|drain|toilet|faucet|sink/i.test(lower)) fastCat = 'plumbing';
  else if (/clean|housekeep|maid|janitor|sanitize|wash/i.test(lower)) fastCat = 'cleaning';
  else if (/laptop|computer|macbook|pc|screen|hardware|repair/i.test(lower)) fastCat = 'laptop repair';
  else if (/tutor|teach|math|english|calculus|lesson|study/i.test(lower)) fastCat = 'tutoring';
  else if (/electr|wire|circuit|breaker|light|socket/i.test(lower)) fastCat = 'electrical';

  let fastLoc = null;
  if (/bole/i.test(lower)) fastLoc = 'Bole';
  else if (/kazanchis|casanchis/i.test(lower)) fastLoc = 'Kazanchis';
  else if (/piassa|arada/i.test(lower)) fastLoc = 'Piassa';
  else if (/mexico/i.test(lower)) fastLoc = 'Mexico';
  else if (/addis/i.test(lower)) fastLoc = 'Addis Ababa';

  if (fastCat) {
    return {
      service_category: fastCat,
      location: fastLoc || previousIntent?.location || null,
      budget_max: previousIntent?.budget_max || null,
      urgency: /urgent|emergency|now|asap|fast/i.test(lower) ? 'urgent' : (previousIntent?.urgency || 'medium'),
      keywords: fastLoc ? [fastCat, fastLoc] : [fastCat],
    };
  }

  // Fallback: Gemini LLM intent extraction
  try {
    const contextNote = previousIntent
      ? `Previous intent context: ${JSON.stringify(previousIntent)}`
      : 'No previous intent context.';

    const messages = [
      {
        role: 'user',
        parts: [{ text: `${contextNote}\n\nNew message: ${userMessage}` }],
      },
    ];

    const raw = await chat(messages, SYSTEM_PROMPT);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const extracted = JSON.parse(cleaned);

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
