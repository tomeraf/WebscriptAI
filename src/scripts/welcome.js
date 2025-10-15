// Welcome page interactivity

const getApiKeyBtn = document.getElementById('getApiKeyBtn');
const openExtensionBtn = document.getElementById('openExtensionBtn');

// Open Google AI Studio to get API key
getApiKeyBtn.addEventListener('click', () => {
  chrome.tabs.create({
    url: 'https://aistudio.google.com/app/apikey'
  });
});

// Open extension popup (or setup page if no API key)
openExtensionBtn.addEventListener('click', () => {
  chrome.storage.local.get(['geminiApiKey'], (result) => {
    if (!result.geminiApiKey) {
      // No API key, open setup window
      chrome.windows.create({
        url: chrome.runtime.getURL('src/pages/setup.html'),
        type: 'popup',
        width: 600,
        height: 700
      });
    } else {
      // Has API key, just show a message to click the extension icon
      alert('Extension is ready! Click the extension icon in your browser toolbar to get started.');
    }
  });
});
