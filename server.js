require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = 8080;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Function to call OpenAI API securely
function callOpenAI(userPrompt, context, res) {
  const requestData = JSON.stringify({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a wise Stoic AI Coach, inspired by the teachings of Marcus Aurelius, Seneca, and Epictetus. 
        Your responses should be:
        - Calm and thoughtful
        - Rooted in Stoic philosophy
        - Practical and actionable
        - Encouraging but realistic
        - Include relevant Stoic quotes when appropriate
        - Provide specific Stoic practices or exercises
        - Focus on the four cardinal virtues: Wisdom, Courage, Justice, and Temperance
        - Help users understand what is within vs. outside their control
        Always provide guidance that helps the user build resilience, focus, and emotional control.
        
        ${context}`
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

  const req = https.request(options, (apiRes) => {
    let data = '';
    apiRes.on('data', (chunk) => {
      data += chunk;
    });
    apiRes.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.choices && response.choices[0]) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            response: response.choices[0].message.content.trim() 
          }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid response from OpenAI' }));
        }
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error parsing response' }));
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error calling OpenAI API:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  });

  req.write(requestData);
  req.end();
}

const server = http.createServer((req, res) => {
  // Handle API requests
  if (req.method === 'POST' && req.url === '/api/stoic-response') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { userPrompt, context } = JSON.parse(body);
        callOpenAI(userPrompt, context, res);
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }

  // Handle static files
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath);
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 