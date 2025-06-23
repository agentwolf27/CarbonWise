// Authentication listener for CarbonWise Extension
// This script runs on the extension connection page to handle auth messages

console.log('🎧 CarbonWise auth listener loaded on:', window.location.href);

// Listen for authentication messages from the web app
window.addEventListener('message', async (event) => {
  console.log('📨 Received message:', event.data);
  
  if (event.data.type === 'CARBONWISE_AUTH_SUCCESS' && event.data.source === 'carbonwise_web_app') {
    console.log('🔐 Processing authentication data...');
    
    try {
      const authData = event.data.data;
      
      // Store authentication data in extension storage
      await chrome.storage.local.set({
        carbonwise_token: authData.carbonwise_token,
        carbonwise_user: authData.carbonwise_user
      });
      
      console.log('✅ Authentication data stored in extension:', {
        token: authData.carbonwise_token ? 'present' : 'missing',
        user: authData.carbonwise_user?.email || 'unknown'
      });
      
      // Notify background script
      await chrome.runtime.sendMessage({
        type: 'AUTH_COMPLETE',
        data: authData
      });
      
      // Show success notification
      if (chrome.notifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'CarbonWise Connected!',
          message: `Extension connected for ${authData.carbonwise_user?.name || 'user'}`
        });
      }
      
      // Send confirmation back to web page
      window.postMessage({
        type: 'CARBONWISE_EXTENSION_AUTH_COMPLETE',
        success: true,
        user: authData.carbonwise_user
      }, '*');
      
      // Force popup refresh by sending message to all extension contexts
      setTimeout(() => {
        chrome.runtime.sendMessage({
          type: 'FORCE_POPUP_REFRESH',
          reason: 'auth_complete'
        }).catch(() => {}); // Ignore errors if popup isn't open
      }, 1000);
      
    } catch (error) {
      console.error('❌ Failed to store authentication data:', error);
      
      // Send error back to web page
      window.postMessage({
        type: 'CARBONWISE_EXTENSION_AUTH_COMPLETE',
        success: false,
        error: error.message
      }, '*');
    }
  }
});

// Also check localStorage for auth data (backup method)
const checkLocalStorageAuth = async () => {
  try {
    const storedAuth = localStorage.getItem('carbonwise_auth_data');
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      console.log('📦 Found auth data in localStorage, storing in extension...');
      
      await chrome.storage.local.set({
        carbonwise_token: authData.carbonwise_token,
        carbonwise_user: authData.carbonwise_user
      });
      
      // Clear localStorage after successful storage
      localStorage.removeItem('carbonwise_auth_data');
      
      console.log('✅ Auth data migrated from localStorage to extension storage');
    }
  } catch (error) {
    console.error('❌ Error checking localStorage auth:', error);
  }
};

// Check localStorage on page load
setTimeout(checkLocalStorageAuth, 1000);

// Notify web page that extension is ready
window.postMessage({
  type: 'CARBONWISE_EXTENSION_READY',
  extensionId: chrome.runtime.id
}, '*');

console.log('🚀 Auth listener ready and waiting for authentication...'); 