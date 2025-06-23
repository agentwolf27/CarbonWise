// Content script for CarbonWise Chrome Extension
// Detects carbon-related activities on e-commerce and travel websites

console.log('CarbonWise content script loaded on:', window.location.hostname);

// Configuration for different websites
const siteConfigs = {
  'amazon.com': {
    type: 'Shopping',
    selectors: {
      orderConfirmation: [
        '[data-test-id="order-confirmation"]',
        '.a-alert-success',
        'h1:contains("Order placed")'
      ],
      productInfo: '.a-price-whole, .a-price-fraction',
      deliveryInfo: '[data-feature-name="delivery"]'
    },
    carbonFactor: 0.5 // kg CO2 per dollar
  },
  'chat.openai.com': {
    type: 'Digital',
    selectors: {
      messageInput: '[data-testid="textbox"]',
      messages: '[data-testid*="conversation"]',
      tokenUsage: '.token-count'
    },
    carbonFactor: 0.008, // kg CO2 per message
    trackingType: 'messages'
  },
  'claude.ai': {
    type: 'Digital',
    selectors: {
      messageInput: '[contenteditable="true"]',
      messages: '[data-testid="message"]',
      conversation: '.conversation'
    },
    carbonFactor: 0.006, // kg CO2 per message
    trackingType: 'messages'
  },
  'youtube.com': {
    type: 'Digital',
    selectors: {
      videoPlayer: '#movie_player',
      videoTitle: 'h1.title',
      videoDuration: '.ytp-time-duration'
    },
    carbonFactor: 0.0036, // kg CO2 per hour
    trackingType: 'video_time'
  },
  'netflix.com': {
    type: 'Digital',
    selectors: {
      videoPlayer: '.VideoContainer',
      videoTitle: '[data-uia="video-title"]',
      playButton: '[data-uia="play-pause-button"]'
    },
    carbonFactor: 0.0041, // kg CO2 per hour (higher quality)
    trackingType: 'video_time'
  },
  'booking.com': {
    type: 'Travel',
    selectors: {
      bookingConfirmation: [
        '[data-testid="confirmation"]',
        '.bp-confirmation',
        'h1:contains("confirmed")'
      ],
      hotelName: 'h2[data-testid="title"]',
      nights: '[data-testid="length-of-stay"]'
    },
    carbonFactor: 15 // kg CO2 per night
  },
  'expedia.com': {
    type: 'Travel',
    selectors: {
      flightConfirmation: [
        '.confirmation-section',
        'h1:contains("confirmed")'
      ],
      flightDetails: '.flight-details',
      passengers: '.passenger-count'
    },
    carbonFactor: 250 // kg CO2 per flight
  },
  'uber.com': {
    type: 'Transportation',
    selectors: {
      rideComplete: [
        '[data-test="trip-details"]',
        '.trip-completed'
      ],
      distance: '.trip-distance',
      vehicleType: '.vehicle-type'
    },
    carbonFactor: 0.21 // kg CO2 per km
  },
  'doordash.com': {
    type: 'Food',
    selectors: {
      orderConfirmation: [
        '[data-anchor-id="OrderConfirmationPage"]',
        '.order-confirmation'
      ],
      restaurant: '.restaurant-name',
      orderTotal: '.order-total'
    },
    carbonFactor: 2.5 // kg CO2 per order
  }
};

// Current site configuration
const currentDomain = window.location.hostname.replace('www.', '');
const siteConfig = Object.keys(siteConfigs).find(domain => 
  currentDomain.includes(domain)
) ? siteConfigs[Object.keys(siteConfigs).find(domain => currentDomain.includes(domain))] : null;

if (siteConfig) {
  console.log('CarbonWise: Monitoring', currentDomain, 'for', siteConfig.type, 'activities');
  
  // Initialize monitoring
  initializeMonitoring();
} else {
  console.log('CarbonWise: Site not supported for automatic tracking');
}

