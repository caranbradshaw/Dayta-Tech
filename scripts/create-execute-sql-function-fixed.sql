-- Drop the function if it exists to avoid conflicts
DROP FUNCTION IF EXISTS execute_sql(TEXT);

-- Create a function to execute arbitrary SQL with more permissive settings
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
-- Using invoker rights instead of definer for better compatibility
SECURITY INVOKER 
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Log the query being executed (helpful for debugging)
  RAISE NOTICE 'Executing SQL: %', sql_query;
  
  -- Execute the query and capture any output if it's a SELECT
  BEGIN
    EXECUTE sql_query;
    result := jsonb_build_object('success', true, 'message', 'Query executed successfully');
    RETURN result;
  EXCEPTION WHEN OTHERS THEN
    -- Return detailed error information
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE,
      'context', 'Error executing SQL query'
    );
  END;
END;
$$;

-- Grant execute permission more broadly if needed
GRANT EXECUTE ON FUNCTION execute_sql TO PUBLIC;

-- Return success message to confirm function was created
SELECT 'execute_sql function created successfully' AS result;
