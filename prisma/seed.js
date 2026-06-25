/*
 * CarbonWise database seed.
 *
 * Usage:
 *   npm run db:seed                       # seeds the most-recent user (or a demo user)
 *   SEED_USER_EMAIL=you@gmail.com npm run db:seed   # seeds the user you log in as
 *
 * Run this AFTER you've logged into the app at least once (so your user row
 * exists) and pass SEED_USER_EMAIL with your Google email, so the dashboard
 * you see is populated for *your* account.
 */

const path = require('path');
// Load .env first, then .env.local (local overrides), mirroring Next.js.
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local'), override: true });

const url = process.env.DATABASE_URL || '';
if (!url || url.includes('YOUR_DB_HOST') || url.includes('[')) {
  console.error('\n❌ DATABASE_URL is not pointing at a real database.');
  console.error('   Current value:', url || '(empty)');
  console.error('   Fix DATABASE_URL in .env.local (it currently has a placeholder) and re-run.\n');
  process.exit(1);
}

const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

async function main() {
  // 1) Resolve which user to seed
  const email = process.env.SEED_USER_EMAIL;
  let user;
  if (email) {
    user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: email.split('@')[0], accountType: 'INDIVIDUAL' },
    });
  } else {
    user = await prisma.user.findFirst({ orderBy: { createdAt: 'desc' } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: 'demo@carbonwise.local', name: 'Demo User', accountType: 'INDIVIDUAL' },
      });
    }
  }
  console.log(`🌱 Seeding data for user: ${user.email} (${user.id})`);

  // 2) Clear previously-seeded sample activities so re-running stays idempotent
  await prisma.carbonActivity.deleteMany({
    where: { userId: user.id, metadata: { path: ['seeded'], equals: true } },
  });

  // 3) Sample activities (kg CO2), spread across the past week
  const activities = [
    { activityType: 'STREAMING',      category: 'ENTERTAINMENT', description: 'Watched Netflix in HD for 2 hours', carbonFootprint: 0.84,  daysAgo: 0, source: 'extension', aiEnhanced: true,  aiConfidence: 0.82, location: 'Chrome Browser' },
    { activityType: 'AI_INTERACTION', category: 'WORK',          description: 'Used DeepSeek AI assistant',          carbonFootprint: 0.025, daysAgo: 0, source: 'extension', aiEnhanced: true,  aiConfidence: 0.78, location: 'Extension' },
    { activityType: 'SHOPPING',       category: 'E_COMMERCE',    description: 'Browsed Amazon for electronics',       carbonFootprint: 0.31,  daysAgo: 1, source: 'extension', aiEnhanced: true,  aiConfidence: 0.70, location: 'Chrome Browser' },
    { activityType: 'SOCIAL_MEDIA',   category: 'ENTERTAINMENT', description: 'Scrolled social feeds',                carbonFootprint: 0.12,  daysAgo: 2, source: 'manual',    aiEnhanced: false, aiConfidence: null, location: 'Mobile' },
    { activityType: 'SEARCH',         category: 'GENERAL',       description: 'A batch of web searches',              carbonFootprint: 0.05,  daysAgo: 3, source: 'extension', aiEnhanced: false, aiConfidence: null, location: 'Chrome Browser' },
    { activityType: 'STREAMING',      category: 'ENTERTAINMENT', description: 'YouTube videos',                       carbonFootprint: 0.40,  daysAgo: 5, source: 'extension', aiEnhanced: true,  aiConfidence: 0.75, location: 'Chrome Browser' },
  ];

  for (const a of activities) {
    await prisma.carbonActivity.create({
      data: {
        userId: user.id,
        activityType: a.activityType,
        category: a.category,
        description: a.description,
        carbonFootprint: a.carbonFootprint,
        unit: 'kg_co2',
        source: a.source,
        aiEnhanced: a.aiEnhanced,
        aiConfidence: a.aiConfidence,
        activityDate: new Date(now - a.daysAgo * DAY),
        metadata: { location: a.location, seeded: true },
      },
    });
  }
  console.log(`   ✓ ${activities.length} sample activities`);

  // 4) Achievements (idempotent via the [userId, achievementType] unique key)
  const achievements = [
    { achievementType: 'first_activity', title: 'First Steps',    description: 'Tracked your first carbon activity', icon: 'leaf',   points: 10 },
    { achievementType: 'extension_user', title: 'Extension User', description: 'Connected the Chrome extension',     icon: 'chrome', points: 20 },
  ];
  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { userId_achievementType: { userId: user.id, achievementType: ach.achievementType } },
      create: { userId: user.id, ...ach },
      update: {},
    });
  }
  console.log(`   ✓ ${achievements.length} achievements`);

  // 5) A weekly goal (create only if one of this type doesn't already exist)
  const goalType = 'weekly_carbon_reduction';
  const existingGoal = await prisma.goal.findFirst({ where: { userId: user.id, goalType } });
  if (!existingGoal) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    await prisma.goal.create({
      data: {
        userId: user.id,
        goalType,
        targetValue: 20,
        currentValue: 1.74,
        unit: 'kg_co2',
        startDate: start,
        endDate: new Date(start.getTime() + 7 * DAY),
        status: 'active',
      },
    });
    console.log('   ✓ 1 weekly goal');
  } else {
    console.log('   • weekly goal already exists, skipped');
  }

  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
