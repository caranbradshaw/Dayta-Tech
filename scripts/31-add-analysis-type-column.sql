-- Add analysis_type column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS analysis_type TEXT;

-- Update existing users to have a default analysis_type if they don't have one
UPDATE profiles 
SET analysis_type = CASE 
    WHEN role LIKE '%scientist%' THEN 'Data Scientist'
    WHEN role LIKE '%engineer%' THEN 'Data Engineer'
    ELSE 'Data Scientist'
END
WHERE analysis_type IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_analysis_type ON profiles(analysis_type);
