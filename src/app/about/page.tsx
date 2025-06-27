import { Metadata } from 'next';
import { Users, Target, Award, Calendar, CheckCircle, Leaf, Brain, Shield } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProfileCard from '@/components/ProfileCard';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about CarbonWise\'s mission to make carbon tracking accessible and actionable for everyone.',
};

export default function AboutPage() {
  return (
    <div className="page-transition">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-carbon-dark via-carbon-dark to-carbon-accent">
        <div className="container-carbon">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              About <span className="text-primary-green">CarbonWise</span>
            </h1>
            <p className="text-xl text-carbon-muted leading-relaxed">
              We're building the future of carbon tracking with AI-driven insights, making environmental responsibility accessible to everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container-carbon">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Our Mission</h2>
              <p className="text-lg text-carbon-muted leading-relaxed">
                At CarbonWise, we believe that understanding your environmental impact is the first step toward creating meaningful change. Our platform combines cutting-edge AI technology with user-friendly design to make carbon tracking effortless and actionable.
              </p>
              <p className="text-lg text-carbon-muted leading-relaxed">
                We envision a world where every individual and organization can easily monitor, understand, and reduce their carbon footprint, contributing to a more sustainable future for all.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Target, title: 'Accuracy', description: 'Precise carbon tracking with AI validation' },
                { icon: Brain, title: 'Intelligence', description: 'Smart insights for better decisions' },
                { icon: Shield, title: 'Privacy', description: 'Your data is secure and protected' },
                { icon: Leaf, title: 'Impact', description: 'Measurable environmental benefits' },
              ].map((value, index) => (
                <div key={index} className="card bg-carbon-card border border-carbon-border rounded-xl p-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-primary-green/10 rounded-lg flex items-center justify-center mx-auto">
                    <value.icon size={24} className="text-primary-green" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{value.title}</h3>
                  <p className="text-sm text-carbon-muted">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-carbon-card">
        <div className="container-carbon">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Our Journey</h2>
            <p className="text-xl text-carbon-muted max-w-3xl mx-auto">
              From a small idea to a global platform, here's how we've grown to serve thousands of users worldwide.
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                date: 'Q1 2025',
                title: 'Idea Born',
                description: 'Founded with the vision of making carbon tracking accessible to everyone.',
                status: 'completed'
              },
              {
                date: 'Q2 2025',
                title: 'MVP Launch',
                description: 'Released our first minimum viable product to a small group of beta users.',
                status: 'completed'
              },
              {
                date: 'Q3 2025',
                title: 'AI Integration',
                description: 'Introduced DeepSeek V3 and advanced machine learning algorithms for better carbon footprint predictions.',
                status: 'completed'
              },
              {
                date: 'Q4 2025',
                title: 'Public Beta',
                description: 'Opened our platform to the public with enhanced features and improved UI.',
                status: 'completed'
              },
              {
                date: 'Q4 2025',
                title: 'API Release',
                description: 'Launched comprehensive API for third-party integrations and enterprise clients.',
                status: 'completed'
              },
              {
                date: 'Q1 2026',
                title: 'Mobile App',
                description: 'Native mobile applications for iOS and Android platforms in development.',
                status: 'current'
              },
              {
                date: 'Q2 2026',
                title: 'Global Expansion',
                description: 'Expanding to serve businesses and individuals across 50+ countries.',
                status: 'upcoming'
              },
            ].map((milestone, index) => (
              <div key={index} className="flex items-start gap-6">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    milestone.status === 'completed' ? 'bg-primary-green text-carbon-dark' :
                    milestone.status === 'current' ? 'bg-primary-green/20 border-2 border-primary-green text-primary-green' :
                    'bg-carbon-border text-carbon-muted'
                  }`}>
                    {milestone.status === 'completed' ? (
                      <CheckCircle size={20} />
                    ) : (
                      <Calendar size={20} />
                    )}
                  </div>
                  {index < 6 && (
                    <div className={`w-0.5 h-16 mt-2 ${
                      milestone.status === 'completed' ? 'bg-primary-green' : 'bg-carbon-border'
                    }`}></div>
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-sm font-medium text-primary-green bg-primary-green/10 px-3 py-1 rounded-full">
                      {milestone.date}
                    </span>
                    {milestone.status === 'current' && (
                      <span className="text-xs font-medium text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{milestone.title}</h3>
                  <p className="text-carbon-muted">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container-carbon">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Meet the Founder</h2>
            <p className="text-xl text-carbon-muted max-w-3xl mx-auto">
              The passionate individual working to make sustainable living more accessible and impactful.
            </p>
          </div>

          <div className="flex justify-center">
            <ProfileCard
              name="Vishrut Malhotra"
              title="Founder & Full-Stack Developer"
              handle="vishrut"
              status="Building"
              contactText="Contact Me"
              avatarUrl="https://github.com/vishrutmalhotra.png"
              showUserInfo={true}
              enableTilt={true}
            />
          </div>

          <div className="mt-12 max-w-2xl mx-auto text-center space-y-6">
            <div className="card bg-carbon-card border border-carbon-border rounded-xl p-8 space-y-4">
              <h3 className="text-2xl font-semibold text-white">About Vishrut</h3>
              <p className="text-carbon-muted leading-relaxed">
                Vishrut Malhotra is a 4th-year Computer Science student at San Francisco State University with a passion for environmental technology and AI. 
                As the sole founder and developer of CarbonWise, he combines his technical expertise in full-stack development with his commitment to sustainability.
              </p>
              <p className="text-carbon-muted leading-relaxed">
                Starting as a solo project in 2025, CarbonWise has grown from an idea to a fully functional platform featuring AI-powered carbon tracking, 
                real-time analytics, and comprehensive APIs. Vishrut handles everything from backend architecture and AI integration to frontend design and user experience.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {[
                  'Full-Stack Development',
                  'AI Integration',
                  'React/Next.js',
                  'Node.js',
                  'TypeScript',
                  'Prisma',
                  'API Design',
                  'UI/UX Design'
                ].map((skill, index) => (
                  <span 
                    key={index} 
                    className="text-xs font-medium text-primary-green bg-primary-green/10 px-3 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-primary-green/10 to-carbon-accent/20">
        <div className="container-carbon">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Our Values</h2>
            <p className="text-xl text-carbon-muted max-w-3xl mx-auto">
              The principles that guide everything we do at CarbonWise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Transparency',
                description: 'We believe in open, honest communication about our methods, data sources, and impact calculations.'
              },
              {
                title: 'Innovation',
                description: 'We continuously push the boundaries of what\'s possible in carbon tracking and environmental technology.'
              },
              {
                title: 'Accessibility',
                description: 'Environmental responsibility should be available to everyone, regardless of technical expertise or resources.'
              },
              {
                title: 'Accuracy',
                description: 'Our data and calculations are rigorously tested and validated to ensure the highest precision.'
              },
              {
                title: 'Privacy',
                description: 'We protect user data with enterprise-grade security and never compromise personal information.'
              },
              {
                title: 'Impact',
                description: 'Every feature we build is designed to drive real, measurable environmental improvements.'
              },
            ].map((value, index) => (
              <div key={index} className="card bg-carbon-card border border-carbon-border rounded-xl p-6 space-y-4">
                <h3 className="text-xl font-semibold text-white">{value.title}</h3>
                <p className="text-carbon-muted leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 