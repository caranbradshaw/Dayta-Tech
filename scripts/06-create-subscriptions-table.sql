-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    
    -- Subscription details
    plan_type TEXT NOT NULL CHECK (plan_type IN ('trial', 'basic', 'pro', 'enterprise')),
    status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing', 'paused')),
    
    -- Trial information
    trial_start_date TIMESTAMPTZ,
    trial_end_date TIMESTAMPTZ,
    
    -- Billing cycle
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    
    -- External billing integration
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    
    -- Usage limits
    monthly_reports_limit INTEGER NOT NULL DEFAULT 10,
    monthly_exports_limit INTEGER NOT NULL DEFAULT 5,
    monthly_uploads_limit INTEGER NOT NULL DEFAULT 50,
    storage_limit_gb INTEGER NOT NULL DEFAULT 5,
    
    -- Feature access
    features JSONB NOT NULL DEFAULT '{
        "basic_insights": true,
        "csv_support": true,
        "excel_support": false,
        "advanced_insights": false,
        "all_file_formats": false,
        "industry_specific_analysis": false,
        "historical_learning": false,
        "team_collaboration": false,
        "priority_support": false,
        "api_access": false,
        "custom_integrations": false,
        "dedicated_support": false
    }'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS public.usage_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    
    -- Usage counters (reset monthly)
    reports_created INTEGER DEFAULT 0,
    reports_exported INTEGER DEFAULT 0,
    files_uploaded INTEGER DEFAULT 0,
    storage_used_mb INTEGER DEFAULT 0,
    
    -- API usage (for higher tiers)
    api_calls_made INTEGER DEFAULT 0,
    
    -- Period tracking
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, period_start)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS subscriptions_user_idx ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_org_idx ON public.subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS subscriptions_plan_idx ON public.subscriptions(plan_type);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_idx ON public.subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS usage_stats_user_idx ON public.usage_stats(user_id);
CREATE INDEX IF NOT EXISTS usage_stats_subscription_idx ON public.usage_stats(subscription_id);
CREATE INDEX IF NOT EXISTS usage_stats_period_idx ON public.usage_stats(period_start, period_end);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;

-- Subscription policies
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their organization subscriptions" ON public.subscriptions
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id 
            FROM public.organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "System can manage subscriptions" ON public.subscriptions
    FOR ALL USING (TRUE); -- This will be restricted to service role

-- Usage stats policies
CREATE POLICY "Users can view their own usage stats" ON public.usage_stats
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage usage stats" ON public.usage_stats
    FOR ALL USING (TRUE); -- This will be restricted to service role

-- Add updated_at triggers
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_usage_stats_updated_at
    BEFORE UPDATE ON public.usage_stats
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create default subscription for new users
CREATE OR REPLACE FUNCTION public.create_default_subscription()
RETURNS TRIGGER AS $$
DECLARE
    sub_id UUID;
BEGIN
    -- Create trial subscription
    INSERT INTO public.subscriptions (
        user_id,
        plan_type,
        status,
        trial_start_date,
        trial_end_date,
        current_period_start,
        current_period_end,
        monthly_reports_limit,
        monthly_exports_limit,
        monthly_uploads_limit,
        storage_limit_gb,
        features
    )
    VALUES (
        NEW.id,
        'trial',
        'trialing',
        NOW(),
        NOW() + INTERVAL '30 days',
        NOW(),
        NOW() + INTERVAL '30 days',
        100, -- Generous trial limits
        50,
        100,
        10,
        '{
            "basic_insights": true,
            "csv_support": true,
            "excel_support": true,
            "advanced_insights": true,
            "all_file_formats": true,
            "industry_specific_analysis": true,
            "historical_learning": true,
            "team_collaboration": false,
            "priority_support": true,
            "api_access": false,
            "custom_integrations": false,
            "dedicated_support": false
        }'::jsonb
    )
    RETURNING id INTO sub_id;
    
    -- Create initial usage stats
    INSERT INTO public.usage_stats (
        user_id,
        subscription_id,
        period_start,
        period_end
    )
    VALUES (
        NEW.id,
        sub_id,
        NOW(),
        NOW() + INTERVAL '30 days'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default subscription
CREATE TRIGGER create_default_subscription_trigger
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.create_default_subscription();

-- Function to check feature access
CREATE OR REPLACE FUNCTION public.has_feature_access(
    user_uuid UUID,
    feature_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN := FALSE;
BEGIN
    SELECT 
        COALESCE((features->>feature_name)::boolean, FALSE)
    INTO has_access
    FROM public.subscriptions 
    WHERE user_id = user_uuid 
    AND status IN ('active', 'trialing')
    ORDER BY created_at DESC 
    LIMIT 1;
    
    RETURN COALESCE(has_access, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current usage
CREATE OR REPLACE FUNCTION public.get_current_usage(user_uuid UUID)
RETURNS TABLE(
    reports_created INTEGER,
    reports_exported INTEGER,
    files_uploaded INTEGER,
    storage_used_mb INTEGER,
    api_calls_made INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        us.reports_created,
        us.reports_exported,
        us.files_uploaded,
        us.storage_used_mb,
        us.api_calls_made
    FROM public.usage_stats us
    WHERE us.user_id = user_uuid
    AND us.period_start <= NOW()
    AND us.period_end >= NOW()
    ORDER BY us.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
