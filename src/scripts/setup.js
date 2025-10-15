const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const setupStatusDiv = document.getElementById('setupStatus');

// Load existing API key if present
chrome.storage.local.get(['geminiApiKey'], function(result) {
  if (result.geminiApiKey) {
    apiKeyInput.value = result.geminiApiKey;
  }
});

saveApiKeyBtn.addEventListener('click', function() {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    setupStatusDiv.textContent = 'Please enter an API key';
    setupStatusDiv.className = 'status error';
    setTimeout(() => setupStatusDiv.style.display = 'none', 3000);
    return;
  }

  chrome.storage.local.set({ geminiApiKey: apiKey }, function() {
    setupStatusDiv.textContent = 'API key saved! Opening chat...';
    setupStatusDiv.className = 'status success';

    setTimeout(() => {
      // Close this window and open chat
      chrome.windows.create({
        url: 'src/pages/chat.html',
        type: 'popup',
        width: 500,
        height: 600
      });
      window.close();
    }, 1000);
  });
});
