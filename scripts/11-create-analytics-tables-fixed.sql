-- Enable required extensions first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create analytics_events table (core tracking)
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name VARCHAR(100) NOT NULL,
    user_id UUID,
    session_id UUID,
    properties JSONB DEFAULT '{}',
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    page_views INTEGER DEFAULT 0,
    device_type VARCHAR(50),
    browser VARCHAR(50),
    os VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100)
);

-- Create business_metrics table
CREATE TABLE IF NOT EXISTS business_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2),
    metric_date DATE DEFAULT CURRENT_DATE,
    user_id UUID,
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create file_analytics table
CREATE TABLE IF NOT EXISTS file_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    file_name TEXT,
    file_type VARCHAR(50),
    file_size BIGINT,
    upload_status VARCHAR(20) DEFAULT 'pending',
    processing_time_ms INTEGER,
    ai_provider VARCHAR(50),
    analysis_success BOOLEAN DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_start ON user_sessions(session_start);

CREATE INDEX IF NOT EXISTS idx_business_metrics_metric_name ON business_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_business_metrics_metric_date ON business_metrics(metric_date);

CREATE INDEX IF NOT EXISTS idx_file_analytics_user_id ON file_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_file_analytics_created_at ON file_analytics(created_at);

-- Enable Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (simplified)
CREATE POLICY "Users can view own analytics" ON analytics_events
    FOR SELECT USING (user_id::text = (SELECT auth.uid()::text));

CREATE POLICY "Users can insert own analytics" ON analytics_events
    FOR INSERT WITH CHECK (user_id::text = (SELECT auth.uid()::text) OR auth.uid() IS NULL);

CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (user_id::text = (SELECT auth.uid()::text));

CREATE POLICY "Users can insert own sessions" ON user_sessions
    FOR INSERT WITH CHECK (user_id::text = (SELECT auth.uid()::text) OR auth.uid() IS NULL);

CREATE POLICY "Users can view own metrics" ON business_metrics
    FOR SELECT USING (user_id::text = (SELECT auth.uid()::text));

CREATE POLICY "Users can insert own metrics" ON business_metrics
    FOR INSERT WITH CHECK (user_id::text = (SELECT auth.uid()::text) OR auth.uid() IS NULL);

CREATE POLICY "Users can view own file analytics" ON file_analytics
    FOR SELECT USING (user_id::text = (SELECT auth.uid()::text));

CREATE POLICY "Users can insert own file analytics" ON file_analytics
    FOR INSERT WITH CHECK (user_id::text = (SELECT auth.uid()::text) OR auth.uid() IS NULL);
