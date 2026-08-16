/**
 * Assembles the full grounded system prompt for the AI chat mode.
 * Injects retrieved provider data as context, with special handling
 * for new providers so the AI presents them fairly.
 */
function buildPrompt(userMessage, retrievedProviders, conversationHistory) {
  let context;

  if (retrievedProviders.length === 0) {
    context = 'No providers were found matching this specific need right now.';
  } else {
    // Build a plain-language note for each provider so Gemini understands new vs established
    const providerNotes = retrievedProviders.map((p) => {
      const base = { ...p };
      if (p.is_new) {
        base._note = 'NEW PROVIDER — joined recently, few or no reviews yet. Present them honestly as new but promising.';
      } else if (p.total_reviews >= 20) {
        base._note = 'ESTABLISHED — many reviews, reliable track record.';
      }
      return base;
    });

    context = `Here are the top matching providers/businesses/organizations from our database:\n${JSON.stringify(providerNotes, null, 2)}`;
  }

  const systemInstruction = `You are LINC AI, a helpful assistant on the LINC platform — a service discovery platform that connects people with service providers, businesses, and organizations.

Your job:
1. Help users find the right match for their needs.
2. Be conversational, friendly, and concise.
3. When you have provider data, present the best options clearly — mention their rating, price, location, and why they match.
4. For providers marked as NEW (is_new: true), mention that they are new to LINC and may not have reviews yet, but present this as a positive opportunity — early clients help them build their reputation.
5. Never rank new providers as worse just because they lack reviews — use the match_score and context to guide your recommendation.
6. Ask follow-up questions if you need more info (location, budget, urgency).
7. Never make up providers or data — only use what is given to you.
8. Always encourage the user to message the provider directly through LINC.

${context}`;

  return { systemInstruction, conversationHistory };
}

module.exports = { buildPrompt };
