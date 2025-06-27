'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { 
  Calendar, Filter, Search, MoreVertical, TrendingUp, TrendingDown,
  Globe, Zap, BarChart3, Target, Bell, Leaf, Chrome, Smartphone,
  ArrowLeft, ArrowRight, RefreshCw, Download, Eye, Trash2
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface Activity {
  id: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  location?: string;
  metadata?: any;
  timestamp: string;
  createdAt: string;
}

const getIconForActivityType = (type: string) => {
  const icons = {
    'Cloud Computing': Globe,
    'Data Transfer': Zap,
    'Video Streaming': BarChart3,
    'Database Queries': Target,
    'Email Sending': Bell,
    'Web Browsing': Chrome,
    'Mobile Usage': Smartphone,
    'AI Interaction': Target,
    'Social Media': Globe,
    'Gaming': BarChart3,
    'Shopping': Target,
    'News': Bell,
    'Work': Target,
    'Search': Chrome,
    'Streaming': BarChart3,
    'Other': Leaf
  };
  return icons[type] || Leaf;
};

const getCategoryColor = (category: string) => {
  const colors = {
    'HIGH': 'text-red-400 bg-red-400/10 border-red-400/20',
    'MEDIUM': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    'LOW': 'text-green-400 bg-green-400/10 border-green-400/20',
    'DIGITAL': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    'PHYSICAL': 'text-purple-400 bg-purple-400/10 border-purple-400/20'
  };
  return colors[category] || 'text-gray-400 bg-gray-400/10 border-gray-400/20';
};

