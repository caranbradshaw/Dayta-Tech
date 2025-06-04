-- Create user activities table for audit trail
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Activity details
    activity_type TEXT NOT NULL, -- 'login', 'logout', 'file_upload', 'analysis_created', etc.
    activity_description TEXT NOT NULL,
    
    -- Context data
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Request details
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create account changes table for tracking profile/subscription changes
CREATE TABLE IF NOT EXISTS public.account_changes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Change details
    change_type TEXT NOT NULL, -- 'profile_update', 'subscription_change', 'password_change', etc.
    old_values JSONB,
    new_values JSONB,
    
    -- Who made the change
    changed_by UUID REFERENCES public.profiles(id), -- NULL if self-change
    reason TEXT, -- Optional reason for admin changes
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create file activities table for detailed file tracking
CREATE TABLE IF NOT EXISTS public.file_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
    
    -- Activity details
    activity_type TEXT NOT NULL, -- 'uploaded', 'processed', 'downloaded', 'deleted', etc.
    file_name TEXT,
    file_size BIGINT,
    
    -- Additional context
    activity_details JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS user_activities_user_idx ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS user_activities_type_idx ON public.user_activities(activity_type);
CREATE INDEX IF NOT EXISTS user_activities_created_at_idx ON public.user_activities(created_at);

CREATE INDEX IF NOT EXISTS account_changes_user_idx ON public.account_changes(user_id);
CREATE INDEX IF NOT EXISTS account_changes_type_idx ON public.account_changes(change_type);
CREATE INDEX IF NOT EXISTS account_changes_created_at_idx ON public.account_changes(created_at);

CREATE INDEX IF NOT EXISTS file_activities_user_idx ON public.file_activities(user_id);
CREATE INDEX IF NOT EXISTS file_activities_analysis_idx ON public.file_activities(analysis_id);
CREATE INDEX IF NOT EXISTS file_activities_type_idx ON public.file_activities(activity_type);
CREATE INDEX IF NOT EXISTS file_activities_created_at_idx ON public.file_activities(created_at);

-- Enable RLS
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_activities ENABLE ROW LEVEL SECURITY;

-- User activities policies
CREATE POLICY "Users can view their own activities" ON public.user_activities
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert activities" ON public.user_activities
    FOR INSERT WITH CHECK (TRUE); -- Will be restricted to service role

-- Account changes policies
CREATE POLICY "Users can view their own account changes" ON public.account_changes
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert account changes" ON public.account_changes
    FOR INSERT WITH CHECK (TRUE); -- Will be restricted to service role

-- File activities policies
CREATE POLICY "Users can view their own file activities" ON public.file_activities
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert file activities" ON public.file_activities
    FOR INSERT WITH CHECK (TRUE); -- Will be restricted to service role

-- Function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
    user_uuid UUID,
    activity_type_param TEXT,
    description_param TEXT,
    metadata_param JSONB DEFAULT '{}'::jsonb,
    ip_param INET DEFAULT NULL,
    user_agent_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO public.user_activities (
        user_id,
        activity_type,
        activity_description,
        metadata,
        ip_address,
        user_agent
    )
    VALUES (
        user_uuid,
        activity_type_param,
        description_param,
        metadata_param,
        ip_param,
        user_agent_param
    )
    RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log account changes
CREATE OR REPLACE FUNCTION public.log_account_change(
    user_uuid UUID,
    change_type_param TEXT,
    old_values_param JSONB,
    new_values_param JSONB,
    changed_by_param UUID DEFAULT NULL,
    reason_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    change_id UUID;
BEGIN
    INSERT INTO public.account_changes (
        user_id,
        change_type,
        old_values,
        new_values,
        changed_by,
        reason
    )
    VALUES (
        user_uuid,
        change_type_param,
        old_values_param,
        new_values_param,
        changed_by_param,
        reason_param
    )
    RETURNING id INTO change_id;
    
    RETURN change_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log file activity
CREATE OR REPLACE FUNCTION public.log_file_activity(
    user_uuid UUID,
    analysis_uuid UUID,
    activity_type_param TEXT,
    file_name_param TEXT DEFAULT NULL,
    file_size_param BIGINT DEFAULT NULL,
    details_param JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO public.file_activities (
        user_id,
        analysis_id,
        activity_type,
        file_name,
        file_size,
        activity_details
    )
    VALUES (
        user_uuid,
        analysis_uuid,
        activity_type_param,
        file_name_param,
        file_size_param,
        details_param
    )
    RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log profile changes
CREATE OR REPLACE FUNCTION public.log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if there are actual changes
    IF OLD IS DISTINCT FROM NEW THEN
        PERFORM public.log_account_change(
            NEW.id,
            'profile_update',
            to_jsonb(OLD),
            to_jsonb(NEW),
            auth.uid(),
            'Profile updated by user'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log subscription changes
CREATE OR REPLACE FUNCTION public.log_subscription_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM public.log_account_change(
            NEW.user_id,
            'subscription_created',
            '{}'::jsonb,
            to_jsonb(NEW),
            auth.uid(),
            'New subscription created'
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' AND OLD IS DISTINCT FROM NEW THEN
        PERFORM public.log_account_change(
            NEW.user_id,
            'subscription_updated',
            to_jsonb(OLD),
            to_jsonb(NEW),
            auth.uid(),
            'Subscription updated'
        );
        RETURN NEW;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER log_profile_changes_trigger
    AFTER UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.log_profile_changes();

CREATE TRIGGER log_subscription_changes_trigger
    AFTER INSERT OR UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.log_subscription_changes();
