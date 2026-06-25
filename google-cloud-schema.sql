-- CarbonWise Database Schema for Google Cloud SQL
-- PostgreSQL 15 optimized schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Users table with Google OAuth integration
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    image_url TEXT,
    google_id VARCHAR(255) UNIQUE,
    account_type VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table for carbon tracking
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    carbon_footprint DECIMAL(10,4) NOT NULL DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'kg_co2',
    activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(100) DEFAULT 'manual',
    metadata JSONB,
    ai_enhanced BOOLEAN DEFAULT FALSE,
    ai_confidence DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Digital activities for web tracking
CREATE TABLE digital_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    page_title TEXT,
    duration_minutes INTEGER DEFAULT 0,
    activity_type VARCHAR(100),
    intensity_level VARCHAR(20) DEFAULT 'medium',
    carbon_footprint DECIMAL(10,4) NOT NULL DEFAULT 0,
    session_id VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals table for user targets
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_type VARCHAR(100) NOT NULL,
    target_value DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'kg_co2',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements table for gamification
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    points INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- AI insights table for enhanced recommendations
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    insight_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    confidence_score DECIMAL(3,2),
    impact_score DECIMAL(3,2),
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB
);

-- Create indexes for better performance
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_date ON activities(activity_date);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_digital_activities_user_id ON digital_activities(user_id);
CREATE INDEX idx_digital_activities_domain ON digital_activities(domain);
CREATE INDEX idx_digital_activities_timestamp ON digital_activities(timestamp);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO users (email, name, google_id, account_type) VALUES
('test@carbonwise.app', 'Test User', 'test_google_id', 'premium');

-- Add some sample activities
INSERT INTO activities (user_id, activity_type, category, description, carbon_footprint, source) 
SELECT id, 'transportation', 'car', 'Daily commute', 5.2, 'manual' FROM users WHERE email = 'test@carbonwise.app';

INSERT INTO activities (user_id, activity_type, category, description, carbon_footprint, source, ai_enhanced) 
SELECT id, 'digital', 'streaming', 'YouTube watching', 0.025, 'extension', true FROM users WHERE email = 'test@carbonwise.app';

-- Add sample digital activities
INSERT INTO digital_activities (user_id, domain, page_title, duration_minutes, activity_type, carbon_footprint)
SELECT id, 'youtube.com', 'Climate Change Video', 30, 'STREAMING', 0.045 FROM users WHERE email = 'test@carbonwise.app';

INSERT INTO digital_activities (user_id, domain, page_title, duration_minutes, activity_type, carbon_footprint)
SELECT id, 'deepseek.com', 'AI Chat Session', 15, 'AI_INTERACTION', 0.012 FROM users WHERE email = 'test@carbonwise.app';

-- Add sample goal
INSERT INTO goals (user_id, goal_type, target_value, start_date, end_date)
SELECT id, 'monthly_carbon', 100.0, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days' FROM users WHERE email = 'test@carbonwise.app';

-- Add sample achievement
INSERT INTO achievements (user_id, achievement_type, title, description, points)
SELECT id, 'first_week', 'First Week Complete', 'Completed your first week of carbon tracking', 100 FROM users WHERE email = 'test@carbonwise.app';

-- Create views for common queries
CREATE VIEW user_carbon_summary AS
SELECT 
    u.id,
    u.email,
    u.name,
    COALESCE(SUM(a.carbon_footprint), 0) as total_carbon,
    COALESCE(SUM(da.carbon_footprint), 0) as digital_carbon,
    COUNT(a.id) as activity_count,
    COUNT(da.id) as digital_activity_count
FROM users u
LEFT JOIN activities a ON u.id = a.user_id
LEFT JOIN digital_activities da ON u.id = da.user_id
GROUP BY u.id, u.email, u.name;

-- Grant permissions (will be set up when we create the database user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO carbonwise_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO carbonwise_user; 