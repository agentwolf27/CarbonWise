import { NextResponse } from 'next/server';

// Sample carbon activity data - in a real app, this would come from a database
const carbonActivities = [
  {
    id: 1,
    type: 'Cloud Computing',
    category: 'AWS EC2',
    amount: 1.2,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    description: 'EC2 instance running for 4 hours',
    location: 'us-east-1'
  },
  {
    id: 2,
    type: 'Data Transfer',
    category: 'CDN',
    amount: 0.8,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    description: 'CDN data transfer - 5.2 GB',
    location: 'global'
  },
  {
    id: 3,
    type: 'Video Streaming',
    category: 'Media',
    amount: 0.4,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    description: 'Video streaming - 30 minutes HD',
    location: 'us-west-2'
  },
  {
    id: 4,
    type: 'Database Queries',
    category: 'Database',
    amount: 0.15,
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    description: 'PostgreSQL queries - 1,250 operations',
    location: 'eu-west-1'
  },
  {
    id: 5,
    type: 'Email Sending',
    category: 'Communication',
    amount: 0.05,
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
    description: 'Email service - 150 emails sent',
    location: 'us-east-1'
  }
];

// Calculate carbon data for different time periods
function calculateCarbonData() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
  const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

  const todayActivities = carbonActivities.filter(activity => 
    activity.timestamp >= today
  );
  
  const weekActivities = carbonActivities.filter(activity => 
    activity.timestamp >= weekAgo
  );
  
  const monthActivities = carbonActivities.filter(activity => 
    activity.timestamp >= monthAgo
  );

  // Simulate more historical data
  const weekTotal = weekActivities.reduce((sum, activity) => sum + activity.amount, 0) + 14.2;
  const monthTotal = monthActivities.reduce((sum, activity) => sum + activity.amount, 0) + 65.6;
  const yearTotal = monthTotal * 12 + 156.3; // Simulate year data

  return {
    today: {
      value: todayActivities.reduce((sum, activity) => sum + activity.amount, 0),
      change: -12,
      activities: todayActivities.length
    },
    week: {
      value: weekTotal,
      change: 8,
      activities: weekActivities.length + 28
    },
    month: {
      value: monthTotal,
      change: -5,
      activities: monthActivities.length + 95
    },
    year: {
      value: yearTotal,
      change: -15,
      activities: 1250
    }
  };
}

// Generate chart data for the last 7 days
function generateChartData() {
  const labels = [];
  const data = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    
    // Simulate daily carbon footprint data
    const baseValue = 2.5;
    const variation = (Math.random() - 0.5) * 1.5;
    data.push(Math.max(0.5, baseValue + variation));
  }
  
  return { labels, data };
}

export async function GET() {
  try {
    const carbonData = calculateCarbonData();
    const chartData = generateChartData();
    const recentActivities = carbonActivities.slice(0, 5); // Get 5 most recent

    return NextResponse.json({
      success: true,
      data: {
        summary: carbonData,
        chart: chartData,
        recentActivities: recentActivities.map(activity => ({
          ...activity,
          timeAgo: getTimeAgo(activity.timestamp)
        })),
        goals: [
          {
            id: 1,
            title: 'Weekly Carbon Goal',
            current: carbonData.week.value,
            target: 20,
            unit: 'kg CO₂',
            percentage: Math.min((carbonData.week.value / 20) * 100, 100)
          },
          {
            id: 2,
            title: 'Monthly Reduction',
            current: Math.abs(carbonData.month.change),
            target: 10,
            unit: '% decrease',
            percentage: Math.min((Math.abs(carbonData.month.change) / 10) * 100, 100)
          },
          {
            id: 3,
            title: 'Team Challenge',
            current: 85,
            target: 100,
            unit: 'points',
            percentage: 85
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching carbon data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch carbon data' },
      { status: 500 }
    );
  }
}

function getTimeAgo(timestamp: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
} 