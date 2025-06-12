-- First, ensure all tables exist before enabling RLS
DO $$ 
BEGIN
    -- Check if tables exist before enabling RLS
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organizations') THEN
        ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organization_members') THEN
        ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'projects') THEN
        ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'analyses') THEN
        ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'file_uploads') THEN
        ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'insights') THEN
        ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_activities') THEN
        ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'account_changes') THEN
        ALTER TABLE account_changes ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'file_activities') THEN
        ALTER TABLE file_activities ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create policies only if tables exist
DO $$ 
BEGIN
    -- Profiles policies
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
        CREATE POLICY "Users can view own profile" ON profiles
          FOR SELECT USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
        CREATE POLICY "Users can update own profile" ON profiles
          FOR UPDATE USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
        CREATE POLICY "Users can insert own profile" ON profiles
          FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;

    -- Organizations policies
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organizations') 
       AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organization_members') THEN
        DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
        CREATE POLICY "Users can view organizations they belong to" ON organizations
          FOR SELECT USING (
            id IN (
              SELECT organization_id FROM organization_members 
              WHERE user_id = auth.uid() AND status = 'active'
            )
          );

        DROP POLICY IF EXISTS "Organization owners can update" ON organizations;
        CREATE POLICY "Organization owners can update" ON organizations
          FOR UPDATE USING (
            id IN (
              SELECT organization_id FROM organization_members 
              WHERE user_id = auth.uid() AND role = 'owner'
            )
          );
    END IF;

    -- Organization members policies
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organization_members') THEN
        DROP POLICY IF EXISTS "Users can view organization members" ON organization_members;
        CREATE POLICY "Users can view organization members" ON organization_members
          FOR SELECT USING (
            organization_id IN (
              SELECT organization_id FROM organization_members om2
              WHERE om2.user_id = auth.uid() AND om2.status = 'active'
            )
          );
    END IF;

    -- Projects policies
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'projects') 
       AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organization_members') THEN
        DROP POLICY IF EXISTS "Users can view organization projects" ON projects;
        CREATE POLICY "Users can view organization projects" ON projects
          FOR SELECT USING (
            organization_id IN (
              SELECT organization_id FROM organization_members 
              WHERE user_id = auth.uid() AND status = 'active'
            )
          );

        DROP POLICY IF EXISTS "Users can create projects in their organizations" ON projects;
        CREATE POLICY "Users can create projects in their organizations" ON projects
          FOR INSERT WITH CHECK (
            organization_id IN (
              SELECT organization_id FROM organization_members 
              WHERE user_id = auth.uid() AND status = 'active'
            )
          );
    END IF;

    -- Analyses policies
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'analyses') THEN
        DROP POLICY IF EXISTS "Users can view own analyses" ON analyses;
        CREATE POLICY "Users can view own analyses" ON analyses
          FOR SELECT USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can create own analyses" ON analyses;
        CREATE POLICY "Users can create own analyses" ON analyses
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can update own analyses" ON analyses;
        CREATE POLICY "Users can update own analyses" ON analyses
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- File uploads policies
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'file_uploads') THEN
        DROP POLICY IF EXISTS "Users can view own file uploads" ON file_uploads;
        CREATE POLICY "Users can view own file uploads" ON file_uploads
          FOR SELECT USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can create own file uploads" ON file_uploads;
        CREATE POLICY "Users can create own file uploads" ON file_uploads
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Insights policies
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'insights') 
       AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'analyses') THEN
        DROP POLICY IF EXISTS "Users can view insights for their analyses" ON insights;
        CREATE POLICY "Users can view insights for their analyses" ON insights
          FOR SELECT USING (
            analysis_id IN (
              SELECT id FROM analyses WHERE user_id = auth.uid()
            )
          );
    END IF;

    -- Subscriptions policies
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
        CREATE POLICY "Users can view own subscription" ON subscriptions
          FOR SELECT USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;
        CREATE POLICY "Users can update own subscription" ON subscriptions
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Activity policies
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_activities') THEN
        DROP POLICY IF EXISTS "Users can view own activities" ON user_activities;
        CREATE POLICY "Users can view own activities" ON user_activities
          FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'account_changes') THEN
        DROP POLICY IF EXISTS "Users can view own account changes" ON account_changes;
        CREATE POLICY "Users can view own account changes" ON account_changes
          FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'file_activities') THEN
        DROP POLICY IF EXISTS "Users can view own file activities" ON file_activities;
        CREATE POLICY "Users can view own file activities" ON file_activities
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create a simple success indicator
SELECT 'RLS policies setup completed successfully' as result;
