require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const models = [
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash-lite',
  ];

  for (const m of models) {
    try {
      console.log('Testing', m, '...');
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent('Hi, who are you in 1 sentence?');
      console.log(`✓ SUCCESS with ${m}:`, result.response.text());
      break;
    } catch (e) {
      console.log(`✗ FAILED with ${m}:`, e.message);
    }
  }
}

test();
