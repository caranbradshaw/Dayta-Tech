-- Create email verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create login attempts table for security
CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    attempts INTEGER DEFAULT 0,
    last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user activities table for logging
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    activity_type TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update profiles table to support trial system
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'trial_pro';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_status TEXT DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'global';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS features JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS login_rules JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Update subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'trial_pro';
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_start TIMESTAMP WITH TIME ZONE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'global';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_status ON profiles(trial_status);
CREATE INDEX IF NOT EXISTS idx_profiles_region ON profiles(region);

-- Create RLS policies
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Email verifications policies
CREATE POLICY "Users can view their own email verifications" ON email_verifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert email verifications" ON email_verifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update email verifications" ON email_verifications
    FOR UPDATE USING (true);

-- Login attempts policies (admin only)
CREATE POLICY "Admins can view login attempts" ON login_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'support-admin'
        )
    );

CREATE POLICY "System can manage login attempts" ON login_attempts
    FOR ALL USING (true);

-- User activities policies
CREATE POLICY "Users can view their own activities" ON user_activities
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert activities" ON user_activities
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all activities" ON user_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'support-admin'
        )
    );

-- Function to check trial status
CREATE OR REPLACE FUNCTION check_trial_status(user_id UUID)
RETURNS TABLE (
    is_active BOOLEAN,
    days_remaining INTEGER,
    status TEXT,
    message TEXT
) AS $$
DECLARE
    trial_end TIMESTAMP WITH TIME ZONE;
    days_left INTEGER;
BEGIN
    SELECT trial_end_date INTO trial_end
    FROM profiles
    WHERE id = user_id;
    
    IF trial_end IS NULL THEN
        RETURN QUERY SELECT FALSE, 0, 'no_trial'::TEXT, 'No trial found'::TEXT;
        RETURN;
    END IF;
    
    days_left := EXTRACT(DAY FROM (trial_end - NOW()));
    
    IF days_left <= 0 THEN
        RETURN QUERY SELECT FALSE, 0, 'expired'::TEXT, 'Trial has expired'::TEXT;
    ELSIF days_left <= 3 THEN
        RETURN QUERY SELECT TRUE, days_left, 'expiring'::TEXT, 
            ('Trial expires in ' || days_left || ' day(s)')::TEXT;
    ELSE
        RETURN QUERY SELECT TRUE, days_left, 'active'::TEXT, 
            ('Trial active with ' || days_left || ' days remaining')::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to extend trial (admin only)
CREATE OR REPLACE FUNCTION extend_trial(user_id UUID, additional_days INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE profiles
    SET trial_end_date = trial_end_date + (additional_days || ' days')::INTERVAL,
        updated_at = NOW()
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upgrade from trial
CREATE OR REPLACE FUNCTION upgrade_from_trial(user_id UUID, new_plan TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE profiles
    SET account_type = new_plan,
        trial_status = 'converted',
        updated_at = NOW()
    WHERE id = user_id;
    
    UPDATE subscriptions
    SET plan_type = new_plan,
        status = 'active',
        updated_at = NOW()
    WHERE user_id = user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
