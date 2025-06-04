-- Insert reference data for industries
INSERT INTO public.industries (name, description) VALUES
('Technology', 'Software, hardware, and IT services'),
('Finance & Banking', 'Financial services, banking, and insurance'),
('Healthcare', 'Medical services, pharmaceuticals, and health tech'),
('Retail & E-commerce', 'Retail stores, online commerce, and consumer goods'),
('Manufacturing', 'Production, industrial, and manufacturing companies'),
('Education', 'Schools, universities, and educational services'),
('Real Estate', 'Property management, real estate, and construction'),
('Hospitality', 'Hotels, restaurants, and travel services'),
('Consulting', 'Professional services and consulting'),
('Energy', 'Oil, gas, renewable energy, and utilities'),
('Transportation', 'Logistics, shipping, and transportation services'),
('Media & Entertainment', 'Publishing, broadcasting, and entertainment'),
('Non-profit', 'Charitable organizations and NGOs'),
('Government', 'Public sector and government agencies'),
('Other', 'Other industries not listed above')
ON CONFLICT (name) DO NOTHING;

-- Insert reference data for user roles
INSERT INTO public.user_roles (name, description) VALUES
('Business Analyst', 'Analyzes business data and processes'),
('Data Analyst', 'Specializes in data analysis and reporting'),
('Data Scientist', 'Advanced analytics and machine learning'),
('Data Engineer', 'Data infrastructure and pipeline development'),
('Product Manager', 'Manages product development and strategy'),
('Marketing Manager', 'Oversees marketing campaigns and analytics'),
('Operations Manager', 'Manages business operations and processes'),
('Executive', 'C-level executives and senior leadership'),
('Consultant', 'External consultant or advisor'),
('Student', 'Student or academic researcher'),
('Other', 'Other roles not listed above')
ON CONFLICT (name) DO NOTHING;

-- Create a sample admin user (you should change this email to your own)
-- Note: This user will need to sign up normally first, then you can run this to make them an admin
/*
INSERT INTO public.admin_users (user_id, admin_level, permissions, created_by)
SELECT 
    id,
    'super_admin',
    '{
        "view_user_data": true,
        "modify_user_data": true,
        "view_analytics": true,
        "manage_subscriptions": true,
        "system_administration": true
    }'::jsonb,
    id
FROM public.profiles 
WHERE email = 'admin@daytatech.com' -- Change this to your email
ON CONFLICT (user_id) DO NOTHING;
*/

-- Insert sample support ticket categories and priorities for reference
-- (These are handled by CHECK constraints, but good to document)

