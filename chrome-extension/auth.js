// Secure Authentication Module for CarbonWise Extension

class ExtensionAuth {
  constructor() {
    this.clientId = CARBONWISE_CONFIG.CLIENT_ID;
    this.apiBaseUrl = CARBONWISE_CONFIG.API_BASE_URL;
    this.extensionId = CARBONWISE_CONFIG.EXTENSION_ID;
  }

  // OAuth 2.0 Authentication Flow
  async authenticateWithOAuth() {
    try {
      // Use Chrome Identity API for OAuth
      const token = await new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ 
          interactive: true,
          scopes: CARBONWISE_CONFIG.OAUTH_SCOPES 
        }, (token) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(token);
          }
        });
      });

      if (!token) {
        throw new Error('No OAuth token received');
      }

      // Exchange OAuth token for CarbonWise JWT
      const response = await fetch(`${this.apiBaseUrl}/api/auth/extension-oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oauthToken: token,
          extensionId: this.extensionId,
          clientId: this.clientId
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const authData = await response.json();
      
      // Store secure tokens
      await this.storeTokens(authData);
      
      return authData;

    } catch (error) {
      console.error('OAuth authentication failed:', error);
      throw error;
    }
  }

  // Generate secure JWT token with extension credentials
  async generateSecureToken(userId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/extension-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          extensionId: this.extensionId,
          clientId: this.clientId,
          timestamp: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`Token generation failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Token generation failed:', error);
      throw error;
    }
  }

  // Store tokens securely in Chrome storage
  async storeTokens(authData) {
    const tokenData = {
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      expiresAt: Date.now() + CARBONWISE_CONFIG.TOKEN_EXPIRY,
      userId: authData.user.id,
      userData: authData.user
    };

    await chrome.storage.local.set({
      carbonwiseAuth: tokenData
    });
  }

  // Get stored authentication data
  async getStoredAuth() {
    const result = await chrome.storage.local.get(['carbonwiseAuth']);
    return result.carbonwiseAuth || null;
  }

  // Check if current token is valid
  async isTokenValid() {
    const auth = await this.getStoredAuth();
    
    if (!auth || !auth.accessToken) {
      return false;
    }

    // Check expiration
    if (Date.now() >= auth.expiresAt) {
      return false;
    }

    // Verify with server
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/verify-extension`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: auth.userId,
          extensionId: this.extensionId
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }

  // Refresh expired token
  async refreshToken() {
    const auth = await this.getStoredAuth();
    
    if (!auth || !auth.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refreshToken: auth.refreshToken,
          extensionId: this.extensionId,
          clientId: this.clientId
        })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const newAuthData = await response.json();
      await this.storeTokens(newAuthData);
      
      return newAuthData;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear invalid tokens
      await this.logout();
      throw error;
    }
  }

  // Get valid token (refresh if needed)
  async getValidToken() {
    if (await this.isTokenValid()) {
      const auth = await this.getStoredAuth();
      return auth.accessToken;
    }

    // Try to refresh token
    try {
      const newAuth = await this.refreshToken();
      return newAuth.accessToken;
    } catch (error) {
      // Need to re-authenticate
      throw new Error('Re-authentication required');
    }
  }

  // Logout and clear tokens
  async logout() {
    // Revoke Chrome OAuth token
    const auth = await this.getStoredAuth();
    if (auth && auth.accessToken) {
      try {
        chrome.identity.removeCachedAuthToken({ 
          token: auth.accessToken 
        }, () => {
          console.log('OAuth token revoked');
        });
      } catch (error) {
        console.error('Failed to revoke OAuth token:', error);
      }
    }

    // Clear stored data
    await chrome.storage.local.remove(['carbonwiseAuth']);
    
    // Notify server
    try {
      await fetch(`${this.apiBaseUrl}/api/auth/extension-logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          extensionId: this.extensionId,
          userId: auth?.userId
        })
      });
    } catch (error) {
      console.error('Server logout notification failed:', error);
    }
  }

  // Get user data
  async getUserData() {
    const auth = await this.getStoredAuth();
    return auth?.userData || null;
  }
}

// Export singleton instance
const extensionAuth = new ExtensionAuth();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = extensionAuth;
} else {
  window.extensionAuth = extensionAuth;
} 