const https = require('https');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  await new Promise(resolve => req.on('end', resolve));

  let userPrompt, context;
  try {
    ({ userPrompt, context } = JSON.parse(body));
  } catch {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const requestData = JSON.stringify({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a wise Stoic AI Coach, inspired by the teachings of Marcus Aurelius, Seneca, and Epictetus. Your responses should be: Calm and thoughtful, Rooted in Stoic philosophy, Practical and actionable, Encouraging but realistic, Include relevant Stoic quotes when appropriate, Provide specific Stoic practices or exercises, Focus on the four cardinal virtues: Wisdom, Courage, Justice, and Temperance, Help users understand what is within vs. outside their control. Always provide guidance that helps the user build resilience, focus, and emotional control. ${context}`
      },
      {
        role: 'user',
        content: userPrompt
      }
    ],
    max_tokens: 600,
    temperature: 0.7
  });

  const options = {
    hostname: 'api.openai.com',
    port: 443,
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Length': Buffer.byteLength(requestData)
    }
  };

  try {
    const openaiRes = await new Promise((resolve, reject) => {
      const openaiReq = https.request(options, apiRes => {
        let data = '';
        apiRes.on('data', chunk => { data += chunk; });
        apiRes.on('end', () => resolve(data));
      });
      openaiReq.on('error', reject);
      openaiReq.write(requestData);
      openaiReq.end();
    });

    const response = JSON.parse(openaiRes);
    if (response.choices && response.choices[0]) {
      res.status(200).json({ response: response.choices[0].message.content.trim() });
    } else {
      res.status(500).json({ error: 'Invalid response from OpenAI' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error calling OpenAI API' });
  }
}; 