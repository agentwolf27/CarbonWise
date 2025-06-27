'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { 
  BarChart3, TrendingUp, TrendingDown, Calendar, Download,
  Globe, Zap, Target, Bell, Leaf, Filter, Eye, PieChart,
  ArrowLeft, RefreshCw, FileText, Mail
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function ReportsPage() {
  const { data: session } = useSession();
  const [timeframe, setTimeframe] = useState('month');
  const [reportType, setReportType] = useState('summary');
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, [timeframe, reportType]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setReportData({
          summary: {
            totalEmissions: 45.6,
            activitiesCount: 127,
            trend: -12.3,
            avgDaily: 1.52
          },
          breakdown: {
            streaming: 18.4,
            browsing: 12.1,
            social: 8.9,
            work: 6.2
          },
          insights: [
            "Your carbon footprint decreased by 12.3% this month",
            "Video streaming accounts for 40% of your digital emissions",
            "You could save 5.2 kg CO₂ by reducing HD streaming by 20%"
          ]
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const generatePDFReport = () => {
    // Simulate PDF generation
    alert('PDF report generated! (Feature coming soon)');
  };

  const emailReport = () => {
    alert('Report emailed! (Feature coming soon)');
  };

  const pieChartData = reportData?.breakdown || {};
  const total = Object.values(pieChartData).reduce((sum, val) => sum + val, 0);

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
                <h1 className="text-3xl md:text-4xl font-bold text-white">Carbon Reports</h1>
              </div>
              <p className="text-carbon-muted">
                Detailed analytics and insights about your carbon footprint
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={emailReport}
                className="btn-secondary flex items-center gap-2"
              >
                <Mail size={16} />
                Email Report
              </button>
              <button
                onClick={generatePDFReport}
                className="btn-primary flex items-center gap-2"
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="py-6 bg-carbon-dark">
        <div className="container-carbon">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-4 py-2 bg-carbon-card border border-carbon-border rounded-lg text-white focus:border-primary-green outline-none"
            >
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="quarter">Past Quarter</option>
              <option value="year">Past Year</option>
            </select>
            
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-4 py-2 bg-carbon-card border border-carbon-border rounded-lg text-white focus:border-primary-green outline-none"
            >
              <option value="summary">Summary Report</option>
              <option value="detailed">Detailed Analysis</option>
              <option value="comparison">Comparison Report</option>
              <option value="trends">Trend Analysis</option>
            </select>
            
            <button
              onClick={fetchReportData}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh Data
            </button>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-8">
        <div className="container-carbon">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <Leaf size={24} className="text-primary-green" />
                <div>
                  <p className="text-sm text-carbon-muted">Total Emissions</p>
                  <p className="text-2xl font-bold text-white">
                    {isLoading ? (
                      <span className="inline-block w-16 h-6 bg-carbon-border/50 rounded animate-pulse"></span>
                    ) : (
                      `${reportData?.summary.totalEmissions || 0} kg CO₂`
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <BarChart3 size={24} className="text-blue-400" />
                <div>
                  <p className="text-sm text-carbon-muted">Activities</p>
                  <p className="text-2xl font-bold text-white">
                    {isLoading ? (
                      <span className="inline-block w-16 h-6 bg-carbon-border/50 rounded animate-pulse"></span>
                    ) : (
                      reportData?.summary.activitiesCount || 0
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <TrendingDown size={24} className="text-green-400" />
                <div>
                  <p className="text-sm text-carbon-muted">Trend</p>
                  <p className="text-2xl font-bold text-green-400">
                    {isLoading ? (
                      <span className="inline-block w-16 h-6 bg-carbon-border/50 rounded animate-pulse"></span>
                    ) : (
                      `${Math.abs(reportData?.summary.trend || 0)}% ↓`
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
              <div className="flex items-center gap-3">
                <Calendar size={24} className="text-yellow-400" />
                <div>
                  <p className="text-sm text-carbon-muted">Daily Average</p>
                  <p className="text-2xl font-bold text-white">
                    {isLoading ? (
                      <span className="inline-block w-16 h-6 bg-carbon-border/50 rounded animate-pulse"></span>
                    ) : (
                      `${reportData?.summary.avgDaily || 0} kg CO₂`
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Emissions Breakdown Chart */}
            <div className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Emissions Breakdown</h2>
              {isLoading ? (
                <div className="h-64 bg-carbon-dark/50 rounded-lg animate-pulse"></div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(pieChartData).map(([category, value], index) => {
                    const percentage = total > 0 ? (value / total) * 100 : 0;
                    const colors = ['bg-primary-green', 'bg-blue-400', 'bg-yellow-400', 'bg-red-400'];
                    
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-white capitalize">{category}</span>
                          <span className="text-carbon-muted">{value} kg CO₂ ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-carbon-dark rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${colors[index % colors.length]}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Insights & Recommendations */}
            <div className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Key Insights</h2>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 bg-carbon-dark/50 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {reportData?.insights.map((insight, index) => (
                    <div key={index} className="p-4 bg-primary-green/10 border border-primary-green/20 rounded-lg">
                      <p className="text-primary-green text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Breakdown Table */}
          <div className="card bg-carbon-card border border-carbon-border rounded-xl p-6 mt-8">
            <h2 className="text-xl font-bold text-white mb-6">Activity Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-carbon-border">
                    <th className="text-left py-3 text-carbon-muted">Activity Type</th>
                    <th className="text-right py-3 text-carbon-muted">Count</th>
                    <th className="text-right py-3 text-carbon-muted">Total CO₂ (kg)</th>
                    <th className="text-right py-3 text-carbon-muted">Avg per Activity</th>
                    <th className="text-right py-3 text-carbon-muted">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-carbon-border/50">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} className="py-3">
                            <div className="h-4 bg-carbon-border/50 rounded animate-pulse"></div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    Object.entries(pieChartData).map(([category, value]) => {
                      const count = Math.floor(Math.random() * 20) + 5;
                      const avg = value / count;
                      const percentage = total > 0 ? (value / total) * 100 : 0;
                      
                      return (
                        <tr key={category} className="border-b border-carbon-border/50 hover:bg-carbon-dark/30">
                          <td className="py-3 text-white capitalize">{category}</td>
                          <td className="py-3 text-right text-carbon-muted">{count}</td>
                          <td className="py-3 text-right text-white">{value.toFixed(2)}</td>
                          <td className="py-3 text-right text-carbon-muted">{avg.toFixed(3)}</td>
                          <td className="py-3 text-right text-primary-green">{percentage.toFixed(1)}%</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Export Options */}
          <div className="card bg-gradient-to-br from-primary-green/10 to-carbon-accent/20 border border-carbon-border rounded-xl p-6 mt-8">
            <h2 className="text-xl font-bold text-white mb-4">Export & Share</h2>
            <p className="text-carbon-muted mb-6">
              Generate detailed reports in various formats or share your progress with others.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={generatePDFReport}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <FileText size={16} />
                PDF Report
              </button>
              <button
                onClick={() => alert('CSV export coming soon!')}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Download size={16} />
                CSV Data
              </button>
              <button
                onClick={emailReport}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Mail size={16} />
                Email Report
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 