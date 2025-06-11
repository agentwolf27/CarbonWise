'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ChartData } from '@/types/carbon';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CarbonChartProps {
  data: ChartData;
  isLoading?: boolean;
}

export default function CarbonChart({ data, isLoading }: CarbonChartProps) {
  const chartRef = useRef<ChartJS<'line', number[], string>>(null);

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Daily Carbon Footprint (kg CO₂)',
        data: data.data,
        borderColor: '#8cd279',
        backgroundColor: 'rgba(140, 210, 121, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#8cd279',
        pointBorderColor: '#8cd279',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#8cd279',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#222e1f',
        titleColor: '#ffffff',
        bodyColor: '#a4be9d',
        borderColor: '#2f402b',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context: any) => `${context[0].label}`,
          label: (context: any) => `${context.parsed.y.toFixed(2)} kg CO₂`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: '#2f402b',
          borderColor: '#2f402b',
        },
        ticks: {
          color: '#a4be9d',
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: '#2f402b',
          borderColor: '#2f402b',
        },
        ticks: {
          color: '#a4be9d',
          font: {
            size: 12,
          },
          callback: (value: any) => `${value} kg`,
        },
        beginAtZero: true,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  };

  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      chart.update();
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="h-64 bg-gradient-to-br from-primary-green/20 to-carbon-accent/10 rounded-lg flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary-green border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-carbon-muted text-sm">Loading chart data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 relative">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
} 