function initializeMonitoring() {
  // Monitor for page changes (SPA navigation)
  let lastUrl = window.location.href;
  
  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      setTimeout(checkForActivities, 1000); // Delay to let page load
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Initial check
  setTimeout(checkForActivities, 2000);
  
  // Periodic check every 5 seconds
  setInterval(checkForActivities, 5000);
}

function checkForActivities() {
  if (!siteConfig) return;
  
  try {
    // Check for order/booking confirmations
    if (detectConfirmation()) {
      const activity = extractActivityData();
      if (activity) {
        console.log('CarbonWise: Detected activity:', activity);
        trackActivity(activity);
      }
    }
  } catch (error) {
    console.error('CarbonWise: Error checking for activities:', error);
  }
}

function detectConfirmation() {
  if (!siteConfig.selectors) return false;
  
  const confirmationSelectors = Object.values(siteConfig.selectors)[0]; // First selector group
  
  for (const selector of confirmationSelectors) {
    if (selector.includes(':contains')) {
      // Handle text-based selectors
      const text = selector.split(':contains("')[1].split('")')[0];
      const elements = document.querySelectorAll('h1, h2, h3, .title, .confirmation');
      
      for (const element of elements) {
        if (element.textContent.toLowerCase().includes(text.toLowerCase())) {
          return true;
        }
      }
    } else {
      // Handle CSS selectors
      if (document.querySelector(selector)) {
        return true;
      }
    }
  }
  
  return false;
}

function extractActivityData() {
  const domain = currentDomain;
  let activity = {
    type: siteConfig.type,
    category: domain.charAt(0).toUpperCase() + domain.slice(1),
    amount: 0,
    description: `${siteConfig.type} activity on ${domain}`,
    location: null,
    metadata: {
      url: window.location.href,
      timestamp: new Date().toISOString(),
      domain: domain,
      source: 'auto_detected'
    }
  };
  
  // Site-specific data extraction
  if (domain.includes('amazon.com')) {
    activity = extractAmazonData(activity);
  } else if (domain.includes('booking.com')) {
    activity = extractBookingData(activity);
  } else if (domain.includes('expedia.com')) {
    activity = extractExpediaData(activity);
  } else if (domain.includes('uber.com')) {
    activity = extractUberData(activity);
  } else if (domain.includes('doordash.com')) {
    activity = extractDoorDashData(activity);
  }
  
  // Ensure minimum emission value
  if (activity.amount === 0) {
    activity.amount = siteConfig.carbonFactor; // Default emission
  }
  
  return activity;
}

function extractAmazonData(activity) {
  try {
    // Try to extract order value and estimate emissions
    const priceElements = document.querySelectorAll('.a-price-whole, .grand-total-price');
    let orderValue = 0;
    
    for (const element of priceElements) {
      const price = parseFloat(element.textContent.replace(/[^0-9.]/g, ''));
      if (price > orderValue) {
        orderValue = price;
      }
    }
    
    if (orderValue > 0) {
      activity.amount = orderValue * siteConfig.carbonFactor;
      activity.description = `Amazon order ($${orderValue.toFixed(2)})`;
      activity.metadata.orderValue = orderValue;
    } else {
      activity.amount = 2.5; // Default for Amazon orders
      activity.description = 'Amazon order (estimated)';
    }
  } catch (error) {
    console.error('Error extracting Amazon data:', error);
    activity.amount = 2.5;
  }
  
  return activity;
}

function extractBookingData(activity) {
  try {
    // Try to extract number of nights
    const nightsElements = document.querySelectorAll('[data-testid="length-of-stay"], .nights');
    let nights = 1;
    
    for (const element of nightsElements) {
      const nightsMatch = element.textContent.match(/(\d+)\s*night/i);
      if (nightsMatch) {
        nights = parseInt(nightsMatch[1]);
        break;
      }
    }
    
    activity.amount = nights * siteConfig.carbonFactor;
    activity.description = `Hotel booking (${nights} night${nights > 1 ? 's' : ''})`;
    activity.metadata.nights = nights;
  } catch (error) {
    console.error('Error extracting Booking data:', error);
    activity.amount = 15; // Default one night
  }
  
  return activity;
}

