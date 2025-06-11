// Background service worker for CarbonWise Chrome Extension

const API_BASE_URL = 'http://localhost:3000';

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
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-extension`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      if (response.ok) {
        isAuthenticated = true;
        chrome.action.setBadgeText({ text: '✓' });
        chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
      } else {
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
    const response = await fetch(`${API_BASE_URL}/api/carbon/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        ...activity,
        timestamp: activity.timestamp || new Date().toISOString(),
        source: 'extension'
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

// Periodic auth check (every 5 minutes)
setInterval(checkAuthStatus, 5 * 60 * 1000); 