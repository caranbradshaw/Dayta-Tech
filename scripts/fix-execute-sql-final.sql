-- First, let's check what's currently in the database
SELECT 'Starting execute_sql function setup...' as status;

-- Drop any existing versions to avoid conflicts
DROP FUNCTION IF EXISTS execute_sql(TEXT);
DROP FUNCTION IF EXISTS public.execute_sql(TEXT);

-- Create the function with minimal permissions and error handling
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    result_count INTEGER;
    error_msg TEXT;
BEGIN
    -- Basic validation
    IF sql_query IS NULL OR LENGTH(TRIM(sql_query)) = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Empty SQL query provided'
        );
    END IF;
    
    -- Execute the query
    BEGIN
        EXECUTE sql_query;
        GET DIAGNOSTICS result_count = ROW_COUNT;
        
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Query executed successfully',
            'rows_affected', result_count
        );
        
    EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS error_msg = MESSAGE_TEXT;
        
        RETURN jsonb_build_object(
            'success', false,
            'error', error_msg,
            'sqlstate', SQLSTATE
        );
    END;
END;
$$;

-- Test the function immediately
SELECT public.execute_sql('SELECT 1 as test') as test_result;

-- Show success message
SELECT 'execute_sql function created and tested successfully!' as final_status;
