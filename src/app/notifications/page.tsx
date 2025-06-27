'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { 
  Bell, Check, X, Filter, Search, AlertCircle, Info, 
  CheckCircle, TrendingUp, Target, Settings, ArrowLeft,
  Trash2, MoreVertical, Calendar, Leaf
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'achievement' | 'goal' | 'insight' | 'alert' | 'tip';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'achievement':
      return CheckCircle;
    case 'goal':
      return Target;
    case 'insight':
      return TrendingUp;
    case 'alert':
      return AlertCircle;
    case 'tip':
      return Info;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'achievement':
      return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'goal':
      return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'insight':
      return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
    case 'alert':
      return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'tip':
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    default:
      return 'text-primary-green bg-primary-green/10 border-primary-green/20';
  }
};

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filter, searchTerm]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // Simulate API call with sample data
      setTimeout(() => {
        const sampleNotifications: Notification[] = [
          {
            id: '1',
            type: 'achievement',
            title: 'First Week Complete!',
            message: 'Congratulations! You\'ve successfully tracked your carbon footprint for a full week.',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            read: false,
            priority: 'medium',
            actionUrl: '/dashboard'
          },
          {
            id: '2',
            type: 'insight',
            title: 'Carbon Footprint Decreased',
            message: 'Your digital carbon footprint decreased by 15% this week compared to last week.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            read: false,
            priority: 'high'
          },
          {
            id: '3',
            type: 'tip',
            title: 'Reduce Streaming Emissions',
            message: 'Tip: Watching videos in 720p instead of 1080p can reduce your streaming emissions by up to 30%.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
            read: true,
            priority: 'low'
          },
          {
            id: '4',
            type: 'goal',
            title: 'Monthly Goal Progress',
            message: 'You\'re 75% of the way to your monthly carbon reduction goal. Keep it up!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            read: true,
            priority: 'medium',
            actionUrl: '/dashboard'
          },
          {
            id: '5',
            type: 'alert',
            title: 'High Emissions Day',
            message: 'Yesterday\'s carbon footprint was 40% higher than your average. Check your activities.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
            read: true,
            priority: 'high',
            actionUrl: '/activities'
          }
        ];
        setNotifications(sampleNotifications);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    // Filter by type
    if (filter !== 'all') {
      if (filter === 'unread') {
        filtered = filtered.filter(n => !n.read);
      } else if (filter === 'read') {
        filtered = filtered.filter(n => n.read);
      } else {
        filtered = filtered.filter(n => n.type === filter);
      }
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredNotifications(filtered);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notifTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
                <h1 className="text-3xl md:text-4xl font-bold text-white">Notifications</h1>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="text-carbon-muted">
                Stay updated with your carbon tracking progress and insights
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={markAllAsRead}
                className="btn-secondary flex items-center gap-2"
                disabled={unreadCount === 0}
              >
                <Check size={16} />
                Mark All Read
              </button>
              <Link href="/dashboard" className="btn-primary flex items-center gap-2">
                <Settings size={16} />
                Settings
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-carbon-dark">
        <div className="container-carbon">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-carbon-muted" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-carbon-card border border-carbon-border rounded-lg text-white placeholder-carbon-muted focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
              />
            </div>

            {/* Filter by type */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-carbon-card border border-carbon-border rounded-lg text-white focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="achievement">Achievements</option>
              <option value="goal">Goals</option>
              <option value="insight">Insights</option>
              <option value="alert">Alerts</option>
              <option value="tip">Tips</option>
            </select>

            {/* Clear filters */}
            <button
              onClick={() => {
                setFilter('all');
                setSearchTerm('');
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>

            {/* Notification settings */}
            <button className="btn-secondary flex items-center justify-center gap-2">
              <Settings size={16} />
              Settings
            </button>
          </div>
        </div>
      </section>

      {/* Notifications List */}
      <section className="py-8">
        <div className="container-carbon">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-carbon-border/50 rounded-lg animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-carbon-border/50 rounded animate-pulse w-1/3"></div>
                      <div className="h-4 bg-carbon-border/50 rounded animate-pulse w-2/3"></div>
                      <div className="h-3 bg-carbon-border/50 rounded animate-pulse w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell size={64} className="text-carbon-muted mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No notifications found</h3>
              <p className="text-carbon-muted">
                {notifications.length === 0 
                  ? "You don't have any notifications yet."
                  : "Try adjusting your filters to see more notifications."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const colorClasses = getNotificationColor(notification.type);
                
                return (
                  <div 
                    key={notification.id} 
                    className={`card border rounded-xl p-6 transition-all duration-200 ${
                      notification.read 
                        ? 'bg-carbon-card border-carbon-border opacity-75' 
                        : 'bg-carbon-card border-primary-green/30 shadow-lg'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${colorClasses}`}>
                        <Icon size={24} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className={`font-semibold mb-1 ${notification.read ? 'text-carbon-muted' : 'text-white'}`}>
                              {notification.title}
                            </h3>
                            <p className={`text-sm mb-2 ${notification.read ? 'text-carbon-muted' : 'text-carbon-light'}`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-carbon-muted">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              <span className="capitalize">{notification.type}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                notification.priority === 'high' ? 'bg-red-400/20 text-red-400' :
                                notification.priority === 'medium' ? 'bg-yellow-400/20 text-yellow-400' :
                                'bg-green-400/20 text-green-400'
                              }`}>
                                {notification.priority}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-2 text-carbon-muted hover:text-primary-green transition-colors"
                                title="Mark as read"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            {notification.actionUrl && (
                              <Link
                                href={notification.actionUrl}
                                className="btn-secondary text-xs px-3 py-1"
                              >
                                View
                              </Link>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-2 text-carbon-muted hover:text-red-400 transition-colors"
                              title="Delete notification"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="py-8 bg-carbon-card border-t border-carbon-border">
        <div className="container-carbon">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { type: 'achievement', label: 'Achievement notifications', description: 'Get notified when you unlock new achievements' },
                { type: 'goal', label: 'Goal progress updates', description: 'Updates on your carbon reduction goals' },
                { type: 'insight', label: 'Weekly insights', description: 'AI-generated insights about your carbon footprint' },
                { type: 'alert', label: 'High emission alerts', description: 'Alerts when your emissions spike unexpectedly' },
                { type: 'tip', label: 'Daily tips', description: 'Daily tips to reduce your carbon footprint' }
              ].map((pref) => (
                <div key={pref.type} className="flex items-center justify-between p-4 bg-carbon-dark rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">{pref.label}</h4>
                    <p className="text-carbon-muted text-sm">{pref.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-carbon-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-green"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 