-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id),
    
    -- Project status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    
    -- Project settings
    settings JSONB DEFAULT '{
        "auto_insights": true,
        "data_retention_days": 90,
        "notification_preferences": {
            "email": true,
            "in_app": true
        }
    }'::jsonb,
    
    -- Tags for organization
    tags TEXT[] DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS projects_organization_idx ON public.projects(organization_id);
CREATE INDEX IF NOT EXISTS projects_created_by_idx ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS projects_status_idx ON public.projects(status);
CREATE INDEX IF NOT EXISTS projects_tags_idx ON public.projects USING GIN(tags);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON public.projects(created_at);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Project policies
CREATE POLICY "Users can view projects in their organizations" ON public.projects
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id 
            FROM public.organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Organization members can create projects" ON public.projects
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM public.organization_members 
            WHERE user_id = auth.uid() 
            AND permissions->>'can_upload' = 'true'
        )
        AND auth.uid() = created_by
    );

CREATE POLICY "Project creators and org admins can update projects" ON public.projects
    FOR UPDATE USING (
        created_by = auth.uid() 
        OR organization_id IN (
            SELECT organization_id 
            FROM public.organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Project creators and org admins can delete projects" ON public.projects
    FOR DELETE USING (
        created_by = auth.uid() 
        OR organization_id IN (
            SELECT organization_id 
            FROM public.organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Add updated_at trigger
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