export default function ActivitiesPage() {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const activitiesPerPage = 10;

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    filterAndSortActivities();
  }, [activities, searchTerm, selectedType, selectedCategory, dateRange, sortBy]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/carbon/activities');
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortActivities = () => {
    let filtered = [...activities];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(activity => activity.type === selectedType);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(activity => activity.category === selectedCategory);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      if (dateRange !== 'all') {
        filtered = filtered.filter(activity => 
          new Date(activity.timestamp) >= filterDate
        );
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'highest-impact':
          return b.amount - a.amount;
        case 'lowest-impact':
          return a.amount - b.amount;
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    setFilteredActivities(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getUniqueTypes = () => {
    return [...new Set(activities.map(a => a.type))];
  };

  const getUniqueCategories = () => {
    return [...new Set(activities.map(a => a.category))];
  };

  const getCurrentPageActivities = () => {
    const startIndex = (currentPage - 1) * activitiesPerPage;
    const endIndex = startIndex + activitiesPerPage;
    return filteredActivities.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(filteredActivities.length / activitiesPerPage);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalEmissions = () => {
    return filteredActivities.reduce((sum, activity) => sum + activity.amount, 0);
  };

  const exportToCSV = () => {
    const csvContent = [
      'Date,Type,Category,Description,Emissions (kg CO2),Location',
      ...filteredActivities.map(activity => 
        `${formatDate(activity.timestamp)},${activity.type},${activity.category},"${activity.description}",${activity.amount},${activity.location || ''}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carbonwise-activities-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="page-transition">
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-carbon-dark">
          <div className="flex items-center gap-3">
            <RefreshCw size={24} className="text-primary-green animate-spin" />
            <span className="text-white">Loading activities...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <Navigation />
      
      {/* Header */}
      <section className="py-8 bg-carbon-card border-b border-carbon-border">
        <div className="container-carbon">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link href="/dashboard" className="text-carbon-muted hover:text-white transition-colors">
                  <ArrowLeft size={20} />
                </Link>
                <h1 className="text-3xl md:text-4xl font-bold text-white">All Activities</h1>
              </div>
              <p className="text-carbon-muted">
                Comprehensive view of your carbon footprint activities
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={exportToCSV}
                className="btn-secondary flex items-center gap-2"
              >
                <Download size={16} />
                Export CSV
              </button>
              <button
                onClick={fetchActivities}
                className="btn-primary flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Stats */}
      <section className="py-6 bg-carbon-dark">
        <div className="container-carbon">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <BarChart3 size={24} className="text-primary-green" />
                <div>
                  <p className="text-sm text-carbon-muted">Total Activities</p>
                  <p className="text-2xl font-bold text-white">{filteredActivities.length}</p>
                </div>
              </div>
            </div>
            <div className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <Leaf size={24} className="text-red-400" />
                <div>
                  <p className="text-sm text-carbon-muted">Total Emissions</p>
                  <p className="text-2xl font-bold text-white">{getTotalEmissions().toFixed(2)} kg CO₂</p>
                </div>
              </div>
            </div>
            <div className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <Calendar size={24} className="text-blue-400" />
                <div>
                  <p className="text-sm text-carbon-muted">Average per Day</p>
                  <p className="text-2xl font-bold text-white">
                    {filteredActivities.length > 0 ? (getTotalEmissions() / 7).toFixed(2) : '0.00'} kg CO₂
                  </p>
                </div>
              </div>
            </div>
            <div className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <Target size={24} className="text-yellow-400" />
                <div>
                  <p className="text-sm text-carbon-muted">Most Common</p>
                  <p className="text-lg font-bold text-white">
                    {activities.length > 0 ? 
                      Object.entries(
                        activities.reduce((acc, activity) => {
                          acc[activity.type] = (acc[activity.type] || 0) + 1;
                          return acc;
                        }, {})
                      ).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
                      : 'None'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-carbon-card border-b border-carbon-border">
        <div className="container-carbon">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-carbon-muted" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-carbon-dark border border-carbon-border rounded-lg text-white placeholder-carbon-muted focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-carbon-dark border border-carbon-border rounded-lg text-white focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
            >
              <option value="all">All Types</option>
              {getUniqueTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-carbon-dark border border-carbon-border rounded-lg text-white focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
            >
              <option value="all">All Categories</option>
              {getUniqueCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-carbon-dark border border-carbon-border rounded-lg text-white focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="3months">Past 3 Months</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-carbon-dark border border-carbon-border rounded-lg text-white focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest-impact">Highest Impact</option>
              <option value="lowest-impact">Lowest Impact</option>
              <option value="type">By Type</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedCategory('all');
                setDateRange('all');
                setSortBy('newest');
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      {/* Activities List */}
      <section className="py-8">
        <div className="container-carbon">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <Leaf size={64} className="text-carbon-muted mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No activities found</h3>
              <p className="text-carbon-muted">
                {activities.length === 0 
                  ? "You haven't logged any activities yet. Start tracking your carbon footprint!"
                  : "Try adjusting your filters to see more activities."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {getCurrentPageActivities().map((activity) => {
                const Icon = getIconForActivityType(activity.type);
                
                return (
                  <div key={activity.id} className="card bg-carbon-card border border-carbon-border rounded-xl p-6 hover:border-primary-green/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-primary-green/10 rounded-lg flex items-center justify-center">
                          <Icon size={24} className="text-primary-green" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold text-white">{activity.type}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(activity.category)}`}>
                              {activity.category}
                            </span>
                          </div>
                          <p className="text-carbon-muted text-sm mb-2">{activity.description}</p>
                          <div className="flex items-center gap-4 text-xs text-carbon-muted">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(activity.timestamp)}
                            </span>
                            {activity.location && (
                              <span className="flex items-center gap-1">
                                <Globe size={14} />
                                {activity.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">{activity.amount.toFixed(3)}</p>
                        <p className="text-sm text-carbon-muted">kg CO₂</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {getTotalPages() > 1 && (
            <div className="flex items-center justify-between mt-8">
              <p className="text-sm text-carbon-muted">
                Showing {((currentPage - 1) * activitiesPerPage) + 1} to {Math.min(currentPage * activitiesPerPage, filteredActivities.length)} of {filteredActivities.length} activities
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-carbon-border rounded-lg bg-carbon-card text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary-green transition-colors"
                >
                  <ArrowLeft size={16} />
                </button>
                
                {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 border rounded-lg transition-colors ${
                      page === currentPage
                        ? 'border-primary-green bg-primary-green text-white'
                        : 'border-carbon-border bg-carbon-card text-white hover:border-primary-green'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages()))}
                  disabled={currentPage === getTotalPages()}
                  className="p-2 border border-carbon-border rounded-lg bg-carbon-card text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary-green transition-colors"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
} 