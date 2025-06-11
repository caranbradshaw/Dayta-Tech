-- Seed analytics data (fixed version)
-- First, let's check if the analytics tables exist and create them if needed

-- Create analytics tables if they don't exist
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id TEXT,
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    page_views INTEGER DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    referrer TEXT,
    landing_page TEXT,
    exit_page TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    country TEXT,
    city TEXT
);

CREATE TABLE IF NOT EXISTS analytics_page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    page_url TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    time_on_page INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on analytics tables
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_page_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics tables
DROP POLICY IF EXISTS "Users can view own analytics events" ON analytics_events;
CREATE POLICY "Users can view own analytics events" ON analytics_events
    FOR ALL USING (auth.uid() = user_id OR auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

DROP POLICY IF EXISTS "Users can view own analytics sessions" ON analytics_sessions;
CREATE POLICY "Users can view own analytics sessions" ON analytics_sessions
    FOR ALL USING (auth.uid() = user_id OR auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

DROP POLICY IF EXISTS "Users can view own page views" ON analytics_page_views;
CREATE POLICY "Users can view own page views" ON analytics_page_views
    FOR ALL USING (auth.uid() = user_id OR auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

-- Insert sample analytics data
-- Note: We'll use placeholder UUIDs for demo purposes
INSERT INTO analytics_sessions (session_id, started_at, page_views, duration_seconds, referrer, landing_page, device_type, browser, os, country, city) VALUES
('session_001', NOW() - INTERVAL '7 days', 5, 1200, 'https://google.com', '/', 'desktop', 'Chrome', 'Windows', 'United States', 'New York'),
('session_002', NOW() - INTERVAL '6 days', 3, 800, 'https://linkedin.com', '/nigeria', 'mobile', 'Safari', 'iOS', 'Nigeria', 'Lagos'),
('session_003', NOW() - INTERVAL '5 days', 8, 2400, 'direct', '/', 'desktop', 'Firefox', 'macOS', 'United Kingdom', 'London'),
('session_004', NOW() - INTERVAL '4 days', 2, 300, 'https://twitter.com', '/demo', 'tablet', 'Chrome', 'Android', 'Canada', 'Toronto'),
('session_005', NOW() - INTERVAL '3 days', 6, 1800, 'https://google.com', '/signup', 'desktop', 'Edge', 'Windows', 'Australia', 'Sydney'),
('session_006', NOW() - INTERVAL '2 days', 4, 900, 'https://facebook.com', '/nigeria', 'mobile', 'Chrome', 'Android', 'Nigeria', 'Abuja'),
('session_007', NOW() - INTERVAL '1 day', 7, 2100, 'direct', '/dashboard', 'desktop', 'Chrome', 'macOS', 'Germany', 'Berlin'),
('session_008', NOW() - INTERVAL '12 hours', 3, 600, 'https://google.com', '/faq', 'mobile', 'Safari', 'iOS', 'France', 'Paris');

-- Insert sample page views
INSERT INTO analytics_page_views (session_id, page_url, page_title, referrer, time_on_page, created_at) VALUES
('session_001', '/', 'DaytaTech - Home', 'https://google.com', 120, NOW() - INTERVAL '7 days'),
('session_001', '/demo', 'Demo - DaytaTech', '/', 300, NOW() - INTERVAL '7 days' + INTERVAL '2 minutes'),
('session_001', '/signup', 'Sign Up - DaytaTech', '/demo', 180, NOW() - INTERVAL '7 days' + INTERVAL '7 minutes'),
('session_002', '/nigeria', 'DaytaTech Nigeria', 'https://linkedin.com', 200, NOW() - INTERVAL '6 days'),
('session_002', '/demo', 'Demo - DaytaTech', '/nigeria', 250, NOW() - INTERVAL '6 days' + INTERVAL '3 minutes'),
('session_003', '/', 'DaytaTech - Home', 'direct', 90, NOW() - INTERVAL '5 days'),
('session_003', '/faq', 'FAQ - DaytaTech', '/', 150, NOW() - INTERVAL '5 days' + INTERVAL '2 minutes'),
('session_003', '/security', 'Security - DaytaTech', '/faq', 180, NOW() - INTERVAL '5 days' + INTERVAL '4 minutes'),
('session_003', '/signup', 'Sign Up - DaytaTech', '/security', 240, NOW() - INTERVAL '5 days' + INTERVAL '7 minutes');

-- Insert sample events
INSERT INTO analytics_events (event_type, event_data, session_id, page_url, created_at) VALUES
('page_view', '{"page": "/", "title": "DaytaTech - Home"}', 'session_001', '/', NOW() - INTERVAL '7 days'),
('button_click', '{"button": "Start Free Trial", "location": "hero"}', 'session_001', '/', NOW() - INTERVAL '7 days' + INTERVAL '30 seconds'),
('page_view', '{"page": "/demo", "title": "Demo"}', 'session_001', '/demo', NOW() - INTERVAL '7 days' + INTERVAL '2 minutes'),
('demo_interaction', '{"action": "file_upload", "file_type": "csv"}', 'session_001', '/demo', NOW() - INTERVAL '7 days' + INTERVAL '3 minutes'),
('form_submission', '{"form": "signup", "plan": "pro"}', 'session_001', '/signup', NOW() - INTERVAL '7 days' + INTERVAL '8 minutes'),
('page_view', '{"page": "/nigeria", "title": "DaytaTech Nigeria"}', 'session_002', '/nigeria', NOW() - INTERVAL '6 days'),
('button_click', '{"button": "See How It Works", "location": "hero"}', 'session_002', '/nigeria', NOW() - INTERVAL '6 days' + INTERVAL '45 seconds'),
('contact_form', '{"type": "sales_inquiry", "plan": "team"}', 'session_002', '/nigeria', NOW() - INTERVAL '6 days' + INTERVAL '4 minutes'),
('page_view', '{"page": "/faq", "title": "FAQ"}', 'session_003', '/faq', NOW() - INTERVAL '5 days'),
('search', '{"query": "pricing", "results": 5}', 'session_003', '/faq', NOW() - INTERVAL '5 days' + INTERVAL '1 minute');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user_id ON analytics_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started_at ON analytics_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_session_id ON analytics_page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_created_at ON analytics_page_views(created_at);

-- Create a view for analytics summary
CREATE OR REPLACE VIEW analytics_summary AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_events,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as page_views,
    COUNT(CASE WHEN event_type = 'button_click' THEN 1 END) as button_clicks,
    COUNT(CASE WHEN event_type = 'form_submission' THEN 1 END) as form_submissions
FROM analytics_events 
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Grant permissions
GRANT SELECT ON analytics_summary TO authenticated;
GRANT ALL ON analytics_events TO authenticated;
GRANT ALL ON analytics_sessions TO authenticated;
GRANT ALL ON analytics_page_views TO authenticated;
