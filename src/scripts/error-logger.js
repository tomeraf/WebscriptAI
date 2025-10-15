// Centralized error logging utility for the extension
const ERROR_LOG_ENDPOINT = 'https://extension-mggyyc2t8-tomerbigcohen-4405s-projects.vercel.app/api/log-error';

// Get extension version from manifest
let extensionVersion = 'unknown';
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
  extensionVersion = chrome.runtime.getManifest().version;
}

/**
 * Logs an error to the remote logging service
 * @param {Error|string} error - The error object or message
 * @param {string} context - Where the error occurred (e.g., 'background.js', 'popup.js')
 * @param {Object} additionalData - Any additional context
 */
async function logError(error, context, additionalData = {}) {
  try {
    // Always log to console first
    console.error(`[${context}]`, error, additionalData);

    // Skip remote logging if endpoint not configured
    if (ERROR_LOG_ENDPOINT.includes('YOUR_VERCEL_URL')) {
      return;
    }

    const errorData = {
      timestamp: new Date().toISOString(),
      context,
      extensionVersion,
      userAgent: navigator.userAgent,
      error: {
        message: error?.message || String(error),
        stack: error?.stack,
        name: error?.name
      },
      ...additionalData
    };

    // Send to Vercel endpoint (don't await - fire and forget)
    fetch(ERROR_LOG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData)
    }).catch(err => {
      // Silently fail if logging fails
      console.warn('Failed to send error to remote logger:', err);
    });
  } catch (loggingError) {
    // Don't let error logging break the app
    console.warn('Error in error logger:', loggingError);
  }
}

/**
 * Wraps an async function with error logging
 * @param {Function} fn - The function to wrap
 * @param {string} context - Context name for logging
 * @returns {Function} Wrapped function
 */
function withErrorLogging(fn, context) {
  return async function(...args) {
    try {
      return await fn.apply(this, args);
    } catch (error) {
      logError(error, context, { args });
      throw error; // Re-throw after logging
    }
  };
}
