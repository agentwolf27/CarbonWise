// auth-listener.js - Listen for authentication messages from the web app

console.log('🌱 CarbonWise extension auth listener loaded');

// Listen for authentication messages from the web app
window.addEventListener('message', async (event) => {
    console.log('Received message:', event.data);
    
    // Accept messages from both localhost:3000 and localhost:3001
    const validOrigins = ['http://localhost:3000', 'http://localhost:3001'];
    if (!validOrigins.includes(event.origin)) {
        console.log('Ignored message from origin:', event.origin);
        return;
    }
    
    if (event.data.type === 'CARBONWISE_AUTH_SUCCESS') {
        console.log('🔑 Received authentication data from web app');
        
        try {
            const { carbonwise_token, carbonwise_user } = event.data.data;
            
            if (carbonwise_token && carbonwise_user) {
                console.log('📦 Storing authentication data in extension storage');
                
                // Store in extension storage
                await chrome.storage.local.set({
                    carbonwise_token,
                    carbonwise_user
                });
                
                console.log('✅ Extension authentication successful');
                
                // Notify the web page
                window.postMessage({
                    type: 'CARBONWISE_EXTENSION_AUTH_COMPLETE',
                    success: true
                }, '*');
                
                // Show success notification
                showAuthNotification('✅ Extension connected successfully!');
                
                // Close the tab after a delay
                setTimeout(() => {
                    console.log('🔄 Closing authentication tab');
                    window.close();
                }, 2000);
            } else {
                throw new Error('Missing token or user data');
            }
        } catch (error) {
            console.error('❌ Failed to store extension authentication:', error);
            window.postMessage({
                type: 'CARBONWISE_EXTENSION_AUTH_COMPLETE',
                success: false,
                error: error.message
            }, '*');
            
            showAuthNotification('❌ Extension connection failed: ' + error.message);
        }
    }
});

// Also listen for page load to announce extension readiness
window.addEventListener('load', () => {
    console.log('📢 Announcing extension readiness to web page');
    window.postMessage({
        type: 'CARBONWISE_EXTENSION_READY'
    }, '*');
});

// Show a temporary notification
function showAuthNotification(message) {
    console.log('📢 Showing notification:', message);
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #22c55e;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        animation: slideInAuth 0.3s ease;
        max-width: 300px;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutAuth 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInAuth {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutAuth {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Test Chrome extension APIs
if (typeof chrome !== 'undefined' && chrome.storage) {
    console.log('✅ Chrome extension APIs available');
} else {
    console.error('❌ Chrome extension APIs not available');
} 