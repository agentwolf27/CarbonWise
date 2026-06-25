-- CarbonWise Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255), -- for email/password auth
  image VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  account_type VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carbon Activities table
CREATE TABLE public.carbon_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 4) NOT NULL, -- CO2 amount in kg
  description TEXT NOT NULL,
  location JSONB, -- Store lat/lng and address
  metadata JSONB, -- Store additional data (url, duration, etc.)
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals table
CREATE TABLE public.goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target DECIMAL(10, 4) NOT NULL, -- Target amount
  current DECIMAL(10, 4) DEFAULT 0, -- Current progress
  unit VARCHAR(50) DEFAULT 'kg_co2', -- Unit of measurement
  period VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table
CREATE TABLE public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(100) NOT NULL, -- 'first_week', 'low_carbon_day', etc.
  name VARCHAR(255) NOT NULL,
  description TEXT,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_carbon_activities_user_id ON public.carbon_activities(user_id);
CREATE INDEX idx_carbon_activities_timestamp ON public.carbon_activities(timestamp);
CREATE INDEX idx_carbon_activities_type ON public.carbon_activities(type);
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_achievements_user_id ON public.achievements(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see/edit their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own activities" ON public.carbon_activities
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own goals" ON public.goals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON public.achievements
  FOR ALL USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER handle_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_carbon_activities
  BEFORE UPDATE ON public.carbon_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_goals
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data for testing
INSERT INTO public.users (id, email, name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'demo@carbonwise.com', 'Demo User', 'user');

INSERT INTO public.carbon_activities (user_id, type, category, amount, description, metadata, timestamp) VALUES
  ('00000000-0000-0000-0000-000000000001', 'STREAMING', 'ENTERTAINMENT', 0.125, 'Watched YouTube videos', '{"url": "youtube.com", "duration": 3600}', NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000001', 'BROWSING', 'PRODUCTIVITY', 0.045, 'Google search and browsing', '{"url": "google.com", "duration": 1800}', NOW() - INTERVAL '2 hours'),
  ('00000000-0000-0000-0000-000000000001', 'AI_INTERACTION', 'PRODUCTIVITY', 0.089, 'AI chat session', '{"url": "chat.deepseek.com", "duration": 2400}', NOW() - INTERVAL '30 minutes');

INSERT INTO public.goals (user_id, title, description, target, current, period) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Monthly Carbon Reduction', 'Reduce digital carbon footprint by 20%', 10.0, 2.5, 'monthly'),
  ('00000000-0000-0000-0000-000000000001', 'Daily Streaming Limit', 'Limit streaming to 2 hours per day', 2.0, 1.5, 'daily');

INSERT INTO public.achievements (user_id, type, name, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'first_activity', 'First Step', 'Logged your first carbon activity'),
  ('00000000-0000-0000-0000-000000000001', 'week_tracker', 'Week Warrior', 'Tracked activities for a full week'); 