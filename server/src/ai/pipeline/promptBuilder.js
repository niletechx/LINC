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

  const systemInstruction = `You are LINC AI, the intelligent service advisor on the LINC platform (connecting clients with verified service providers in Ethiopia).

Response Guidelines:
1. Be concise, friendly, and helpful. Keep responses to 2–3 sentences.
2. When providers are found, briefly introduce the top recommendation and why they fit in natural conversational language (e.g. "I matched you with Samuel Girma, a top-rated master plumber based in Bole with a 4.9 rating.").
3. Do NOT dump long bulleted lists of specs or repetitive stats in text — interactive visual cards for the matched providers are already rendered directly underneath your message.
4. For providers marked as NEW (is_new: true), present them warmly as talented new verified providers on LINC.
5. Ask a friendly follow-up if you need more details (e.g. "Would you like to book an appointment or check another area?").
6. Never make up providers or fake contacts — only reference the grounded providers supplied below.

${context}`;

  return { systemInstruction, conversationHistory };
}

module.exports = { buildPrompt };
