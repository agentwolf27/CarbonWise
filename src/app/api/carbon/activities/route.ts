import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveUserId } from '@/lib/extension-auth';

export async function GET(request: NextRequest) {
  try {
    // Auth: web session OR verified extension token
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build the Prisma filter
    const where: any = { userId };
    if (type) {
      where.activityType = type;
    }
    if (startDate || endDate) {
      where.activityDate = {};
      if (startDate) where.activityDate.gte = new Date(startDate);
      if (endDate) where.activityDate.lte = new Date(endDate);
    }

    const [activities, total] = await Promise.all([
      prisma.carbonActivity.findMany({
        where,
        orderBy: { activityDate: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.carbonActivity.count({ where: { userId } }),
    ]);

    // Normalize to the shape the frontend expects
    const activitiesWithTimeAgo = activities.map((activity) => {
      const metadata = (activity.metadata as Record<string, any>) || {};
      return {
        id: activity.id,
        type: activity.activityType,
        category: activity.category,
        amount: activity.carbonFootprint,
        unit: activity.unit,
        description: activity.description,
        location: metadata.location ?? null,
        source: activity.source,
        metadata,
        timestamp: activity.activityDate,
        timeAgo: getTimeAgo(activity.activityDate),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        activities: activitiesWithTimeAgo,
        total,
        pagination: {
          limit,
          offset,
          hasMore: total > offset + limit,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth: web session OR verified extension token
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, category, amount, description, location, metadata, timestamp, source = 'manual' } = body;

    // Validation
    if (!type || !category || amount === undefined || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: type, category, amount, description' },
        { status: 400 }
      );
    }
    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 });
    }

    const activity = await prisma.carbonActivity.create({
      data: {
        userId,
        activityType: type,
        category,
        carbonFootprint: parseFloat(amount.toString()),
        unit: 'kg_co2',
        description,
        source,
        activityDate: timestamp ? new Date(timestamp) : new Date(),
        // location has no dedicated column — fold it into metadata
        metadata: { ...(metadata || {}), ...(location ? { location } : {}) },
      },
    });

    // Award milestone achievements (fire-and-forget; not critical to the response)
    checkAndAwardAchievements(userId).catch(console.error);

    return NextResponse.json({
      success: true,
      activity: {
        id: activity.id,
        type: activity.activityType,
        category: activity.category,
        amount: activity.carbonFootprint,
        description: activity.description,
        timestamp: activity.activityDate,
      },
    });
  } catch (error) {
    console.error('Failed to create carbon activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}

// Award activity-count milestone achievements via Prisma upsert (idempotent
// thanks to the @@unique([userId, achievementType]) constraint).
async function checkAndAwardAchievements(userId: string) {
  try {
    const activityCount = await prisma.carbonActivity.count({ where: { userId } });

    const achievementsToCheck = [
      { count: 1, type: 'first_activity', name: 'First Steps', description: 'Tracked your first carbon activity' },
      { count: 10, type: 'activities_10', name: '10 Activities', description: 'Tracked 10 carbon activities' },
      { count: 50, type: 'activities_50', name: '50 Activities', description: 'Tracked 50 carbon activities' },
      { count: 100, type: 'activities_100', name: '100 Activities', description: 'Tracked 100 carbon activities' },
      { count: 500, type: 'activities_500', name: '500 Activities', description: 'Tracked 500 carbon activities' },
    ];

    for (const achievement of achievementsToCheck) {
      if (activityCount === achievement.count) {
        await prisma.achievement.upsert({
          where: { userId_achievementType: { userId, achievementType: achievement.type } },
          create: {
            userId,
            achievementType: achievement.type,
            title: achievement.name,
            description: achievement.description,
          },
          update: {},
        });
      }
    }
  } catch (error) {
    console.error('Failed to check achievements:', error);
    // Non-critical — never throw from here
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
