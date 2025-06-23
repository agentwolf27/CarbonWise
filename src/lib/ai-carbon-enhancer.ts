// AI-Enhanced Carbon Footprint Calculator
// Integrates multiple AI APIs for improved accuracy and intelligence

import OpenAI from 'openai';

interface CarbonCalculationInput {
  url: string;
  domain: string;
  pageTitle: string;
  timeOnPage: number;
  scrollDepth: number;
  clickCount: number;
  deviceType: string;
  networkType: string;
  location: {
    lat: number;
    lng: number;
    country: string;
  };
  userAgent: string;
  timestamp: Date;
}

interface AIEnhancedResult {
  carbonEmission: number;
  activityType: string;
  confidence: number;
  breakdown: {
    deviceEnergy: number;
    networkTransfer: number;
    serverProcessing: number;
    aiProcessing?: number;
  };
  insights: string[];
  recommendations: string[];
}

export class AIEnhancedCarbonCalculator {
  private openai: OpenAI;
  private climatiqApiKey: string;
  private websiteEnergyDb: any[];
  private deviceEnergyDb: any[];

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.climatiqApiKey = process.env.CLIMATIQ_API_KEY || '';
    this.loadDatabases();
  }

  private loadDatabases() {
    // Load our training datasets
    try {
      this.websiteEnergyDb = require('../../training-data/website-energy-database.json');
      this.deviceEnergyDb = require('../../training-data/device-energy-consumption.json');
    } catch (error) {
      console.warn('Training datasets not found, using fallback data');
      this.websiteEnergyDb = [];
      this.deviceEnergyDb = [];
    }
  }

  // Main AI-enhanced calculation method
  async calculateEnhancedCarbon(input: CarbonCalculationInput): Promise<AIEnhancedResult> {
    try {
      // Step 1: Basic calculation using our database
      const baseCalculation = this.calculateBaseCarbon(input);
      
      // Step 2: AI-enhanced activity classification
      const activityClassification = await this.classifyActivityWithAI(input);
      
      // Step 3: Real-time emission factors from Climatiq
      const realTimeFactors = await this.getRealTimeEmissionFactors(input.location.country);
      
      // Step 4: AI-generated insights and recommendations
      const insights = await this.generateAIInsights(input, baseCalculation);
      
      // Step 5: Combine all data for final result
      const enhancedResult = this.combineCalculations(
        baseCalculation,
        activityClassification,
        realTimeFactors,
        insights
      );

      return enhancedResult;
    } catch (error) {
      console.error('AI-enhanced calculation failed:', error);
      // Fallback to basic calculation
      return this.getFallbackCalculation(input);
    }
  }

  // Basic carbon calculation using our datasets
  private calculateBaseCarbon(input: CarbonCalculationInput) {
    // Find website in our database
    const websiteData = this.websiteEnergyDb.find(site => 
      input.domain.includes(site.domain.replace('www.', ''))
    );

    // Find device energy consumption
    const deviceData = this.deviceEnergyDb.find(device => 
      input.deviceType.toLowerCase().includes(device.category)
    );

    // Calculate base emissions
    const websiteEmission = websiteData ? websiteData.co2_per_visit_g : 3.5; // Default
    const deviceEmission = deviceData ? 
      (deviceData.browsing_watts * input.timeOnPage / 3600 * 0.709) : 2.1; // Default
    
    const networkEmission = this.calculateNetworkEmission(input);
    
    return {
      total: websiteEmission + deviceEmission + networkEmission,
      website: websiteEmission,
      device: deviceEmission,
      network: networkEmission,
      confidence: websiteData && deviceData ? 0.8 : 0.6
    };
  }

  // AI-powered activity classification
  private async classifyActivityWithAI(input: CarbonCalculationInput) {
    const prompt = `
    Analyze this web activity and classify it for carbon footprint calculation:
    
    URL: ${input.url}
    Domain: ${input.domain}
    Page Title: ${input.pageTitle}
    Time on Page: ${input.timeOnPage}s
    Scroll Depth: ${input.scrollDepth}%
    Clicks: ${input.clickCount}
    
    Classify this activity into one of these categories:
    1. SEARCH - Web searches
    2. SOCIAL_MEDIA - Social platforms, messaging
    3. STREAMING - Video/audio streaming
    4. SHOPPING - E-commerce, browsing products
    5. AI_INTERACTION - ChatGPT, Claude, AI tools
    6. WORK - Productivity, email, documents
    7. NEWS - Reading news, articles
    8. GAMING - Online games
    9. OTHER - Anything else
    
    Also estimate the carbon intensity (LOW/MEDIUM/HIGH) based on:
    - Page complexity and resource usage
    - User interaction level
    - Likely backend processing requirements
    
    Respond with JSON: {"category": "...", "intensity": "...", "reasoning": "..."}
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: "o4-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        category: result.category || 'OTHER',
        intensity: result.intensity || 'MEDIUM',
        reasoning: result.reasoning || '',
        confidence: 0.85
      };
    } catch (error) {
      console.error('AI classification failed:', error);
      return {
        category: this.fallbackClassification(input.domain),
        intensity: 'MEDIUM',
        reasoning: 'Fallback classification',
        confidence: 0.5
      };
    }
  }

  // Get real-time emission factors from Climatiq API
  private async getRealTimeEmissionFactors(country: string) {
    if (!this.climatiqApiKey) {
      return { electricityFactor: 0.709, confidence: 0.3 }; // US average fallback
    }

    try {
      const response = await fetch('https://api.climatiq.io/data/v1/emission-factors', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.climatiqApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Extract electricity emission factor for the country
        const electricityFactor = this.extractElectricityFactor(data, country);
        return { electricityFactor, confidence: 0.9 };
      }
    } catch (error) {
      console.error('Climatiq API failed:', error);
    }

    return { electricityFactor: 0.709, confidence: 0.3 };
  }

  // Generate AI insights and recommendations
  private async generateAIInsights(input: CarbonCalculationInput, calculation: any) {
    const prompt = `
    Based on this web activity carbon calculation, provide insights and recommendations:
    
    Activity: ${input.domain} for ${input.timeOnPage}s
    Carbon Emission: ${calculation.total.toFixed(2)}g CO2
    Device: ${input.deviceType}
    
    Provide:
    1. 2-3 brief insights about this activity's environmental impact
    2. 2-3 actionable recommendations to reduce emissions
    
    Keep responses concise and practical. Focus on digital behavior changes.
    
    Respond with JSON: {
      "insights": ["insight1", "insight2"],
      "recommendations": ["rec1", "rec2"]
    }
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: "o4-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        insights: result.insights || [],
        recommendations: result.recommendations || []
      };
    } catch (error) {
      console.error('AI insights generation failed:', error);
      return {
        insights: ['This activity contributed to your digital carbon footprint'],
        recommendations: ['Consider reducing time on high-emission websites']
      };
    }
  }

  // Combine all calculations and AI insights
  private combineCalculations(
    baseCalculation: any,
    activityClassification: any,
    realTimeFactors: any,
    insights: any
  ): AIEnhancedResult {
    // Adjust base calculation based on AI classification
    const intensityMultipliers = {
      'LOW': 0.7,
      'MEDIUM': 1.0,
      'HIGH': 1.4
    };

    const intensityMultiplier = intensityMultipliers[activityClassification.intensity as keyof typeof intensityMultipliers] || 1.0;
    const adjustedEmission = baseCalculation.total * intensityMultiplier;

    // Apply real-time electricity factors
    const deviceAdjustedEmission = baseCalculation.device * (realTimeFactors.electricityFactor / 0.709);
    
    const finalEmission = baseCalculation.website + deviceAdjustedEmission + baseCalculation.network;

    return {
      carbonEmission: Math.round(finalEmission * 100) / 100,
      activityType: activityClassification.category,
      confidence: Math.min(
        baseCalculation.confidence,
        activityClassification.confidence,
        realTimeFactors.confidence
      ),
      breakdown: {
        deviceEnergy: Math.round(deviceAdjustedEmission * 100) / 100,
        networkTransfer: Math.round(baseCalculation.network * 100) / 100,
        serverProcessing: Math.round(baseCalculation.website * 100) / 100,
        aiProcessing: activityClassification.category === 'AI_INTERACTION' ? 
          Math.round(finalEmission * 0.3 * 100) / 100 : undefined
      },
      insights: insights.insights,
      recommendations: insights.recommendations
    };
  }

  // Helper methods
  private calculateNetworkEmission(input: CarbonCalculationInput): number {
    // Estimate data transfer based on time on page and activity
    const estimatedDataMB = Math.min(input.timeOnPage * 0.1, 50); // Max 50MB
    
    const networkEmissionFactors = {
      'wifi': 0.05,
      '4g': 0.18,
      '5g': 0.08,
      'ethernet': 0.03
    };

    const factor = networkEmissionFactors[input.networkType as keyof typeof networkEmissionFactors] || 0.12;
    return estimatedDataMB * factor;
  }

  private fallbackClassification(domain: string): string {
    if (domain.includes('google') || domain.includes('bing')) return 'SEARCH';
    if (domain.includes('youtube') || domain.includes('netflix')) return 'STREAMING';
    if (domain.includes('facebook') || domain.includes('twitter')) return 'SOCIAL_MEDIA';
    if (domain.includes('amazon') || domain.includes('shop')) return 'SHOPPING';
    if (domain.includes('openai') || domain.includes('claude')) return 'AI_INTERACTION';
    return 'OTHER';
  }

  private extractElectricityFactor(data: any, country: string): number {
    // Extract electricity emission factor from Climatiq response
    // This is a simplified implementation
    const countryFactors: { [key: string]: number } = {
      'US': 0.709,
      'UK': 0.233,
      'DE': 0.401,
      'FR': 0.056,
      'CA': 0.130,
      'AU': 0.81
    };
    
    return countryFactors[country] || 0.709;
  }

  private getFallbackCalculation(input: CarbonCalculationInput): AIEnhancedResult {
    return {
      carbonEmission: 3.5,
      activityType: 'OTHER',
      confidence: 0.3,
      breakdown: {
        deviceEnergy: 1.5,
        networkTransfer: 1.0,
        serverProcessing: 1.0
      },
      insights: ['Basic calculation used due to AI service unavailability'],
      recommendations: ['Enable AI features for personalized recommendations']
    };
  }
}

// Enhanced API endpoint integration
export async function enhancedCarbonCalculation(
  url: string,
  timeOnPage: number,
  userContext: any
) {
  const calculator = new AIEnhancedCarbonCalculator();
  
  const input: CarbonCalculationInput = {
    url,
    domain: new URL(url).hostname,
    pageTitle: userContext.pageTitle || '',
    timeOnPage,
    scrollDepth: userContext.scrollDepth || 0,
    clickCount: userContext.clickCount || 0,
    deviceType: userContext.deviceType || 'laptop',
    networkType: userContext.networkType || 'wifi',
    location: userContext.location || { lat: 37.7749, lng: -122.4194, country: 'US' },
    userAgent: userContext.userAgent || '',
    timestamp: new Date()
  };

  return await calculator.calculateEnhancedCarbon(input);
} 