// Background service worker for CarbonWise Chrome Extension

const API_BASE_URL = 'http://localhost:3001';

// Authentication state
let isAuthenticated = false;
let userToken = null;
let currentUser = null;

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('CarbonWise Extension installed');
  checkAuthStatus();
});

// Check authentication status
async function checkAuthStatus() {
  try {
    const result = await chrome.storage.local.get(['carbonwise_token', 'carbonwise_user']);
    
    if (result.carbonwise_token && result.carbonwise_user) {
      userToken = result.carbonwise_token;
      currentUser = result.carbonwise_user;
      
      // Verify token with the server
      console.log('🔐 Verifying token with server...', {
        userId: currentUser.id,
        extensionId: chrome.runtime.id,
        hasToken: !!userToken
      });
      
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-extension`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          userId: currentUser.id,
          extensionId: chrome.runtime.id
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Token verification successful:', result);
        isAuthenticated = true;
        chrome.action.setBadgeText({ text: '✓' });
        chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
      } else {
        const errorText = await response.text();
        console.error('❌ Token verification failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        // Token invalid, clear storage
        await chrome.storage.local.clear();
        isAuthenticated = false;
        userToken = null;
        currentUser = null;
        chrome.action.setBadgeText({ text: '' });
      }
    } else {
      isAuthenticated = false;
      userToken = null;
      currentUser = null;
      chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    isAuthenticated = false;
    chrome.action.setBadgeText({ text: '' });
  }
}

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'PERMISSIONS_GRANTED') {
    console.log('Permissions granted, starting tracking');
    sendResponse({ success: true });
    return;
  }
  
  if (request.type === 'GET_AUTH_STATUS') {
    sendResponse({ 
      isAuthenticated, 
      user: currentUser,
      hasToken: !!userToken
    });
    return;
  }
  
  if (request.type === 'TRACK_ACTIVITY') {
    if (isAuthenticated) {
      trackCarbonActivity(request.activity)
        .then(success => sendResponse({ success }))
        .catch(error => sendResponse({ success: false, error: error.message }));
    } else {
      sendResponse({ success: false, error: 'Not authenticated' });
    }
    return true; // Keep message channel open for async response
  }
  
  if (request.type === 'LOGOUT') {
    handleLogout()
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.type === 'AUTH_COMPLETE') {
    handleAuthComplete(request.data)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.type === 'WEB_AUTH_SUCCESS') {
    handleWebAuthSuccess(request.data)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.type === 'FORCE_POPUP_REFRESH') {
    console.log('🔄 Broadcasting popup refresh request');
    // This message will be handled by popup.js
    sendResponse({ success: true });
    return;
  }
});

// Handle logout
async function handleLogout() {
  try {
    await chrome.storage.local.clear();
    userToken = null;
    currentUser = null;
    isAuthenticated = false;
    chrome.action.setBadgeText({ text: '' });
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
}

// Track carbon activity
async function trackCarbonActivity(activity) {
  if (!isAuthenticated || !userToken) {
    throw new Error('Not authenticated');
  }
  
  try {
    // Use AI-enhanced carbon calculation
    const response = await fetch(`${API_BASE_URL}/api/carbon/ai-enhanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        url: activity.url || window.location?.href || 'unknown',
        timeOnPage: activity.timeOnPage || 60,
        pageTitle: activity.pageTitle || activity.description || 'Extension Activity',
        scrollDepth: activity.scrollDepth || 0,
        clickCount: activity.clickCount || 0,
        deviceType: activity.deviceType || 'laptop',
        networkType: activity.networkType || 'wifi',
        userAgent: activity.userAgent || 'Chrome Extension',
        location: activity.location || { lat: 0, lng: 0, country: 'US' }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('Activity tracked:', result);
    
    // Show notification if permissions allow
    try {
      if (chrome.notifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'CarbonWise',
          message: `Tracked: ${activity.description} (${activity.co2Amount?.toFixed(1) || activity.amount} kg CO₂)`
        });
      }
    } catch (notifError) {
      console.log('Notification not available:', notifError);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to track activity:', error);
    throw error;
  }
}

// Listen for storage changes (when user authenticates via popup)
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && (changes.carbonwise_token || changes.carbonwise_user)) {
    checkAuthStatus();
  }
});

// Check auth on startup
chrome.runtime.onStartup.addListener(() => {
  checkAuthStatus();
});

// Handle authentication completion
async function handleAuthComplete(authData) {
  try {
    console.log('🔐 Processing auth completion in background:', authData);
    
    userToken = authData.carbonwise_token;
    currentUser = authData.carbonwise_user;
    
    // Verify authentication
    await checkAuthStatus();
    
    console.log('✅ Authentication processed successfully');
  } catch (error) {
    console.error('❌ Failed to process auth completion:', error);
    throw error;
  }
}

// Handle web authentication success
async function handleWebAuthSuccess(authData) {
  try {
    console.log('🌐 Processing web auth success in background:', authData);
    
    // Store the auth data
    await chrome.storage.local.set({
      carbonwise_token: authData.carbonwise_token,
      carbonwise_user: authData.carbonwise_user
    });
    
    userToken = authData.carbonwise_token;
    currentUser = authData.carbonwise_user;
    isAuthenticated = true;
    
    // Update badge
    chrome.action.setBadgeText({ text: '✓' });
    chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
    
    console.log('✅ Web auth data stored successfully');
  } catch (error) {
    console.error('❌ Failed to store web auth data:', error);
    throw error;
  }
}

// Helper function to detect device type (simplified for service worker)
function getDeviceType() {
  // Service workers don't have access to navigator.userAgent
  // Default to laptop since most Chrome users are on desktop
  return 'laptop';
}

// Periodic auth check (every 5 minutes)
setInterval(checkAuthStatus, 5 * 60 * 1000); 