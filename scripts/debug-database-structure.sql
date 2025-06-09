-- Debug script to check what tables exist
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname IN ('public', 'auth')
ORDER BY schemaname, tablename;

-- Check if auth.users exists and is accessible
SELECT COUNT(*) as user_count FROM auth.users;

-- Check if profiles table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
) as profiles_exists;

-- Check profiles table structure if it exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if analyses table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'analyses'
) as analyses_exists;

-- List all functions
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
