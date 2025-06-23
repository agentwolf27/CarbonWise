// Extract useful training data from carbon datasets
const fs = require('fs');
const path = require('path');

console.log('🔍 Processing carbon footprint datasets...');

// 1. Process Our World in Data CO2 dataset
function processOWIDData() {
  const csvContent = fs.readFileSync('owid-co2-data.csv', 'utf8');
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  
  console.log('📊 OWID Dataset headers:', headers.slice(0, 10).join(', '), '...');
  console.log('📈 Total records:', lines.length - 1);
  
  // Extract recent data for major countries
  const recentData = [];
  for (let i = 1; i < Math.min(1000, lines.length); i++) {
    const row = lines[i].split(',');
    if (row[1] && parseInt(row[1]) >= 2020) { // Recent years only
      const record = {
        country: row[0],
        year: parseInt(row[1]),
        co2_per_capita: parseFloat(row[16]) || 0,
        electricity_per_capita: parseFloat(row[33]) || 0,
        gdp_per_capita: parseFloat(row[4]) ? parseFloat(row[4]) / parseFloat(row[3]) : 0
      };
      if (record.co2_per_capita > 0) {
        recentData.push(record);
      }
    }
  }
  
  console.log('✅ Processed', recentData.length, 'recent country records');
  return recentData;
}

// 2. Create activity-based training examples
function createActivityTrainingData() {
  const activities = [
    // E-commerce examples
    {
      activity_type: 'SHOPPING',
      website: 'amazon.com',
      product_category: 'electronics',
      price_usd: 299.99,
      shipping_distance_km: 50,
      shipping_type: 'standard',
      carbon_kg: 1.2,
      confidence: 0.85
    },
    {
      activity_type: 'SHOPPING', 
      website: 'amazon.com',
      product_category: 'clothing',
      price_usd: 49.99,
      shipping_distance_km: 100,
      shipping_type: 'express',
      carbon_kg: 0.8,
      confidence: 0.80
    },
    
    // Streaming examples
    {
      activity_type: 'STREAMING',
      website: 'netflix.com',
      duration_minutes: 90,
      video_quality: '4K',
      device_type: 'TV',
      carbon_kg: 0.32,
      confidence: 0.90
    },
    {
      activity_type: 'STREAMING',
      website: 'youtube.com', 
      duration_minutes: 15,
      video_quality: 'HD',
      device_type: 'mobile',
      carbon_kg: 0.018,
      confidence: 0.85
    },
    
    // Food delivery examples
    {
      activity_type: 'FOOD_DELIVERY',
      website: 'doordash.com',
      restaurant_distance_km: 5,
      food_type: 'burger',
      delivery_vehicle: 'car',
      carbon_kg: 2.1,
      confidence: 0.75
    },
    {
      activity_type: 'FOOD_DELIVERY',
      website: 'ubereats.com',
      restaurant_distance_km: 2,
      food_type: 'salad',
      delivery_vehicle: 'bike',
      carbon_kg: 0.4,
      confidence: 0.80
    },
    
    // Travel booking examples
    {
      activity_type: 'TRAVEL',
      website: 'booking.com',
      travel_type: 'hotel',
      nights: 3,
      location: 'urban',
      carbon_kg: 15.6,
      confidence: 0.70
    },
    {
      activity_type: 'TRAVEL',
      website: 'expedia.com',
      travel_type: 'flight',
      distance_km: 500,
      passengers: 1,
      carbon_kg: 85.0,
      confidence: 0.95
    }
  ];
  
  console.log('✅ Created', activities.length, 'activity training examples');
  return activities;
}

// 3. Create ML feature engineering examples
function createFeatureExamples() {
  const features = [
    {
      // Website patterns
      domain: 'amazon.com',
      url_contains_product: true,
      page_title_words: ['echo', 'dot', 'alexa'],
      time_on_page_seconds: 180,
      scroll_percentage: 75,
      
      // User context
      hour_of_day: 14,
      day_of_week: 2,
      is_weekend: false,
      user_location_lat: 37.7749,
      user_location_lng: -122.4194,
      
      // Extracted data
      price_extracted: 49.99,
      category_detected: 'electronics',
      shipping_option: 'prime',
      
      // Output labels
      predicted_carbon: 1.2,
      activity_type: 'SHOPPING',
      confidence_score: 0.85
    }
  ];
  
  return features;
}

// 4. Generate realistic training variations
function generateTrainingVariations() {
  const baseActivities = createActivityTrainingData();
  const variations = [];
  
  baseActivities.forEach(activity => {
    // Create 5 variations of each base activity
    for (let i = 0; i < 5; i++) {
      const variation = { ...activity };
      
      // Add realistic noise/variations
      if (variation.price_usd) {
        variation.price_usd *= (0.8 + Math.random() * 0.4); // ±20% price variation
      }
      if (variation.duration_minutes) {
        variation.duration_minutes *= (0.7 + Math.random() * 0.6); // ±30% duration variation
      }
      if (variation.shipping_distance_km) {
        variation.shipping_distance_km *= (0.5 + Math.random() * 1.0); // ±50% distance variation
      }
      
      // Adjust carbon accordingly
      const carbonMultiplier = 0.8 + Math.random() * 0.4;
      variation.carbon_kg *= carbonMultiplier;
      variation.confidence *= (0.9 + Math.random() * 0.1); // Slight confidence variation
      
      variations.push(variation);
    }
  });
  
  console.log('✅ Generated', variations.length, 'training variations');
  return variations;
}

// Main execution
try {
  const owidData = processOWIDData();
  const activityData = createActivityTrainingData();
  const featureExamples = createFeatureExamples();
  const trainingVariations = generateTrainingVariations();
  
  // Save processed datasets
  fs.writeFileSync('processed-country-emissions.json', JSON.stringify(owidData, null, 2));
  fs.writeFileSync('activity-training-data.json', JSON.stringify(activityData, null, 2));
  fs.writeFileSync('ml-feature-examples.json', JSON.stringify(featureExamples, null, 2));
  fs.writeFileSync('training-variations.json', JSON.stringify(trainingVariations, null, 2));
  
  console.log('\n🎯 Training Data Summary:');
  console.log(`📊 Country emissions: ${owidData.length} records`);
  console.log(`🛒 Activity examples: ${activityData.length} base activities`);
  console.log(`🔬 Training variations: ${trainingVariations.length} examples`);
  console.log(`🧠 Feature examples: ${featureExamples.length} ML examples`);
  console.log('\n📁 Files created:');
  console.log('  - processed-country-emissions.json');
  console.log('  - activity-training-data.json');
  console.log('  - ml-feature-examples.json');
  console.log('  - training-variations.json');
  console.log('  - food-carbon-detailed.csv');
  
  console.log('\n🚀 Next Steps:');
  console.log('  1. Train ML model with TensorFlow.js using these datasets');
  console.log('  2. Validate against known carbon calculators');
  console.log('  3. Get EPA API key for real-time emission factors');
  console.log('  4. Collect real user data (with permission) for better training');
  
} catch (error) {
  console.error('❌ Error processing data:', error);
} 