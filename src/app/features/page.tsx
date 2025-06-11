import { Metadata } from 'next';
import Link from 'next/link';
import { 
  BarChart3, Brain, Shield, Globe, Zap, Users, 
  TrendingUp, Bell, Smartphone, ArrowRight, 
  CheckCircle, Target, Calendar, Award,
  PieChart, Activity, RefreshCw, Cloud
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Features',
  description: 'Discover CarbonWise\'s powerful features for tracking, analyzing, and reducing your carbon footprint.',
};

export default function FeaturesPage() {
  return (
    <div className="page-transition">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-carbon-dark via-carbon-dark to-carbon-accent">
        <div className="container-carbon">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              Powerful <span className="text-primary-green">Features</span> for Carbon Tracking
            </h1>
            <p className="text-xl text-carbon-muted leading-relaxed">
              Everything you need to monitor, understand, and reduce your environmental impact with cutting-edge AI technology.
            </p>
            <Link href="/dashboard" className="btn-primary text-lg px-8 py-4 inline-flex items-center">
              Try Features Free
              <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20">
        <div className="container-carbon">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white">Core Features</h2>
            <p className="text-xl text-carbon-muted max-w-3xl mx-auto">
              Comprehensive tools designed to make carbon tracking effortless and actionable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: 'Real-time Carbon Tracking',
                description: 'Monitor your carbon footprint across all digital activities with live updates and instant notifications.',
                features: ['Live dashboard updates', 'Real-time calculations', 'Instant notifications', 'Cross-platform sync']
              },
              {
                icon: Brain,
                title: 'AI-Powered Insights',
                description: 'Get personalized recommendations and predictions based on advanced machine learning algorithms.',
                features: ['Smart recommendations', 'Predictive analytics', 'Behavior patterns', 'Custom insights']
              },
              {
                icon: TrendingUp,
                title: 'Advanced Analytics',
                description: 'Deep dive into your carbon data with comprehensive reports and trend analysis.',
                features: ['Detailed reports', 'Trend analysis', 'Comparative metrics', 'Export capabilities']
              },
              {
                icon: Target,
                title: 'Goal Setting & Tracking',
                description: 'Set sustainable goals and track your progress with milestone celebrations.',
                features: ['Custom goal setting', 'Progress tracking', 'Milestone rewards', 'Achievement badges']
              },
              {
                icon: Bell,
                title: 'Smart Notifications',
                description: 'Stay informed with intelligent alerts about your carbon footprint and opportunities.',
                features: ['Custom alerts', 'Smart timing', 'Actionable tips', 'Weekly summaries']
              },
              {
                icon: Smartphone,
                title: 'Mobile & Desktop Apps',
                description: 'Access your carbon data anywhere with native apps for all platforms.',
                features: ['Native mobile apps', 'Desktop application', 'Offline access', 'Cloud synchronization']
              },
            ].map((feature, index) => (
              <div key={index} className="card bg-carbon-card border border-carbon-border rounded-xl p-6 space-y-6">
                <div className="w-16 h-16 bg-primary-green/10 rounded-xl flex items-center justify-center">
                  <feature.icon size={32} className="text-primary-green" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-carbon-muted leading-relaxed mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle size={16} className="text-primary-green flex-shrink-0" />
                        <span className="text-carbon-muted">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Visualization */}
      <section className="py-20 bg-carbon-card">
        <div className="container-carbon">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Powerful Data <span className="text-primary-green">Visualization</span>
              </h2>
              <p className="text-lg text-carbon-muted leading-relaxed">
                Transform complex carbon data into clear, actionable insights with our advanced visualization tools.
              </p>
              <div className="space-y-4">
                {[
                  { icon: PieChart, title: 'Interactive Charts', description: 'Dynamic pie charts, bar graphs, and line charts' },
                  { icon: Activity, title: 'Live Monitoring', description: 'Real-time activity tracking with instant updates' },
                  { icon: Calendar, title: 'Historical Data', description: 'View trends over days, weeks, months, and years' },
                  { icon: RefreshCw, title: 'Auto-Updates', description: 'Automatic data refresh and synchronization' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon size={20} className="text-primary-green" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{item.title}</h4>
                      <p className="text-carbon-muted text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-carbon-dark rounded-xl p-8 border border-carbon-border">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">Carbon Footprint Overview</h3>
                  <span className="text-primary-green text-sm">Live Data</span>
                </div>
                <div className="h-64 bg-gradient-to-br from-primary-green/20 to-carbon-accent/10 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <BarChart3 size={48} className="text-primary-green mx-auto" />
                    <p className="text-carbon-muted text-sm">Interactive Dashboard Preview</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {['Today', 'This Week', 'This Month'].map((period, index) => (
                    <div key={index} className="text-center p-3 bg-carbon-border/30 rounded-lg">
                      <p className="text-primary-green font-bold text-lg">
                        {index === 0 ? '2.4' : index === 1 ? '16.8' : '68.2'}kg
                      </p>
                      <p className="text-carbon-muted text-xs">{period}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Features */}
      <section className="py-20">
        <div className="container-carbon">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              <span className="text-primary-green">Seamless</span> Integrations
            </h2>
            <p className="text-xl text-carbon-muted max-w-3xl mx-auto">
              Connect with your existing tools and platforms for comprehensive carbon tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Cloud,
                title: 'Cloud Services',
                description: 'Integrate with AWS, Google Cloud, Azure, and other cloud providers to track server emissions.',
                integrations: ['AWS CloudWatch', 'Google Cloud Console', 'Microsoft Azure', 'DigitalOcean']
              },
              {
                icon: Zap,
                title: 'Development Tools',
                description: 'Connect your development workflow with CI/CD pipelines and code repositories.',
                integrations: ['GitHub Actions', 'GitLab CI', 'Jenkins', 'Docker Hub']
              },
              {
                icon: Globe,
                title: 'Business Applications',
                description: 'Sync with business tools to track carbon impact across your organization.',
                integrations: ['Slack', 'Microsoft Teams', 'Jira', 'Confluence']
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Enterprise-grade security with SSO, audit logs, and compliance reporting.',
                integrations: ['SAML 2.0', 'OAuth 2.0', 'Active Directory', 'LDAP']
              },
            ].map((integration, index) => (
              <div key={index} className="card bg-carbon-card border border-carbon-border rounded-xl p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <integration.icon size={24} className="text-primary-green" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">{integration.title}</h3>
                    <p className="text-carbon-muted leading-relaxed mb-4">{integration.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {integration.integrations.map((item, idx) => (
                        <span key={idx} className="text-xs bg-primary-green/10 text-primary-green px-3 py-1 rounded-full">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Features */}
      <section className="py-20 bg-gradient-to-br from-primary-green/10 to-carbon-accent/20">
        <div className="container-carbon">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Built for <span className="text-primary-green">Teams</span>
            </h2>
            <p className="text-xl text-carbon-muted max-w-3xl mx-auto">
              Collaborate with your team to achieve collective sustainability goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Team Management',
                description: 'Invite team members, assign roles, and manage permissions with ease.'
              },
              {
                icon: Target,
                title: 'Shared Goals',
                description: 'Set team-wide sustainability goals and track collective progress.'
              },
              {
                icon: Award,
                title: 'Team Leaderboards',
                description: 'Gamify sustainability with friendly competition and achievements.'
              },
              {
                icon: BarChart3,
                title: 'Team Analytics',
                description: 'View team-wide carbon metrics and identify improvement opportunities.'
              },
              {
                icon: Bell,
                title: 'Team Notifications',
                description: 'Stay updated on team progress and important sustainability milestones.'
              },
              {
                icon: Shield,
                title: 'Admin Controls',
                description: 'Comprehensive admin panel with user management and security controls.'
              },
            ].map((feature, index) => (
              <div key={index} className="card bg-carbon-card border border-carbon-border rounded-xl p-6 space-y-4 text-center">
                <div className="w-16 h-16 bg-primary-green/10 rounded-xl flex items-center justify-center mx-auto">
                  <feature.icon size={28} className="text-primary-green" />
                </div>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-carbon-muted leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-carbon">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Ready to start tracking?
            </h2>
            <p className="text-xl text-carbon-muted">
              Join thousands of users who are already making a difference with CarbonWise.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="btn-primary text-lg px-8 py-4">
                Start Free Trial
                <ArrowRight size={20} className="ml-2" />
              </Link>
              <Link href="/contact" className="btn-secondary text-lg px-8 py-4">
                Contact Sales
              </Link>
            </div>
            <p className="text-sm text-carbon-muted">
              14-day free trial • No credit card required • Setup in minutes
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 