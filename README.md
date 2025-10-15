# 🚀 Script Runner with AI - Chrome Extension

Run custom JavaScript on any website with AI-powered script generation. Automate tasks, modify pages, and enhance your browsing experience.

![Version](https://img.shields.io/badge/version-1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🤖 **AI Script Generator** - Describe what you want in plain English, let Google Gemini AI generate the code
- 🔄 **Repeating Scripts** - Run scripts at custom intervals for automation
- ⚡ **CSP Bypass** - Advanced injection system that bypasses Content Security Policy
- 💬 **Interactive Chat** - Chat with AI to refine scripts and debug issues
- 🎯 **Site-Specific** - Enable/disable scripts per website
- 🔒 **Privacy First** - All scripts run locally, your API keys stay on your device
- 📊 **Error Logging** - Automatic error tracking via Vercel serverless functions

## 📦 Installation

Since this extension is not published on the Chrome Web Store, you'll need to install it manually:

### Step 1: Download the Extension

**Option A: Clone with Git**
```bash
git clone https://github.com/tomeraf/WebscriptAI.git
```

**Option B: Download ZIP**
1. Click the green "Code" button above
2. Select "Download ZIP"
3. Extract the ZIP file to a folder

### Step 2: Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the folder containing the extension files
5. The extension icon should appear in your toolbar!

### Step 3: Get Your Free API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key
5. Click the extension icon and enter your API key when prompted

## 🎯 Quick Start

### Basic Usage

1. **Click the extension icon** to open the popup
2. **Toggle "Enable Script"** to activate
3. **Write your JavaScript** in the "Initial Script" textarea
4. **Set a delay** (optional) before the script runs
5. **Reload the page** to see your script in action

### Using the AI Assistant

1. Click **"Chat with AI Assistant"** in the popup
2. Describe what you want: _"Find all images and make them grayscale"_
3. AI generates the JavaScript code for you
4. Click **"Use as Initial Script"** or **"Use as Repeat Script"**
5. The code is automatically saved to your extension

### Repeating Scripts

1. Use the **"Repeat Script"** section for continuous automation
2. Set the **interval** (in seconds)
3. Perfect for monitoring, polling, or recurring tasks

## 📚 Example Scripts

### Remove All Ads
```javascript
document.querySelectorAll('[id*="ad"], [class*="ad"]').forEach(el => el.remove());
```

### Auto-Scroll to Bottom
```javascript
window.scrollTo(0, document.body.scrollHeight);
```

### Extract All Links
```javascript
Array.from(document.querySelectorAll('a')).map(a => a.href);
```

### Dark Mode Any Website
```javascript
document.body.style.filter = 'invert(1) hue-rotate(180deg)';
```

### Auto-Click Button Every 5 Seconds
```javascript
// Use as Repeat Script with 5 second interval
document.querySelector('button.submit-btn')?.click();
```

### Extract Table Data
```javascript
Array.from(document.querySelectorAll('table tr')).map(row =>
  Array.from(row.querySelectorAll('td')).map(cell => cell.textContent)
);
```

## 🛠️ Use Cases

- 🎨 **Page Customization** - Change colors, hide elements, add custom CSS
- 📊 **Data Extraction** - Scrape tables, extract prices, collect information
- 🤖 **Task Automation** - Auto-fill forms, click buttons, navigate pages
- 🧪 **Testing & Debugging** - Test JavaScript on live websites
- 📈 **Monitoring** - Watch for changes, track prices, log activity
- 🎓 **Learning** - Practice JavaScript with AI assistance

## 📂 Project Structure

```
extension/
├── src/
│   ├── pages/              # HTML pages
│   │   ├── popup.html      # Main UI
│   │   ├── chat.html       # AI chat window
│   │   ├── setup.html      # API key setup
│   │   └── welcome.html    # Onboarding page
│   ├── scripts/            # JavaScript files
│   │   ├── background.js   # Service worker
│   │   ├── content.js      # Content script
│   │   ├── popup.js        # Popup logic
│   │   ├── chat.js         # Chat logic
│   │   ├── setup.js        # Setup logic
│   │   ├── welcome.js      # Welcome logic
│   │   └── error-logger.js # Error tracking
│   └── assets/             # Icons
├── api/                    # Vercel serverless functions
│   └── log-error.js        # Error logging endpoint
├── public/                 # Landing page
│   ├── index.html          # Documentation website
│   └── styles.css          # Website styles
├── manifest.json           # Extension configuration
└── vercel.json             # Vercel deployment config
```

## 🔒 Privacy & Security

- ✅ All scripts run **locally in your browser**
- ✅ Your API keys are stored **only on your device** (chrome.storage.local)
- ✅ No data is sent to third parties except:
  - Google Gemini API (when you use AI features)
  - Vercel error logging (anonymous error reports only)
- ✅ **Open source** - Review the code yourself

## 🌐 Live Demo & Documentation

- **Landing Page**: https://extension-kfh3wd12s-tomerbigcohen-4405s-projects.vercel.app
- **Error Dashboard**: https://vercel.com/tomerbigcohen-4405s-projects/extension

## 🐛 Troubleshooting

### Script not running?
- Make sure the extension is **enabled** (toggle switch is on)
- **Reload the page** after making changes
- Check the **browser console** (F12) for errors

### AI not working?
- Verify your **API key** is correct
- Check you have **internet connection**
- Google Gemini API has **rate limits** on free tier

### Extension icon not showing?
- Go to `chrome://extensions/`
- Make sure the extension is **enabled**
- Try **reloading the extension**

### Scripts stopped working after Chrome update?
- Reload the extension in `chrome://extensions/`
- If issues persist, re-download the latest version from GitHub

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Development

### Testing Changes

1. Make your code changes
2. Go to `chrome://extensions/`
3. Click the **reload icon** on the extension card
4. **Reload any web pages** where you're testing (content scripts don't auto-reload)

### Tech Stack

- **Manifest V3** - Modern Chrome extension API
- **Vanilla JavaScript** - No frameworks, fast and lightweight
- **Google Gemini 2.0 Flash** - AI-powered code generation
- **Vercel Serverless Functions** - Error logging backend

## ⚠️ Disclaimer

This extension allows you to run arbitrary JavaScript on websites. Use responsibly:

- ⚠️ Respect website terms of service
- ⚠️ Don't use for malicious purposes
- ⚠️ Be careful with sensitive data
- ⚠️ Test scripts before using on important sites

## 📄 License

MIT License - feel free to use, modify, and distribute.

## 🙏 Credits

- Built with ❤️ using Claude Code
- AI powered by Google Gemini
- Hosted on Vercel

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/tomeraf/WebscriptAI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tomeraf/WebscriptAI/discussions)

---

**Star ⭐ this repo if you find it useful!**
