// Debug script for authentication troubleshooting
console.log('🔧 Debug auth script loaded');

async function debugAuth() {
    console.log('=== CARBONWISE EXTENSION DEBUG ===');
    
    try {
        // 1. Check storage
        const storage = await chrome.storage.local.get(null);
        console.log('📦 All extension storage:', storage);
        
        // 2. Check specific auth data
        const authData = await chrome.storage.local.get(['carbonwise_token', 'carbonwise_user']);
        console.log('🔐 Auth data:', authData);
        
        // 3. Check background script status
        try {
            const bgStatus = await chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' });
            console.log('📱 Background status:', bgStatus);
        } catch (bgError) {
            console.log('❌ Background script error:', bgError);
        }
        
        // 4. Check if API is accessible
        try {
            const apiResponse = await fetch('http://localhost:3000/api/auth/session');
            console.log('🌐 API response status:', apiResponse.status);
        } catch (apiError) {
            console.log('❌ API error:', apiError);
        }
        
        // 5. Check permissions
        try {
            const hasPermissions = await new Promise((resolve) => {
                chrome.permissions.contains({
                    origins: ["*://amazon.com/*", "*://*.amazon.com/*"]
                }, resolve);
            });
            console.log('🔓 Has permissions:', hasPermissions);
        } catch (permError) {
            console.log('❌ Permission check error:', permError);
        }
        
        console.log('=== END DEBUG ===');
        
        return {
            storage,
            authData,
            hasAuthData: !!(authData.carbonwise_token && authData.carbonwise_user),
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
        return { error: error.message };
    }
}

// Force refresh popup
async function forceRefresh() {
    console.log('🔄 Force refreshing popup...');
    location.reload();
}

// Clear all auth data
async function clearAuth() {
    console.log('🗑️ Clearing all auth data...');
    await chrome.storage.local.clear();
    console.log('✅ Auth data cleared');
    location.reload();
}

// Test auth storage
async function testAuthStorage() {
    console.log('🧪 Testing auth storage...');
    
    const testData = {
        carbonwise_token: 'test-token-' + Date.now(),
        carbonwise_user: {
            email: 'test@example.com',
            name: 'Test User'
        }
    };
    
    await chrome.storage.local.set(testData);
    console.log('✅ Test data stored');
    
    const retrieved = await chrome.storage.local.get(['carbonwise_token', 'carbonwise_user']);
    console.log('📦 Retrieved data:', retrieved);
    
    return retrieved;
}

// Make functions available globally
window.debugAuth = debugAuth;
window.forceRefresh = forceRefresh;
window.clearAuth = clearAuth;
window.testAuthStorage = testAuthStorage;

console.log('🔧 Debug functions available: debugAuth(), forceRefresh(), clearAuth(), testAuthStorage()'); 