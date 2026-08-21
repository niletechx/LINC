const axios = require('axios');

async function test() {
  console.log('Testing Multi-Candidate LINC AI Query...');
  const res1 = await axios.post('http://localhost:5000/api/ai/chat', {
    message: 'Find all available verified plumbers and cleaning services in Addis Ababa',
  });

  console.log('\n--- AI RESPONSE ---');
  console.log(res1.data.data.message);
  console.log('\n--- PROVIDERS ATTACHED ---', res1.data.data.providers.length);
  res1.data.data.providers.forEach((p, idx) => {
    console.log(`${idx + 1}. ${p.name} (@${p.username}) - Rating: ${p.avg_rating}★ (${p.total_reviews} reviews) - Rate: ${p.hourly_rate} ${p.currency}/hr`);
  });

  console.log('\n\nTesting @username Specific Advisor Query...');
  const res2 = await axios.post('http://localhost:5000/api/ai/chat', {
    message: 'What do clients say about @samuel_plumbing and is he reliable for emergency repairs?',
    conversationId: res1.data.data.conversationId,
  });

  console.log('\n--- ADVISOR AI RESPONSE ---');
  console.log(res2.data.data.message);
}

test().catch(console.error);
