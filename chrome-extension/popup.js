// Popup JavaScript for CarbonWise Chrome Extension

class PopupManager {
    constructor() {
        this.apiUrl = null; // Will be determined dynamically
        this.currentUser = null;
        this.isAuthenticated = false;
        
        // DOM elements
        this.elements = {
            loadingSection: document.getElementById('loadingSection'),
            authSection: document.getElementById('authSection'),
            dashboardSection: document.getElementById('dashboardSection'),
            statusIndicator: document.getElementById('statusIndicator'),
            statusText: document.getElementById('statusText'),
            signInBtn: document.getElementById('signInBtn'),
            permissionsBtn: document.getElementById('permissionsBtn'),
            errorMessage: document.getElementById('errorMessage'),
            signOutBtn: document.getElementById('signOutBtn'),
            manualEntryBtn: document.getElementById('manualEntryBtn'),
            viewDashboardBtn: document.getElementById('viewDashboardBtn'),
            todayEmissions: document.getElementById('todayEmissions'),
            monthEmissions: document.getElementById('monthEmissions')
        };
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing CarbonWise extension popup');
        await this.detectApiUrl();
        await this.checkAuthStatus();
        this.bindEvents();
    }
    
    async detectApiUrl() {
        // Try to detect which port the server is running on
        const ports = [3000, 3001];
        
        for (const port of ports) {
            try {
                const testUrl = `http://localhost:${port}`;
                const response = await fetch(`${testUrl}/api/auth/session`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                });
                
                if (response.ok || response.status === 401) {
                    this.apiUrl = testUrl;
                    console.log(`✅ Detected API server at ${testUrl}`);
                    return;
                }
            } catch (error) {
                console.log(`❌ Server not found at port ${port}`);
            }
        }
        
