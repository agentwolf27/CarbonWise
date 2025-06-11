import { NextResponse } from 'next/server';
import type { NewCarbonActivity } from '@/types/carbon';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// In a real app, this would be stored in a database
let activities: any[] = [];

export async function POST(request: Request) {
  try {
    // Check authentication - support both session and extension token
    let userId = null;
    
    // First, try to get session (for web app)
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      // Try extension authentication
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        // For now, we'll extract userId from the request body
        // In production, you'd decode it from the JWT token
        const body = await request.json();
        
        // Simple token validation - in production use proper JWT
        if (token && body.userId) {
          userId = body.userId;
        }
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const {
      type,
      category,
      amount,
      description,
      location,
      metadata,
      source = 'manual'
    } = body;
    
    // Validation
    if (!type || !category || amount === undefined || !description) {
      return NextResponse.json({ 
        error: "Missing required fields: type, category, amount, description" 
      }, { status: 400 });
    }
    
    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json({ 
        error: "Amount must be a positive number" 
      }, { status: 400 });
    }
    
    // Create carbon activity
    const activity = await prisma.carbonActivity.create({
      data: {
        userId,
        type,
        category,
        amount: parseFloat(amount),
        description,
        location: location || null,
        metadata: typeof metadata === 'string' ? metadata : JSON.stringify(metadata || {}),
        timestamp: new Date(),
      }
    });
    
    // Check for achievements
    await checkAndAwardAchievements(userId);
    
    return NextResponse.json({
      success: true,
      activity: {
        id: activity.id,
        type: activity.type,
        category: activity.category,
        amount: activity.amount,
        description: activity.description,
        timestamp: activity.timestamp
      }
    });
    
  } catch (error) {
    console.error('Failed to create carbon activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}

async function checkAndAwardAchievements(userId: string) {
  try {
    // Get user's activity count
    const activityCount = await prisma.carbonActivity.count({
      where: { userId }
    });
    
    // Award "First Activity" achievement
    if (activityCount === 1) {
      await prisma.achievement.upsert({
        where: {
          userId_type: {
            userId,
            type: 'FIRST_ACTIVITY'
          }
        },
        update: {},
        create: {
          userId,
          type: 'FIRST_ACTIVITY',
          name: 'First Steps',
          description: 'Tracked your first carbon activity',
        }
      });
    }
    
    // Award milestone achievements
    const milestones = [10, 50, 100, 500];
    for (const milestone of milestones) {
      if (activityCount === milestone) {
        await prisma.achievement.upsert({
          where: {
            userId_type: {
              userId,
              type: `ACTIVITIES_${milestone}`
            }
          },
          update: {},
          create: {
            userId,
            type: `ACTIVITIES_${milestone}`,
            name: `${milestone} Activities`,
            description: `Tracked ${milestone} carbon activities`,
          }
        });
      }
    }
    
  } catch (error) {
    console.error('Failed to check achievements:', error);
    // Don't throw error as this is not critical
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