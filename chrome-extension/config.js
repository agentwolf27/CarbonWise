// Chrome Extension Configuration
// In production, these would be environment-specific

const CONFIG = {
  // Extension credentials (set during build process)
  CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID_HERE', // Set during build/deployment
  CLIENT_SECRET: '', // NEVER store client secret in extension - handle server-side only
  
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