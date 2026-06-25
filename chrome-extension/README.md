# CarbonWise Chrome Extension

A Chrome extension that automatically tracks your carbon footprint across various websites.

## 🌱 Features

- **Automatic Tracking**: Monitors purchases, bookings, and activities on supported websites
- **Real-time Notifications**: Shows carbon impact as you browse
- **Secure Authentication**: OAuth 2.0 + JWT token system
- **Permission-based**: Only tracks on explicitly approved websites
- **Dashboard Integration**: Syncs with your CarbonWise web dashboard

## 🔧 Installation & Setup

### 1. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder from this project
5. Extension should appear with green CarbonWise icon

### 2. Start Development Server

```bash
cd /path/to/CarbonWise
npm run dev
```

### 3. Test Authentication

1. Click the CarbonWise extension icon in Chrome
2. Click "Sign In with Google"
3. Complete authentication in the opened tab
4. Return to extension popup - should show "Connected & Tracking"

## 🎯 Testing the Extension

### Method 1: Full Authentication Flow

1. **Sign Out** from web app (if signed in)
2. **Click extension icon** → "Sign In with Google"
3. **Complete OAuth flow** in web app
4. **Check extension status** - should show "Connected"

### Method 2: Quick Test (if already signed in)

1. **Visit** `http://localhost:3000/auth/extension-connect`
2. **Click "Connect Extension"**
3. **Check extension popup** - should show dashboard data

### Method 3: Test Page

1. **Open** `chrome-extension/test-auth.html` in Chrome
2. **Click "Test Extension Auth"**
3. **Click "Check Extension Storage"** to verify data

## 🌐 Supported Websites

Extension automatically tracks carbon emissions on:

- **🛒 Shopping**: Amazon
- **✈️ Travel**: Booking.com, Expedia, Kayak
- **🚗 Transportation**: Uber, Lyft
- **🍕 Food Delivery**: DoorDash, Uber Eats, Grubhub

## 📱 How It Works

### Authentication Flow
```
1. User clicks "Sign In" in extension popup
2. Extension opens web app authentication page
3. User completes OAuth with Google
4. Web app generates JWT token
5. Token stored in extension storage
6. Extension shows "Connected" status
```

### Tracking Flow
```
1. User visits supported website (e.g., Amazon)
2. Content script detects page activity
3. Carbon calculation applied
4. Activity sent to CarbonWise API
5. Real-time notification shown
6. Data synced with dashboard
```

## 🔍 Debugging

### Check Extension Console
1. Go to `chrome://extensions/`
2. Click "Details" on CarbonWise extension
3. Click "Inspect views: background page"
4. Check console for logs

### Check Popup Console
1. Right-click extension icon
2. Select "Inspect popup"
3. Check console in DevTools

### Check Content Script Console
1. Visit tracked website (e.g., Amazon)
2. Open DevTools (F12)
3. Look for CarbonWise logs in console

## 🐛 Common Issues

### "Not Connected" Status
- **Solution**: Complete authentication flow
- **Check**: Web app is running on `localhost:3000`
- **Verify**: User is signed in to web app

### Permissions Dialog
- **Cause**: Extension needs website access
- **Solution**: Click "Enable Tracking Permissions"
- **Allow**: All requested website permissions

### No Tracking on Websites
- **Check**: Extension has permissions for the website
- **Verify**: Green "🌱 CarbonWise" indicator appears
- **Debug**: Check content script console for errors

## 🔑 Carbon Calculation Factors

- **Amazon**: $0.50 CO₂ per dollar spent
- **Hotels**: 15 kg CO₂ per night
- **Flights**: 250 kg CO₂ per flight  
- **Rideshare**: 0.21 kg CO₂ per km
- **Food Delivery**: 2.5 kg CO₂ per order

## 📊 API Endpoints

- **Auth**: `POST /api/auth/extension-oauth`
- **Verify**: `POST /api/auth/verify-extension`
- **Track**: `POST /api/carbon/activities`
- **Refresh**: `POST /api/auth/refresh-token`

## 🔒 Security

- **OAuth 2.0**: Google authentication
- **JWT Tokens**: Secure API access (24h expiration)
- **Refresh Tokens**: Automatic renewal (30d expiration)
- **Permission-based**: Explicit user consent required

## 📝 File Structure

```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup UI
├── popup.js              # Popup functionality
├── background.js         # Service worker
├── content.js            # Website tracking
├── auth-listener.js      # Authentication handler
├── config.js             # Configuration
├── test-auth.html        # Testing page
└── icons/                # Extension icons
```

## 🚀 Next Steps

1. **Test tracking** on supported websites
2. **Check dashboard** for recorded activities
3. **Enable permissions** for all tracked sites
4. **Monitor console** for any errors

---

**Need help?** Check the console logs or review the authentication flow in the web app.

## Setup Instructions

1. **Configure OAuth Credentials**
   - Copy `config.example.js` to `config.js`
   - Copy `manifest.example.json` to `manifest.json`
   - Replace `YOUR_GOOGLE_OAUTH_CLIENT_ID` and `YOUR_GOOGLE_OAUTH_CLIENT_SECRET` with your actual Google OAuth credentials

2. **Get Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Google+ API
   - Go to "Credentials" and create OAuth 2.0 Client IDs
   - Add `chrome-extension://[extension-id]` to authorized origins
   - Copy the Client ID and Client Secret to your config files

3. **Load the Extension**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select this directory
   - Note the extension ID and update it in your config if needed

4. **Test the Extension**
   - Visit one of the supported websites
   - Click the extension icon to open the popup
   - Sign in with Google to connect to CarbonWise

## Supported Websites

- Amazon
- Booking.com
- Expedia
- Kayak
- Uber
- Lyft
- DoorDash
- UberEats
- GrubHub
- DeepSeek
- Claude.ai
- YouTube
- Netflix

## Files

- `config.js` - Configuration with OAuth credentials (not tracked by git)
- `manifest.json` - Chrome extension manifest (not tracked by git)
- `background.js` - Service worker for the extension
- `content.js` - Content script injected into supported websites
- `popup.html/js` - Extension popup interface
- `auth-listener.js` - Handles authentication from the web app 