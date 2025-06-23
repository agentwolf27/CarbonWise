// Chrome Extension Configuration Template
// Copy this file to config.js and replace with your actual values

const CONFIG = {
  // Extension credentials (replace with your OAuth credentials)
  CLIENT_ID: 'YOUR_GOOGLE_OAUTH_CLIENT_ID',
  CLIENT_SECRET: 'YOUR_GOOGLE_OAUTH_CLIENT_SECRET',
  
  // API endpoints
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:3000',
  
  // Extension-specific settings
  EXTENSION_ID: chrome.runtime.id, // Auto-generated unique ID
  
  // OAuth scopes needed
  OAUTH_SCOPES: ['openid', 'email', 'profile'],
  
  // Supported websites for tracking
  SUPPORTED_DOMAINS: [
    'amazon.com',
    'booking.com', 
    'expedia.com',
    'kayak.com',
    'uber.com',
    'lyft.com',
    'doordash.com',
    'ubereats.com',
    'grubhub.com'
  ],
  
  // Security settings
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  MAX_RETRY_ATTEMPTS: 3,
  
  // Feature flags
  FEATURES: {
    AUTO_TRACKING: true,
    MANUAL_ENTRY: true,
    NOTIFICATIONS: true,
    ANALYTICS: false // Disable for privacy
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else {
  window.CARBONWISE_CONFIG = CONFIG;
} 