function extractExpediaData(activity) {
  try {
    // Try to detect if it's a flight
    const isFlightPage = window.location.href.includes('flight') || 
                        document.querySelector('.flight-details, .flight-summary');
    
    if (isFlightPage) {
      activity.amount = siteConfig.carbonFactor; // Default flight emission
      activity.description = 'Flight booking';
      activity.type = 'Travel';
      activity.category = 'Flight';
    } else {
      activity.amount = 15; // Default hotel emission
      activity.description = 'Travel booking';
    }
  } catch (error) {
    console.error('Error extracting Expedia data:', error);
    activity.amount = 50; // Default travel emission
  }
  
  return activity;
}

function extractUberData(activity) {
  try {
    // Try to extract distance
    const distanceElements = document.querySelectorAll('.trip-distance, .distance');
    let distance = 5; // Default 5km
    
    for (const element of distanceElements) {
      const distanceMatch = element.textContent.match(/([\d.]+)\s*(km|mi)/i);
      if (distanceMatch) {
        distance = parseFloat(distanceMatch[1]);
        if (distanceMatch[2].toLowerCase() === 'mi') {
          distance *= 1.609; // Convert miles to km
        }
        break;
      }
    }
    
    activity.amount = distance * siteConfig.carbonFactor;
    activity.description = `Uber ride (${distance.toFixed(1)} km)`;
    activity.metadata.distance = distance;
  } catch (error) {
    console.error('Error extracting Uber data:', error);
    activity.amount = 1.05; // Default 5km ride
  }
  
  return activity;
}

function extractDoorDashData(activity) {
  try {
    // Try to extract restaurant name
    const restaurantElements = document.querySelectorAll('.restaurant-name, .store-name');
    let restaurantName = 'Restaurant';
    
    if (restaurantElements.length > 0) {
      restaurantName = restaurantElements[0].textContent.trim();
    }
    
    activity.amount = siteConfig.carbonFactor;
    activity.description = `Food delivery from ${restaurantName}`;
    activity.metadata.restaurant = restaurantName;
  } catch (error) {
    console.error('Error extracting DoorDash data:', error);
    activity.amount = 2.5;
  }
  
  return activity;
}

async function trackActivity(activity) {
  try {
    // Send to background script
    const response = await chrome.runtime.sendMessage({
      action: 'trackActivity',
      activity: activity
    });
    
    if (response && response.success) {
      console.log('CarbonWise: Activity tracked successfully');
      
      // Show subtle notification
      showTrackingNotification(activity);
    } else {
      console.error('CarbonWise: Failed to track activity:', response?.error);
    }
  } catch (error) {
    console.error('CarbonWise: Error sending activity to background:', error);
  }
}

function showTrackingNotification(activity) {
  // Create a subtle notification overlay
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    max-width: 300px;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 16px;">🌱</span>
      <div>
        <div style="font-weight: 600;">CarbonWise Tracked</div>
        <div style="font-size: 12px; opacity: 0.9;">${activity.description} (${activity.amount.toFixed(1)} kg CO2)</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 100);
  
  // Remove after 4 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 4000);
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkCurrentSite') {
    sendResponse({
      domain: currentDomain,
      isSupported: !!siteConfig,
      type: siteConfig?.type
    });
  }
  
  if (request.action === 'manualCheck') {
    checkForActivities();
    sendResponse({ success: true });
  }
});

class CarbonTracker {
    constructor() {
        this.isTracking = false;
        this.currentDomain = window.location.hostname;
        this.trackedActivities = new Set();
        this.startTime = Date.now();
        this.clickCount = 0;
        
        // Track user interactions
        document.addEventListener('click', () => this.clickCount++);
        
        this.init();
    }
    
    async init() {
        // Check if user is authenticated and has permissions
        const hasAuth = await this.checkAuthentication();
        if (!hasAuth) return;
        
        const hasPermissions = await this.checkPermissions();
        if (!hasPermissions) return;
        
        this.startTracking();
    }
    
