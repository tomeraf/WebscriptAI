// Load error logger
const errorLoggerScript = document.createElement('script');
errorLoggerScript.src = '../scripts/error-logger.js';
document.head.appendChild(errorLoggerScript);

const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

let conversationHistory = [];

// Load chat history
chrome.storage.local.get(['chatHistory'], function(result) {
  if (result.chatHistory) {
    conversationHistory = result.chatHistory;
    result.chatHistory.forEach(msg => {
      if (msg.role === 'user') {
        addMessage(msg.content, 'user', false);
      } else if (msg.role === 'assistant') {
        addMessage(msg.content, 'ai', false);
      }
    });
  }
});

// Send message on button click
sendBtn.addEventListener('click', sendMessage);

// Send message on Enter (Shift+Enter for new line)
userInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Add user message to UI
  addMessage(message, 'user');
  userInput.value = '';

  // Add to conversation history
  conversationHistory.push({ role: 'user', content: message });

  // Show typing indicator
  const typingDiv = document.createElement('div');
  typingDiv.className = 'typing';
  typingDiv.textContent = 'AI is thinking...';
  chatContainer.appendChild(typingDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Disable send button
  sendBtn.disabled = true;

  // Get API key and send to background for AI response
  chrome.storage.local.get(['geminiApiKey'], function(data) {
    if (chrome.runtime.lastError) {
      console.error('Storage error:', chrome.runtime.lastError);
      typingDiv.remove();
      sendBtn.disabled = false;
      return;
    }

    if (!data.geminiApiKey) {
      typingDiv.remove();
      sendBtn.disabled = false;
      addMessage('Error: No API key found. Please go back and save your Gemini API key.', 'ai', false);
      return;
    }

    try {
      chrome.runtime.sendMessage({
        action: 'chatWithAI',
        messages: conversationHistory,
        apiKey: data.geminiApiKey
      }, function(response) {
        // Remove typing indicator
        typingDiv.remove();
        sendBtn.disabled = false;

        if (chrome.runtime.lastError) {
          console.error('Runtime error:', chrome.runtime.lastError);
          addMessage('Error: ' + chrome.runtime.lastError.message, 'ai', false);
          return;
        }

        if (response.success) {
          const aiResponse = response.message;
          conversationHistory.push({ role: 'assistant', content: aiResponse });

          // Save conversation history
          chrome.storage.local.set({ chatHistory: conversationHistory });

          // Add AI message with action buttons if it contains code
          addMessage(aiResponse, 'ai', true);
        } else {
          addMessage('Error: ' + response.error, 'ai', false);
        }

        userInput.focus();
      });
    } catch (error) {
      console.error('chat.js:sendMessage error:', error);
      typingDiv.remove();
      sendBtn.disabled = false;
      addMessage('Error: ' + error.message, 'ai', false);
    }
  });
}

function addMessage(text, type, hasCode = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;

  // Check if message contains code blocks
  const codeBlockRegex = /```(?:javascript|js)?\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let hasCodeBlock = false;
  let tempDiv = document.createElement('div');

  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    hasCodeBlock = true;

    // Add text before code block
    if (match.index > lastIndex) {
      const textNode = document.createTextNode(text.substring(lastIndex, match.index));
      tempDiv.appendChild(textNode);
    }

    // Add code block
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = match[1].trim();
    pre.appendChild(code);
    tempDiv.appendChild(pre);

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const textNode = document.createTextNode(text.substring(lastIndex));
    tempDiv.appendChild(textNode);
  }

  messageDiv.innerHTML = tempDiv.innerHTML || text;

  // Add action buttons if AI message contains code
  if (type === 'ai' && hasCodeBlock) {
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';

    const initialBtn = document.createElement('button');
    initialBtn.className = 'action-btn';
    initialBtn.textContent = 'Use as Initial Script';
    initialBtn.onclick = (e) => {
      e.preventDefault();
      const code = extractCode(text);
      chrome.storage.local.set({ customScript: code }, () => {
        // Show confirmation
        initialBtn.textContent = 'Added!';
        initialBtn.style.backgroundColor = '#45a049';
        setTimeout(() => {
          initialBtn.textContent = 'Use as Initial Script';
          initialBtn.style.backgroundColor = '#4CAF50';
        }, 2000);
      });
    };

    const repeatBtn = document.createElement('button');
    repeatBtn.className = 'action-btn';
    repeatBtn.textContent = 'Use as Repeat Script';
    repeatBtn.onclick = (e) => {
      e.preventDefault();
      const code = extractCode(text);
      chrome.storage.local.set({ repeatScript: code }, () => {
        // Show confirmation
        repeatBtn.textContent = 'Added!';
        repeatBtn.style.backgroundColor = '#45a049';
        setTimeout(() => {
          repeatBtn.textContent = 'Use as Repeat Script';
          repeatBtn.style.backgroundColor = '#4CAF50';
        }, 2000);
      });
    };

    buttonGroup.appendChild(initialBtn);
    buttonGroup.appendChild(repeatBtn);
    messageDiv.appendChild(buttonGroup);
  }

  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function extractCode(text) {
  const match = text.match(/```(?:javascript|js)?\n?([\s\S]*?)```/);
  return match ? match[1].trim() : text;
}
