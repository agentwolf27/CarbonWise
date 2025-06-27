'use client';

import { useState } from 'react';
import { useSession, signOut } from "next-auth/react";
import { 
  Settings, User, Bell, Shield, Globe, Palette, 
  ArrowLeft, Save, LogOut, Trash2, Eye, EyeOff,
  Mail, Phone, MapPin, Key, Chrome, Download
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [profileData, setProfileData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    location: '',
    bio: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    achievements: true,
    goals: true,
    insights: true,
    alerts: true,
    tips: false,
    emailDigest: true,
    pushNotifications: true
  });

  const [preferences, setPreferences] = useState({
    theme: 'dark',
    language: 'en',
    timezone: 'UTC-8',
    units: 'metric',
    privacyLevel: 'normal'
  });

  const handleProfileSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      alert('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Notification preferences updated!');
    } catch (error) {
      alert('Failed to update notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmed) {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert('Account deletion requested. You will receive an email confirmation.');
      } catch (error) {
        alert('Failed to delete account');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const exportData = () => {
    alert('Data export started. You will receive an email when ready for download.');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'integrations', label: 'Integrations', icon: Chrome }
  ];

  return (
    <div className="page-transition">
      <Navigation />
      
      {/* Header */}
      <section className="py-8 bg-carbon-card border-b border-carbon-border">
        <div className="container-carbon">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard" className="text-carbon-muted hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Settings</h1>
          </div>
          <p className="text-carbon-muted">
            Manage your account preferences and application settings
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container-carbon">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-green text-white'
                          : 'text-carbon-muted hover:text-white hover:bg-carbon-card'
                      }`}
                    >
                      <Icon size={20} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
                  
                  <div className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary-green/20 to-carbon-accent/20 rounded-full flex items-center justify-center">
                        <User size={32} className="text-primary-green" />
                      </div>
                      <div>
                        <button className="btn-secondary text-sm">Change Avatar</button>
                        <p className="text-carbon-muted text-sm mt-1">JPG, GIF or PNG. Max size of 2MB.</p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white font-medium mb-2">Full Name</label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-carbon-dark border border-carbon-border rounded-lg text-white focus:border-primary-green outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white font-medium mb-2">Email</label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-carbon-dark border border-carbon-border rounded-lg text-white focus:border-primary-green outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white font-medium mb-2">Phone</label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                          className="w-full px-4 py-3 bg-carbon-dark border border-carbon-border rounded-lg text-white focus:border-primary-green outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white font-medium mb-2">Location</label>
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          placeholder="San Francisco, CA"
                          className="w-full px-4 py-3 bg-carbon-dark border border-carbon-border rounded-lg text-white focus:border-primary-green outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Bio</label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        rows={4}
                        placeholder="Tell us about yourself..."
                        className="w-full px-4 py-3 bg-carbon-dark border border-carbon-border rounded-lg text-white focus:border-primary-green outline-none resize-vertical"
                      />
                    </div>

                    <button
                      onClick={handleProfileSave}
                      disabled={isLoading}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Save size={16} />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  {/* Change Password */}
                  <div className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Current Password</label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full px-4 py-3 bg-carbon-dark border border-carbon-border rounded-lg text-white focus:border-primary-green outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white font-medium mb-2">New Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-4 py-3 pr-12 bg-carbon-dark border border-carbon-border rounded-lg text-white focus:border-primary-green outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-carbon-muted hover:text-white"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-white font-medium mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-4 py-3 bg-carbon-dark border border-carbon-border rounded-lg text-white focus:border-primary-green outline-none"
                        />
                      </div>

                      <button
                        onClick={handlePasswordChange}
                        disabled={isLoading}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Key size={16} />
                        {isLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Two-Factor Authentication</h3>
                    <p className="text-carbon-muted mb-4">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                    </p>
                    <button className="btn-secondary">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-6">
                    {Object.entries({
                      achievements: 'Achievement notifications',
                      goals: 'Goal progress updates',
                      insights: 'Weekly insights',
                      alerts: 'High emission alerts',
                      tips: 'Daily eco-tips',
                      emailDigest: 'Weekly email digest',
                      pushNotifications: 'Browser push notifications'
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-carbon-dark rounded-lg">
                        <span className="text-white">{label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications[key]}
                            onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-carbon-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-green"></div>
                        </label>
                      </div>
                    ))}

                    <button
                      onClick={handleNotificationSave}
                      disabled={isLoading}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Save size={16} />
                      {isLoading ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">App Preferences</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white font-medium mb-2">Theme</label>
                        <select
                          value={preferences.theme}
                          onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                          className="w-full px-4 py-3 bg-carbon-dark border border-carbon-border rounded-lg text-white focus:border-primary-green outline-none"
                        >
                          <option value="dark">Dark</option>
                          <option value="light">Light</option>
                          <option value="auto">Auto</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-white font-medium mb-2">Language</label>
                        <select
                          value={preferences.language}
                          onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                          className="w-full px-4 py-3 bg-carbon-dark border border-carbon-border rounded-lg text-white focus:border-primary-green outline-none"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-white font-medium mb-2">Timezone</label>
                        <select
                          value={preferences.timezone}
                          onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                          className="w-full px-4 py-3 bg-carbon-dark border border-carbon-border rounded-lg text-white focus:border-primary-green outline-none"
                        >
                          <option value="UTC-8">Pacific Time (UTC-8)</option>
                          <option value="UTC-7">Mountain Time (UTC-7)</option>
                          <option value="UTC-6">Central Time (UTC-6)</option>
                          <option value="UTC-5">Eastern Time (UTC-5)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-white font-medium mb-2">Units</label>
                        <select
                          value={preferences.units}
                          onChange={(e) => setPreferences({ ...preferences, units: e.target.value })}
                          className="w-full px-4 py-3 bg-carbon-dark border border-carbon-border rounded-lg text-white focus:border-primary-green outline-none"
                        >
                          <option value="metric">Metric (kg, km)</option>
                          <option value="imperial">Imperial (lbs, miles)</option>
                        </select>
                      </div>
                    </div>

                    <button className="btn-primary flex items-center gap-2">
                      <Save size={16} />
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  {/* Data Export */}
                  <div className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Data Export</h3>
                    <p className="text-carbon-muted mb-4">
                      Download a copy of all your data stored in CarbonWise.
                    </p>
                    <button
                      onClick={exportData}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Download size={16} />
                      Export My Data
                    </button>
                  </div>

                  {/* Delete Account */}
                  <div className="card bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-red-400 mb-4">Danger Zone</h3>
                    <p className="text-carbon-muted mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

              {/* Integrations Tab */}
              {activeTab === 'integrations' && (
                <div className="card bg-carbon-card border border-carbon-border rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Integrations</h2>
                  
                  <div className="space-y-6">
                    {/* Chrome Extension */}
                    <div className="flex items-center justify-between p-4 bg-carbon-dark rounded-lg">
                      <div className="flex items-center gap-4">
                        <Chrome size={24} className="text-primary-green" />
                        <div>
                          <h4 className="text-white font-medium">Chrome Extension</h4>
                          <p className="text-carbon-muted text-sm">Automatically track your digital carbon footprint</p>
                        </div>
                      </div>
                      <button className="btn-primary text-sm">
                        Install Extension
                      </button>
                    </div>

                    {/* Future integrations placeholder */}
                    <div className="p-6 border-2 border-dashed border-carbon-border rounded-lg text-center">
                      <h4 className="text-white font-medium mb-2">More Integrations Coming Soon</h4>
                      <p className="text-carbon-muted text-sm">
                        Connect with your favorite apps and services to automatically track your carbon footprint.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sign Out Button */}
      <section className="py-6 bg-carbon-card border-t border-carbon-border">
        <div className="container-carbon">
          <div className="flex justify-center">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="btn-secondary flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 