// AI-Enhanced Carbon Calculation API Endpoint
// Uses DeepSeek V3 via OpenRouter for intelligent activity classification.
// Accepts both web-app sessions and Chrome-extension Bearer tokens.

import { NextRequest, NextResponse } from 'next/server';
import { enhancedCarbonCalculation } from '@/lib/ai-carbon-enhancer';
import { prisma } from '@/lib/prisma';
import { resolveUserId } from '@/lib/extension-auth';

export async function POST(request: NextRequest) {
  // Hoisted so the catch block can still build a fallback record if the
  // AI/Climatiq step throws after we've parsed the body.
  let userId: string | null = null;
  let url: string | undefined;
  let timeOnPage: number | undefined;

  try {
    // Auth: web session OR verified extension token
    userId = await resolveUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    url = body.url;
    timeOnPage = body.timeOnPage;
    const { pageTitle, scrollDepth, clickCount, deviceType, networkType, userAgent, location } = body;

    if (!url || !timeOnPage) {
      return NextResponse.json(
        { error: 'Missing required fields: url, timeOnPage' },
        { status: 400 }
      );
    }

    console.log('🤖 Starting DeepSeek V3 (OpenRouter) enhanced carbon calculation for:', url);

    const userContext = {
      pageTitle: pageTitle || '',
      scrollDepth: scrollDepth || 0,
      clickCount: clickCount || 0,
      deviceType: deviceType || 'laptop',
      networkType: networkType || 'wifi',
      userAgent: userAgent || '',
      location: location || { lat: 37.7749, lng: -122.4194, country: 'US' },
    };

    const aiResult = await enhancedCarbonCalculation(url, timeOnPage, userContext);

    // The AI enhancer works in grams; the rest of the app standardizes on
    // kilograms (kg_co2), so convert at the storage boundary.
    const carbonKg = gramsToKg(aiResult.carbonEmission);
    const breakdownKg = breakdownToKg(aiResult.breakdown);

    // Persist using the ACTUAL Prisma CarbonActivity schema fields.
    const carbonActivity = await prisma.carbonActivity.create({
      data: {
        userId,
        activityType: aiResult.activityType,
        category: getCategoryFromActivityType(aiResult.activityType),
        carbonFootprint: carbonKg,
        unit: 'kg_co2',
        description: `Auto-detected ${aiResult.activityType.toLowerCase().replace(/_/g, ' ')} activity`,
        source: 'extension',
        aiEnhanced: true,
        aiConfidence: aiResult.confidence,
        metadata: {
          url,
          domain: new URL(url).hostname,
          timeOnPage,
          country: userContext.location.country,
          aiInsights: aiResult.insights,
          aiRecommendations: aiResult.recommendations,
          breakdown: breakdownKg,
          deviceType: userContext.deviceType,
          networkType: userContext.networkType,
          aiModel: 'deepseek-v3-0324-openrouter',
        },
      },
    });

    console.log('✅ Enhanced activity stored:', carbonActivity.id);

    return NextResponse.json({
      success: true,
      activityId: carbonActivity.id,
      carbonEmission: carbonKg,
      unit: 'kg_co2',
      activityType: aiResult.activityType,
      confidence: aiResult.confidence,
      breakdown: breakdownKg,
      insights: aiResult.insights,
      recommendations: aiResult.recommendations,
      metadata: {
        aiModel: 'deepseek-v3-0324-openrouter',
        provider: 'OpenRouter',
        dataSource: 'comprehensive_datasets',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ AI-enhanced carbon calculation failed:', message);

    // Fallback: still record a basic estimate, but only if we got far enough
    // to know the user and the page being measured.
    if (userId && url && timeOnPage) {
      try {
        const basicKg = gramsToKg(calculateBasicEmission(url, timeOnPage));

        const fallbackActivity = await prisma.carbonActivity.create({
          data: {
            userId,
            activityType: 'OTHER',
            category: 'GENERAL',
            carbonFootprint: basicKg,
            unit: 'kg_co2',
            description: 'Basic calculation (AI enhancement unavailable)',
            source: 'extension',
            aiEnhanced: false,
            metadata: { url, timeOnPage, fallback: true, error: message },
          },
        });

        return NextResponse.json({
          success: true,
          activityId: fallbackActivity.id,
          carbonEmission: basicKg,
          unit: 'kg_co2',
          activityType: 'OTHER',
          confidence: 0.5,
          insights: ['Basic calculation used - AI enhancement temporarily unavailable'],
          recommendations: ['Try again later for AI-powered insights'],
          fallback: true,
        });
      } catch (fallbackError) {
        const fbMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown error';
        console.error('❌ Fallback calculation also failed:', fbMessage);
      }
    }

    return NextResponse.json(
      { error: 'Carbon calculation failed', details: message },
      { status: 500 }
    );
  }
}

// Unit conversion helpers — the digital pipeline computes grams of CO2,
// but the app standardizes on kilograms (kg_co2).
function gramsToKg(grams: number): number {
  return Math.round((grams / 1000) * 1e6) / 1e6; // keep 6 dp precision for small values
}

function breakdownToKg(breakdown: {
  deviceEnergy: number;
  networkTransfer: number;
  serverProcessing: number;
  aiProcessing?: number;
}) {
  return {
    deviceEnergy: gramsToKg(breakdown.deviceEnergy),
    networkTransfer: gramsToKg(breakdown.networkTransfer),
    serverProcessing: gramsToKg(breakdown.serverProcessing),
    ...(breakdown.aiProcessing !== undefined
      ? { aiProcessing: gramsToKg(breakdown.aiProcessing) }
      : {}),
  };
}

// Map AI activity types to database categories
function getCategoryFromActivityType(activityType: string): string {
  const categoryMap: { [key: string]: string } = {
    SEARCH: 'GENERAL',
    SOCIAL_MEDIA: 'ENTERTAINMENT',
    STREAMING: 'ENTERTAINMENT',
    SHOPPING: 'E_COMMERCE',
    AI_INTERACTION: 'WORK',
    WORK: 'WORK',
    NEWS: 'GENERAL',
    GAMING: 'ENTERTAINMENT',
    OTHER: 'GENERAL',
  };
  return categoryMap[activityType] || 'GENERAL';
}

// Basic fallback calculation (grams CO2)
function calculateBasicEmission(url: string, timeOnPage: number): number {
  const domain = new URL(url).hostname.toLowerCase();
  const baseEmission = 3.5;
  const timeMultiplier = Math.min(timeOnPage / 60, 10);

  let domainMultiplier = 1.0;
  if (domain.includes('youtube') || domain.includes('netflix')) {
    domainMultiplier = 2.5;
  } else if (domain.includes('google') || domain.includes('bing')) {
    domainMultiplier = 0.8;
  } else if (domain.includes('facebook') || domain.includes('instagram')) {
    domainMultiplier = 1.5;
  }

  return Math.round(baseEmission * timeMultiplier * domainMultiplier * 100) / 100;
}
