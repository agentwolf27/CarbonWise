import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    const activities = await prisma.carbonActivity.findMany({ where: { userId }, orderBy: { timestamp: 'desc' } });
    const achievements = await prisma.achievement.findMany({ where: { userId }, orderBy: { achievedAt: 'desc' } });
    const goals = await prisma.goal.findMany({ where: { userId, isActive: true }, orderBy: { createdAt: 'desc' } });

    // --- Start of Robust Date Calculations ---
    const now = new Date();
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (weekStart.getDay() === 0 ? -6 : 1)); // Set to Monday

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    // --- End of Robust Date Calculations ---

    const todayValue = activities.filter(a => a.timestamp >= todayStart).reduce((sum, a) => sum + a.amount, 0);
    const weekValue = activities.filter(a => a.timestamp >= weekStart).reduce((sum, a) => sum + a.amount, 0);
    const monthValue = activities.filter(a => a.timestamp >= monthStart).reduce((sum, a) => sum + a.amount, 0);
    const yearValue = activities.filter(a => a.timestamp >= yearStart).reduce((sum, a) => sum + a.amount, 0);

    const summary = {
      today: { value: todayValue, change: -10, activities: activities.filter(a => a.timestamp >= todayStart).length },
      week: { value: weekValue, change: 5, activities: activities.filter(a => a.timestamp >= weekStart).length },
      month: { value: monthValue, change: -2, activities: activities.filter(a => a.timestamp >= monthStart).length },
      year: { value: yearValue, change: -15, activities: activities.filter(a => a.timestamp >= yearStart).length },
    };

    const labels = [];
    const chartDataValues = [];
    for (let i = 6; i >= 0; i--) {
        const day = new Date();
        day.setHours(0, 0, 0, 0);
        day.setDate(day.getDate() - i);
        
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);

        labels.push(day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        const dayActivities = activities.filter(a => a.timestamp >= day && a.timestamp < nextDay);
        chartDataValues.push(dayActivities.reduce((sum, a) => sum + a.amount, 0));
    }
    const chart = { labels, data: chartDataValues };
    
    return NextResponse.json({
      success: true,
      data: {
        summary,
        chart,
        activities: activities.slice(0, 5),
        achievements,
        goals: goals.map(goal => {
          const percentage = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
          return {
            ...goal,
            percentage: Math.min(percentage, 100),
          };
        }),
      },
    });

  } catch (error) {
    console.error('Error fetching carbon data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch carbon data' },
      { status: 500 }
    );
  }
} 