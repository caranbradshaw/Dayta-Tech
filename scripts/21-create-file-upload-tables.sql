-- Create file_uploads table for tracking uploaded files
CREATE TABLE IF NOT EXISTS file_uploads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    file_path TEXT, -- For future Vercel Blob integration
    upload_status TEXT DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploading', 'completed', 'failed')),
    upload_started_at TIMESTAMPTZ DEFAULT NOW(),
    upload_completed_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_analysis_id ON file_uploads(analysis_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_status ON file_uploads(upload_status);
CREATE INDEX IF NOT EXISTS idx_file_uploads_created_at ON file_uploads(created_at DESC);

-- Enable RLS
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own file uploads" ON file_uploads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own file uploads" ON file_uploads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own file uploads" ON file_uploads
    FOR UPDATE USING (auth.uid() = user_id);

-- Create storage bucket for file uploads (if using Vercel Blob, this is handled differently)
-- This is for future Supabase Storage integration
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-uploads', 'user-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload their own files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'user-uploads' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'user-uploads' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'user-uploads' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_file_uploads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_file_uploads_updated_at
    BEFORE UPDATE ON file_uploads
    FOR EACH ROW
    EXECUTE FUNCTION update_file_uploads_updated_at();

-- Add some helpful functions
CREATE OR REPLACE FUNCTION get_user_upload_stats(user_uuid UUID)
RETURNS TABLE(
    total_uploads BIGINT,
    total_size BIGINT,
    successful_uploads BIGINT,
    failed_uploads BIGINT,
    avg_file_size NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_uploads,
        COALESCE(SUM(file_size), 0) as total_size,
        COUNT(*) FILTER (WHERE upload_status = 'completed') as successful_uploads,
        COUNT(*) FILTER (WHERE upload_status = 'failed') as failed_uploads,
        COALESCE(AVG(file_size), 0) as avg_file_size
    FROM file_uploads 
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON file_uploads TO authenticated;
GRANT USAGE ON SEQUENCE file_uploads_id_seq TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_upload_stats(UUID) TO authenticated;

COMMENT ON TABLE file_uploads IS 'Tracks all file uploads by users for analysis';
COMMENT ON FUNCTION get_user_upload_stats(UUID) IS 'Returns upload statistics for a specific user';