    async checkAuthentication() {
        try {
            const result = await chrome.storage.local.get(['carbonwise_token']);
            return !!result.carbonwise_token;
        } catch (error) {
            console.error('Auth check failed:', error);
            return false;
        }
    }
    
    async checkPermissions() {
        return new Promise((resolve) => {
            chrome.permissions.contains({
                origins: [`*://${this.currentDomain}/*`]
            }, resolve);
        });
    }
    
    startTracking() {
        this.isTracking = true;
        console.log(`🌱 CarbonWise: Tracking started on ${this.currentDomain}`);
        
        // Site-specific tracking
        if (this.currentDomain.includes('amazon')) {
            this.trackAmazon();
        } else if (this.currentDomain.includes('netflix')) {
            this.trackNetflix();
        } else if (this.currentDomain.includes('youtube')) {
            this.trackYouTube();
        } else if (this.currentDomain.includes('booking')) {
            this.trackBooking();
        } else if (this.currentDomain.includes('expedia')) {
            this.trackExpedia();
        } else if (this.currentDomain.includes('kayak')) {
            this.trackKayak();
        } else if (this.currentDomain.includes('uber')) {
            this.trackUber();
        } else if (this.currentDomain.includes('lyft')) {
            this.trackLyft();
        } else if (this.currentDomain.includes('doordash')) {
            this.trackDoorDash();
        } else if (this.currentDomain.includes('ubereats')) {
            this.trackUberEats();
        } else if (this.currentDomain.includes('grubhub')) {
            this.trackGrubHub();
        }
        
        // Show tracking indicator
        this.showTrackingIndicator();
    }
    
    trackAmazon() {
        // Track Amazon purchases
        this.observeElement('.a-button-primary', () => {
            if (window.location.href.includes('/gp/buy/spc/handlers/static-submit-decoupled.html')) {
                this.detectAmazonPurchase();
            }
        });
        
        // Track "Add to Cart" actions
        this.observeElement('#add-to-cart-button', (element) => {
            element.addEventListener('click', () => {
                setTimeout(() => this.detectAmazonCartAddition(), 1000);
            });
        });
    }
    