-- Sample data for testing (optional - remove in production)
-- This creates a test user with sample data
/*
-- Note: Uncomment this section only for development/testing
DO $$
DECLARE
    test_user_id UUID;
    test_org_id UUID;
    test_project_id UUID;
    test_analysis_id UUID;
BEGIN
    -- Create test user profile (this would normally be created by auth trigger)
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        first_name,
        last_name,
        company,
        industry,
        role,
        account_type
    ) VALUES (
        '00000000-0000-0000-0000-000000000001',
        'test@daytatech.com',
        'Test User',
        'Test',
        'User',
        'DaytaTech Demo',
        'technology',
        'data-analyst',
        'trial'
    ) ON CONFLICT (id) DO NOTHING
    RETURNING id INTO test_user_id;
    
    -- Create test organization
    INSERT INTO public.organizations (
        id,
        name,
        slug,
        description,
        industry,
        created_by
    ) VALUES (
        '00000000-0000-0000-0000-000000000002',
        'DaytaTech Demo Organization',
        'daytatech-demo',
        'Demo organization for testing',
        'technology',
        '00000000-0000-0000-0000-000000000001'
    ) ON CONFLICT (id) DO NOTHING
    RETURNING id INTO test_org_id;
    
    -- Add test user as organization owner
    INSERT INTO public.organization_members (
        organization_id,
        user_id,
        role,
        permissions
    ) VALUES (
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001',
        'owner',
        '{
            "can_upload": true,
            "can_analyze": true,
            "can_export": true,
            "can_invite": true,
            "can_manage_billing": true
        }'::jsonb
    ) ON CONFLICT (organization_id, user_id) DO NOTHING;
    
    -- Create test project
    INSERT INTO public.projects (
        id,
        name,
        description,
        organization_id,
        created_by,
        tags
    ) VALUES (
        '00000000-0000-0000-0000-000000000003',
        'Sample Sales Analysis',
        'Demo project analyzing sales performance data',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001',
        ARRAY['sales', 'demo', 'quarterly']
    ) ON CONFLICT (id) DO NOTHING
    RETURNING id INTO test_project_id;
    
    -- Create test analysis
    INSERT INTO public.analyses (
        id,
        user_id,
        project_id,
        file_name,
        file_type,
        status,
        summary
    ) VALUES (
        '00000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000003',
        'sample_sales_data.csv',
        'CSV',
        'completed',
        'Analysis of Q4 sales performance showing 15% growth over previous quarter'
    ) ON CONFLICT (id) DO NOTHING
    RETURNING id INTO test_analysis_id;
    
    -- Create sample insights
    INSERT INTO public.insights (
        analysis_id,
        project_id,
        type,
        title,
        content,
        confidence_score
    ) VALUES 
    (
        '00000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000003',
        'summary',
        'Q4 Sales Performance Overview',
        'Sales increased by 15% compared to Q3, with strongest growth in the technology sector. Total revenue reached $2.4M with 1,247 transactions processed.',
        0.95
    ),
    (
        '00000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000003',
        'trend',
        'Monthly Growth Trend',
        'Consistent month-over-month growth observed: October (+8%), November (+12%), December (+18%). Holiday season showed particularly strong performance.',
        0.88
    ),
    (
        '00000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000003',
        'recommendation',
        'Inventory Optimization',
        'Based on sales patterns, recommend increasing inventory for top-performing products by 25% for Q1. Focus on technology and home goods categories.',
        0.82
    ) ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Sample data created successfully for testing';
END $$;
*/

-- Create helpful views for common queries
CREATE OR REPLACE VIEW public.user_subscription_view AS
SELECT 
    p.id as user_id,
    p.email,
    p.full_name,
    s.plan_type,
    s.status as subscription_status,
    s.trial_end_date,
    s.current_period_end,
    s.monthly_uploads_limit,
    s.monthly_exports_limit,
    s.monthly_reports_limit,
    us.files_uploaded,
    us.reports_created,
    us.reports_exported
FROM public.profiles p
LEFT JOIN public.subscriptions s ON p.id = s.user_id AND s.status IN ('active', 'trialing')
LEFT JOIN public.usage_stats us ON p.id = us.user_id 
    AND us.period_start <= NOW() 
    AND us.period_end >= NOW();

-- Create view for organization analytics
CREATE OR REPLACE VIEW public.organization_analytics_view AS
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    COUNT(DISTINCT om.user_id) as total_members,
    COUNT(DISTINCT p.id) as total_projects,
    COUNT(DISTINCT a.id) as total_analyses,
    COUNT(DISTINCT i.id) as total_insights,
    COALESCE(SUM(fu.file_size_bytes), 0) / (1024 * 1024) as storage_used_mb
FROM public.organizations o
LEFT JOIN public.organization_members om ON o.id = om.organization_id AND om.status = 'active'
LEFT JOIN public.projects p ON o.id = p.organization_id AND p.status = 'active'
LEFT JOIN public.analyses a ON p.id = a.project_id
LEFT JOIN public.insights i ON a.id = i.analysis_id
LEFT JOIN public.file_uploads fu ON a.id = fu.analysis_id
GROUP BY o.id, o.name;

-- Final setup message
DO $$
BEGIN
    RAISE NOTICE '=== DaytaTech Database Setup Complete ===';
    RAISE NOTICE 'Tables created: profiles, organizations, projects, analyses, insights, subscriptions, and more';
    RAISE NOTICE 'Security: Row Level Security enabled on all tables';
    RAISE NOTICE 'Features: Audit trails, usage tracking, admin controls';
    RAISE NOTICE 'Next steps: Configure Supabase Auth and add environment variables';
    RAISE NOTICE '==========================================';
END $$;
