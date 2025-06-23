// Carbon Footprint Training Data Collection Script
// Downloads and structures data from various free sources

const fs = require('fs');
const https = require('https');
const path = require('path');

// Create data directory
const dataDir = './training-data';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 1. EPA Emission Factors (Example structure)
const epaEmissionFactors = {
  electricity: {
    // kg CO2e per kWh by region
    us_average: 0.709,
    california: 0.334,
    texas: 0.651,
    new_york: 0.314
  },
  transportation: {
    // kg CO2e per mile
    car_gasoline: 0.404,
    car_hybrid: 0.200,
    car_electric: 0.200, // varies by grid
    motorcycle: 0.220,
    bus: 0.177,
    train: 0.177,
    airplane_domestic: 0.385,
    airplane_international: 0.440
  },
  food: {
    // kg CO2e per kg of food
    beef: 60.0,
    pork: 7.2,
    chicken: 6.1,
    fish_farmed: 5.1,
    cheese: 13.5,
    milk: 3.2,
    eggs: 4.2,
    rice: 2.7,
    wheat: 1.4,
    vegetables: 2.0,
    fruits: 1.1
  },
  shipping: {
    // kg CO2e per package by delivery type
    standard_delivery: 0.5,
    express_delivery: 1.2,
    overnight_delivery: 2.5,
    drone_delivery: 0.1
  },
  streaming: {
    // kg CO2e per hour
    video_sd: 0.0036,
    video_hd: 0.0072,
    video_4k: 0.0216,
    audio_streaming: 0.00072,
    gaming: 0.0144
  },
  ecommerce: {
    // kg CO2e per transaction type
    digital_download: 0.01,
    small_package: 0.5,
    medium_package: 1.2,
    large_package: 2.8,
    furniture_delivery: 15.0
  }
};

// 2. Activity Pattern Recognition Training Data
const activityPatterns = [
  // Amazon Shopping Patterns
  {
    url_pattern: /amazon\.com.*\/dp\/[A-Z0-9]+/,
    activity_type: 'SHOPPING',
    category: 'E_COMMERCE',
    extraction_rules: {
      product_title: 'span#productTitle',
      price: '.a-price-whole',
      product_category: 'nav .a-breadcrumb',
      shipping_option: '[data-csa-c-delivery-option]'
    },
    carbon_calculation: 'ecommerce_with_shipping'
  },
  
  // Netflix Streaming Patterns
  {
    url_pattern: /netflix\.com\/watch/,
    activity_type: 'STREAMING',
    category: 'ENTERTAINMENT',
    extraction_rules: {
      title: '.video-title',
      duration: '.duration-text',
      quality: '[data-uia="video-quality"]'
    },
    carbon_calculation: 'streaming_by_quality_duration'
  },
  
  // YouTube Patterns
  {
    url_pattern: /youtube\.com\/watch/,
    activity_type: 'STREAMING', 
    category: 'ENTERTAINMENT',
    extraction_rules: {
      title: 'h1.title',
      duration: '.ytp-time-duration',
      quality: '.ytp-settings-menu'
    },
    carbon_calculation: 'streaming_by_quality_duration'
  },
  
  // Travel Booking Patterns
  {
    url_pattern: /booking\.com.*\/hotel/,
    activity_type: 'TRAVEL',
    category: 'ACCOMMODATION',
    extraction_rules: {
      location: '[data-testid="header-location"]',
      dates: '.c-reservation-dates',
      room_type: '.hprt-table'
    },
    carbon_calculation: 'hotel_stay_by_location_nights'
  },
  
  // Food Delivery Patterns
  {
    url_pattern: /doordash\.com.*\/store/,
    activity_type: 'FOOD_DELIVERY',
    category: 'FOOD',
    extraction_rules: {
      restaurant: '.store-header h1',
      items: '.order-item',
      delivery_distance: '.delivery-time'
    },
    carbon_calculation: 'food_delivery_by_distance_items'
  }
];

// 3. Machine Learning Training Dataset Structure
const trainingDataset = {
  features: [
    // Website features
    'domain',
    'url_path',
    'page_title',
    'time_spent_seconds',
    'scroll_depth_percent',
    'clicks_count',
    
    // User context
    'time_of_day',
    'day_of_week', 
    'location_lat',
    'location_lng',
    'device_type',
    
    // Activity extracted data
    'product_price',
    'shipping_distance_km',
    'video_duration_minutes',
    'video_quality',
    'travel_distance_km',
    'number_of_people'
  ],
  labels: [
    'carbon_emission_kg',
    'activity_type',
    'confidence_score'
  ],
  examples: [
    {
      features: {
        domain: 'amazon.com',
        url_path: '/dp/B08N5WRWNW',
        page_title: 'Echo Dot (4th Gen)',
        time_spent_seconds: 180,
        scroll_depth_percent: 75,
        clicks_count: 3,
        time_of_day: 14,
        day_of_week: 2,
        location_lat: 37.7749,
        location_lng: -122.4194,
        device_type: 'laptop',
        product_price: 49.99,
        shipping_distance_km: 50,
        video_duration_minutes: 0,
        video_quality: null,
        travel_distance_km: 0,
        number_of_people: 1
      },
      labels: {
        carbon_emission_kg: 1.2,
        activity_type: 'SHOPPING',
        confidence_score: 0.95
      }
    }
    // Add more training examples...
  ]
};

// Save all data to files
fs.writeFileSync(
  path.join(dataDir, 'emission_factors.json'), 
  JSON.stringify(epaEmissionFactors, null, 2)
);

fs.writeFileSync(
  path.join(dataDir, 'activity_patterns.json'),
  JSON.stringify(activityPatterns, null, 2)
);

fs.writeFileSync(
  path.join(dataDir, 'training_dataset.json'),
  JSON.stringify(trainingDataset, null, 2)
);

console.log('🌱 Carbon footprint training data downloaded and structured!');
console.log('📁 Files created in:', dataDir);
console.log('📊 Next steps:');
console.log('  1. Download EPA datasets from official sources');
console.log('  2. Collect real user activity data (with permission)');
console.log('  3. Train ML model using TensorFlow.js or similar');
console.log('  4. Validate against known carbon calculations'); 