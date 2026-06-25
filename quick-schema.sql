-- Quick setup for CarbonWise
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    carbon_footprint DECIMAL(10,4) NOT NULL DEFAULT 0,
    activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Digital activities table
CREATE TABLE IF NOT EXISTS digital_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    carbon_footprint DECIMAL(10,4) NOT NULL DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test data
INSERT INTO users (email, name, google_id) VALUES 
('test@carbonwise.app', 'Test User', 'test_google_id') 
ON CONFLICT (email) DO NOTHING;

SELECT 'Schema setup complete!' as result;
