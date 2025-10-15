// Load error logger
const errorLoggerScript = document.createElement('script');
errorLoggerScript.src = '../scripts/error-logger.js';
document.head.appendChild(errorLoggerScript);

const toggleSwitch = document.getElementById('toggleSwitch');
const scriptEditor = document.getElementById('scriptEditor');
const repeatScript = document.getElementById('repeatScript');
const delaySeconds = document.getElementById('delaySeconds');
const intervalSeconds = document.getElementById('intervalSeconds');
const statusDiv = document.getElementById('status');
const openChatBtn = document.getElementById('openChat');

// Load saved state and script
function loadScripts() {
  chrome.storage.local.get(['enabled', 'customScript', 'repeatScript', 'delaySeconds', 'intervalSeconds'], function(result) {
    toggleSwitch.checked = result.enabled || false;
    scriptEditor.value = result.customScript || '';
    repeatScript.value = result.repeatScript || '';
    delaySeconds.value = result.delaySeconds || 0;
    intervalSeconds.value = result.intervalSeconds || 5;
  });
}

loadScripts();

// Listen for storage changes from chat window
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace === 'local') {
    if (changes.customScript) {
      scriptEditor.value = changes.customScript.newValue;
    }
    if (changes.repeatScript) {
      repeatScript.value = changes.repeatScript.newValue;
    }
  }
});

// Auto-save function
function autoSave() {
  const settings = {
    customScript: scriptEditor.value,
    repeatScript: repeatScript.value,
    delaySeconds: parseFloat(delaySeconds.value) || 0,
    intervalSeconds: parseFloat(intervalSeconds.value) || 5
  };

  chrome.storage.local.set(settings, function() {
    // Show brief save indicator
    statusDiv.textContent = 'Saved';
    statusDiv.className = 'status success';
    statusDiv.style.display = 'block';

    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 1000);
  });
}

// Handle toggle change
toggleSwitch.addEventListener('change', function() {
  try {
    const enabled = this.checked;

    // Save state
    chrome.storage.local.set({ enabled: enabled });

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (chrome.runtime.lastError) {
        console.error('Tabs query error:', chrome.runtime.lastError);
        return;
      }
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleScript',
          enabled: enabled
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Message send error:', chrome.runtime.lastError);
          }
        });

        // Reload the page to apply changes
        if (enabled) {
          chrome.tabs.reload(tabs[0].id);
        }
      }
    });
  } catch (error) {
    console.error('popup.js:toggleSwitch error:', error);
  }
});

// Save when clicking away from textareas (blur event)
scriptEditor.addEventListener('blur', autoSave);
repeatScript.addEventListener('blur', autoSave);

// Save immediately on number changes
delaySeconds.addEventListener('change', autoSave);
intervalSeconds.addEventListener('change', autoSave);

// Track chat window ID
let chatWindowId = null;
let setupWindowId = null;

// Open chat in separate window (single instance)
openChatBtn.addEventListener('click', function() {
  chrome.storage.local.get(['geminiApiKey'], function(result) {
    if (!result.geminiApiKey) {
      // Check if setup window already exists
      if (setupWindowId) {
        chrome.windows.get(setupWindowId, function(win) {
          if (chrome.runtime.lastError || !win) {
            // Window doesn't exist, create new one
            createSetupWindow();
          } else {
            // Focus existing window
            chrome.windows.update(setupWindowId, { focused: true });
          }
        });
      } else {
        createSetupWindow();
      }
    } else {
      // Check if chat window already exists
      if (chatWindowId) {
        chrome.windows.get(chatWindowId, function(win) {
          if (chrome.runtime.lastError || !win) {
            // Window doesn't exist, create new one
            createChatWindow();
          } else {
            // Focus existing window
            chrome.windows.update(chatWindowId, { focused: true });
          }
        });
      } else {
        createChatWindow();
      }
    }
  });
});

function createSetupWindow() {
  chrome.windows.create({
    url: 'src/pages/setup.html',
    type: 'popup',
    width: 600,
    height: 700
  }, function(window) {
    setupWindowId = window.id;
    // Clear ID when window is closed
    chrome.windows.onRemoved.addListener(function(windowId) {
      if (windowId === setupWindowId) {
        setupWindowId = null;
      }
    });
  });
}

function createChatWindow() {
  chrome.windows.create({
    url: 'src/pages/chat.html',
    type: 'popup',
    width: 600,
    height: 700
  }, function(window) {
    chatWindowId = window.id;
    // Clear ID when window is closed
    chrome.windows.onRemoved.addListener(function(windowId) {
      if (windowId === chatWindowId) {
        chatWindowId = null;
      }
    });
  });
}
