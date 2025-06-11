'use client';

import { useState, useEffect } from 'react';
import type { CarbonDashboardData, CarbonApiResponse } from '@/types/carbon';

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
        throw new Error(result.error || 'Failed to fetch carbon data');
      }
      
      if (result.data) {
        setData(result.data);
      }
    } catch (err) {
      console.error('Error fetching carbon data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
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