    async detectAmazonPurchase() {
        try {
            // Look for order total
            const totalElement = document.querySelector('.grand-total-price') || 
                                document.querySelector('[data-test-id="order-total"]') ||
                                document.querySelector('.a-price.a-text-bold');
            
            if (totalElement) {
                const totalText = totalElement.textContent;
                const amount = this.extractPrice(totalText);
                
                if (amount > 0) {
                    await this.trackActivity({
                        type: 'Shopping',
                        category: 'Online Purchase',
                        description: `Amazon purchase - $${amount}`,
                        co2Amount: amount * 0.5, // $0.50 CO2 per dollar spent
                        metadata: {
                            domain: 'amazon.com',
                            amount: amount,
                            currency: 'USD'
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Amazon tracking error:', error);
        }
    }
    
    async detectAmazonCartAddition() {
        try {
            const priceElement = document.querySelector('.a-price.a-text-price.a-size-medium.apexPriceToPay') ||
                                document.querySelector('.a-price-whole');
            
            if (priceElement) {
                const price = this.extractPrice(priceElement.textContent);
                if (price > 0) {
                    this.showNotification(`🛍️ Item added to cart (~${(price * 0.5).toFixed(1)} kg CO₂)`);
                }
            }
        } catch (error) {
            console.error('Amazon cart tracking error:', error);
        }
    }
    
    trackBooking() {
        // Track hotel bookings
        this.observeElement('[data-testid="reservation-submit-button"]', (element) => {
            element.addEventListener('click', () => {
                setTimeout(() => this.detectHotelBooking(), 2000);
            });
        });
    }
    
    async detectHotelBooking() {
        try {
            const priceElement = document.querySelector('[data-testid="total-price"]') ||
                                document.querySelector('.total-price');
            
            if (priceElement) {
                const price = this.extractPrice(priceElement.textContent);
                const nights = this.extractNights() || 1;
                
                await this.trackActivity({
                    type: 'Travel',
                    category: 'Hotel Booking',
                    description: `Hotel booking - ${nights} night(s)`,
                    co2Amount: nights * 15, // 15 kg CO2 per night
                    metadata: {
                        domain: 'booking.com',
                        nights: nights,
                        price: price
                    }
                });
            }
        } catch (error) {
            console.error('Booking tracking error:', error);
        }
    }
    
    trackUber() {
        // Track Uber rides
        this.observeElement('[data-testid="ride-request-button"]', (element) => {
            element.addEventListener('click', () => {
                setTimeout(() => this.detectUberRide(), 3000);
            });
        });
    }
    
    async detectUberRide() {
        try {
            // Estimate distance based on typical city ride
            const estimatedDistance = 5; // km
            
            await this.trackActivity({
                type: 'Transportation',
                category: 'Rideshare',
                description: 'Uber ride',
                co2Amount: estimatedDistance * 0.21, // 0.21 kg CO2 per km
                metadata: {
                    domain: 'uber.com',
                    service: 'uber',
                    estimatedDistance: estimatedDistance
                }
            });
        } catch (error) {
            console.error('Uber tracking error:', error);
        }
    }
    
    trackNetflix() {
        console.log('🎬 CarbonWise: Netflix tracking initialized');
        
        // Track when video starts playing
        this.observeElement('.VideoContainer', () => {
            this.detectNetflixStreaming();
        });
        
        // Track when user clicks play button
        this.observeElement('[data-uia="play-pause-button"]', (element) => {
            element.addEventListener('click', () => {
                setTimeout(() => this.detectNetflixStreaming(), 1000);
            });
        });
        
        // Track streaming every 30 seconds while video is playing
        setInterval(() => {
            if (this.isVideoPlaying()) {
                this.detectNetflixStreaming();
            }
        }, 30000);
    }
    
    trackYouTube() {
        console.log('📺 CarbonWise: YouTube tracking initialized');
        
        // Track video watching
        this.observeElement('#movie_player', () => {
            this.detectYouTubeStreaming();
        });
        
        // Track streaming every 30 seconds
        setInterval(() => {
            if (this.isVideoPlaying()) {
                this.detectYouTubeStreaming();
            }
        }, 30000);
    }
    
    async detectNetflixStreaming() {
        try {
            // Get video title if available
            const titleElement = document.querySelector('[data-uia="video-title"]') || 
                                document.querySelector('h1') ||
                                document.querySelector('title');
            
            const videoTitle = titleElement ? titleElement.textContent : 'Netflix Video';
            
            await this.trackActivity({
                type: 'Digital',
                category: 'Streaming',
                description: `Netflix streaming: ${videoTitle}`,
                co2Amount: 0.12, // 0.12 kg CO2 per 30 seconds of streaming
                metadata: {
                    domain: 'netflix.com',
                    service: 'Netflix',
                    videoTitle: videoTitle,
                    quality: 'HD' // Assume HD quality
                }
            });
        } catch (error) {
            console.error('Netflix tracking error:', error);
        }
    }
    
    async detectYouTubeStreaming() {
        try {
            const titleElement = document.querySelector('h1.title') || 
                                document.querySelector('.title');
            
            const videoTitle = titleElement ? titleElement.textContent : 'YouTube Video';
            
            await this.trackActivity({
                type: 'Digital',
                category: 'Streaming',
                description: `YouTube streaming: ${videoTitle}`,
                co2Amount: 0.09, // 0.09 kg CO2 per 30 seconds of streaming
                metadata: {
                    domain: 'youtube.com',
                    service: 'YouTube',
                    videoTitle: videoTitle
                }
            });
        } catch (error) {
            console.error('YouTube tracking error:', error);
        }
    }
    
    isVideoPlaying() {
        // Check if video is currently playing
        const netflixPlayer = document.querySelector('.VideoContainer video');
        const youtubePlayer = document.querySelector('#movie_player video');
        
        if (netflixPlayer && !netflixPlayer.paused) return true;
        if (youtubePlayer && !youtubePlayer.paused) return true;
        
        return false;
    }
    
    trackDoorDash() {
        // Track food delivery orders
        this.observeElement('[data-testid="place-order-button"]', (element) => {
            element.addEventListener('click', () => {
                setTimeout(() => this.detectFoodDelivery('DoorDash'), 2000);
            });
        });
    }
    
    async detectFoodDelivery(service) {
        try {
            await this.trackActivity({
                type: 'Food',
                category: 'Food Delivery',
                description: `${service} food delivery`,
                co2Amount: 2.5, // 2.5 kg CO2 per delivery order
                metadata: {
                    domain: this.currentDomain,
                    service: service
                }
            });
        } catch (error) {
            console.error('Food delivery tracking error:', error);
        }
    }
    
    async trackActivity(activity) {
        try {
            // Prevent duplicate tracking
            const activityKey = `${activity.type}-${activity.description}-${Date.now()}`;
            if (this.trackedActivities.has(activityKey)) return;
            
            this.trackedActivities.add(activityKey);
            
            // Get auth token
            const result = await chrome.storage.local.get(['carbonwise_token']);
            if (!result.carbonwise_token) return;
            
            // Send to AI-enhanced API
            const response = await fetch('http://localhost:3001/api/carbon/ai-enhanced', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${result.carbonwise_token}`
                },
                body: JSON.stringify({
                    url: window.location.href,
                    timeOnPage: Math.floor((Date.now() - this.startTime) / 1000) || 60,
                    pageTitle: document.title,
                    scrollDepth: Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100) || 0,
                    clickCount: this.clickCount || 0,
                    deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'laptop',
                    networkType: 'wifi',
                    userAgent: navigator.userAgent,
                    location: { lat: 0, lng: 0, country: 'US' }
                })
            });
            
            if (response.ok) {
                this.showNotification(
                    `🌱 Activity tracked: ${activity.description} (${activity.co2Amount.toFixed(1)} kg CO₂)`
                );
            }
            
        } catch (error) {
            console.error('Activity tracking failed:', error);
        }
    }
    
    showTrackingIndicator() {
        // Create a subtle indicator that tracking is active
        const indicator = document.createElement('div');
        indicator.id = 'carbonwise-indicator';
        indicator.innerHTML = '🌱 CarbonWise';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(34, 197, 94, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 12px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        // Add click handler to show status
        indicator.addEventListener('click', () => {
            this.showNotification('🌱 CarbonWise is actively tracking your carbon footprint');
        });
        
        // Auto-hide after 3 seconds
        document.body.appendChild(indicator);
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.style.opacity = '0.3';
                indicator.style.transform = 'scale(0.8)';
            }
        }, 3000);
    }
    
    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50px;
            right: 10px;
            background: rgba(34, 197, 94, 0.95);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 13px;
            font-weight: 500;
            z-index: 10001;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 4000);
    }
    
    observeElement(selector, callback) {
        // Check if element already exists
        const existing = document.querySelector(selector);
        if (existing) {
            callback(existing);
            return;
        }
        
        // Watch for element to appear
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) { // Element node
                        const element = node.matches?.(selector) ? node : node.querySelector?.(selector);
                        if (element) {
                            callback(element);
                            observer.disconnect();
                            return;
                        }
                    }
                }
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Cleanup after 30 seconds
        setTimeout(() => observer.disconnect(), 30000);
    }
    
    extractPrice(text) {
        const match = text.match(/[\$€£¥]?([\d,]+\.?\d*)/);
        return match ? parseFloat(match[1].replace(',', '')) : 0;
    }
    
    extractNights() {
        const nightsElement = document.querySelector('[data-testid="nights-count"]') ||
                             document.querySelector('.nights-count');
        
        if (nightsElement) {
            const match = nightsElement.textContent.match(/(\d+)/);
            return match ? parseInt(match[1]) : 1;
        }
        return 1;
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize tracker when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new CarbonTracker());
} else {
    new CarbonTracker();
} 