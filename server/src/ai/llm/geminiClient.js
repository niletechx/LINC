const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../../utils/logger');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Send a chat to Gemini with a message history.
 * @param {Array} messages - Array of { role: 'user'|'model', parts: [{ text }] }
 * @param {string} systemInstruction - System prompt
 * @returns {string} - AI text response
 */
async function chat(messages, systemInstruction = '') {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction,
    });

    const history = messages.slice(0, -1); // all but last
    const lastMessage = messages[messages.length - 1];

    const chatSession = model.startChat({ history });
    const result = await chatSession.sendMessage(lastMessage.parts[0].text);
    return result.response.text();
  } catch (err) {
    logger.error('Gemini API error: ' + err.message);
    throw new Error('AI service temporarily unavailable');
  }
}

module.exports = { chat };
