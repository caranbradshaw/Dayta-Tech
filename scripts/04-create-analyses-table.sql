-- Create analyses table
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    
    -- File information
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes BIGINT,
    file_url TEXT, -- Supabase Storage URL
    
    -- Analysis status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    
    -- Results
    summary TEXT,
    insights JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    
    -- Processing metadata
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    processing_time_ms INTEGER,
    ai_model_used TEXT,
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create file_uploads table for tracking uploads
CREATE TABLE IF NOT EXISTS public.file_uploads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- File details
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Path in Supabase Storage
    file_size_bytes BIGINT NOT NULL,
    mime_type TEXT,
    
    -- Upload status
    upload_status TEXT DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploading', 'completed', 'failed')),
    
    -- File analysis metadata
    row_count INTEGER,
    column_count INTEGER,
    file_structure JSONB, -- Schema/structure information
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS analyses_user_idx ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS analyses_project_idx ON public.analyses(project_id);
CREATE INDEX IF NOT EXISTS analyses_status_idx ON public.analyses(status);
CREATE INDEX IF NOT EXISTS analyses_created_at_idx ON public.analyses(created_at);
CREATE INDEX IF NOT EXISTS analyses_file_type_idx ON public.analyses(file_type);

CREATE INDEX IF NOT EXISTS file_uploads_analysis_idx ON public.file_uploads(analysis_id);
CREATE INDEX IF NOT EXISTS file_uploads_user_idx ON public.file_uploads(user_id);
CREATE INDEX IF NOT EXISTS file_uploads_status_idx ON public.file_uploads(upload_status);

-- Enable RLS
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

-- Analyses policies
CREATE POLICY "Users can view their own analyses" ON public.analyses
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view analyses in their organization projects" ON public.analyses
    FOR SELECT USING (
        project_id IN (
            SELECT p.id 
            FROM public.projects p
            JOIN public.organization_members om ON p.organization_id = om.organization_id
            WHERE om.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create analyses" ON public.analyses
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own analyses" ON public.analyses
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own analyses" ON public.analyses
    FOR DELETE USING (user_id = auth.uid());

-- File uploads policies
CREATE POLICY "Users can view their own file uploads" ON public.file_uploads
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create file uploads" ON public.file_uploads
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own file uploads" ON public.file_uploads
    FOR UPDATE USING (user_id = auth.uid());

-- Add updated_at trigger
CREATE TRIGGER update_analyses_updated_at
    BEFORE UPDATE ON public.analyses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update analysis status
CREATE OR REPLACE FUNCTION public.update_analysis_status(
    analysis_id UUID,
    new_status TEXT,
    error_msg TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.analyses 
    SET 
        status = new_status,
        error_message = error_msg,
        processing_started_at = CASE 
            WHEN new_status = 'processing' THEN NOW() 
            ELSE processing_started_at 
        END,
        processing_completed_at = CASE 
            WHEN new_status IN ('completed', 'failed', 'cancelled') THEN NOW() 
            ELSE processing_completed_at 
        END,
        processing_time_ms = CASE 
            WHEN new_status IN ('completed', 'failed', 'cancelled') AND processing_started_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (NOW() - processing_started_at)) * 1000 
            ELSE processing_time_ms 
        END,
        updated_at = NOW()
    WHERE id = analysis_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
