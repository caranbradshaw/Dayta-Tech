-- Add missing columns to analyses table for proper AI analysis tracking
ALTER TABLE analyses 
ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'business_analyst',
ADD COLUMN IF NOT EXISTS goals JSONB DEFAULT '[]'::jsonb;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analyses_user_status ON analyses(user_id, status);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_processing ON analyses(status, processing_started_at);

-- Update RLS policies to ensure proper access
DROP POLICY IF EXISTS "Users can view own analyses" ON analyses;
CREATE POLICY "Users can view own analyses" ON analyses
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert own analyses" ON analyses;
CREATE POLICY "Users can insert own analyses" ON analyses
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update own analyses" ON analyses;
CREATE POLICY "Users can update own analyses" ON analyses
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Ensure insights table has proper foreign key relationship
ALTER TABLE insights 
ADD CONSTRAINT fk_insights_analysis 
FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE;

-- Add index for insights queries
CREATE INDEX IF NOT EXISTS idx_insights_analysis_id ON insights(analysis_id);
CREATE INDEX IF NOT EXISTS idx_insights_type ON insights(type);

COMMENT ON TABLE analyses IS 'Stores AI analysis records with complete processing workflow';
COMMENT ON COLUMN analyses.processing_started_at IS 'When AI analysis processing began';
COMMENT ON COLUMN analyses.file_url IS 'URL to uploaded file in blob storage';
COMMENT ON COLUMN analyses.file_path IS 'Path to file in blob storage';
COMMENT ON COLUMN analyses.industry IS 'Industry context for AI analysis';
COMMENT ON COLUMN analyses.role IS 'User role context for AI analysis';
COMMENT ON COLUMN analyses.goals IS 'User-selected analysis goals';
