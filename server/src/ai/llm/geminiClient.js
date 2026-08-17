const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../../utils/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MAX_RETRIES = 2;

/**
 * Send a chat to Gemini and wait for the full response.
 * Retries once on transient empty-response errors.
 *
 * @param {Array}  messages          - [{ role: 'user'|'model', parts: [{ text }] }]
 * @param {string} systemInstruction - System prompt
 * @returns {string} Full AI text response
 */
async function chat(messages, systemInstruction = '') {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    attempt++;
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash', systemInstruction });
      const history = messages.slice(0, -1);
      const lastMessage = messages[messages.length - 1];

      const chatSession = model.startChat({ history });
      const result = await chatSession.sendMessage(lastMessage.parts[0].text);
      const text = result.response.text();

      if (!text || !text.trim()) {
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

/**
 * Stream a chat response from Gemini chunk-by-chunk.
 * Calls onChunk(text) for each partial token as it arrives.
 * Returns the full concatenated response string when done.
 *
 * @param {Array}    messages          - [{ role: 'user'|'model', parts: [{ text }] }]
 * @param {string}   systemInstruction - System prompt
 * @param {Function} onChunk           - Callback called with each text chunk
 * @returns {string} Full response text
 */
async function streamChat(messages, systemInstruction = '', onChunk = () => {}) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash', systemInstruction });
    const history = messages.slice(0, -1);
    const lastMessage = messages[messages.length - 1];

    const chatSession = model.startChat({ history });
    const streamResult = await chatSession.sendMessageStream(lastMessage.parts[0].text);

    let fullText = '';
    for await (const chunk of streamResult.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        fullText += chunkText;
        onChunk(chunkText);
      }
    }

    if (!fullText.trim()) throw new Error('Gemini stream returned empty response');
    return fullText;
  } catch (err) {
    logger.error('Gemini stream error: ' + err.message);
    throw new Error('AI streaming temporarily unavailable. Please try again.');
  }
}

module.exports = { chat, streamChat };
