-- Create saved reports tables for document storage and retrieval

-- Reports table for storing generated analysis reports
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    
    -- Report metadata
    title VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) DEFAULT 'analysis_report',
    status VARCHAR(20) DEFAULT 'generated' CHECK (status IN ('generating', 'generated', 'failed', 'archived')),
    
    -- Report content
    content JSONB NOT NULL DEFAULT '{}',
    summary TEXT,
    executive_summary JSONB,
    insights JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    charts_data JSONB DEFAULT '[]',
    
    -- File information
    file_name VARCHAR(255),
    file_size BIGINT,
    file_type VARCHAR(50) DEFAULT 'json',
    storage_path TEXT, -- Path to stored file (PDF, Excel, etc.)
    
    -- Analysis context
    analysis_role VARCHAR(50),
    industry VARCHAR(100),
    company_name VARCHAR(255),
    
    -- Metadata
    tags TEXT[],
    is_favorite BOOLEAN DEFAULT FALSE,
    is_shared BOOLEAN DEFAULT FALSE,
    share_token VARCHAR(100) UNIQUE,
    
    -- Timestamps
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report shares table for sharing reports with others
CREATE TABLE IF NOT EXISTS report_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with_email VARCHAR(255),
    shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Share settings
    access_level VARCHAR(20) DEFAULT 'view' CHECK (access_level IN ('view', 'comment', 'edit')),
    expires_at TIMESTAMP WITH TIME ZONE,
    password_protected BOOLEAN DEFAULT FALSE,
    password_hash TEXT,
    
    -- Tracking
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report templates table for reusable report formats
CREATE TABLE IF NOT EXISTS report_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Template info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(50) DEFAULT 'custom',
    industry VARCHAR(100),
    role VARCHAR(50),
    
    -- Template structure
    template_config JSONB NOT NULL DEFAULT '{}',
    sections JSONB DEFAULT '[]',
    styling JSONB DEFAULT '{}',
    
    -- Settings
    is_public BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report exports table for tracking exported files
CREATE TABLE IF NOT EXISTS report_exports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Export details
    export_format VARCHAR(20) NOT NULL CHECK (export_format IN ('pdf', 'excel', 'word', 'powerpoint', 'json', 'csv')),
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    storage_path TEXT,
    download_url TEXT,
    
    -- Export settings
    export_settings JSONB DEFAULT '{}',
    includes_charts BOOLEAN DEFAULT TRUE,
    includes_raw_data BOOLEAN DEFAULT FALSE,
    
    -- Tracking
    download_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_analysis_id ON reports(analysis_id);
CREATE INDEX IF NOT EXISTS idx_reports_project_id ON reports(project_id);
CREATE INDEX IF NOT EXISTS idx_reports_organization_id ON reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_share_token ON reports(share_token) WHERE share_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_report_shares_report_id ON report_shares(report_id);
CREATE INDEX IF NOT EXISTS idx_report_shares_shared_with_email ON report_shares(shared_with_email);
CREATE INDEX IF NOT EXISTS idx_report_shares_expires_at ON report_shares(expires_at);

CREATE INDEX IF NOT EXISTS idx_report_templates_user_id ON report_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_organization_id ON report_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_industry ON report_templates(industry);
CREATE INDEX IF NOT EXISTS idx_report_templates_is_public ON report_templates(is_public) WHERE is_public = TRUE;

CREATE INDEX IF NOT EXISTS idx_report_exports_report_id ON report_exports(report_id);
CREATE INDEX IF NOT EXISTS idx_report_exports_user_id ON report_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_report_exports_expires_at ON report_exports(expires_at);

-- RLS Policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_exports ENABLE ROW LEVEL SECURITY;

-- Reports policies
CREATE POLICY "Users can view their own reports" ON reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" ON reports
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" ON reports
    FOR DELETE USING (auth.uid() = user_id);

-- Shared reports access policy
CREATE POLICY "Users can view shared reports" ON reports
    FOR SELECT USING (
        auth.uid() = user_id OR 
        is_shared = TRUE OR
        EXISTS (
            SELECT 1 FROM report_shares 
            WHERE report_shares.report_id = reports.id 
            AND (
                report_shares.shared_with_user_id = auth.uid() OR
                report_shares.shared_with_email = auth.email()
            )
            AND (report_shares.expires_at IS NULL OR report_shares.expires_at > NOW())
        )
    );

-- Report shares policies
CREATE POLICY "Users can manage shares for their reports" ON report_shares
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM reports 
            WHERE reports.id = report_shares.report_id 
            AND reports.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view shares they have access to" ON report_shares
    FOR SELECT USING (
        shared_with_user_id = auth.uid() OR 
        shared_with_email = auth.email() OR
        EXISTS (
            SELECT 1 FROM reports 
            WHERE reports.id = report_shares.report_id 
            AND reports.user_id = auth.uid()
        )
    );

-- Report templates policies
CREATE POLICY "Users can view their own and public templates" ON report_templates
    FOR SELECT USING (
        auth.uid() = user_id OR 
        is_public = TRUE OR
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can create templates" ON report_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON report_templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON report_templates
    FOR DELETE USING (auth.uid() = user_id);

-- Report exports policies
CREATE POLICY "Users can view their own exports" ON report_exports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create exports for accessible reports" ON report_exports
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM reports 
            WHERE reports.id = report_exports.report_id 
            AND (
                reports.user_id = auth.uid() OR
                reports.is_shared = TRUE OR
                EXISTS (
                    SELECT 1 FROM report_shares 
                    WHERE report_shares.report_id = reports.id 
                    AND (
                        report_shares.shared_with_user_id = auth.uid() OR
                        report_shares.shared_with_email = auth.email()
                    )
                    AND (report_shares.expires_at IS NULL OR report_shares.expires_at > NOW())
                )
            )
        )
    );

-- Functions for report management
CREATE OR REPLACE FUNCTION update_report_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE reports 
    SET last_accessed_at = NOW() 
    WHERE id = NEW.report_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last accessed time
CREATE TRIGGER trigger_update_report_access
    AFTER INSERT ON report_shares
    FOR EACH ROW
    EXECUTE FUNCTION update_report_last_accessed();

-- Function to clean up expired shares and exports
CREATE OR REPLACE FUNCTION cleanup_expired_items()
RETURNS void AS $$
BEGIN
    -- Delete expired report shares
    DELETE FROM report_shares 
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    -- Delete expired report exports
    DELETE FROM report_exports 
    WHERE expires_at < NOW();
    
    -- Archive old reports (optional - uncomment if needed)
    -- UPDATE reports 
    -- SET status = 'archived' 
    -- WHERE created_at < NOW() - INTERVAL '1 year' 
    -- AND status = 'generated';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (if pg_cron is available)
-- SELECT cron.schedule('cleanup-expired-items', '0 2 * * *', 'SELECT cleanup_expired_items();');

COMMENT ON TABLE reports IS 'Stores generated analysis reports and documents';
COMMENT ON TABLE report_shares IS 'Manages sharing of reports with other users';
COMMENT ON TABLE report_templates IS 'Reusable report templates for different industries/roles';
COMMENT ON TABLE report_exports IS 'Tracks exported report files in various formats';
