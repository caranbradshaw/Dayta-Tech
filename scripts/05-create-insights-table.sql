-- Create insights table
CREATE TABLE IF NOT EXISTS public.insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    
    -- Insight classification
    type TEXT NOT NULL CHECK (type IN ('summary', 'trend', 'anomaly', 'recommendation', 'prediction', 'correlation')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    
    -- AI metadata
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    ai_model TEXT,
    processing_time_ms INTEGER,
    
    -- Additional data
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Visibility and sharing
    is_public BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create insight ratings table for user feedback
CREATE TABLE IF NOT EXISTS public.insight_ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    insight_id UUID REFERENCES public.insights(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(insight_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS insights_analysis_idx ON public.insights(analysis_id);
CREATE INDEX IF NOT EXISTS insights_project_idx ON public.insights(project_id);
CREATE INDEX IF NOT EXISTS insights_type_idx ON public.insights(type);
CREATE INDEX IF NOT EXISTS insights_confidence_idx ON public.insights(confidence_score);
CREATE INDEX IF NOT EXISTS insights_created_at_idx ON public.insights(created_at);
CREATE INDEX IF NOT EXISTS insights_featured_idx ON public.insights(is_featured);

CREATE INDEX IF NOT EXISTS insight_ratings_insight_idx ON public.insight_ratings(insight_id);
CREATE INDEX IF NOT EXISTS insight_ratings_user_idx ON public.insight_ratings(user_id);

-- Enable RLS
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insight_ratings ENABLE ROW LEVEL SECURITY;

-- Insights policies
CREATE POLICY "Users can view insights from their analyses" ON public.insights
    FOR SELECT USING (
        analysis_id IN (
            SELECT id FROM public.analyses WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view insights from their organization projects" ON public.insights
    FOR SELECT USING (
        project_id IN (
            SELECT p.id 
            FROM public.projects p
            JOIN public.organization_members om ON p.organization_id = om.organization_id
            WHERE om.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view public insights" ON public.insights
    FOR SELECT USING (is_public = TRUE);

CREATE POLICY "System can insert insights" ON public.insights
    FOR INSERT WITH CHECK (TRUE); -- This will be used by backend services

CREATE POLICY "Users can update insights from their analyses" ON public.insights
    FOR UPDATE USING (
        analysis_id IN (
            SELECT id FROM public.analyses WHERE user_id = auth.uid()
        )
    );

-- Insight ratings policies
CREATE POLICY "Users can view all insight ratings" ON public.insight_ratings
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can rate insights" ON public.insight_ratings
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own ratings" ON public.insight_ratings
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own ratings" ON public.insight_ratings
    FOR DELETE USING (user_id = auth.uid());

-- Add updated_at trigger
CREATE TRIGGER update_insights_updated_at
    BEFORE UPDATE ON public.insights
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get insight statistics
CREATE OR REPLACE FUNCTION public.get_insight_stats(insight_uuid UUID)
RETURNS TABLE(
    avg_rating DECIMAL,
    total_ratings BIGINT,
    rating_distribution JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROUND(AVG(rating), 2) as avg_rating,
        COUNT(*) as total_ratings,
        jsonb_object_agg(rating, count) as rating_distribution
    FROM (
        SELECT 
            rating,
            COUNT(*) as count
        FROM public.insight_ratings 
        WHERE insight_id = insight_uuid
        GROUP BY rating
    ) rating_counts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
