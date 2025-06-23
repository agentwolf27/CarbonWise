import { NextResponse } from 'next/server';
import { CarbonCalculator } from '@/lib/carbon-calculator';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    // Check authentication
    let userId = null;
    
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      // Try extension authentication
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        // Simple token validation - extract userId from token
        if (token.startsWith('ext_')) {
          const parts = token.split('_');
          if (parts.length >= 2) {
            userId = parts[1];
          }
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
      autoCalculate = true
    } = body;
    
    // Validation
    if (!type || !category || !description) {
      return NextResponse.json({ 
        error: "Missing required fields: type, category, description" 
      }, { status: 400 });
    }
    
    let calculationResult;
    
    if (autoCalculate) {
      // Use AI calculator for intelligent calculation
      const calculationInput = {
        type: type as any,
        category,
        amount,
        description,
        location,
        metadata
      };
      
      calculationResult = CarbonCalculator.calculate(calculationInput);
      
      console.log('🤖 AI Carbon Calculation:', {
        input: calculationInput,
        result: calculationResult
      });
    } else {
      // Use provided amount
      calculationResult = {
        emissions: amount || 0,
        confidence: 0.5,
        factors: ['Manual entry'],
        recommendations: []
      };
    }
    
    return NextResponse.json({
      success: true,
      calculation: {
        emissions: calculationResult.emissions,
        confidence: calculationResult.confidence,
        factors: calculationResult.factors,
        recommendations: calculationResult.recommendations,
        metadata: {
          calculationMethod: autoCalculate ? 'ai_powered' : 'manual',
          timestamp: new Date().toISOString(),
          userId
        }
      }
    });
    
  } catch (error) {
    console.error('Carbon calculation failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Calculation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for bulk calculations
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activities = searchParams.get('activities');
    
    if (!activities) {
      return NextResponse.json({ 
        error: "Missing activities parameter" 
      }, { status: 400 });
    }
    
    const activitiesData = JSON.parse(activities);
    
    if (!Array.isArray(activitiesData)) {
      return NextResponse.json({ 
        error: "Activities must be an array" 
      }, { status: 400 });
    }
    
    const calculations = CarbonCalculator.calculateBatch(activitiesData);
    
    return NextResponse.json({
      success: true,
      calculations: calculations.map((calc, index) => ({
        ...calc,
        originalActivity: activitiesData[index]
      }))
    });
    
  } catch (error) {
    console.error('Batch calculation failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Batch calculation failed' 
      },
      { status: 500 }
    );
  }
} 