        // Default to 3000 if detection fails
        this.apiUrl = 'http://localhost:3000';
        console.log(`⚠️ Using default API URL: ${this.apiUrl}`);
    }
    
    bindEvents() {
        this.elements.signInBtn?.addEventListener('click', () => this.handleSignIn());
        this.elements.permissionsBtn?.addEventListener('click', () => this.requestPermissions());
        this.elements.signOutBtn?.addEventListener('click', () => this.handleSignOut());
        this.elements.manualEntryBtn?.addEventListener('click', () => this.openManualEntry());
        this.elements.viewDashboardBtn?.addEventListener('click', () => this.openDashboard());
    }
    
    async checkAuthStatus() {
        try {
            const result = await chrome.storage.local.get(['carbonwise_token', 'carbonwise_user']);
            console.log('📦 Current extension storage:', result);
            
            if (result.carbonwise_token && result.carbonwise_user) {
                // Verify token is still valid
                const isValid = await this.verifyToken(result.carbonwise_token);
                if (isValid) {
                    this.isAuthenticated = true;
                    this.currentUser = result.carbonwise_user;
                    console.log('✅ Extension authenticated for user:', this.currentUser.email);
                    
                    // Check if permissions are needed
                    const hasPermissions = await this.checkPermissions();
                    if (!hasPermissions) {
                        this.showPermissionRequest();
                        return;
                    }
                    
                    await this.loadDashboardData();
                    this.showDashboard();
                    return;
                }
            }
            
            // Not authenticated
            console.log('❌ Extension not authenticated');
            this.showAuthSection();
            
        } catch (error) {
            console.error('Error checking auth status:', error);
            this.showError('Error checking authentication status');
            this.showAuthSection();
        }
    }
    
    async verifyToken(token) {
        try {
            const response = await fetch(`${this.apiUrl}/api/auth/verify-extension`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log(`🔍 Token verification response: ${response.status}`);
            return response.ok;
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    }
    
    async handleSignIn() {
        try {
            this.setLoading(true);
            this.hideError();
            
            console.log(`🚀 Opening extension connection page at ${this.apiUrl}`);
            
            // Open the extension connection page in a new tab
            await chrome.tabs.create({ 
                url: `${this.apiUrl}/auth/extension-connect`,
                active: true 
            });
            
            console.log('✅ Extension connection page opened');
            
            // Close the popup
            window.close();
            
        } catch (error) {
            console.error('Sign in failed:', error);
            this.showError('Failed to open sign in page');
            this.setLoading(false);
        }
    }
    
    async checkPermissions() {
        return new Promise((resolve) => {
            chrome.permissions.contains({
                origins: [
                    "*://amazon.com/*",
                    "*://*.amazon.com/*",
                    "*://booking.com/*",
                    "*://*.booking.com/*",
                    "*://expedia.com/*",
                    "*://*.expedia.com/*",
                    "*://kayak.com/*",
                    "*://*.kayak.com/*",
                    "*://uber.com/*",
                    "*://*.uber.com/*",
                    "*://lyft.com/*",
                    "*://*.lyft.com/*",
                    "*://doordash.com/*",
                    "*://*.doordash.com/*",
                    "*://ubereats.com/*",
                    "*://*.ubereats.com/*",
                    "*://grubhub.com/*",
                    "*://*.grubhub.com/*"
                ]
            }, resolve);
        });
    }
    
    showPermissionRequest() {
        this.elements.loadingSection.style.display = 'none';
        this.elements.authSection.style.display = 'block';
        this.elements.dashboardSection.classList.remove('show');
        
        this.elements.signInBtn.style.display = 'none';
        this.elements.permissionsBtn.style.display = 'block';
        
        this.updateStatus('Permissions Needed', false);
    }
    
    async requestPermissions() {
        try {
            this.setLoading(true);
            
            const granted = await new Promise((resolve) => {
                chrome.permissions.request({
                    origins: [
                        "*://amazon.com/*",
                        "*://*.amazon.com/*",
                        "*://booking.com/*",
                        "*://*.booking.com/*",
                        "*://expedia.com/*",
                        "*://*.expedia.com/*",
                        "*://kayak.com/*",
                        "*://*.kayak.com/*",
                        "*://uber.com/*",
                        "*://*.uber.com/*",
                        "*://lyft.com/*",
                        "*://*.lyft.com/*",
                        "*://doordash.com/*",
                        "*://*.doordash.com/*",
                        "*://ubereats.com/*",
                        "*://*.ubereats.com/*",
                        "*://grubhub.com/*",
                        "*://*.grubhub.com/*"
                    ]
                }, resolve);
            });
            
            if (granted) {
                // Notify background script to start tracking
                await chrome.runtime.sendMessage({ type: 'PERMISSIONS_GRANTED' });
                
                await this.loadDashboardData();
                this.showDashboard();
            } else {
                this.showError('Permissions are required for carbon tracking to work');
            }
            
        } catch (error) {
            console.error('Permission request failed:', error);
            this.showError('Permission request failed');
        } finally {
            this.setLoading(false);
        }
    }
    
    async loadDashboardData() {
        try {
            const result = await chrome.storage.local.get(['carbonwise_token']);
            if (!result.carbonwise_token) return;
            
            const response = await fetch(`${this.apiUrl}/api/carbon/activities?period=today`, {
                headers: {
                    'Authorization': `Bearer ${result.carbonwise_token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.updateEmissionsDisplay(data);
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }
    
    updateEmissionsDisplay(data) {
        const today = data.activities
            ?.filter(a => this.isToday(new Date(a.timestamp)))
            ?.reduce((sum, a) => sum + a.co2Amount, 0) || 0;
        
        const month = data.activities
            ?.filter(a => this.isThisMonth(new Date(a.timestamp)))
            ?.reduce((sum, a) => sum + a.co2Amount, 0) || 0;
        
        this.elements.todayEmissions.textContent = today.toFixed(1);
        this.elements.monthEmissions.textContent = month.toFixed(1);
    }
    
    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }
    
    isThisMonth(date) {
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    
    async handleSignOut() {
        try {
            await chrome.storage.local.clear();
            await chrome.runtime.sendMessage({ type: 'LOGOUT' });
            this.isAuthenticated = false;
            this.currentUser = null;
            this.showAuthSection();
        } catch (error) {
            console.error('Sign out failed:', error);
        }
    }
    
    openManualEntry() {
        chrome.tabs.create({ url: `${this.apiUrl}/dashboard?tab=manual` });
    }
    
    openDashboard() {
        chrome.tabs.create({ url: `${this.apiUrl}/dashboard` });
    }
    
    showAuthSection() {
        this.elements.loadingSection.style.display = 'none';
        this.elements.authSection.style.display = 'block';
        this.elements.dashboardSection.classList.remove('show');
        
        this.elements.signInBtn.style.display = 'block';
        this.elements.permissionsBtn.style.display = 'none';
        
        this.updateStatus('Not Connected', false);
    }
    
    showDashboard() {
        this.elements.loadingSection.style.display = 'none';
        this.elements.authSection.style.display = 'none';
        this.elements.dashboardSection.classList.add('show');
        
        this.updateStatus('Connected & Tracking', true);
    }
    
    updateStatus(text, connected) {
        this.elements.statusText.textContent = text;
        if (connected) {
            this.elements.statusIndicator.classList.add('connected');
        } else {
            this.elements.statusIndicator.classList.remove('connected');
        }
    }
    
    setLoading(isLoading) {
        if (isLoading) {
            this.elements.loadingSection.style.display = 'block';
            this.elements.authSection.style.display = 'none';
            this.elements.dashboardSection.classList.remove('show');
        }
    }
    
    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            this.elements.errorMessage.style.display = 'none';
        }, 5000);
    }
    
    hideError() {
        this.elements.errorMessage.style.display = 'none';
    }
}

// Listen for storage changes (when user completes authentication)
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.carbonwise_token) {
        console.log('🔄 Authentication storage changed, reloading popup');
        // Reload popup when authentication completes
        location.reload();
    }
});

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing CarbonWise extension popup');
    new PopupManager();
}); 