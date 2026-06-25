'use client';

import { useState, useEffect } from 'react';
import type { CarbonDashboardData, CarbonApiResponse } from '@/types/carbon';

// Mock data for when database is not available
const getMockData = (): CarbonDashboardData => ({
  summary: {
    today: {
      value: 2.4,
      count: 3,
      change: 12
    },
    week: {
      value: 15.7,
      count: 18,
      change: -8
    },
    month: {
      value: 67.2,
      count: 89,
      change: 5
    },
    year: {
      value: 524.8,
      count: 672,
      change: -15
    }
  },
  activities: [
    {
      id: '1',
      type: 'Video Streaming',
      description: 'Watched Netflix for 2 hours',
      amount: 0.84,
      timestamp: new Date().toISOString(),
      timeAgo: 'just now',
      location: 'Chrome Browser',
      source: 'manual'
    },
    {
      id: '2',
      type: 'Cloud Computing',
      description: 'Used DeepSeek AI for 30 minutes',
      amount: 0.025,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      timeAgo: '1 hour ago',
      location: 'Extension',
      source: 'extension'
    },
    {
      id: '3',
      type: 'Data Transfer',
      description: 'Uploaded 500MB to cloud storage',
      amount: 0.15,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      timeAgo: '2 hours ago',
      location: 'Google Drive',
      source: 'manual'
    }
  ],
  goals: [
    {
      id: '1',
      title: 'Weekly Emission Goal',
      target: 20.0,
      current: 15.7,
      unit: 'kg CO₂',
      percentage: 78.5,
      period: 'week',
      isActive: true
    }
  ],
  achievements: [
    {
      id: '1',
      name: 'First Steps',
      description: 'Logged your first carbon activity',
      icon: 'leaf',
      unlockedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Extension User',
      description: 'Connected the Chrome extension',
      icon: 'chrome',
      unlockedAt: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  chart: [
    { date: '2025-06-20', emissions: 2.1 },
    { date: '2025-06-21', emissions: 3.4 },
    { date: '2025-06-22', emissions: 1.8 },
    { date: '2025-06-23', emissions: 4.2 },
    { date: '2025-06-24', emissions: 2.9 },
    { date: '2025-06-25', emissions: 3.1 },
    { date: '2025-06-26', emissions: 2.4 }
  ]
});

export function useCarbonData() {
  const [data, setData] = useState<CarbonDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/carbon');
      const result: CarbonApiResponse = await response.json();
      
      if (!response.ok || !result.success) {
        // If API fails, use mock data during development
        console.warn('Carbon API not available, using mock data for development');
        setData(getMockData());
        return;
      }
      
      if (result.data) {
        setData(result.data);
      }
    } catch (err) {
      console.warn('Error fetching carbon data, using mock data:', err);
      // Use mock data when database is not available
      setData(getMockData());
      setError(null); // Don't show error when using mock data
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    isLoading,
    error,
    refetch,
  };
} 