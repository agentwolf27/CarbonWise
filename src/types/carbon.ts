export interface CarbonActivity {
  id: number;
  type: string;
  category: string;
  amount: number;
  timestamp: Date;
  description: string;
  location: string;
  timeAgo?: string;
}

export interface CarbonSummary {
  today: {
    value: number;
    change: number;
    activities: number;
  };
  week: {
    value: number;
    change: number;
    activities: number;
  };
  month: {
    value: number;
    change: number;
    activities: number;
  };
  year: {
    value: number;
    change: number;
    activities: number;
  };
}

export interface ChartData {
  labels: string[];
  data: number[];
}

export interface Goal {
  id: number;
  title: string;
  current: number;
  target: number;
  unit: string;
  percentage: number;
}

export interface CarbonDashboardData {
  summary: CarbonSummary;
  chart: ChartData;
  recentActivities: CarbonActivity[];
  goals: Goal[];
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