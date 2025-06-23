interface CarbonCalculationInput {
  type: 'Shopping' | 'Travel' | 'Food' | 'Transportation' | 'Energy' | 'Digital';
  category: string;
  amount?: number;
  description: string;
  location?: string;
  metadata?: Record<string, any>;
}

interface CarbonCalculationResult {
  emissions: number; // kg CO2
  confidence: number; // 0-1
  factors: string[];
  recommendations: string[];
}

// Carbon emission factors (kg CO2 per unit)
const CARBON_FACTORS = {
  // Shopping (per $ spent)
  shopping: {
    'amazon': { base: 0.5, categories: { 'electronics': 1.2, 'clothing': 0.8, 'books': 0.3 }},
    'default': 0.4
  },
  
  // Transportation (per km)
  transportation: {
    'uber': { car: 0.21, premium: 0.35, suv: 0.45 },
    'lyft': { shared: 0.15, standard: 0.21 },
    'flight': { domestic: 0.255, international: 0.285 },
    'default': 0.2
  },
  
  // Food delivery (per order)
  food: {
    'doordash': 3.2,
    'ubereats': 3.0,
    'grubhub': 3.5,
    'default': 3.0
  },
  
  // Travel (per night/booking)
  travel: {
    'hotel': 12.0,
    'airbnb': 8.5,
    'flight': 250.0,
    'default': 10.0
  },
  
  // Digital services (per hour)
  digital: {
    'streaming': 0.0036, // Netflix, YouTube
    'gaming': 0.012,
    'social': 0.0024,
    'default': 0.003
  }
};

// Regional multipliers for location-based adjustments
const REGIONAL_FACTORS = {
  'US': 1.0,
  'EU': 0.8,
  'China': 1.3,
  'India': 1.1,
  'default': 1.0
};

export class CarbonCalculator {
  
  /**
   * Main calculation method using hybrid AI approach
   */
  static calculate(input: CarbonCalculationInput): CarbonCalculationResult {
    const baseEmission = this.getBaseEmission(input);
    const categoryAdjustment = this.getCategoryAdjustment(input);
    const locationAdjustment = this.getLocationAdjustment(input.location);
    const intelligentAdjustment = this.getIntelligentAdjustment(input);
    
    const emissions = baseEmission * categoryAdjustment * locationAdjustment * intelligentAdjustment;
    const confidence = this.calculateConfidence(input);
    const factors = this.getEmissionFactors(input);
    const recommendations = this.generateRecommendations(input, emissions);
    
    return {
      emissions: Math.round(emissions * 100) / 100,
      confidence,
      factors,
      recommendations
    };
  }
  
  private static getBaseEmission(input: CarbonCalculationInput): number {
    const type = input.type.toLowerCase();
    const category = input.category.toLowerCase();
    
    switch (type) {
      case 'shopping':
        return this.calculateShoppingEmission(input);
      case 'transportation':
        return this.calculateTransportationEmission(input);
      case 'food':
        return this.calculateFoodEmission(input);
      case 'travel':
        return this.calculateTravelEmission(input);
      case 'digital':
        return this.calculateDigitalEmission(input);
      default:
        return 1.0; // Default emission
    }
  }
  
  private static calculateShoppingEmission(input: CarbonCalculationInput): number {
    const platform = input.category.toLowerCase();
    const amount = input.amount || 50; // Default $50 order
    
    if (CARBON_FACTORS.shopping[platform]) {
      const platformFactor = CARBON_FACTORS.shopping[platform];
      let factor = platformFactor.base;
      
      // Apply category-specific multipliers using NLP-like keyword matching
      if (platformFactor.categories && input.description) {
        const description = input.description.toLowerCase();
        for (const [category, multiplier] of Object.entries(platformFactor.categories)) {
          if (description.includes(category)) {
            factor = multiplier;
            break;
          }
        }
      }
      
      return amount * factor;
    }
    
    return amount * CARBON_FACTORS.shopping.default;
  }
  
  private static calculateTransportationEmission(input: CarbonCalculationInput): number {
    const service = input.category.toLowerCase();
    const distance = input.metadata?.distance || 10; // Default 10km
    const vehicleType = input.metadata?.vehicleType || 'standard';
    
    if (CARBON_FACTORS.transportation[service]) {
      const serviceFactor = CARBON_FACTORS.transportation[service];
      const factor = typeof serviceFactor === 'object' 
        ? serviceFactor[vehicleType] || serviceFactor.standard || serviceFactor.car
        : serviceFactor;
      
      return distance * factor;
    }
    
    return distance * CARBON_FACTORS.transportation.default;
  }
  
  private static calculateFoodEmission(input: CarbonCalculationInput): number {
    const service = input.category.toLowerCase();
    const orders = input.metadata?.orders || 1;
    
    const factor = CARBON_FACTORS.food[service] || CARBON_FACTORS.food.default;
    return orders * factor;
  }
  
  private static calculateTravelEmission(input: CarbonCalculationInput): number {
    const type = input.metadata?.type || 'hotel';
    const nights = input.metadata?.nights || 1;
    const passengers = input.metadata?.passengers || 1;
    
    const factor = CARBON_FACTORS.travel[type] || CARBON_FACTORS.travel.default;
    return nights * passengers * factor;
  }
  
