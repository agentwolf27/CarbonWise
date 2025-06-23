// Chrome Extension Configuration
// In production, these would be environment-specific

const CONFIG = {
  // Extension credentials (set during build process)
  CLIENT_ID: '113243607151-f8cbt4ror4v1uqtdftf41pq6uvko9so4.apps.googleusercontent.com',
  CLIENT_SECRET: 'GOCSPX-ZGMSokCnJnwyIMIlvMSsNjqiKmN',
  
  // API endpoints
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:3001',
  
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