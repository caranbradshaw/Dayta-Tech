-- Check what tables and columns already exist
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;

-- Check if profiles table has trial fields
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public';

-- Check existing analytics-related tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%analytic%' OR table_name LIKE '%event%' OR table_name LIKE '%activity%');
