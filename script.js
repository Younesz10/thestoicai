// OpenAI API Configuration
const OPENAI_API_URL = '/api/stoic-response'; // Use backend proxy

// Waitlist form functionality
const form = document.getElementById('waitlistForm');
const emailInput = document.getElementById('email');
const confirmMsg = document.getElementById('waitlistConfirm');

if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (!email) return;
    
    // Simulate async submission
    form.querySelector('button').disabled = true;
    confirmMsg.style.opacity = 0;
    setTimeout(() => {
      confirmMsg.textContent = 'Thank you! You\'re on the waitlist.';
      confirmMsg.style.opacity = 1;
      form.reset();
      form.querySelector('button').disabled = false;
    }, 900);
  });
}

// Rotating quotes functionality
const quotes = Array.from(document.querySelectorAll('.quote'));
let current = 0;

if (quotes.length > 0) {
  setInterval(() => {
    quotes[current].classList.remove('active');
    current = (current + 1) % quotes.length;
    quotes[current].classList.add('active');
  }, 6000);
}

// Stoic Quotes Database
const stoicQuotes = {
  wisdom: [
    "The happiness of your life depends upon the quality of your thoughts. - Marcus Aurelius",
    "It is not what happens to you, but how you react to it that matters. - Epictetus",
    "Waste no more time arguing about what a good man should be. Be one. - Marcus Aurelius"
  ],
  courage: [
    "He who has a why to live can bear almost any how. - Friedrich Nietzsche (Stoic-adjacent)",
    "Courage is not the absence of fear, but the triumph over it. - Nelson Mandela (Stoic-adjacent)",
    "The bravest sight in the world is to see a great man struggling against adversity. - Seneca"
  ],
  justice: [
    "Justice is the source of all the other virtues. - Cicero",
    "What is not good for the swarm is not good for the bee. - Marcus Aurelius",
    "The best revenge is not to be like your enemy. - Marcus Aurelius"
  ],
  temperance: [
    "Wealth consists not in having great possessions, but in having few wants. - Epictetus",
    "It is the power of the mind to be unconquerable. - Seneca",
    "The greatest wealth is to live content with little. - Plato (Stoic-adjacent)"
  ]
};

// Stoic Practices Database
const stoicPractices = {
  morning: {
    title: "🌅 Morning Stoic Reflection",
    prompts: [
      "What challenges might I face today?",
      "How can I apply Stoic virtues to these challenges?",
      "What is within my control today?",
      "How can I serve others with wisdom and justice?"
    ]
  },
  evening: {
    title: "🌙 Evening Stoic Review",
    prompts: [
      "What did I do well today?",
      "Where did I fall short of Stoic principles?",
      "What am I grateful for today?",
      "How can I improve tomorrow?"
    ]
  },
  journaling: {
    title: "📝 Stoic Journaling Exercise",
    prompts: [
      "Reflect on a recent challenge: What was within your control?",
      "Write about a virtue you want to strengthen today",
      "Describe a situation where you could have been more Stoic",
      "What would Marcus Aurelius say about your current situation?"
    ]
  },
  meditation: {
    title: "🧘 Stoic Meditation Guide",
    prompts: [
      "Focus on your breath and the present moment",
      "Contemplate the impermanence of all things",
      "Reflect on what truly matters in life",
      "Practice accepting what you cannot change"
    ]
  }
};

// OpenAI API Functions
async function getStoicResponse(userPrompt, context = '') {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userPrompt,
        context
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error calling API:', error);
    return 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.';
  }
}

// Chat functionality
let chatHistory = [];

function addMessageToChat(userMessage, aiResponse) {
  const chatMessages = document.getElementById('chatMessages');
  const messageId = Date.now();

  // Insert user message and an empty AI message
  const messageHTML = `
    <div class="chat-message" id="message-${messageId}">
      <div class="user-message">
        <div class="message-avatar">👤</div>
        <div class="message-content">
          <div class="message-text">${userMessage}</div>
        </div>
      </div>
      <div class="ai-message">
        <div class="message-avatar"><img src="marcus-aurelius.png" alt="Stoic Coach" class="stoic-avatar"></div>
        <div class="message-content">
          <div class="message-text" id="ai-text-${messageId}"></div>
        </div>
      </div>
    </div>
  `;
  chatMessages.insertAdjacentHTML('beforeend', messageHTML);

  // Typing effect for AI response
  typeAIResponse(`ai-text-${messageId}`, formatAIResponse(aiResponse));

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Add to chat history
  chatHistory.push({
    id: messageId,
    user: userMessage,
    ai: aiResponse,
    timestamp: new Date()
  });
}

