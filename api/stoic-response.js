const https = require('https');

module.exports = async (req, res) => {
  try {
    console.log('Function started');

    if (req.method !== 'POST') {
      console.error('Method not allowed:', req.method);
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    let userPrompt, context;
    try {
      ({ userPrompt, context } = req.body);
      if (!userPrompt) throw new Error('Missing userPrompt');
      console.log('Parsed body:', { userPrompt, context });
    } catch (err) {
      console.error('Body parse error:', err);
      res.status(400).json({ error: 'Invalid request', details: err.message });
      return;
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      console.error('Missing OPENAI_API_KEY');
      res.status(500).json({ error: 'Missing OpenAI API key' });
      return;
    }
    console.log('API key loaded, length:', OPENAI_API_KEY.length);

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
    console.log('Request data prepared');

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
    console.log('Options prepared');

    const openaiRes = await new Promise((resolve, reject) => {
      const openaiReq = https.request(options, apiRes => {
        let data = '';
        apiRes.on('data', chunk => { data += chunk; });
        apiRes.on('end', () => resolve(data));
      });
      openaiReq.on('error', err => {
        console.error('OpenAI request error:', err);
        reject(err);
      });
      openaiReq.write(requestData);
      openaiReq.end();
    });
    console.log('OpenAI response received:', openaiRes.slice(0, 200)); // log first 200 chars

    let response;
    try {
      response = JSON.parse(openaiRes);
    } catch (err) {
      console.error('OpenAI response parse error:', err, openaiRes);
      res.status(500).json({ error: 'Error parsing OpenAI response', details: err.message });
      return;
    }

    if (response.choices && response.choices[0]) {
      res.status(200).json({ response: response.choices[0].message.content.trim() });
    } else {
      console.error('Invalid response from OpenAI:', response);
      res.status(500).json({ error: 'Invalid response from OpenAI', details: response });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Unexpected server error', details: error.message });
  }
}; 