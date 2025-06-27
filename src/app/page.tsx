import Link from 'next/link';
import { ArrowRight, Play, BarChart3, Shield, Globe, Users, Zap, TrendingUp, Building2, CheckCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="page-transition">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-carbon-dark via-carbon-dark to-carbon-accent overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        <div className="container-carbon relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Track your{' '}
              <span className="text-primary-green">digital carbon</span>{' '}
              footprint in real time
            </h1>
            <p className="text-lg md:text-xl text-carbon-muted max-w-2xl mx-auto leading-relaxed">
              AI-driven insights and personalized recommendations to help you make sustainable choices and reduce your environmental impact.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="btn-primary text-lg px-8 py-4">
                Start Tracking Free
                <ArrowRight size={20} className="ml-2" />
              </Link>
              <button className="flex items-center gap-3 text-white hover:text-primary-green transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary-green/20 flex items-center justify-center hover:bg-primary-green/30 transition-colors">
                  <Play size={20} className="text-primary-green ml-1" />
                </div>
                Watch Demo
              </button>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-green/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-primary-green/3 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-carbon-card border-y border-carbon-border">
        <div className="container-carbon">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: '10,000+', label: 'Active Users', icon: Users },
              { number: '2.5M', label: 'Tons CO₂ Tracked', icon: BarChart3 },
              { number: '150+', label: 'Companies Trust Us', icon: Globe },
            ].map((stat, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary-green/10 rounded-full flex items-center justify-center mx-auto">
                  <stat.icon size={32} className="text-primary-green" />
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white">{stat.number}</h3>
                  <p className="text-carbon-muted">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container-carbon">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Why Choose <span className="text-primary-green">CarbonWise</span>?
            </h2>
            <p className="text-xl text-carbon-muted max-w-3xl mx-auto">
              Advanced AI technology meets environmental consciousness to deliver the most comprehensive carbon tracking solution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: 'Real-time Tracking',
                description: 'Monitor your carbon footprint across all digital activities with live updates and instant notifications.'
              },
              {
                icon: TrendingUp,
                title: 'AI-Powered Insights',
                description: 'Get personalized recommendations and predictions based on advanced machine learning algorithms.'
              },
              {
                icon: Shield,
                title: 'Privacy First',
                description: 'Your data is encrypted and secure. We never share your personal information with third parties.'
              },
              {
                icon: Globe,
                title: 'Global Impact',
                description: 'See how your actions contribute to global sustainability goals and environmental initiatives.'
              },
            ].map((feature, index) => (
              <div key={index} className="card bg-carbon-card border border-carbon-border rounded-xl p-6 space-y-4">
                <div className="w-12 h-12 bg-primary-green/10 rounded-lg flex items-center justify-center">
                  <feature.icon size={24} className="text-primary-green" />
                </div>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="text-carbon-muted leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Businesses Section */}
      <section className="py-20 bg-carbon-card border-y border-carbon-border">
        <div className="container-carbon">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block bg-primary-green/10 text-primary-green text-sm font-semibold px-4 py-2 rounded-full">
                Coming Soon
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white">
                Powerful Tools for <span className="text-primary-green">Businesses</span>
              </h2>
              <p className="text-xl text-carbon-muted">
                Empower your organization to track, manage, and reduce its carbon footprint with our upcoming suite of business-focused features.
              </p>
              <ul className="space-y-4 text-carbon-light">
                <li className="flex items-start gap-3">
                  <CheckCircle size={24} className="text-primary-green flex-shrink-0 mt-1" />
                  <span><span className="font-semibold text-white">Team Dashboards:</span> Get a comprehensive overview of your company's total emissions.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={24} className="text-primary-green flex-shrink-0 mt-1" />
                  <span><span className="font-semibold text-white">Employee Challenges:</span> Engage your workforce with fun, competitive sustainability goals.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle size={24} className="text-primary-green flex-shrink-0 mt-1" />
                  <span><span className="font-semibold text-white">Automated Reporting:</span> Generate compliance and sustainability reports with a single click.</span>
                </li>
              </ul>
              <Link href="/auth/signup" className="btn-secondary text-lg mt-4 inline-block">
                Request Early Access
              </Link>
            </div>
            <div className="relative h-96">
              <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary-green/10 to-transparent rounded-2xl"></div>
              <div className="p-8 h-full flex items-center justify-center">
                 <Building2 size={128} className="text-primary-green opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-green/10 to-carbon-accent/20">
        <div className="container-carbon">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Ready to make a difference?
            </h2>
            <p className="text-xl text-carbon-muted">
              Join thousands of users who are already tracking and reducing their carbon footprint with CarbonWise.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="btn-primary text-lg px-8 py-4">
                Get Started for Free
                <ArrowRight size={20} className="ml-2" />
              </Link>
              <Link href="/features" className="btn-secondary text-lg px-8 py-4">
                Learn More
              </Link>
            </div>
            <p className="text-sm text-carbon-muted">
              Free forever • No credit card required • Start in 2 minutes
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
