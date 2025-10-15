// Import error logger
importScripts('error-logger.js');

// Show welcome page on first install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/pages/welcome.html')
    });
  }
});

// Listen for script injection requests from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'injectScript') {
    // Use chrome.scripting API to execute the script in the MAIN world (bypasses CSP)
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      world: 'MAIN',
      func: (code) => {
        try {
          // Execute in the main page context
          (function() { eval(code); })();
        } catch (error) {
          console.error('Script execution error:', error);
        }
      },
      args: [request.code]
    }).catch(err => {
      logError(err, 'background.js:injectScript', { label: request.label });
    });
  } else if (request.action === 'generateScript') {
    // Handle AI script generation
    generateScriptWithAI(request.prompt)
      .then(script => sendResponse({ success: true, script: script }))
      .catch(error => {
        logError(error, 'background.js:generateScript', { prompt: request.prompt });
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  } else if (request.action === 'chatWithAI') {
    // Handle chat conversation
    chatWithAI(request.messages, request.apiKey)
      .then(message => sendResponse({ success: true, message: message }))
      .catch(error => {
        logError(error, 'background.js:chatWithAI');
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  }
});

async function generateScriptWithAI(prompt, apiKey) {
  // Using Google Gemini API (free tier)

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are a JavaScript code generator. Generate only clean, executable JavaScript code without any markdown formatting, explanations, or comments. Output only the raw code.\n\nGenerate JavaScript code for a Chrome extension content script that: ${prompt}\n\nProvide only the code, no markdown, no explanations.`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API request failed');
  }

  const data = await response.json();
  let code = data.candidates[0].content.parts[0].text.trim();

  // Remove markdown code blocks if present
  code = code.replace(/^```(?:javascript|js)?\n?/g, '').replace(/\n?```$/g, '');

  return code;
}

async function chatWithAI(messages, apiKey) {
  // Using Google Gemini API (free tier)

  // Convert messages to Gemini format
  let conversationText = 'You are a code-only assistant. Your job: 1) Confirm you understand the request (1 sentence max), 2) Generate ONLY the JavaScript code in ```javascript blocks. NO explanations, NO reasoning, NO instructions. Just brief confirmation then code.\n\n';

  messages.forEach(msg => {
    if (msg.role === 'user') {
      conversationText += `User: ${msg.content}\n\n`;
    } else if (msg.role === 'assistant') {
      conversationText += `Assistant: ${msg.content}\n\n`;
    }
  });

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: conversationText
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API request failed');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text.trim();
}
