-- Function to get daily user growth
CREATE OR REPLACE FUNCTION get_daily_user_growth(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    date DATE,
    new_users BIGINT,
    total_users BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH daily_signups AS (
        SELECT 
            DATE(created_at) as signup_date,
            COUNT(*) as new_users
        FROM analytics_events 
        WHERE event_name = 'user_signup' 
        AND created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
        GROUP BY DATE(created_at)
    ),
    running_totals AS (
        SELECT 
            signup_date,
            new_users,
            SUM(new_users) OVER (ORDER BY signup_date) as total_users
        FROM daily_signups
    )
    SELECT 
        signup_date::DATE,
        new_users,
        total_users
    FROM running_totals
    ORDER BY signup_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get conversion rates
CREATE OR REPLACE FUNCTION get_conversion_rates()
RETURNS TABLE (
    step_name TEXT,
    users_count BIGINT,
    conversion_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH funnel_steps AS (
        SELECT 'page_view' as step, COUNT(DISTINCT user_id) as users FROM analytics_events WHERE event_name = 'page_view'
        UNION ALL
        SELECT 'signup_started' as step, COUNT(DISTINCT user_id) as users FROM analytics_events WHERE event_name = 'signup_started'
        UNION ALL
        SELECT 'signup_completed' as step, COUNT(DISTINCT user_id) as users FROM analytics_events WHERE event_name = 'user_signup'
        UNION ALL
        SELECT 'first_upload' as step, COUNT(DISTINCT user_id) as users FROM analytics_events WHERE event_name = 'file_uploaded'
        UNION ALL
        SELECT 'subscription_started' as step, COUNT(DISTINCT user_id) as users FROM analytics_events WHERE event_name = 'subscription_started'
    ),
    total_visitors AS (
        SELECT users as total FROM funnel_steps WHERE step = 'page_view'
    )
    SELECT 
        f.step::TEXT,
        f.users,
        ROUND((f.users::DECIMAL / t.total::DECIMAL) * 100, 2) as conversion_rate
    FROM funnel_steps f
    CROSS JOIN total_visitors t
    ORDER BY f.users DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get popular file types
CREATE OR REPLACE FUNCTION get_popular_file_types()
RETURNS TABLE (
    file_type TEXT,
    upload_count BIGINT,
    success_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fa.file_type::TEXT,
        COUNT(*)::BIGINT as upload_count,
        ROUND((COUNT(*) FILTER (WHERE fa.analysis_success = true)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2) as success_rate
    FROM file_analytics fa
    WHERE fa.file_type IS NOT NULL
    GROUP BY fa.file_type
    ORDER BY upload_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get revenue metrics
CREATE OR REPLACE FUNCTION get_revenue_metrics(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    metric_date DATE,
    daily_revenue DECIMAL(15,2),
    cumulative_revenue DECIMAL(15,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH daily_revenue AS (
        SELECT 
            bm.metric_date,
            SUM(bm.metric_value) as daily_revenue
        FROM business_metrics bm
        WHERE bm.metric_name = 'revenue'
        AND bm.metric_date >= CURRENT_DATE - INTERVAL '1 day' * days_back
        GROUP BY bm.metric_date
    )
    SELECT 
        dr.metric_date,
        dr.daily_revenue,
        SUM(dr.daily_revenue) OVER (ORDER BY dr.metric_date) as cumulative_revenue
    FROM daily_revenue dr
    ORDER BY dr.metric_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
