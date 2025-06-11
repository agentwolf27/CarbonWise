'use client';

import { useState } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, Target, 
  Calendar, Award, Bell, Settings, Plus,
  Leaf, Zap, Globe, Users, RefreshCw, AlertCircle
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CarbonChart from '@/components/CarbonChart';
import { useCarbonData } from '@/hooks/useCarbonData';

export default function DashboardPage() {
  const [timeFrame, setTimeFrame] = useState('week');
  const { data, isLoading, error, refetch } = useCarbonData();

  const getIconForActivityType = (type: string) => {
    switch (type) {
      case 'Cloud Computing':
        return Globe;
      case 'Data Transfer':
        return Zap;
      case 'Video Streaming':
        return BarChart3;
      case 'Database Queries':
        return Target;
      case 'Email Sending':
        return Bell;
      default:
        return BarChart3;
    }
  };

  const getCurrentData = () => {
    if (!data) return null;
    
    switch (timeFrame) {
      case 'today':
        return data.summary.today;
      case 'week':
        return data.summary.week;
      case 'month':
        return data.summary.month;
      case 'year':
        return data.summary.year;
      default:
        return data.summary.week;
    }
  };

  const currentData = getCurrentData();

  if (error) {
    return (
      <div className="page-transition">
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-carbon-dark">
          <div className="text-center space-y-4">
            <AlertCircle size={48} className="text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Failed to load dashboard</h2>
            <p className="text-carbon-muted">{error}</p>
            <button
              onClick={refetch}
              className="btn-primary mt-4"
            >
              <RefreshCw size={20} className="mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <Navigation />
      
      {/* Dashboard Header */}
      <section className="py-8 bg-carbon-card border-b border-carbon-border">
        <div className="container-carbon">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Welcome back, <span className="text-primary-green">Alex</span>
              </h1>
              <p className="text-carbon-muted mt-2">
                {isLoading ? (
                  'Loading your carbon footprint data...'
                ) : currentData ? (
                  `Your carbon footprint for ${timeFrame === 'today' ? 'today' : `this ${timeFrame}`} is ${currentData.value.toFixed(1)} kg CO₂`
                ) : (
                  'Welcome to your carbon tracking dashboard!'
                )}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value)}
                className="px-4 py-2 bg-carbon-dark border border-carbon-border rounded-lg text-white focus:border-primary-green outline-none"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <button 
                onClick={refetch}
                disabled={isLoading}
                className="btn-secondary p-3"
                title="Refresh data"
              >
                <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
              </button>
              <button className="btn-primary">
                <Plus size={20} className="mr-2" />
                Add Activity
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-8">
        <div className="container-carbon">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data && Object.entries(data.summary).map(([period, stats], index) => {
              const icons = [Calendar, BarChart3, TrendingUp, Target];
              const Icon = icons[index];
              const periodLabels = {
                today: 'Today',
                week: 'This Week',
                month: 'This Month',
                year: 'This Year'
              };

              return (
                <div key={period} className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-primary-green/10 rounded-lg flex items-center justify-center">
                      <Icon size={24} className="text-primary-green" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      stats.change >= 0 ? 'text-red-400' : 'text-primary-green'
                    }`}>
                      {stats.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {Math.abs(stats.change)}%
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {isLoading ? (
                        <span className="inline-block w-16 h-6 bg-carbon-border/50 rounded animate-pulse"></span>
                      ) : (
                        `${stats.value.toFixed(1)} kg CO₂`
                      )}
                    </p>
                    <p className="text-carbon-muted text-sm">{periodLabels[period as keyof typeof periodLabels]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <section className="py-8">
        <div className="container-carbon">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Carbon Footprint Chart */}
              <div className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Carbon Footprint Trend</h2>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-primary-green rounded-full"></span>
                    <span className="text-carbon-muted text-sm">Carbon Emissions</span>
                  </div>
                </div>
                {data ? (
                  <CarbonChart data={data.chart} isLoading={isLoading} />
                ) : (
                  <div className="h-64 bg-gradient-to-br from-primary-green/20 to-carbon-accent/10 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="w-8 h-8 border-2 border-primary-green border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-carbon-muted text-sm">Loading chart data...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Activities */}
              <div className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Recent Activities</h2>
                <div className="space-y-4">
                  {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-carbon-dark/50 rounded-lg">
                        <div className="w-10 h-10 bg-carbon-border/50 rounded-lg animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="w-32 h-4 bg-carbon-border/50 rounded animate-pulse"></div>
                          <div className="w-24 h-3 bg-carbon-border/30 rounded animate-pulse"></div>
                        </div>
                        <div className="w-16 h-4 bg-carbon-border/50 rounded animate-pulse"></div>
                      </div>
                    ))
                  ) : data?.recentActivities ? (
                    data.recentActivities.map((activity) => {
                      const Icon = getIconForActivityType(activity.type);
                      return (
                        <div key={activity.id} className="flex items-center gap-4 p-4 bg-carbon-dark/50 rounded-lg hover:bg-carbon-dark/70 transition-colors">
                          <div className="w-10 h-10 bg-primary-green/10 rounded-lg flex items-center justify-center">
                            <Icon size={20} className="text-primary-green" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{activity.type}</p>
                            <p className="text-carbon-muted text-sm">{activity.timeAgo}</p>
                            <p className="text-carbon-muted text-xs">{activity.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-primary-green font-semibold">{activity.amount.toFixed(2)} kg CO₂</p>
                            <p className="text-carbon-muted text-xs">{activity.location}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-carbon-muted">
                      <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No activities found</p>
                    </div>
                  )}
                  <button className="w-full py-3 text-center text-primary-green hover:bg-primary-green/5 rounded-lg transition-colors">
                    View All Activities
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Goals Progress */}
              <div className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Goals & Progress</h2>
                <div className="space-y-6">
                  {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <div className="w-32 h-4 bg-carbon-border/50 rounded animate-pulse"></div>
                          <div className="w-16 h-4 bg-carbon-border/50 rounded animate-pulse"></div>
                        </div>
                        <div className="w-full bg-carbon-dark rounded-full h-2">
                          <div className="bg-carbon-border/50 h-2 rounded-full w-1/2 animate-pulse"></div>
                        </div>
                      </div>
                    ))
                  ) : data?.goals ? (
                    data.goals.map((goal) => (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white">{goal.title}</span>
                          <span className="text-carbon-muted">{goal.current.toFixed(1)}/{goal.target} {goal.unit}</span>
                        </div>
                        <div className="w-full bg-carbon-dark rounded-full h-2">
                          <div 
                            className="bg-primary-green h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  ) : null}
                  <button className="w-full btn-secondary mt-4">
                    <Target size={16} className="mr-2" />
                    Set New Goal
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  {[
                    { icon: Plus, label: 'Log Activity', action: 'log' },
                    { icon: BarChart3, label: 'View Reports', action: 'reports' },
                    { icon: Bell, label: 'Notifications', action: 'notifications' },
                    { icon: Settings, label: 'Settings', action: 'settings' },
                  ].map((action, index) => (
                    <button 
                      key={index}
                      className="w-full flex items-center gap-3 p-3 text-left text-white hover:bg-carbon-dark/50 rounded-lg transition-colors"
                    >
                      <action.icon size={20} className="text-primary-green" />
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Carbon Offset */}
              <div className="card bg-gradient-to-br from-primary-green/10 to-carbon-accent/20 border border-carbon-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Leaf size={24} className="text-primary-green" />
                  <h2 className="text-xl font-bold text-white">Carbon Offset</h2>
                </div>
                <p className="text-carbon-muted text-sm mb-4">
                  Offset your carbon footprint by supporting verified environmental projects.
                </p>
                <div className="text-center space-y-2 mb-4">
                  <p className="text-2xl font-bold text-primary-green">
                    {isLoading ? (
                      <span className="inline-block w-16 h-8 bg-primary-green/20 rounded animate-pulse"></span>
                    ) : data ? (
                      `${(data.summary.month.value * 0.18).toFixed(1)} kg`
                    ) : (
                      '12.4 kg'
                    )}
                  </p>
                  <p className="text-xs text-carbon-muted">Available to offset</p>
                </div>
                <button className="w-full btn-primary">
                  Offset Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 