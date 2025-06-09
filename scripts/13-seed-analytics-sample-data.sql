-- Insert sample analytics events
INSERT INTO analytics_events (event_name, user_id, properties, page_url, created_at) VALUES
('page_view', uuid_generate_v4(), '{"page": "landing"}', '/', NOW() - INTERVAL '7 days'),
('page_view', uuid_generate_v4(), '{"page": "pricing"}', '/pricing', NOW() - INTERVAL '6 days'),
('signup_started', uuid_generate_v4(), '{"plan": "pro"}', '/signup', NOW() - INTERVAL '5 days'),
('user_signup', uuid_generate_v4(), '{"plan": "pro"}', '/signup', NOW() - INTERVAL '5 days'),
('file_uploaded', uuid_generate_v4(), '{"file_type": "csv"}', '/upload', NOW() - INTERVAL '4 days'),
('analysis_completed', uuid_generate_v4(), '{"ai_provider": "openai"}', '/analysis', NOW() - INTERVAL '3 days'),
('subscription_started', uuid_generate_v4(), '{"plan": "pro", "amount": 29.99}', '/checkout', NOW() - INTERVAL '2 days');

-- Insert sample user sessions
INSERT INTO user_sessions (user_id, session_start, session_end, page_views, device_type, browser) VALUES
(uuid_generate_v4(), NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 5, 'desktop', 'chrome'),
(uuid_generate_v4(), NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '30 minutes', 3, 'mobile', 'safari'),
(uuid_generate_v4(), NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '45 minutes', 8, 'desktop', 'firefox');

-- Insert sample business metrics
INSERT INTO business_metrics (metric_name, metric_value, metric_date) VALUES
('revenue', 29.99, CURRENT_DATE - 1),
('revenue', 59.98, CURRENT_DATE - 2),
('revenue', 89.97, CURRENT_DATE - 3),
('mrr', 299.90, CURRENT_DATE),
('active_users', 150, CURRENT_DATE),
('churn_rate', 2.5, CURRENT_DATE);

-- Insert sample file analytics
INSERT INTO file_analytics (user_id, file_name, file_type, file_size, upload_status, processing_time_ms, ai_provider, analysis_success) VALUES
(uuid_generate_v4(), 'sales_data.csv', 'csv', 1024000, 'completed', 2500, 'openai', true),
(uuid_generate_v4(), 'customer_data.xlsx', 'xlsx', 2048000, 'completed', 3200, 'groq', true),
(uuid_generate_v4(), 'financial_report.json', 'json', 512000, 'completed', 1800, 'openai', true),
(uuid_generate_v4(), 'large_dataset.csv', 'csv', 10240000, 'failed', 0, null, false);
