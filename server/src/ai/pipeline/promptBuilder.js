/**
 * Assembles the full prompt for the AI chat mode.
 * Injects retrieved provider data as context.
 */
function buildPrompt(userMessage, retrievedProviders, conversationHistory) {
  const context = retrievedProviders.length > 0
    ? `Here are the top matching providers from our database:\n${JSON.stringify(retrievedProviders, null, 2)}`
    : 'No providers were found matching this specific need right now.';

  const systemInstruction = `You are LINC AI, a helpful assistant on the LINC platform — a service discovery platform that connects people with service providers.

Your job:
1. Help users find the right service provider for their needs.
2. Be conversational, friendly, and concise.
3. When you have provider data, present the best options clearly with their rating, price, and why they match.
4. Ask follow-up questions if you need more info (location, budget, urgency).
5. Never make up providers or data — only use what is given to you.
6. Always encourage the user to message the provider directly through LINC.

${context}`;

  return { systemInstruction, conversationHistory };
}

module.exports = { buildPrompt };
