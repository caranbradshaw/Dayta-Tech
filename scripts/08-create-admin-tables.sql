-- Create admin users table for support staff
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Admin level
    admin_level TEXT NOT NULL CHECK (admin_level IN ('support', 'admin', 'super_admin')),
    
    -- Permissions
    permissions JSONB NOT NULL DEFAULT '{
        "view_user_data": false,
        "modify_user_data": false,
        "view_analytics": false,
        "manage_subscriptions": false,
        "system_administration": false
    }'::jsonb,
    
    -- Audit trail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id),
    
    UNIQUE(user_id)
);

-- Create admin activity log
CREATE TABLE IF NOT EXISTS public.admin_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    admin_user_id UUID REFERENCES public.admin_users(id) ON DELETE CASCADE,
    
    -- Activity details
    action_type TEXT NOT NULL, -- 'view_user', 'modify_subscription', 'export_data', etc.
    target_user_id UUID REFERENCES public.profiles(id),
    action_description TEXT NOT NULL,
    
    -- Context
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create support tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_admin_id UUID REFERENCES public.admin_users(id),
    
    -- Ticket details
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_user', 'resolved', 'closed')),
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'technical', 'billing', 'feature_request', 'bug_report')),
    
    -- Resolution
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create support ticket messages
CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Message content
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- Internal admin notes
    
    -- Attachments
    attachments JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS admin_users_user_idx ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS admin_users_level_idx ON public.admin_users(admin_level);

CREATE INDEX IF NOT EXISTS admin_activities_admin_idx ON public.admin_activities(admin_user_id);
CREATE INDEX IF NOT EXISTS admin_activities_target_idx ON public.admin_activities(target_user_id);
CREATE INDEX IF NOT EXISTS admin_activities_created_at_idx ON public.admin_activities(created_at);

CREATE INDEX IF NOT EXISTS support_tickets_user_idx ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS support_tickets_admin_idx ON public.support_tickets(assigned_admin_id);
CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS support_tickets_priority_idx ON public.support_tickets(priority);

CREATE INDEX IF NOT EXISTS support_ticket_messages_ticket_idx ON public.support_ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS support_ticket_messages_sender_idx ON public.support_ticket_messages(sender_id);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- Admin users policies
CREATE POLICY "Admins can view admin users" ON public.admin_users
    FOR SELECT USING (
        user_id IN (
            SELECT user_id FROM public.admin_users WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Super admins can manage admin users" ON public.admin_users
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM public.admin_users 
            WHERE admin_level = 'super_admin'
        )
    );

-- Admin activities policies
CREATE POLICY "Admins can view admin activities" ON public.admin_activities
    FOR SELECT USING (
        admin_user_id IN (
            SELECT id FROM public.admin_users WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert admin activities" ON public.admin_activities
    FOR INSERT WITH CHECK (TRUE);

-- Support tickets policies
CREATE POLICY "Users can view their own tickets" ON public.support_tickets
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all tickets" ON public.support_tickets
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.admin_users
        )
    );

CREATE POLICY "Users can create tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update tickets" ON public.support_tickets
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM public.admin_users
        )
    );

-- Support ticket messages policies
CREATE POLICY "Users can view messages for their tickets" ON public.support_ticket_messages
    FOR SELECT USING (
        ticket_id IN (
            SELECT id FROM public.support_tickets WHERE user_id = auth.uid()
        )
        AND is_internal = FALSE
    );

CREATE POLICY "Admins can view all messages" ON public.support_ticket_messages
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.admin_users
        )
    );

CREATE POLICY "Users can send messages to their tickets" ON public.support_ticket_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND ticket_id IN (
            SELECT id FROM public.support_tickets WHERE user_id = auth.uid()
        )
        AND is_internal = FALSE
    );

CREATE POLICY "Admins can send messages to any ticket" ON public.support_ticket_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND auth.uid() IN (
            SELECT user_id FROM public.admin_users
        )
    );

-- Add updated_at triggers
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check admin permissions
CREATE OR REPLACE FUNCTION public.has_admin_permission(
    user_uuid UUID,
    permission_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := FALSE;
BEGIN
    SELECT 
        COALESCE((permissions->>permission_name)::boolean, FALSE)
    INTO has_permission
    FROM public.admin_users 
    WHERE user_id = user_uuid;
    
    RETURN COALESCE(has_permission, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin activity
CREATE OR REPLACE FUNCTION public.log_admin_activity(
    admin_uuid UUID,
    action_type_param TEXT,
    target_user_uuid UUID,
    description_param TEXT,
    metadata_param JSONB DEFAULT '{}'::jsonb,
    ip_param INET DEFAULT NULL,
    user_agent_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
    admin_id UUID;
BEGIN
    -- Get admin_user_id
    SELECT id INTO admin_id 
    FROM public.admin_users 
    WHERE user_id = admin_uuid;
    
    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'User is not an admin';
    END IF;
    
    INSERT INTO public.admin_activities (
        admin_user_id,
        action_type,
        target_user_id,
        action_description,
        metadata,
        ip_address,
        user_agent
    )
    VALUES (
        admin_id,
        action_type_param,
        target_user_uuid,
        description_param,
        metadata_param,
        ip_param,
        user_agent_param
    )
    RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
