const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../../utils/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MAX_RETRIES = 2;

const CANDIDATE_MODELS = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-2.5-flash',
];

/**
 * Send a chat to Gemini and wait for the full response.
 * Cycles through available models if one encounters quota or transient error.
 *
 * @param {Array}  messages          - [{ role: 'user'|'model', parts: [{ text }] }]
 * @param {string} systemInstruction - System prompt
 * @returns {string} Full AI text response
 */
async function chat(messages, systemInstruction = '') {
  let lastErr = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
      const history = messages.slice(0, -1);
      const lastMessage = messages[messages.length - 1];

      const chatSession = model.startChat({ history });
      const result = await chatSession.sendMessage(lastMessage.parts[0].text);
      const text = result.response.text();

      if (text && text.trim()) {
        return text;
      }
    } catch (err) {
      lastErr = err;
      logger.warn(`Gemini (${modelName}) failed: ${err.message} — trying next model candidate...`);
    }
  }

  logger.error('All Gemini models failed: ' + (lastErr?.message || 'unknown error'));
  throw new Error('AI service temporarily unavailable. Please try again.');
}

/**
 * Stream a chat response from Gemini chunk-by-chunk.
 *
 * @param {Array}    messages          - [{ role: 'user'|'model', parts: [{ text }] }]
 * @param {string}   systemInstruction - System prompt
 * @param {Function} onChunk           - Callback called with each text chunk
 * @returns {string} Full response text
 */
async function streamChat(messages, systemInstruction = '', onChunk = () => {}) {
  let lastErr = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
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

      if (fullText.trim()) return fullText;
    } catch (err) {
      lastErr = err;
      logger.warn(`Gemini stream (${modelName}) failed: ${err.message} — trying next model...`);
    }
  }

  logger.error('Gemini stream error (all models failed): ' + (lastErr?.message || 'unknown'));
  throw new Error('AI streaming temporarily unavailable. Please try again.');
}

module.exports = { chat, streamChat };
