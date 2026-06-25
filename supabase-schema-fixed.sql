-- CarbonWise Database Schema for Supabase (Fixed Version)
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
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
CREATE TABLE IF NOT EXISTS public.carbon_activities (
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
CREATE TABLE IF NOT EXISTS public.goals (
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
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(100) NOT NULL, -- 'first_week', 'low_carbon_day', etc.
  name VARCHAR(255) NOT NULL,
  description TEXT,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_carbon_activities_user_id ON public.carbon_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_carbon_activities_timestamp ON public.carbon_activities(timestamp);
CREATE INDEX IF NOT EXISTS idx_carbon_activities_type ON public.carbon_activities(type);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own activities" ON public.carbon_activities;
DROP POLICY IF EXISTS "Users can view own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can view own achievements" ON public.achievements;

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

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS handle_updated_at_users ON public.users;
DROP TRIGGER IF EXISTS handle_updated_at_carbon_activities ON public.carbon_activities;
DROP TRIGGER IF EXISTS handle_updated_at_goals ON public.goals;

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

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, image)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'CarbonWise database schema created successfully! 🎉';
  RAISE NOTICE 'Tables created: users, carbon_activities, goals, achievements';
  RAISE NOTICE 'RLS policies enabled for data security';
  RAISE NOTICE 'Auto-user creation trigger installed';
  RAISE NOTICE 'Ready to start tracking carbon footprints! 🌱';
END $$; 