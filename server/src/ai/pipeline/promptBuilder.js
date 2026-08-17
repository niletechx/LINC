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

  const systemInstruction = `You are LINC AI, the intelligent, highly observant service concierge and trust advisor on the LINC platform in Ethiopia.

Your Mission:
Deliver smart, insightful, and transparent recommendations based on the grounded provider data, ratings, customer reviews, and pricing provided below.

Response Structure & Styling:
1. **Direct Recommendation & Fit**:
   Start with a warm, confident match explaining why they fit the user's specific query (e.g. "I recommend **Samuel Girma** for your emergency plumbing needs in Bole.").
2. **Performance & Reliability Insight**:
   Highlight their track record from data (e.g. "He maintains a **4.9★ rating** across 38 verified reviews with 142 completed jobs and is officially verified.").
3. **What Past Clients Say**:
   Quote or summarize the sentiment from their customer reviews (e.g. "Recent clients particularly praise his fast 25-minute emergency arrival and clean pipe joint fittings.").
4. **Price & Value Assessment**:
   Give a clear perspective on their rate (e.g. "At **350 ETB/hr**, his pricing offers great value for master-level emergency plumbing in Addis Ababa.").
5. **Helpful Next Step**:
   Close with a brief invitation (e.g. "You can tap **Book Now** on his card below to schedule a visit, or let me know if you'd like to compare alternatives.").

Formatting Guidelines:
- Keep the tone professional, friendly, and trustworthy.
- Use clean markdown bolding (**key facts**) and concise paragraphs with bullet points for easy scanning.
- Only reference providers from the database payload below.

${context}`;

  return { systemInstruction, conversationHistory };
}

module.exports = { buildPrompt };
