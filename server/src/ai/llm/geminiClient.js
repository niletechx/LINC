const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../../utils/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MAX_RETRIES = 2;

/**
 * Send a chat to Gemini with a message history.
 * Retries once on transient empty-response errors.
 *
 * @param {Array} messages  - Array of { role: 'user'|'model', parts: [{ text }] }
 * @param {string} systemInstruction - System prompt
 * @returns {string} - AI text response
 */
async function chat(messages, systemInstruction = '') {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    attempt++;
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction,
      });

      const history = messages.slice(0, -1); // all but last
      const lastMessage = messages[messages.length - 1];

      const chatSession = model.startChat({ history });
      const result = await chatSession.sendMessage(lastMessage.parts[0].text);

      const text = result.response.text();

      if (!text || !text.trim()) {
        // Gemini returned an empty response — retry if attempts remain
        if (attempt < MAX_RETRIES) {
          logger.warn(`Gemini returned empty response on attempt ${attempt}, retrying...`);
          continue;
        }
        throw new Error('Gemini returned an empty response after retries');
      }

      return text;
    } catch (err) {
      if (attempt < MAX_RETRIES) {
        logger.warn(`Gemini API error on attempt ${attempt}: ${err.message} — retrying...`);
        continue;
      }
      logger.error('Gemini API error (all retries exhausted): ' + err.message);
      throw new Error('AI service temporarily unavailable. Please try again.');
    }
  }
}

module.exports = { chat };
