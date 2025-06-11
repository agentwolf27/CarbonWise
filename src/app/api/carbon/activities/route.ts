import { NextResponse } from 'next/server';
import type { NewCarbonActivity } from '@/types/carbon';

// In a real app, this would be stored in a database
let activities: any[] = [];

export async function POST(request: Request) {
  try {
    const body: NewCarbonActivity = await request.json();
    
    // Validate required fields
    if (!body.type || !body.category || !body.amount || !body.description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    // Create new activity
    const newActivity = {
      id: Date.now(), // In a real app, use proper ID generation
      type: body.type,
      category: body.category,
      amount: body.amount,
      timestamp: new Date(),
      description: body.description,
      location: body.location || 'Unknown',
    };

    // Add to activities (in a real app, save to database)
    activities.push(newActivity);

    return NextResponse.json({
      success: true,
      data: {
        activity: newActivity,
        message: 'Activity added successfully'
      }
    });
  } catch (error) {
    console.error('Error adding carbon activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add activity' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return recent activities (in a real app, fetch from database)
    const recentActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
      .map(activity => ({
        ...activity,
        timeAgo: getTimeAgo(new Date(activity.timestamp))
      }));

    return NextResponse.json({
      success: true,
      data: {
        activities: recentActivities,
        total: activities.length
      }
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

function getTimeAgo(timestamp: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
} 