// AI-Enhanced Carbon Calculation API Endpoint
// Uses DeepSeek V3 via OpenRouter for intelligent activity classification

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { enhancedCarbonCalculation } from '@/lib/ai-carbon-enhancer';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      url, 
      timeOnPage, 
      pageTitle, 
      scrollDepth, 
      clickCount,
      deviceType,
      networkType,
      userAgent,
      location 
    } = body;

    // Validate required fields
    if (!url || !timeOnPage) {
      return NextResponse.json({ 
        error: 'Missing required fields: url, timeOnPage' 
      }, { status: 400 });
    }

    console.log('🤖 Starting DeepSeek V3 (OpenRouter) enhanced carbon calculation for:', url);

    // Prepare user context for AI analysis
    const userContext = {
      pageTitle: pageTitle || '',
      scrollDepth: scrollDepth || 0,
      clickCount: clickCount || 0,
      deviceType: deviceType || 'laptop',
      networkType: networkType || 'wifi',
      userAgent: userAgent || '',
      location: location || { lat: 37.7749, lng: -122.4194, country: 'US' }
    };

    // Get DeepSeek V3-enhanced carbon calculation
    const aiResult = await enhancedCarbonCalculation(url, timeOnPage, userContext);

    // Store the activity in database with AI insights
    const carbonActivity = await prisma.carbonActivity.create({
      data: {
        userId: session.user.id,
        type: aiResult.activityType,
        category: getCategoryFromActivityType(aiResult.activityType),
        amount: aiResult.carbonEmission,
        description: `DeepSeek V3-detected ${aiResult.activityType.toLowerCase().replace('_', ' ')} activity`,
        location: userContext.location.country,
        metadata: JSON.stringify({
          url,
          domain: new URL(url).hostname,
          timeOnPage,
          aiInsights: aiResult.insights,
          aiRecommendations: aiResult.recommendations,
          breakdown: aiResult.breakdown,
          confidence: aiResult.confidence,
          deviceType: userContext.deviceType,
          networkType: userContext.networkType,
          aiModel: 'deepseek-v3-0324-openrouter'
        }),
        timestamp: new Date()
      }
    });

    console.log('✅ DeepSeek V3 (OpenRouter) enhanced activity stored:', carbonActivity.id);

    return NextResponse.json({
      success: true,
      activityId: carbonActivity.id,
      carbonEmission: aiResult.carbonEmission,
      activityType: aiResult.activityType,
      confidence: aiResult.confidence,
      breakdown: aiResult.breakdown,
      insights: aiResult.insights,
      recommendations: aiResult.recommendations,
      metadata: {
        aiModel: 'deepseek-v3-0324-openrouter',
        provider: 'OpenRouter',
        processingTime: 'optimized',
        dataSource: 'comprehensive_datasets'
      }
    });

  } catch (error) {
    console.error('❌ DeepSeek V3 (OpenRouter) enhanced carbon calculation failed:', error);
    
    // Fallback to basic calculation if AI fails
    try {
      const basicEmission = calculateBasicEmission(url, timeOnPage);
      
      const fallbackActivity = await prisma.carbonActivity.create({
        data: {
          userId: session.user.id,
          type: 'OTHER',
          category: 'GENERAL',
          amount: basicEmission,
          description: 'Basic calculation (DeepSeek V3 via OpenRouter unavailable)',
          location: 'Unknown',
          metadata: JSON.stringify({
            url,
            timeOnPage,
            fallback: true,
            error: error.message
          }),
          timestamp: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        activityId: fallbackActivity.id,
        carbonEmission: basicEmission,
        activityType: 'OTHER',
        confidence: 0.5,
        insights: ['Basic calculation used - DeepSeek V3 (OpenRouter) enhancement temporarily unavailable'],
        recommendations: ['Try again later for AI-powered insights'],
        fallback: true
      });
      
    } catch (fallbackError) {
      console.error('❌ Fallback calculation also failed:', fallbackError);
      return NextResponse.json({
        error: 'Carbon calculation failed',
        details: error.message
      }, { status: 500 });
    }
  }
}

// Helper function to map AI activity types to database categories
function getCategoryFromActivityType(activityType: string): string {
  const categoryMap: { [key: string]: string } = {
    'SEARCH': 'GENERAL',
    'SOCIAL_MEDIA': 'ENTERTAINMENT',
    'STREAMING': 'ENTERTAINMENT',
    'SHOPPING': 'E_COMMERCE',
    'AI_INTERACTION': 'WORK',
    'WORK': 'WORK',
    'NEWS': 'GENERAL',
    'GAMING': 'ENTERTAINMENT',
    'OTHER': 'GENERAL'
  };
  
  return categoryMap[activityType] || 'GENERAL';
}

// Basic fallback calculation
function calculateBasicEmission(url: string, timeOnPage: number): number {
  const domain = new URL(url).hostname.toLowerCase();
  
  // Basic emission factors (g CO2)
  const baseEmission = 3.5; // Base website visit
  const timeMultiplier = Math.min(timeOnPage / 60, 10); // Max 10 minutes effect
  
  // Domain-specific multipliers
  let domainMultiplier = 1.0;
  if (domain.includes('youtube') || domain.includes('netflix')) {
    domainMultiplier = 2.5; // Video streaming
  } else if (domain.includes('google') || domain.includes('bing')) {
    domainMultiplier = 0.8; // Search engines
  } else if (domain.includes('facebook') || domain.includes('instagram')) {
    domainMultiplier = 1.5; // Social media
  }
  
  return Math.round((baseEmission * timeMultiplier * domainMultiplier) * 100) / 100;
} 