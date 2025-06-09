-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    properties JSONB DEFAULT '{}',
    revenue DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File Uploads Table (enhanced version)
CREATE TABLE IF NOT EXISTS file_uploads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    file_url TEXT,
    analysis_id UUID,
    upload_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File Activities Table
CREATE TABLE IF NOT EXISTS file_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_id UUID REFERENCES file_uploads(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'upload', 'download', 'export', 'delete'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start_time ON user_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);

CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_created_at ON file_uploads(created_at);
CREATE INDEX IF NOT EXISTS idx_file_uploads_file_type ON file_uploads(file_type);

CREATE INDEX IF NOT EXISTS idx_file_activities_user_id ON file_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_file_activities_activity_type ON file_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_file_activities_created_at ON file_activities(created_at);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_events
CREATE POLICY "Users can view their own analytics events" ON analytics_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics events" ON analytics_events
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own sessions" ON user_sessions
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for file_uploads
CREATE POLICY "Users can view their own file uploads" ON file_uploads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own file uploads" ON file_uploads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own file uploads" ON file_uploads
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for file_activities
CREATE POLICY "Users can view their own file activities" ON file_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own file activities" ON file_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin policies for analytics dashboard
CREATE POLICY "Admins can view all analytics events" ON analytics_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can view all user sessions" ON user_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can view all file uploads" ON file_uploads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can view all file activities" ON file_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