function typeAIResponse(elementId, text, speed = 20) {
  const el = document.getElementById(elementId);
  let i = 0;

  function type() {
    if (i <= text.length) {
      el.innerHTML = text.slice(0, i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}

function formatAIResponse(response) {
  // Clean up extra whitespace and normalize line breaks
  let formatted = response
    .trim()
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n') // Handle old Mac line endings
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines to max 2
    .replace(/[ \t]+/g, ' ') // Normalize spaces
    .replace(/\n[ \t]+/g, '\n') // Remove leading spaces after newlines
    .replace(/[ \t]+\n/g, '\n'); // Remove trailing spaces before newlines
  
  // Replace newlines with proper HTML breaks and paragraphs
  formatted = formatted
    .replace(/\n\n/g, '</p><p>') // Double newlines become paragraph breaks
    .replace(/\n/g, '<br>') // Single newlines become line breaks
    .replace(/^/, '<p>') // Start with paragraph
    .replace(/$/, '</p>'); // End with paragraph
  
  // Handle quotes with special formatting
  formatted = formatted.replace(/"([^"]+)"/g, '<span class="quote">"$1"</span>');
  
  // Handle numbered lists
  formatted = formatted.replace(/(\d+\.\s+[^<]+)/g, '<div class="list-item">$1</div>');
  
  // Handle bullet points
  formatted = formatted.replace(/(•\s+[^<]+)/g, '<div class="list-item">$1</div>');
  
  // Handle section headers (lines that end with :)
  formatted = formatted.replace(/([^<]+:)\s*<br>/g, '<h4 class="section-header">$1</h4>');
  
  // Clean up empty paragraphs
  formatted = formatted.replace(/<p><\/p>/g, '');
  
  return formatted;
}

// Stoic Tools Functionality
function initializeStoicTools() {
  // Virtue buttons
  const virtueButtons = document.querySelectorAll('.virtue-btn');
  virtueButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const virtue = this.dataset.virtue;
      const quotes = stoicQuotes[virtue];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      
      const prompt = `Teach me about ${virtue} and how to cultivate it in my daily life.`;
      const context = `Focus specifically on the virtue of ${virtue}. Include practical exercises and relevant Stoic wisdom.`;
      
      addMessageToChat(prompt, `Here's wisdom about ${virtue}:\n\n"${randomQuote}"\n\nLet me provide you with deeper guidance...`);
      
      // Get AI response
      getStoicResponse(prompt, context).then(response => {
        // Update the last AI message with the full response
        const chatMessages = document.getElementById('chatMessages');
        const lastAiMessage = chatMessages.querySelector('.chat-message:last-child .ai-message .message-text');
        if (lastAiMessage) {
          const fullResponse = `Here's wisdom about ${virtue}:\n\n"${randomQuote}"\n\n${response}`;
          lastAiMessage.innerHTML = formatAIResponse(fullResponse);
        }
      });
    });
  });

  // Quick prompt buttons
  const quickPromptButtons = document.querySelectorAll('.quick-prompt-btn');
  quickPromptButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const promptTemplate = this.dataset.prompt;
      const promptInput = document.getElementById('promptInput');
      promptInput.value = promptTemplate;
      promptInput.focus();
    });
  });

  // Practice buttons
  const practiceButtons = document.querySelectorAll('.practice-btn');
  practiceButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const practice = this.dataset.practice;
      const practiceData = stoicPractices[practice];
      
      const prompt = `Guide me through a ${practice} practice.`;
      const practiceText = `${practiceData.title}\n\n${practiceData.prompts.map((prompt, index) => `${index + 1}. ${prompt}`).join('\n')}`;
      
      addMessageToChat(prompt, practiceText);
      
      // Get AI guidance for the practice
      const context = `Provide a detailed guide for ${practice} practice. Include specific steps, timing, and how to integrate this into daily life.`;
      getStoicResponse(prompt, context).then(response => {
        const chatMessages = document.getElementById('chatMessages');
        const lastAiMessage = chatMessages.querySelector('.chat-message:last-child .ai-message .message-text');
        if (lastAiMessage) {
          const fullResponse = `${practiceText}\n\n${response}`;
          lastAiMessage.innerHTML = formatAIResponse(fullResponse);
        }
      });
    });
  });
}

// Prompt section functionality
function initializePromptSection() {
  const promptForm = document.getElementById('promptForm');
  const promptInput = document.getElementById('promptInput');
  const responseArea = document.getElementById('aiResponse');
  const submitBtn = document.getElementById('submitPrompt');
  const loadingSpinner = document.getElementById('loadingSpinner');

  if (promptForm) {
    promptForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      await submitPrompt();
    });
  }

  // Handle Enter key press
  if (promptInput) {
    promptInput.addEventListener('keydown', async function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        await submitPrompt();
      }
    });
  }

  async function submitPrompt() {
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    // Show loading state
    submitBtn.disabled = true;
    loadingSpinner.style.display = 'inline-block';
    responseArea.textContent = '';
    responseArea.style.opacity = '0';

    try {
      const stoicResponse = await getStoicResponse(prompt);
      
      // Add message to chat
      addMessageToChat(prompt, stoicResponse);
      
      // Clear input
      promptInput.value = '';
      
    } catch (error) {
      const errorMessage = 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.';
      addMessageToChat(prompt, errorMessage);
    } finally {
      // Hide loading state
      submitBtn.disabled = false;
      loadingSpinner.style.display = 'none';
    }
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializePromptSection();
  initializeStoicTools();
}); 