// Shared types for the carbon dashboard.
// These mirror the shape returned by /api/carbon and the useCarbonData hook.

export interface CarbonActivity {
  id: string;
  type: string;
  category?: string;
  description: string;
  amount: number; // kg CO2
  timestamp: string;
  timeAgo?: string;
  location?: string;
  source?: string;
}

export interface PeriodSummary {
  value: number; // kg CO2
  count: number;
  change: number; // % change vs previous period
}

export interface CarbonSummary {
  today: PeriodSummary;
  week: PeriodSummary;
  month: PeriodSummary;
  year: PeriodSummary;
}

export interface ChartPoint {
  date: string;
  emissions: number; // kg CO2
}

// Legacy {labels, data} shape (kept for any chart utility that still uses it)
export interface ChartData {
  labels: string[];
  data: number[];
}

export interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  percentage: number;
  period?: string;
  isActive?: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface CarbonDashboardData {
  summary: CarbonSummary;
  activities: CarbonActivity[];
  goals: Goal[];
  achievements: Achievement[];
  chart: ChartPoint[];
}

export interface CarbonApiResponse {
  success: boolean;
  data?: CarbonDashboardData;
  error?: string;
}

export interface NewCarbonActivity {
  type: string;
  category: string;
  amount: number;
  description: string;
  location: string;
}
