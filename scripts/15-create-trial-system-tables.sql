-- Create trial_subscriptions table
CREATE TABLE IF NOT EXISTS trial_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_type VARCHAR(50) NOT NULL DEFAULT 'trial_pro',
  trial_status VARCHAR(20) NOT NULL DEFAULT 'active',
  region VARCHAR(50) NOT NULL DEFAULT 'global',
  trial_start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  trial_end_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  is_trial_active BOOLEAN NOT NULL DEFAULT TRUE,
  days_remaining INTEGER NOT NULL DEFAULT 30,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  features JSONB NOT NULL DEFAULT '{"maxUploadsPerMonth": "unlimited", "maxFileSize": 500, "advancedInsights": true, "allFileFormats": true, "industrySpecificAnalysis": true, "historicalLearning": true, "teamCollaboration": false, "prioritySupport": true, "apiAccess": true, "customReports": true, "dataExport": true, "realTimeAnalytics": true}',
  login_rules JSONB NOT NULL DEFAULT '{"requireEmailVerification": true, "maxLoginAttempts": 5, "lockoutDuration": 30, "requireStrongPassword": true, "enableTwoFactor": false, "sessionTimeout": 24, "allowedRegions": ["nigeria", "america", "global"]}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create email_verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  verified_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, token)
);

-- Create login_attempts table
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  locked_until TIMESTAMP WITH TIME ZONE
);

-- Create user_activities table
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(50),
  user_agent TEXT
);

-- Create user_ai_contexts table
CREATE TABLE IF NOT EXISTS user_ai_contexts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  region VARCHAR(50) NOT NULL DEFAULT 'global',
  industry VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  company VARCHAR(255) NOT NULL,
  signup_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  preferences JSONB DEFAULT '{"analysisStyle": "business", "reportFormat": "detailed", "industryFocus": true}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add trial fields to profiles table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
    BEGIN
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS trial_status VARCHAR(20) DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
      ADD COLUMN IF NOT EXISTS industry VARCHAR(100),
      ADD COLUMN IF NOT EXISTS company VARCHAR(255),
      ADD COLUMN IF NOT EXISTS region VARCHAR(50) DEFAULT 'global';
    EXCEPTION
      WHEN duplicate_column THEN
        -- Do nothing, columns already exist
    END;
  END IF;
END $$;

-- Create RLS policies
ALTER TABLE trial_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ai_contexts ENABLE ROW LEVEL SECURITY;

-- Trial subscriptions policies
CREATE POLICY "Users can view their own trial subscriptions"
  ON trial_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own trial subscriptions"
  ON trial_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Email verifications policies
CREATE POLICY "Users can view their own email verifications"
  ON email_verifications FOR SELECT
  USING (auth.uid() = user_id);

-- User AI contexts policies
CREATE POLICY "Users can view their own AI contexts"
  ON user_ai_contexts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI contexts"
  ON user_ai_contexts FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update trial status
CREATE OR REPLACE FUNCTION update_trial_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate days remaining
  NEW.days_remaining := GREATEST(0, EXTRACT(DAY FROM (NEW.trial_end_date - NOW())));
  
  -- Update trial status based on end date
  IF NEW.trial_end_date < NOW() THEN
    NEW.is_trial_active := FALSE;
    NEW.trial_status := 'expired';
  ELSE
    NEW.is_trial_active := TRUE;
    NEW.trial_status := 'active';
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for trial status updates
DROP TRIGGER IF EXISTS update_trial_status_trigger ON trial_subscriptions;
CREATE TRIGGER update_trial_status_trigger
  BEFORE UPDATE ON trial_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_trial_status();

-- Create function to handle email verification
CREATE OR REPLACE FUNCTION verify_email(token_input TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  verification_record email_verifications;
  user_record auth.users;
BEGIN
  -- Find the verification record
  SELECT * INTO verification_record
  FROM email_verifications
  WHERE token = token_input
  AND verified_at IS NULL
  AND expires_at > NOW();
  
  -- If no valid record found
  IF verification_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update verification record
  UPDATE email_verifications
  SET verified_at = NOW()
  WHERE id = verification_record.id;
  
  -- Update trial subscription
  UPDATE trial_subscriptions
  SET email_verified = TRUE
  WHERE user_id = verification_record.user_id;
  
  -- Update user profile if exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
    UPDATE profiles
    SET email_verified = TRUE
    WHERE id = verification_record.user_id;
  END IF;
  
  -- Log activity
  INSERT INTO user_activities (user_id, activity_type, details)
  VALUES (verification_record.user_id, 'email_verified', jsonb_build_object('email', verification_record.email));
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
