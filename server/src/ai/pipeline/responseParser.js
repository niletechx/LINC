/**
 * Cleans and formats the raw LLM response.
 * In the future this could extract structured data (e.g. provider IDs to show cards).
 */
function parseResponse(rawResponse) {
  return rawResponse.trim();
}

module.exports = { parseResponse };
