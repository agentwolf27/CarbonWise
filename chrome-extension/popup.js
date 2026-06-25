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
            console.log('🔍 Starting auth status check...');
            
            // First check local storage
            const result = await chrome.storage.local.get(['carbonwise_token', 'carbonwise_user']);
            console.log('📦 Current extension storage:', result);
            
            // Debug: Check all storage
            const allStorage = await chrome.storage.local.get(null);
            console.log('📦 ALL storage contents:', allStorage);
            
            if (result.carbonwise_token && result.carbonwise_user) {
                console.log('✅ Found auth data in storage!');
                this.isAuthenticated = true;
                this.currentUser = result.carbonwise_user;
                console.log('✅ Extension authenticated for user:', this.currentUser.email);
                
                // Check if permissions are needed
                const hasPermissions = await this.checkPermissions();
                console.log('🔓 Has permissions:', hasPermissions);
                
                if (!hasPermissions) {
                    console.log('⚠️ Showing permission request');
                    this.showPermissionRequest();
                    return;
                }
                
                console.log('📊 Loading dashboard data...');
                await this.loadDashboardData();
                console.log('🎉 Showing dashboard...');
                this.showDashboard();
                return;
            }
            
            // Check with background script
            const bgResponse = await chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' });
            console.log('🔍 Background auth status:', bgResponse);
            
            if (bgResponse.isAuthenticated && bgResponse.user) {
                this.isAuthenticated = true;
                this.currentUser = bgResponse.user;
                console.log('✅ Extension authenticated via background:', this.currentUser.email);
                
                await this.loadDashboardData();
                this.showDashboard();
                return;
            }
            
            // Not authenticated
            console.log('❌ Extension not authenticated - showing auth section');
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
            const result = await chrome.storage.local.get(['carbonwise_token', 'carbonwise_user']);
            if (!result.carbonwise_token) return;
            
            const response = await fetch(`${this.apiUrl}/api/carbon/activities`, {
                headers: {
                    'Authorization': `Bearer ${result.carbonwise_token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.updateEmissionsDisplay(data);
                
                // Set up real-time polling
                this.startRealTimeUpdates(result.carbonwise_token);
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }
    
    startRealTimeUpdates(token) {
        // Clear any existing interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Poll for updates every 10 seconds
        this.updateInterval = setInterval(async () => {
            try {
                const response = await fetch(`${this.apiUrl}/api/carbon/activities`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.updateEmissionsDisplay(data);
                    
                    // Update live indicator
                    const liveIndicator = document.querySelector('.live-indicator');
                    if (liveIndicator) {
                        liveIndicator.textContent = '🟢 Live';
                        setTimeout(() => {
                            if (liveIndicator) liveIndicator.textContent = '🔴 Live';
                        }, 500);
                    }
                }
            } catch (error) {
                console.error('Real-time update failed:', error);
            }
        }, 10000);
    }
    
    updateEmissionsDisplay(data) {
        const today = data.activities
            ?.filter(a => this.isToday(new Date(a.timestamp)))
            ?.reduce((sum, a) => sum + (a.amount || a.co2Amount || 0), 0) || 0;
        
        const week = data.activities
            ?.filter(a => this.isThisWeek(new Date(a.timestamp)))
            ?.reduce((sum, a) => sum + (a.amount || a.co2Amount || 0), 0) || 0;
        
        const month = data.activities
            ?.filter(a => this.isThisMonth(new Date(a.timestamp)))
            ?.reduce((sum, a) => sum + (a.amount || a.co2Amount || 0), 0) || 0;
        
        // Update main emission values
        document.getElementById('todayEmissions').textContent = today.toFixed(1);
        document.getElementById('weekEmissions').textContent = week.toFixed(1);
        document.getElementById('monthEmissions').textContent = month.toFixed(1);
        
        // Update changes and trends
        const lastHourActivity = data.activities?.filter(activity => {
            const activityTime = new Date(activity.timestamp);
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            return activityTime > oneHourAgo;
        }) || [];
        const lastHourTotal = lastHourActivity.reduce((sum, a) => sum + (a.amount || a.co2Amount || 0), 0);
        
        document.getElementById('todayChange').textContent = `+${lastHourTotal.toFixed(1)} this hour`;
        document.getElementById('weekChange').textContent = week > 0 ? '📈 vs last week' : '📊 vs last week';
        document.getElementById('monthTrend').textContent = month > 10 ? '📈 High usage' : '🟢 Good progress';
        
        // Update recent activity list
        this.updateRecentActivity(data.activities || []);
        
        // Update user name if available
        if (this.currentUser) {
            document.getElementById('userName').textContent = this.currentUser.name || 'User';
        }
    }
    
    updateRecentActivity(activities) {
        const activityList = document.getElementById('activityList');
        if (!activities || activities.length === 0) {
            activityList.innerHTML = '<div class="activity-item placeholder"><span>Browse supported sites to see live tracking...</span></div>';
            return;
        }
        
        // Get last 3 activities
        const recentActivities = activities
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 3);
        
        activityList.innerHTML = recentActivities.map(activity => {
            const timeAgo = this.getTimeAgo(new Date(activity.timestamp));
            const emoji = this.getActivityEmoji(activity.type);
            const amount = activity.amount || activity.co2Amount || 0;
            return `
                <div class="activity-item">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>${emoji} ${activity.description}</span>
                        <span style="font-size: 10px; opacity: 0.6;">${amount.toFixed(1)}kg</span>
                    </div>
                    <div style="font-size: 9px; opacity: 0.5; margin-top: 2px;">${timeAgo}</div>
                </div>
            `;
        }).join('');
    }
    
    getActivityEmoji(type) {
        const emojis = {
            'Shopping': '🛒',
            'Travel': '✈️',
            'Food': '🍕',
            'Transportation': '🚗',
            'Digital': '💻',
            'Energy': '⚡'
        };
        return emojis[type] || '📊';
    }
    
    getTimeAgo(timestamp) {
        const now = new Date();
        const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
    
    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }
    
    isThisMonth(date) {
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    
    isThisWeek(date) {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        return date >= startOfWeek;
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

// Listen for messages from auth listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'FORCE_POPUP_REFRESH') {
        console.log('🔄 Force refresh requested:', message.reason);
        location.reload();
    }
});

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 CarbonWise popup loaded');
    
    await initializePopup();
    await loadActivities();
    
    // Set up real-time updates every 30 seconds instead of 10
    setInterval(loadActivities, 30000);
});

async function initializePopup() {
    // Check auth status
    const authResponse = await chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' });
    console.log('🔐 Auth status:', authResponse);
    
    const authSection = document.getElementById('auth-section');
    const contentSection = document.getElementById('content-section');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const userInfo = document.getElementById('user-info');
    
    if (authResponse.isAuthenticated && authResponse.user) {
        // Show main content
        authSection.style.display = 'none';
        contentSection.style.display = 'block';
        
        // Update user info
        if (userInfo) {
            userInfo.innerHTML = `
                <div class="user-avatar">
                    ${authResponse.user.image ? 
                        `<img src="${authResponse.user.image}" alt="${authResponse.user.name}" />` :
                        `<div class="avatar-placeholder">${authResponse.user.name?.[0] || 'U'}</div>`
                    }
                </div>
                <div class="user-details">
                    <div class="user-name">${authResponse.user.name || 'User'}</div>
                    <div class="user-email">${authResponse.user.email}</div>
                </div>
            `;
        }
        
        // Set up logout button
        if (logoutButton) {
            logoutButton.addEventListener('click', handleLogout);
        }
        
    } else {
        // Show auth section
        authSection.style.display = 'block';
        contentSection.style.display = 'none';
        
        // Set up login button
        if (loginButton) {
            loginButton.addEventListener('click', handleLogin);
        }
    }
}

async function handleLogin() {
    console.log('🔑 Login requested');
    
    try {
        // Open the web app's extension connect page
        await chrome.tabs.create({
            url: 'http://localhost:3000/auth/extension-connect',
            active: true
        });
        
        // Close the popup
        window.close();
        
    } catch (error) {
        console.error('❌ Login failed:', error);
        showError('Failed to open login page');
    }
}

async function handleLogout() {
    console.log('🚪 Logout requested');
    
    try {
        const response = await chrome.runtime.sendMessage({ type: 'LOGOUT' });
        
        if (response.success) {
            // Refresh the popup to show login screen
            await initializePopup();
        } else {
            showError('Failed to logout');
        }
    } catch (error) {
        console.error('❌ Logout failed:', error);
        showError('Failed to logout');
    }
}

async function loadActivities() {
    const activitiesList = document.getElementById('activities-list');
    const loadingIndicator = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    
    if (!activitiesList) return;
    
    try {
        // Show loading
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        if (errorElement) errorElement.style.display = 'none';
        
        // Get auth status first
        const authResponse = await chrome.runtime.sendMessage({ type: 'GET_AUTH_STATUS' });
        
        if (!authResponse.isAuthenticated) {
            activitiesList.innerHTML = '<div class="empty-state">Please sign in to view activities</div>';
            return;
        }
        
        // Fetch activities from API with proper authentication
        const storage = await chrome.storage.local.get(['carbonwise_token']);
        const token = storage.carbonwise_token;
        
        if (!token) {
            activitiesList.innerHTML = '<div class="empty-state">Authentication required</div>';
            return;
        }
        
        const response = await fetch('http://localhost:3000/api/carbon/activities?limit=10', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token expired, clear auth and refresh
                await chrome.runtime.sendMessage({ type: 'LOGOUT' });
                await initializePopup();
                return;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data.activities) {
            const activities = result.data.activities;
            
            if (activities.length === 0) {
                activitiesList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🌱</div>
                        <div class="empty-title">No activities yet</div>
                        <div class="empty-description">Start browsing to track your carbon footprint!</div>
                    </div>
                `;
            } else {
                activitiesList.innerHTML = activities
                    .map(activity => createActivityElement(activity))
                    .join('');
            }
            
            // Update summary stats
            updateSummaryStats(result.data);
            
        } else {
            throw new Error('Invalid response format');
        }
        
    } catch (error) {
        console.error('❌ Failed to load activities:', error);
        
        if (activitiesList) {
            activitiesList.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <div class="error-title">Failed to load activities</div>
                    <div class="error-description">${error.message}</div>
                </div>
            `;
        }
        
        if (errorElement) {
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
        }
        
    } finally {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
}

function createActivityElement(activity) {
    const timeAgo = activity.timeAgo || getTimeAgo(new Date(activity.timestamp));
    const icon = getActivityIcon(activity.type);
    const amount = typeof activity.amount === 'number' ? activity.amount.toFixed(3) : '0.000';
    
    return `
        <div class="activity-item">
            <div class="activity-icon">${icon}</div>
            <div class="activity-content">
                <div class="activity-description">${activity.description || 'Unknown activity'}</div>
                <div class="activity-meta">
                    <span class="activity-type">${formatActivityType(activity.type)}</span>
                    <span class="activity-time">${timeAgo}</span>
                </div>
            </div>
            <div class="activity-amount">
                <span class="amount">${amount}</span>
                <span class="unit">kg CO₂</span>
            </div>
        </div>
    `;
}

function updateSummaryStats(data) {
    const todayTotal = document.getElementById('today-total');
    const weekTotal = document.getElementById('week-total');
    const activitiesCount = document.getElementById('activities-count');
    
    if (data.summary) {
        if (todayTotal) todayTotal.textContent = `${data.summary.averageDaily.toFixed(3)} kg`;
        if (weekTotal) weekTotal.textContent = `${data.summary.totalEmissions.toFixed(3)} kg`;
        if (activitiesCount) activitiesCount.textContent = data.summary.activitiesCount;
    } else {
        // Calculate from activities array
        const total = data.activities?.reduce((sum, activity) => sum + (activity.amount || 0), 0) || 0;
        const count = data.activities?.length || 0;
        
        if (todayTotal) todayTotal.textContent = `${(total / Math.max(count, 1)).toFixed(3)} kg`;
        if (weekTotal) weekTotal.textContent = `${total.toFixed(3)} kg`;
        if (activitiesCount) activitiesCount.textContent = count;
    }
}

function getActivityIcon(type) {
    const icons = {
        'STREAMING': '📺',
        'BROWSING': '🌐',
        'AI_INTERACTION': '🤖',
        'SEARCH': '🔍',
        'EMAIL': '📧',
        'SOCIAL': '👥',
        'SHOPPING': '🛒',
        'GAMING': '🎮',
        'VIDEO_CALL': '📹',
        'FILE_TRANSFER': '📁',
        'DEFAULT': '💻'
    };
    
    return icons[type] || icons.DEFAULT;
}

function formatActivityType(type) {
    return type.toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
        return 'Just now';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours}h ago`;
    } else {
        const days = Math.floor(diffInMinutes / 1440);
        return `${days}d ago`;
    }
}

function showError(message) {
    const errorElement = document.getElementById('error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

// Listen for auth updates from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'AUTH_STATUS_CHANGED') {
        console.log('🔄 Auth status changed, refreshing popup');
        initializePopup();
    }
}); 