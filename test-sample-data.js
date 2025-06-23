// Test script to add sample carbon activities
// Run with: node test-sample-data.js

const activities = [
  {
    type: 'SHOPPING',
    category: 'E_COMMERCE',
    description: 'Amazon Prime delivery - Electronics',
    amount: 2.5,
    location: 'San Francisco, CA',
    metadata: JSON.stringify({
      website: 'amazon.com',
      product: 'Wireless headphones',
      deliveryType: 'express',
      price: 129.99
    }),
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    type: 'STREAMING',
    category: 'ENTERTAINMENT',
    description: 'Netflix video streaming - 2 hours',
    amount: 0.4,
    location: 'San Francisco, CA',
    metadata: JSON.stringify({
      website: 'netflix.com',
      duration: 120,
      quality: '4K',
      device: 'laptop'
    }),
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    type: 'AI',
    category: 'PRODUCTIVITY',
    description: 'ChatGPT conversation - 15 messages',
    amount: 0.1,
    location: 'San Francisco, CA',
    metadata: JSON.stringify({
      website: 'chat.openai.com',
      messageCount: 15,
      model: 'gpt-4',
      duration: 25
    }),
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
  },
  {
    type: 'FOOD_DELIVERY',
    category: 'FOOD',
    description: 'DoorDash food delivery - 3.2 miles',
    amount: 1.8,
    location: 'San Francisco, CA',
    metadata: JSON.stringify({
      website: 'doordash.com',
      distance: 3.2,
      restaurant: 'Local Bistro',
      orderValue: 45.50
    }),
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
  },
  {
    type: 'VIDEO',
    category: 'ENTERTAINMENT',
    description: 'YouTube video watching - 45 minutes',
    amount: 0.3,
    location: 'San Francisco, CA',
    metadata: JSON.stringify({
      website: 'youtube.com',
      duration: 45,
      quality: '1080p',
      videoType: 'tutorial'
    }),
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  }
];

console.log('Sample activities for testing:', JSON.stringify(activities, null, 2));
console.log('\n🔗 To add these activities, visit: http://localhost:3000/dashboard');
console.log('📊 Total sample CO₂: ' + activities.reduce((sum, a) => sum + a.amount, 0).toFixed(1) + ' kg'); 