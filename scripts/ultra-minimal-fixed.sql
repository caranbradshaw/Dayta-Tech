-- Ultra minimal setup that should work with any Supabase instance
-- This script avoids complex operations and focuses on the absolute minimum needed

-- Simple test table that doesn't depend on auth schema
CREATE TABLE IF NOT EXISTS public.simple_test (
    id SERIAL PRIMARY KEY,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a test record
INSERT INTO public.simple_test (name) 
VALUES ('Test Record') 
ON CONFLICT DO NOTHING;

-- Simple profiles table with minimal dependencies
CREATE TABLE IF NOT EXISTS public.basic_profiles (
    id UUID PRIMARY KEY,
    email TEXT,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Simple function that just returns success
CREATE OR REPLACE FUNCTION public.test_connection()
RETURNS TEXT AS $$
BEGIN
    RETURN 'Connection successful';
END;
$$ LANGUAGE plpgsql;

-- Return success message
SELECT 'Ultra minimal setup completed successfully' as result;
