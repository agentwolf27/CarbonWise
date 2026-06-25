import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveUserId } from '@/lib/extension-auth';
import type {
  CarbonDashboardData,
  CarbonActivity,
  PeriodSummary,
  Goal,
  Achievement,
  ChartPoint,
} from '@/types/carbon';

const DAY = 24 * 60 * 60 * 1000;

type ActivityRow = {
  id: string;
  activityType: string;
  category: string | null;
  description: string | null;
  carbonFootprint: number;
  unit: string;
  activityDate: Date;
  source: string;
  metadata: unknown;
};

export async function GET(request: NextRequest) {
  try {
    // Auth: web session OR verified extension token
    const userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const yearAgo = new Date(now.getTime() - 365 * DAY);

    const [activities, goals, achievements] = await Promise.all([
      prisma.carbonActivity.findMany({
        where: { userId, activityDate: { gte: yearAgo } },
        orderBy: { activityDate: 'desc' },
      }),
      prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.achievement.findMany({
        where: { userId },
        orderBy: { unlockedAt: 'desc' },
      }),
    ]);

    const data: CarbonDashboardData = {
      summary: buildSummary(activities, now),
      activities: activities.slice(0, 20).map(mapActivity),
      goals: goals.map(mapGoal),
      achievements: achievements.map(mapAchievement),
      chart: buildChart(activities, now),
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Carbon dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}

// ---------- helpers ----------

function round(n: number, dp = 2): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

// Sum carbon footprint for activities within [start, end)
function sumWindow(activities: ActivityRow[], start: number, end: number) {
  let value = 0;
  let count = 0;
  for (const a of activities) {
    const t = a.activityDate.getTime();
    if (t >= start && t < end) {
      value += a.carbonFootprint;
      count += 1;
    }
  }
  return { value, count };
}

// % change of current vs previous equal-length window
function pctChange(current: number, previous: number): number {
  if (previous <= 0) return 0;
  return round(((current - previous) / previous) * 100, 1);
}

function buildPeriod(activities: ActivityRow[], nowMs: number, windowMs: number): PeriodSummary {
  const cur = sumWindow(activities, nowMs - windowMs, nowMs);
  const prev = sumWindow(activities, nowMs - 2 * windowMs, nowMs - windowMs);
  return {
    value: round(cur.value),
    count: cur.count,
    change: pctChange(cur.value, prev.value),
  };
}

function buildSummary(activities: ActivityRow[], now: Date) {
  const nowMs = now.getTime();

  // "today" = since local midnight; previous = the day before
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  const todayCur = sumWindow(activities, midnight.getTime(), nowMs);
  const todayPrev = sumWindow(activities, midnight.getTime() - DAY, midnight.getTime());

  return {
    today: {
      value: round(todayCur.value),
      count: todayCur.count,
      change: pctChange(todayCur.value, todayPrev.value),
    },
    week: buildPeriod(activities, nowMs, 7 * DAY),
    month: buildPeriod(activities, nowMs, 30 * DAY),
    year: buildPeriod(activities, nowMs, 365 * DAY),
  };
}

function mapActivity(a: ActivityRow): CarbonActivity {
  const metadata = (a.metadata as Record<string, any>) || {};
  return {
    id: a.id,
    type: a.activityType,
    category: a.category ?? undefined,
    description: a.description ?? '',
    amount: round(a.carbonFootprint, 3),
    timestamp: a.activityDate.toISOString(),
    timeAgo: getTimeAgo(a.activityDate),
    location: metadata.location ?? a.source ?? undefined,
    source: a.source,
  };
}

function mapGoal(g: {
  id: string;
  goalType: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  status: string;
}): Goal {
  return {
    id: g.id,
    title: humanize(g.goalType),
    current: round(g.currentValue),
    target: round(g.targetValue),
    unit: g.unit,
    percentage: g.targetValue > 0 ? round((g.currentValue / g.targetValue) * 100, 1) : 0,
    period: derivePeriod(g.startDate, g.endDate),
    isActive: g.status === 'active',
  };
}

function mapAchievement(a: {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  unlockedAt: Date;
}): Achievement {
  return {
    id: a.id,
    name: a.title,
    description: a.description ?? '',
    icon: a.icon ?? 'award',
    unlockedAt: a.unlockedAt.toISOString(),
  };
}

// Daily emissions for the last 7 days (oldest → newest)
function buildChart(activities: ActivityRow[], now: Date): ChartPoint[] {
  const points: ChartPoint[] = [];
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i--) {
    const dayStart = midnight.getTime() - i * DAY;
    const dayEnd = dayStart + DAY;
    const { value } = sumWindow(activities, dayStart, dayEnd);
    points.push({
      date: new Date(dayStart).toISOString().slice(0, 10),
      emissions: round(value),
    });
  }
  return points;
}

function humanize(slug: string): string {
  return slug
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function derivePeriod(start: Date, end: Date): string {
  const days = Math.round((end.getTime() - start.getTime()) / DAY);
  if (days <= 1) return 'day';
  if (days <= 7) return 'week';
  if (days <= 31) return 'month';
  return 'year';
}

function getTimeAgo(date: Date): string {
  const diffInMinutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  const days = Math.floor(diffInMinutes / 1440);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}
