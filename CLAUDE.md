# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension (Manifest V3) that allows users to run custom JavaScript scripts on websites. It includes an AI-powered script generator using Google Gemini API.

## Development Workflow

### Loading the Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `c:\downloads d\ai\ourdream\extension` folder
5. After making code changes, click the reload icon on the extension card
6. **Important**: Also reload any web pages where you're testing the extension (content scripts don't auto-reload)

### Testing
- For popup changes: Reload extension, then reopen popup
- For content script changes: Reload extension AND reload the target web page
- For background script changes: Reload extension only
- For AI chat window: Reload extension, then open a new chat window

## Architecture

### Script Injection System (CSP Bypass)
The extension uses a multi-layer approach to inject scripts that bypasses Content Security Policy restrictions:

1. **content.js** (Content Script) - Runs in isolated context, sends script to background
2. **background.js** (Service Worker) - Uses `chrome.scripting.executeScript` with `world: 'MAIN'` to inject into page context
3. **Injection happens in MAIN world** - Bypasses all CSP restrictions by executing directly in the page's JavaScript context

This architecture is necessary because:
- Direct `eval()` or `new Function()` are blocked by CSP in content scripts
- Injecting `<script>` tags with blob URLs are blocked by strict CSP
- Only the background script with `chrome.scripting` API and `world: 'MAIN'` can bypass CSP

### Onboarding Flow
When users install the extension for the first time:
- **background.js** listens for `chrome.runtime.onInstalled` event with reason 'install'
- Automatically opens **welcome.html** in a new tab
- Welcome page includes quick start guide, features overview, and CTAs
- Users can click to get API key or open the extension directly

### Window Management
The extension maintains single instances of popup windows:
- **popup.js** tracks `chatWindowId` and `setupWindowId`
- Clicking "Chat with AI Assistant" focuses existing window or creates new one
- `chrome.windows.onRemoved` listener clears window IDs when closed

### Storage Synchronization
Real-time updates between windows using `chrome.storage.onChanged`:
- Chat window writes scripts to `chrome.storage.local`
- Popup window listens for changes and updates textareas immediately
- No need to close/reopen windows to see changes

### AI Integration (Google Gemini)
- Uses **Gemini 2.0 Flash Exp** model via REST API (v1beta endpoint)
- Users provide their own free API keys (stored in `chrome.storage.local`)
- System prompt configured for code-only responses (minimal explanations)
- **Important**: Old Gemini 1.0/1.5 models are deprecated - always use 2.0+ models

### Error Logging (Vercel Integration)
The extension includes remote error logging via Vercel serverless functions:
- **error-logger.js** - Centralized error logging utility used across all scripts
- **api/log-error.js** - Vercel serverless function that receives and logs errors
- **Deployed at**: https://extension-mggyyc2t8-tomerbigcohen-4405s-projects.vercel.app
- **Dashboard**: https://vercel.com/tomerbigcohen-4405s-projects/extension
- Errors are logged to Vercel's console (visible in deployment logs)
- All extension scripts (background, content, popup, chat) automatically report errors
- Vercel token stored in environment: `mxkcodLRwkIyIbM9pnIzf4zA`

### File Structure
```
extension/
├── src/
│   ├── pages/
│   │   ├── popup.html          # Main extension settings UI
│   │   ├── chat.html           # AI chat interface (separate window)
│   │   ├── setup.html          # API key setup flow (separate window)
│   │   └── welcome.html        # Onboarding page (shown on first install)
│   ├── scripts/
│   │   ├── background.js       # Service worker (script injection, AI API, onboarding)
│   │   ├── content.js          # Content script (execution timing/intervals)
│   │   ├── popup.js            # Popup UI logic
│   │   ├── chat.js             # Chat window logic
│   │   ├── setup.js            # Setup window logic
│   │   ├── welcome.js          # Welcome page interactivity
│   │   └── error-logger.js     # Error logging utility
│   └── assets/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── api/
│   └── log-error.js            # Vercel serverless function for error logging
├── public/
│   ├── index.html              # Landing page/documentation
│   └── styles.css              # Landing page styles
├── manifest.json               # Extension configuration (must be at root)
└── vercel.json                 # Vercel deployment configuration
```

### Script Execution Flow
1. User enables extension and configures scripts in popup
2. Settings stored in `chrome.storage.local` (enabled, customScript, repeatScript, delays)
3. Content script loads on all pages, checks if enabled
4. If enabled:
   - Runs initial script after `delaySeconds` timeout
   - Runs repeat script every `intervalSeconds` interval
5. Content script sends code to background script
6. Background script injects into MAIN world using `chrome.scripting.executeScript`

## Key Constraints
- Must use `chrome.storage.local` (not sync) for all data storage
- AI responses must be extracted from Gemini's `data.candidates[0].content.parts[0].text` structure
- All Chrome API calls must handle async callbacks properly
- Button click handlers in dynamically created elements need `e.preventDefault()`
