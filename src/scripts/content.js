let intervalId = null;

// Import error logger by injecting script tag
const script = document.createElement('script');
script.src = chrome.runtime.getURL('src/scripts/error-logger.js');
(document.head || document.documentElement).appendChild(script);

// Wrap storage access with error handling
try {
  // Check if extension is enabled for this site
  chrome.storage.local.get(['enabled', 'customScript', 'repeatScript', 'delaySeconds', 'intervalSeconds'], function(result) {
    if (chrome.runtime.lastError) {
      console.error('Storage error:', chrome.runtime.lastError);
      return;
    }
    if (result.enabled) {
      startScripts(result);
    }
  });
} catch (error) {
  console.error('content.js initialization error:', error);
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleScript') {
    if (request.enabled) {
      chrome.storage.local.get(['customScript', 'repeatScript', 'delaySeconds', 'intervalSeconds'], function(result) {
        startScripts(result);
      });
    } else {
      stopScripts();
      console.log('Script disabled');
    }
  } else if (request.action === 'runScript') {
    runScriptInPage(request.code);
  }
});

function startScripts(settings) {
  // Stop any existing intervals
  stopScripts();

  // Run initial script with delay
  if (settings.customScript) {
    const delay = (settings.delaySeconds || 0) * 1000;
    setTimeout(() => {
      runScript(settings.customScript, 'Initial script');
    }, delay);
  }

  // Start repeating script
  if (settings.repeatScript && settings.repeatScript.trim()) {
    const interval = (settings.intervalSeconds || 5) * 1000;
    intervalId = setInterval(() => {
      runScript(settings.repeatScript, 'Repeating script');
    }, interval);
  }
}

function stopScripts() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function runScript(scriptCode, label) {
  try {
    // Send message to background to inject via chrome.scripting API
    chrome.runtime.sendMessage({
      action: 'injectScript',
      code: scriptCode,
      label: label
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(`Runtime error for ${label}:`, chrome.runtime.lastError);
      }
    });
  } catch (error) {
    console.error(`content.js:runScript error (${label}):`, error);
  }
}

function runScriptInPage(code) {
  // This runs in the content script context (still has some CSP restrictions)
  // We'll use a workaround with window.eval via the main world
  window.postMessage({ type: 'RUN_CUSTOM_SCRIPT', code: code }, '*');
}
