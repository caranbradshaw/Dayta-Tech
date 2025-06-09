-- Simple Analytics Tables (no dependencies)
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    user_id UUID,
    session_id VARCHAR(100),
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    properties JSONB DEFAULT '{}',
    revenue DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions Table (no foreign keys initially)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    session_id VARCHAR(100) UNIQUE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    page_views INTEGER DEFAULT 0,
    events_count INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start_time ON user_sessions(start_time);

-- Enable RLS (but no policies yet)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Basic policies that don't depend on other tables
CREATE POLICY "Allow insert for analytics_events" ON analytics_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select for analytics_events" ON analytics_events
    FOR SELECT USING (true);

CREATE POLICY "Allow insert for user_sessions" ON user_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select for user_sessions" ON user_sessions
    FOR SELECT USING (true);

CREATE POLICY "Allow update for user_sessions" ON user_sessions
    FOR UPDATE USING (true);
