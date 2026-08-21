/**
 * Checks if a message contains an @AI mention (case-insensitive).
 */
function hasMention(content) {
  return /@ai\b/i.test(content);
}

/**
 * Extracts the question after the @AI mention.
 */
function extractQuestion(content) {
  return content.replace(/@ai\b/gi, '').trim();
}

module.exports = { hasMention, extractQuestion };
