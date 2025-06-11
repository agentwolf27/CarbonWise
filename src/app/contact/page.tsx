'use client';

import { Metadata } from 'next';
import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, Users } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    
    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="page-transition">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-carbon-dark via-carbon-dark to-carbon-accent">
        <div className="container-carbon">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              Get in <span className="text-primary-green">Touch</span>
            </h1>
            <p className="text-xl text-carbon-muted leading-relaxed">
              Have questions about CarbonWise? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="container-carbon">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">Send us a message</h2>
                <p className="text-carbon-muted">
                  Fill out the form below and our team will get back to you within 24 hours.
                </p>
              </div>

              {isSubmitted && (
                <div className="message success">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={20} />
                    <span>Thank you! Your message has been sent successfully.</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-white font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-carbon-card border border-carbon-border rounded-lg text-white placeholder-carbon-muted focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-white font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-carbon-card border border-carbon-border rounded-lg text-white placeholder-carbon-muted focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-white font-medium mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-carbon-card border border-carbon-border rounded-lg text-white focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none transition-colors"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="sales">Sales & Pricing</option>
                    <option value="partnership">Partnership</option>
                    <option value="press">Press & Media</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-white font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-carbon-card border border-carbon-border rounded-lg text-white placeholder-carbon-muted focus:border-primary-green focus:ring-2 focus:ring-primary-green/20 outline-none transition-colors resize-vertical"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-carbon-dark border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">Contact Information</h2>
                <p className="text-carbon-muted">
                  Reach out to us directly through any of these channels.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    icon: Mail,
                    title: 'Email us',
                    description: 'Our friendly team is here to help.',
                    contact: 'info@carbonwise.com',
                    href: 'mailto:info@carbonwise.com'
                  },
                  {
                    icon: Phone,
                    title: 'Call us',
                    description: 'Mon-Fri from 8am to 5pm PST.',
                    contact: '+1 (555) 123-4567',
                    href: 'tel:+1-555-123-4567'
                  },
                  {
                    icon: MapPin,
                    title: 'Visit us',
                    description: 'Come say hello at our office.',
                    contact: '123 Green Street, San Francisco, CA 94111',
                    href: 'https://maps.google.com/?q=123+Green+Street+San+Francisco+CA'
                  },
                ].map((item, index) => (
                  <div key={index} className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon size={24} className="text-primary-green" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                        <p className="text-carbon-muted text-sm mb-2">{item.description}</p>
                        <a
                          href={item.href}
                          className="text-primary-green hover:underline font-medium"
                          target={item.href.startsWith('http') ? '_blank' : undefined}
                          rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        >
                          {item.contact}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Response Time */}
              <div className="bg-gradient-to-br from-primary-green/10 to-carbon-accent/20 rounded-xl p-6 border border-carbon-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock size={24} className="text-primary-green" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Response Time</h3>
                    <p className="text-carbon-muted text-sm leading-relaxed">
                      We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call us directly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-carbon-card">
        <div className="container-carbon">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Frequently Asked <span className="text-primary-green">Questions</span>
            </h2>
            <p className="text-xl text-carbon-muted max-w-3xl mx-auto">
              Find answers to common questions about CarbonWise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: 'How accurate is the carbon tracking?',
                answer: 'Our AI algorithms achieve 95%+ accuracy by cross-referencing multiple data sources and using industry-standard carbon calculation methodologies.'
              },
              {
                question: 'Is my data secure and private?',
                answer: 'Yes, we use enterprise-grade encryption and never share your personal data. All data is stored securely in SOC 2 compliant data centers.'
              },
              {
                question: 'Can I integrate with my existing tools?',
                answer: 'Absolutely! We offer integrations with popular cloud services, development tools, and business applications through our comprehensive API.'
              },
              {
                question: 'Do you offer team/enterprise plans?',
                answer: 'Yes, we have special pricing and features for teams and enterprises. Contact our sales team for a custom quote.'
              },
              {
                question: 'How do I get started?',
                answer: 'Simply sign up for a free account and connect your first service. Our onboarding guide will walk you through the setup process.'
              },
              {
                question: 'What kind of support do you provide?',
                answer: 'We offer email support for all users, with priority support and dedicated account managers for enterprise customers.'
              },
            ].map((faq, index) => (
              <div key={index} className="bg-carbon-dark border border-carbon-border rounded-xl p-6">
                <h3 className="text-white font-semibold mb-3">{faq.question}</h3>
                <p className="text-carbon-muted leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container-carbon">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Meet Our <span className="text-primary-green">Team</span>
            </h2>
            <p className="text-xl text-carbon-muted max-w-3xl mx-auto">
              The passionate individuals behind CarbonWise are here to help you succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Chen',
                role: 'CEO & Co-founder',
                email: 'sarah@carbonwise.com',
                description: 'Environmental policy expert with 10+ years in sustainability.'
              },
              {
                name: 'Marcus Johnson',
                role: 'CTO & Co-founder',
                email: 'marcus@carbonwise.com',
                description: 'AI/ML engineer passionate about climate technology.'
              },
              {
                name: 'Elena Rodriguez',
                role: 'Head of Customer Success',
                email: 'elena@carbonwise.com',
                description: 'Dedicated to helping customers achieve their sustainability goals.'
              },
            ].map((member, index) => (
              <div key={index} className="card bg-carbon-card border border-carbon-border rounded-xl p-6 text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-green/20 to-carbon-accent/20 rounded-full mx-auto flex items-center justify-center">
                  <Users size={32} className="text-primary-green" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{member.name}</h3>
                  <p className="text-primary-green font-medium mb-2">{member.role}</p>
                  <p className="text-carbon-muted text-sm mb-3">{member.description}</p>
                  <a
                    href={`mailto:${member.email}`}
                    className="text-primary-green hover:underline text-sm font-medium"
                  >
                    {member.email}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 