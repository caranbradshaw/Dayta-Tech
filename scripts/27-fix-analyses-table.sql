-- Ensure analyses table has all required columns and proper structure
DO $$ 
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analyses' AND column_name = 'processing_completed_at') THEN
        ALTER TABLE analyses ADD COLUMN processing_completed_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analyses' AND column_name = 'error_message') THEN
        ALTER TABLE analyses ADD COLUMN error_message TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analyses' AND column_name = 'metadata') THEN
        ALTER TABLE analyses ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
    
    -- Update status column to use proper enum if needed
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'analyses_status_check') THEN
        ALTER TABLE analyses ADD CONSTRAINT analyses_status_check 
        CHECK (status IN ('processing', 'completed', 'failed'));
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analyses_user_id_created_at ON analyses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_status ON analyses(status);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view own analyses" ON analyses;
CREATE POLICY "Users can view own analyses" ON analyses
    FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert own analyses" ON analyses;
CREATE POLICY "Users can insert own analyses" ON analyses
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update own analyses" ON analyses;
CREATE POLICY "Users can update own analyses" ON analyses
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Enable RLS
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
