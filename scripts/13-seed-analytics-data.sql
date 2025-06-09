-- Insert sample analytics events for testing
INSERT INTO analytics_events (event_name, user_id, session_id, page_url, properties, revenue, created_at) VALUES
-- Sign up events
('sign_up', (SELECT id FROM auth.users LIMIT 1), 'session_001', '/signup', '{"plan": "basic"}', NULL, NOW() - INTERVAL '30 days'),
('sign_up', (SELECT id FROM auth.users LIMIT 1), 'session_002', '/signup', '{"plan": "pro"}', NULL, NOW() - INTERVAL '25 days'),
('sign_up', (SELECT id FROM auth.users LIMIT 1), 'session_003', '/signup', '{"plan": "basic"}', NULL, NOW() - INTERVAL '20 days'),

-- Email verification events
('email_verified', (SELECT id FROM auth.users LIMIT 1), 'session_001', '/verification', '{}', NULL, NOW() - INTERVAL '29 days'),
('email_verified', (SELECT id FROM auth.users LIMIT 1), 'session_002', '/verification', '{}', NULL, NOW() - INTERVAL '24 days'),

-- Page view events
('page_view', (SELECT id FROM auth.users LIMIT 1), 'session_001', '/dashboard', '{}', NULL, NOW() - INTERVAL '28 days'),
('page_view', (SELECT id FROM auth.users LIMIT 1), 'session_001', '/upload', '{}', NULL, NOW() - INTERVAL '28 days'),
('page_view', (SELECT id FROM auth.users LIMIT 1), 'session_002', '/dashboard', '{}', NULL, NOW() - INTERVAL '23 days'),

-- File upload events
('first_file_upload', (SELECT id FROM auth.users LIMIT 1), 'session_001', '/upload', '{"file_type": "csv", "file_size": 1024000}', NULL, NOW() - INTERVAL '27 days'),
('file_upload', (SELECT id FROM auth.users LIMIT 1), 'session_002', '/upload', '{"file_type": "xlsx", "file_size": 2048000}', NULL, NOW() - INTERVAL '22 days'),

-- Analysis events
('first_analysis', (SELECT id FROM auth.users LIMIT 1), 'session_001', '/analysis', '{"ai_provider": "groq", "processing_time": 15}', NULL, NOW() - INTERVAL '26 days'),
('analysis_completed', (SELECT id FROM auth.users LIMIT 1), 'session_002', '/analysis', '{"ai_provider": "openai", "processing_time": 8}', NULL, NOW() - INTERVAL '21 days'),

-- Feature usage events
('feature_used', (SELECT id FROM auth.users LIMIT 1), 'session_001', '/dashboard', '{"feature": "data_visualization"}', NULL, NOW() - INTERVAL '25 days'),
('feature_used', (SELECT id FROM auth.users LIMIT 1), 'session_002', '/dashboard', '{"feature": "export_report"}', NULL, NOW() - INTERVAL '20 days'),

-- Subscription events
('subscription_started', (SELECT id FROM auth.users LIMIT 1), 'session_002', '/billing', '{"plan": "pro", "billing_cycle": "monthly"}', 29.99, NOW() - INTERVAL '19 days'),

-- Recent activity
('page_view', (SELECT id FROM auth.users LIMIT 1), 'session_current', '/dashboard', '{}', NULL, NOW() - INTERVAL '1 hour'),
('feature_used', (SELECT id FROM auth.users LIMIT 1), 'session_current', '/dashboard', '{"feature": "ai_analysis"}', NULL, NOW() - INTERVAL '30 minutes');

-- Insert sample user sessions
INSERT INTO user_sessions (user_id, session_id, start_time, end_time, page_views, events_count, duration_seconds, device_type, browser, os, country, city) VALUES
((SELECT id FROM auth.users LIMIT 1), 'session_001', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days' + INTERVAL '45 minutes', 5, 8, 2700, 'desktop', 'Chrome', 'Windows', 'United States', 'New York'),
((SELECT id FROM auth.users LIMIT 1), 'session_002', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days' + INTERVAL '1 hour 20 minutes', 7, 12, 4800, 'desktop', 'Firefox', 'macOS', 'United States', 'San Francisco'),
((SELECT id FROM auth.users LIMIT 1), 'session_003', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days' + INTERVAL '25 minutes', 3, 4, 1500, 'mobile', 'Safari', 'iOS', 'Canada', 'Toronto'),
((SELECT id FROM auth.users LIMIT 1), 'session_current', NOW() - INTERVAL '2 hours', NULL, 4, 6, NULL, 'desktop', 'Chrome', 'Windows', 'United States', 'New York');

-- Insert sample file activities
INSERT INTO file_activities (user_id, file_id, activity_type, metadata) VALUES
((SELECT id FROM auth.users LIMIT 1), (SELECT id FROM file_uploads LIMIT 1), 'upload', '{"source": "drag_drop"}'),
((SELECT id FROM auth.users LIMIT 1), (SELECT id FROM file_uploads LIMIT 1), 'export', '{"format": "pdf", "report_type": "summary"}');

-- Add some comments for clarity
COMMENT ON TABLE analytics_events IS 'Stores all user interaction events for analytics tracking';
COMMENT ON TABLE user_sessions IS 'Tracks user sessions with device and location information';
COMMENT ON TABLE file_activities IS 'Tracks file-related activities like uploads, downloads, exports';

COMMENT ON COLUMN analytics_events.event_name IS 'Type of event (sign_up, page_view, feature_used, etc.)';
COMMENT ON COLUMN analytics_events.properties IS 'Additional event data stored as JSON';
COMMENT ON COLUMN analytics_events.revenue IS 'Revenue amount associated with the event (for subscription events)';

COMMENT ON COLUMN user_sessions.duration_seconds IS 'Session duration in seconds (NULL for active sessions)';
COMMENT ON COLUMN user_sessions.device_type IS 'Device type: desktop, mobile, tablet';
