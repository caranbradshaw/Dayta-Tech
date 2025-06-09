-- Analytics Functions
CREATE OR REPLACE FUNCTION get_daily_user_growth(start_date DATE, end_date DATE)
RETURNS TABLE(date DATE, users BIGINT, new_users BIGINT) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(start_date, end_date, '1 day'::interval)::date AS date
    ),
    daily_signups AS (
        SELECT 
            DATE(ae.created_at) as signup_date,
            COUNT(*) as new_users
        FROM analytics_events ae
        WHERE ae.event_name = 'sign_up'
        AND DATE(ae.created_at) BETWEEN start_date AND end_date
        GROUP BY DATE(ae.created_at)
    ),
    cumulative_users AS (
        SELECT 
            ds.date,
            COALESCE(ds_new.new_users, 0) as new_users,
            SUM(COALESCE(ds_new.new_users, 0)) OVER (ORDER BY ds.date) as users
        FROM date_series ds
        LEFT JOIN daily_signups ds_new ON ds.date = ds_new.signup_date
    )
    SELECT cu.date, cu.users, cu.new_users
    FROM cumulative_users cu
    ORDER BY cu.date;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_daily_revenue_growth(start_date DATE, end_date DATE)
RETURNS TABLE(date DATE, revenue NUMERIC, subscriptions BIGINT) AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(start_date, end_date, '1 day'::interval)::date AS date
    ),
    daily_revenue AS (
        SELECT 
            DATE(ae.created_at) as revenue_date,
            SUM(ae.revenue) as revenue,
            COUNT(*) as subscriptions
        FROM analytics_events ae
        WHERE ae.event_name IN ('subscription_started', 'subscription_upgraded')
        AND ae.revenue IS NOT NULL
        AND DATE(ae.created_at) BETWEEN start_date AND end_date
        GROUP BY DATE(ae.created_at)
    )
    SELECT 
        ds.date,
        COALESCE(dr.revenue, 0) as revenue,
        COALESCE(dr.subscriptions, 0) as subscriptions
    FROM date_series ds
    LEFT JOIN daily_revenue dr ON ds.date = dr.revenue_date
    ORDER BY ds.date;
END;
$$ LANGUAGE plpgsql;

-- Function to get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(user_uuid UUID)
RETURNS TABLE(
    total_sessions BIGINT,
    total_page_views BIGINT,
    total_files_uploaded BIGINT,
    total_analyses BIGINT,
    last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM user_sessions WHERE user_id = user_uuid) as total_sessions,
        (SELECT COUNT(*) FROM analytics_events WHERE user_id = user_uuid AND event_name = 'page_view') as total_page_views,
        (SELECT COUNT(*) FROM file_uploads WHERE user_id = user_uuid) as total_files_uploaded,
        (SELECT COUNT(*) FROM analyses WHERE user_id = user_uuid) as total_analyses,
        (SELECT MAX(created_at) FROM analytics_events WHERE user_id = user_uuid) as last_activity;
END;
$$ LANGUAGE plpgsql;

-- Function to get popular file types
CREATE OR REPLACE FUNCTION get_popular_file_types(days_back INTEGER DEFAULT 30)
RETURNS TABLE(file_type VARCHAR, upload_count BIGINT, unique_users BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fu.file_type,
        COUNT(*) as upload_count,
        COUNT(DISTINCT fu.user_id) as unique_users
    FROM file_uploads fu
    WHERE fu.created_at >= NOW() - (days_back || ' days')::interval
    AND fu.file_type IS NOT NULL
    GROUP BY fu.file_type
    ORDER BY upload_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate conversion rates
CREATE OR REPLACE FUNCTION get_conversion_rates(start_date DATE, end_date DATE)
RETURNS TABLE(
    total_signups BIGINT,
    email_verified BIGINT,
    first_upload BIGINT,
    first_analysis BIGINT,
    subscribed BIGINT,
    signup_to_verified_rate NUMERIC,
    verified_to_upload_rate NUMERIC,
    upload_to_analysis_rate NUMERIC,
    analysis_to_subscription_rate NUMERIC
) AS $$
DECLARE
    signups BIGINT;
    verified BIGINT;
    uploads BIGINT;
    analyses BIGINT;
    subscriptions BIGINT;
BEGIN
    -- Get signup count
    SELECT COUNT(*) INTO signups
    FROM analytics_events 
    WHERE event_name = 'sign_up' 
    AND DATE(created_at) BETWEEN start_date AND end_date;
    
    -- Get email verified count
    SELECT COUNT(*) INTO verified
    FROM analytics_events 
    WHERE event_name = 'email_verified' 
    AND DATE(created_at) BETWEEN start_date AND end_date;
    
    -- Get first upload count
    SELECT COUNT(*) INTO uploads
    FROM analytics_events 
    WHERE event_name = 'first_file_upload' 
    AND DATE(created_at) BETWEEN start_date AND end_date;
    
    -- Get first analysis count
    SELECT COUNT(*) INTO analyses
    FROM analytics_events 
    WHERE event_name = 'first_analysis' 
    AND DATE(created_at) BETWEEN start_date AND end_date;
    
    -- Get subscription count
    SELECT COUNT(*) INTO subscriptions
    FROM analytics_events 
    WHERE event_name = 'subscription_started' 
    AND DATE(created_at) BETWEEN start_date AND end_date;
    
    RETURN QUERY
    SELECT 
        signups as total_signups,
        verified as email_verified,
        uploads as first_upload,
        analyses as first_analysis,
        subscriptions as subscribed,
        CASE WHEN signups > 0 THEN ROUND((verified::NUMERIC / signups::NUMERIC) * 100, 2) ELSE 0 END as signup_to_verified_rate,
        CASE WHEN verified > 0 THEN ROUND((uploads::NUMERIC / verified::NUMERIC) * 100, 2) ELSE 0 END as verified_to_upload_rate,
        CASE WHEN uploads > 0 THEN ROUND((analyses::NUMERIC / uploads::NUMERIC) * 100, 2) ELSE 0 END as upload_to_analysis_rate,
        CASE WHEN analyses > 0 THEN ROUND((subscriptions::NUMERIC / analyses::NUMERIC) * 100, 2) ELSE 0 END as analysis_to_subscription_rate;
END;
$$ LANGUAGE plpgsql;
