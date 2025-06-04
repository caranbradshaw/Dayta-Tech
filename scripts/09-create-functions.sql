-- Function to get user dashboard stats
CREATE OR REPLACE FUNCTION public.get_user_dashboard_stats(user_uuid UUID)
RETURNS TABLE(
    total_analyses BIGINT,
    completed_analyses BIGINT,
    total_insights BIGINT,
    files_uploaded BIGINT,
    storage_used_mb BIGINT,
    current_plan TEXT,
    trial_days_remaining INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- Analysis stats
        (SELECT COUNT(*) FROM public.analyses WHERE user_id = user_uuid) as total_analyses,
        (SELECT COUNT(*) FROM public.analyses WHERE user_id = user_uuid AND status = 'completed') as completed_analyses,
        
        -- Insights stats
        (SELECT COUNT(*) FROM public.insights i 
         JOIN public.analyses a ON i.analysis_id = a.id 
         WHERE a.user_id = user_uuid) as total_insights,
        
        -- File stats
        (SELECT COUNT(*) FROM public.file_uploads WHERE user_id = user_uuid) as files_uploaded,
        (SELECT COALESCE(SUM(file_size_bytes), 0) / (1024 * 1024) FROM public.file_uploads WHERE user_id = user_uuid) as storage_used_mb,
        
        -- Subscription info
        (SELECT plan_type FROM public.subscriptions WHERE user_id = user_uuid AND status IN ('active', 'trialing') ORDER BY created_at DESC LIMIT 1) as current_plan,
        
        -- Trial days remaining
        (SELECT 
            CASE 
                WHEN status = 'trialing' AND trial_end_date > NOW() 
                THEN EXTRACT(DAY FROM trial_end_date - NOW())::INTEGER
                ELSE 0 
            END
         FROM public.subscriptions 
         WHERE user_id = user_uuid AND status = 'trialing' 
         ORDER BY created_at DESC LIMIT 1) as trial_days_remaining;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent analyses for dashboard
CREATE OR REPLACE FUNCTION public.get_recent_analyses(user_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    id UUID,
    file_name TEXT,
    status TEXT,
    created_at TIMESTAMPTZ,
    insights_count BIGINT,
    file_type TEXT,
    project_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.file_name,
        a.status,
        a.created_at,
        (SELECT COUNT(*) FROM public.insights WHERE analysis_id = a.id) as insights_count,
        a.file_type,
        COALESCE(p.name, 'No Project') as project_name
    FROM public.analyses a
    LEFT JOIN public.projects p ON a.project_id = p.id
    WHERE a.user_id = user_uuid
    ORDER BY a.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can perform action based on subscription
CREATE OR REPLACE FUNCTION public.can_user_perform_action(
    user_uuid UUID,
    action_type TEXT -- 'upload', 'export', 'analyze'
)
RETURNS BOOLEAN AS $$
DECLARE
    current_usage RECORD;
    subscription_limits RECORD;
    can_perform BOOLEAN := FALSE;
BEGIN
    -- Get current usage
    SELECT * INTO current_usage FROM public.get_current_usage(user_uuid);
    
    -- Get subscription limits
    SELECT 
        monthly_uploads_limit,
        monthly_exports_limit,
        monthly_reports_limit
    INTO subscription_limits
    FROM public.subscriptions 
    WHERE user_id = user_uuid 
    AND status IN ('active', 'trialing')
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Check limits based on action type
    CASE action_type
        WHEN 'upload' THEN
            can_perform := COALESCE(current_usage.files_uploaded, 0) < COALESCE(subscription_limits.monthly_uploads_limit, 0);
        WHEN 'export' THEN
            can_perform := COALESCE(current_usage.reports_exported, 0) < COALESCE(subscription_limits.monthly_exports_limit, 0);
        WHEN 'analyze' THEN
            can_perform := COALESCE(current_usage.reports_created, 0) < COALESCE(subscription_limits.monthly_reports_limit, 0);
        ELSE
            can_perform := FALSE;
    END CASE;
    
    RETURN COALESCE(can_perform, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage counter
CREATE OR REPLACE FUNCTION public.increment_usage(
    user_uuid UUID,
    usage_type TEXT, -- 'reports_created', 'reports_exported', 'files_uploaded'
    increment_by INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
    current_period_start TIMESTAMPTZ;
    current_period_end TIMESTAMPTZ;
    usage_record_exists BOOLEAN := FALSE;
BEGIN
    -- Get current subscription period
    SELECT 
        current_period_start,
        current_period_end
    INTO current_period_start, current_period_end
    FROM public.subscriptions 
    WHERE user_id = user_uuid 
    AND status IN ('active', 'trialing')
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Check if usage record exists for current period
    SELECT EXISTS(
        SELECT 1 FROM public.usage_stats 
        WHERE user_id = user_uuid 
        AND period_start <= NOW() 
        AND period_end >= NOW()
    ) INTO usage_record_exists;
    
    -- Create usage record if it doesn't exist
    IF NOT usage_record_exists THEN
        INSERT INTO public.usage_stats (
            user_id,
            subscription_id,
            period_start,
            period_end
        )
        SELECT 
            user_uuid,
            id,
            current_period_start,
            current_period_end
        FROM public.subscriptions 
        WHERE user_id = user_uuid 
        AND status IN ('active', 'trialing')
        ORDER BY created_at DESC 
        LIMIT 1;
    END IF;
    
    -- Increment the usage counter
    CASE usage_type
        WHEN 'reports_created' THEN
            UPDATE public.usage_stats 
            SET reports_created = reports_created + increment_by
            WHERE user_id = user_uuid 
            AND period_start <= NOW() 
            AND period_end >= NOW();
        WHEN 'reports_exported' THEN
            UPDATE public.usage_stats 
            SET reports_exported = reports_exported + increment_by
            WHERE user_id = user_uuid 
            AND period_start <= NOW() 
            AND period_end >= NOW();
        WHEN 'files_uploaded' THEN
            UPDATE public.usage_stats 
            SET files_uploaded = files_uploaded + increment_by
            WHERE user_id = user_uuid 
            AND period_start <= NOW() 
            AND period_end >= NOW();
        ELSE
            RETURN FALSE;
    END CASE;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get organization analytics (for admins)
CREATE OR REPLACE FUNCTION public.get_organization_analytics(org_uuid UUID)
RETURNS TABLE(
    total_members BIGINT,
    total_projects BIGINT,
    total_analyses BIGINT,
    total_insights BIGINT,
    storage_used_gb DECIMAL,
    active_users_last_30_days BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.organization_members WHERE organization_id = org_uuid AND status = 'active') as total_members,
        (SELECT COUNT(*) FROM public.projects WHERE organization_id = org_uuid AND status = 'active') as total_projects,
        (SELECT COUNT(*) FROM public.analyses a 
         JOIN public.projects p ON a.project_id = p.id 
         WHERE p.organization_id = org_uuid) as total_analyses,
        (SELECT COUNT(*) FROM public.insights i 
         JOIN public.analyses a ON i.analysis_id = a.id 
         JOIN public.projects p ON a.project_id = p.id 
         WHERE p.organization_id = org_uuid) as total_insights,
        (SELECT COALESCE(SUM(file_size_bytes), 0) / (1024 * 1024 * 1024) 
         FROM public.file_uploads fu 
         JOIN public.analyses a ON fu.analysis_id = a.id 
         JOIN public.projects p ON a.project_id = p.id 
         WHERE p.organization_id = org_uuid) as storage_used_gb,
        (SELECT COUNT(DISTINCT user_id) 
         FROM public.user_activities ua 
         JOIN public.organization_members om ON ua.user_id = om.user_id 
         WHERE om.organization_id = org_uuid 
         AND ua.created_at >= NOW() - INTERVAL '30 days') as active_users_last_30_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old data (for maintenance)
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS VOID AS $$
BEGIN
    -- Delete old user activities (older than 2 years)
    DELETE FROM public.user_activities 
    WHERE created_at < NOW() - INTERVAL '2 years';
    
    -- Delete old file activities (older than 1 year)
    DELETE FROM public.file_activities 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    -- Delete failed analyses older than 30 days
    DELETE FROM public.analyses 
    WHERE status = 'failed' 
    AND created_at < NOW() - INTERVAL '30 days';
    
    -- Archive old usage stats (older than 2 years)
    -- In a real implementation, you might move these to an archive table
    DELETE FROM public.usage_stats 
    WHERE period_end < NOW() - INTERVAL '2 years';
    
    RAISE NOTICE 'Cleanup completed successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
