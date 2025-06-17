-- Create email activity tracking table
CREATE TABLE IF NOT EXISTS email_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email_type VARCHAR(50) NOT NULL, -- 'welcome', 'security', 'platform_update'
    region VARCHAR(20) NOT NULL, -- 'nigeria', 'america', 'global', etc.
    user_email VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'sent', -- 'sent', 'failed', 'bounced', 'opened', 'clicked'
    subject TEXT,
    template_version VARCHAR(20),
    message_id VARCHAR(255), -- External email service message ID
    metadata JSONB DEFAULT '{}', -- Additional data like IP, change type, etc.
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_activities_user_email ON email_activities(user_email);
CREATE INDEX IF NOT EXISTS idx_email_activities_user_id ON email_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_email_activities_email_type ON email_activities(email_type);
CREATE INDEX IF NOT EXISTS idx_email_activities_region ON email_activities(region);
CREATE INDEX IF NOT EXISTS idx_email_activities_status ON email_activities(status);
CREATE INDEX IF NOT EXISTS idx_email_activities_sent_at ON email_activities(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_activities_message_id ON email_activities(message_id);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_email_activities_user_type ON email_activities(user_email, email_type);
CREATE INDEX IF NOT EXISTS idx_email_activities_region_type ON email_activities(region, email_type);
CREATE INDEX IF NOT EXISTS idx_email_activities_status_sent ON email_activities(status, sent_at);

-- Enable RLS
ALTER TABLE email_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own email activities" ON email_activities
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            user_id = auth.uid() OR 
            user_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- Admin policy for viewing all email activities
CREATE POLICY "Admins can view all email activities" ON email_activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_email_activities_updated_at
    BEFORE UPDATE ON email_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_email_activities_updated_at();

-- Create function to get email activity stats
CREATE OR REPLACE FUNCTION get_email_activity_stats(
    p_region VARCHAR DEFAULT NULL,
    p_email_type VARCHAR DEFAULT NULL,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
    email_type VARCHAR,
    region VARCHAR,
    total_sent BIGINT,
    total_opened BIGINT,
    total_clicked BIGINT,
    total_bounced BIGINT,
    total_failed BIGINT,
    open_rate NUMERIC,
    click_rate NUMERIC,
    bounce_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ea.email_type,
        ea.region,
        COUNT(*) as total_sent,
        COUNT(ea.opened_at) as total_opened,
        COUNT(ea.clicked_at) as total_clicked,
        COUNT(CASE WHEN ea.status = 'bounced' THEN 1 END) as total_bounced,
        COUNT(CASE WHEN ea.status = 'failed' THEN 1 END) as total_failed,
        CASE 
            WHEN COUNT(*) > 0 THEN ROUND((COUNT(ea.opened_at)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0
        END as open_rate,
        CASE 
            WHEN COUNT(*) > 0 THEN ROUND((COUNT(ea.clicked_at)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0
        END as click_rate,
        CASE 
            WHEN COUNT(*) > 0 THEN ROUND((COUNT(CASE WHEN ea.status = 'bounced' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
            ELSE 0
        END as bounce_rate
    FROM email_activities ea
    WHERE 
        ea.sent_at BETWEEN p_start_date AND p_end_date
        AND (p_region IS NULL OR ea.region = p_region)
        AND (p_email_type IS NULL OR ea.email_type = p_email_type)
    GROUP BY ea.email_type, ea.region
    ORDER BY ea.email_type, ea.region;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data for testing
INSERT INTO email_activities (
    email_type, 
    region, 
    user_email, 
    status, 
    subject, 
    template_version,
    message_id,
    metadata
) VALUES 
(
    'welcome', 
    'nigeria', 
    'test@example.ng', 
    'sent', 
    'Welcome to DaytaTech Nigeria! 🇳🇬 Your 30-Day PRO Trial Starts Now!',
    'v1.0',
    'msg_' || gen_random_uuid()::text,
    '{"test": true, "signup_source": "website"}'
),
(
    'security', 
    'america', 
    'test@example.com', 
    'sent', 
    '🔐 Security Alert: Password Changed - DaytaTech America',
    'v1.0',
    'msg_' || gen_random_uuid()::text,
    '{"change_type": "password", "ip_address": "192.168.1.1"}'
),
(
    'platform_update', 
    'nigeria', 
    'test@example.ng', 
    'sent', 
    '🔧 Scheduled Maintenance - DaytaTech Nigeria Platform',
    'v1.0',
    'msg_' || gen_random_uuid()::text,
    '{"update_type": "maintenance", "duration_minutes": 120}'
);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON email_activities TO authenticated;
GRANT EXECUTE ON FUNCTION get_email_activity_stats TO authenticated;

-- Create view for easy email activity reporting
CREATE OR REPLACE VIEW email_activity_summary AS
SELECT 
    email_type,
    region,
    DATE_TRUNC('day', sent_at) as date,
    COUNT(*) as emails_sent,
    COUNT(opened_at) as emails_opened,
    COUNT(clicked_at) as emails_clicked,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as emails_failed,
    COUNT(CASE WHEN status = 'bounced' THEN 1 END) as emails_bounced
FROM email_activities
GROUP BY email_type, region, DATE_TRUNC('day', sent_at)
ORDER BY date DESC, email_type, region;

-- Grant access to the view
GRANT SELECT ON email_activity_summary TO authenticated;

COMMENT ON TABLE email_activities IS 'Tracks all email activities for the DaytaTech platform with regional support';
COMMENT ON FUNCTION get_email_activity_stats IS 'Returns email activity statistics with open rates, click rates, and bounce rates';
