/**
 * Parses the raw LLM response into a structured payload.
 *
 * Gemini will sometimes mention providers by name or reference them inline.
 * To give the frontend rich provider cards, we also pass through the retrieved
 * provider list so the UI can render them alongside the AI message.
 *
 * If in the future we want Gemini to explicitly return JSON + narrative,
 * this is the place to split them.
 */
function parseResponse(rawResponse, retrievedProviders = []) {
  const message = rawResponse.trim();

  // Extract any provider IDs that were retrieved so frontend can render cards
  const provider_ids = (retrievedProviders || []).map((p) => p.id).filter(Boolean);

  return {
    message,
    provider_ids,
    providers: retrievedProviders, // full objects for card rendering
  };
}

module.exports = { parseResponse };
