const MAX_TOKENS_ESTIMATE = 8000; // conservative estimate
const AVG_CHARS_PER_TOKEN = 4;

/**
 * Trims message history to fit within token budget.
 * Keeps the most recent messages.
 */
function trimHistory(messages, maxTokens = MAX_TOKENS_ESTIMATE) {
  const maxChars = maxTokens * AVG_CHARS_PER_TOKEN;
  let totalChars = 0;
  const trimmed = [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const msgChars = messages[i].parts[0].text.length;
    if (totalChars + msgChars > maxChars) break;
    totalChars += msgChars;
    trimmed.unshift(messages[i]);
  }

  return trimmed;
}

module.exports = { trimHistory };