  private static calculateDigitalEmission(input: CarbonCalculationInput): number {
    const service = input.category.toLowerCase();
    const hours = input.metadata?.hours || 2; // Default 2 hours
    
    const factor = CARBON_FACTORS.digital[service] || CARBON_FACTORS.digital.default;
    return hours * factor;
  }
  
  private static getCategoryAdjustment(input: CarbonCalculationInput): number {
    // Machine learning-like adjustments based on patterns
    if (input.description?.toLowerCase().includes('express') || 
        input.description?.toLowerCase().includes('rush')) {
      return 1.3; // Express delivery has higher emissions
    }
    
    if (input.description?.toLowerCase().includes('bulk') || 
        input.description?.toLowerCase().includes('wholesale')) {
      return 0.8; // Bulk orders are more efficient
    }
    
    return 1.0;
  }
  
  private static getLocationAdjustment(location?: string): number {
    if (!location) return 1.0;
    
    // Extract country code or use pattern matching
    for (const [region, factor] of Object.entries(REGIONAL_FACTORS)) {
      if (location.toUpperCase().includes(region)) {
        return factor;
      }
    }
    
    return REGIONAL_FACTORS.default;
  }
  
  private static getIntelligentAdjustment(input: CarbonCalculationInput): number {
    // AI-like intelligent adjustments based on context
    let adjustment = 1.0;
    
    // Time-based adjustments
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
      adjustment *= 1.1; // Night deliveries have higher emissions
    }
    
    // Weather-based adjustments (simplified)
    if (input.metadata?.weather === 'bad') {
      adjustment *= 1.2;
    }
    
    // Weekend adjustments
    const isWeekend = [0, 6].includes(new Date().getDay());
    if (isWeekend && input.type === 'Food') {
      adjustment *= 1.15; // Weekend food delivery is less efficient
    }
    
    return adjustment;
  }
  
  private static calculateConfidence(input: CarbonCalculationInput): number {
    let confidence = 0.7; // Base confidence
    
    // Increase confidence if we have more data
    if (input.amount) confidence += 0.1;
    if (input.location) confidence += 0.1;
    if (input.metadata && Object.keys(input.metadata).length > 0) confidence += 0.1;
    
    // Decrease confidence for unknown categories
    if (!this.isKnownCategory(input)) confidence -= 0.2;
    
    return Math.min(1.0, Math.max(0.1, confidence));
  }
  
  private static isKnownCategory(input: CarbonCalculationInput): boolean {
    const type = input.type.toLowerCase();
    const category = input.category.toLowerCase();
    
    switch (type) {
      case 'shopping':
        return category in CARBON_FACTORS.shopping || category === 'default';
      case 'transportation':
        return category in CARBON_FACTORS.transportation || category === 'default';
      case 'food':
        return category in CARBON_FACTORS.food || category === 'default';
      case 'travel':
        return true; // Travel is flexible
      case 'digital':
        return category in CARBON_FACTORS.digital || category === 'default';
      default:
        return false;
    }
  }
  
  private static getEmissionFactors(input: CarbonCalculationInput): string[] {
    const factors = [];
    
    factors.push(`Base ${input.type.toLowerCase()} emission factor`);
    
    if (input.location) {
      factors.push('Regional energy grid adjustment');
    }
    
    if (input.metadata?.vehicleType) {
      factors.push(`Vehicle type: ${input.metadata.vehicleType}`);
    }
    
    if (input.description?.toLowerCase().includes('express')) {
      factors.push('Express delivery premium');
    }
    
    return factors;
  }
  
  private static generateRecommendations(input: CarbonCalculationInput, emissions: number): string[] {
    const recommendations = [];
    
    if (emissions > 10) {
      recommendations.push('Consider consolidating orders to reduce delivery emissions');
    }
    
    if (input.type === 'Transportation' && emissions > 5) {
      recommendations.push('Try carpooling or public transport for lower emissions');
    }
    
    if (input.type === 'Food' && emissions > 3) {
      recommendations.push('Choose restaurants closer to you or pick up orders yourself');
    }
    
    if (input.type === 'Shopping') {
      recommendations.push('Look for eco-friendly packaging options');
    }
    
    return recommendations;
  }
  
  /**
   * Batch calculation for multiple activities
   */
  static calculateBatch(inputs: CarbonCalculationInput[]): CarbonCalculationResult[] {
    return inputs.map(input => this.calculate(input));
  }
  
  /**
   * Get emission trends and predictions (future AI feature)
   */
  static predictEmissions(historicalData: any[], days: number = 30): { predicted: number; trend: 'increasing' | 'decreasing' | 'stable' } {
    // Simplified trend analysis - in production, use actual ML
    if (historicalData.length < 2) {
      return { predicted: 0, trend: 'stable' };
    }
    
    const recent = historicalData.slice(-7); // Last 7 days
    const older = historicalData.slice(-14, -7); // Previous 7 days
    
    const recentAvg = recent.reduce((sum, day) => sum + day.emissions, 0) / recent.length;
    const olderAvg = older.reduce((sum, day) => sum + day.emissions, 0) / (older.length || 1);
    
    const predicted = recentAvg * days;
    const trend = recentAvg > olderAvg * 1.1 ? 'increasing' : 
                  recentAvg < olderAvg * 0.9 ? 'decreasing' : 'stable';
    
    return { predicted, trend };
  }
} 