-- Simple database structure check and repair
DO $$
BEGIN
    -- Check if profiles table exists, create if not
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE profiles (
            id UUID REFERENCES auth.users(id) PRIMARY KEY,
            email TEXT,
            full_name TEXT,
            role TEXT DEFAULT 'user',
            industry TEXT,
            company_name TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        -- Create policy
        CREATE POLICY "Users can view own profile" ON profiles
            FOR ALL USING (auth.uid() = id);
    END IF;

    -- Check if subscriptions table exists, create if not
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        CREATE TABLE subscriptions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id),
            plan_type TEXT DEFAULT 'basic',
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
        
        -- Create policy
        CREATE POLICY "Users can view own subscription" ON subscriptions
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Check if analyses table exists, create if not
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'analyses') THEN
        CREATE TABLE analyses (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id),
            file_name TEXT,
            status TEXT DEFAULT 'pending',
            summary TEXT,
            insights JSONB,
            recommendations JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
        
        -- Create policy
        CREATE POLICY "Users can view own analyses" ON analyses
            FOR ALL USING (auth.uid() = user_id);
    END IF;

END $$;
