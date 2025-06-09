-- Create a function to execute arbitrary SQL
-- This allows executing SQL from the Supabase client
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION execute_sql TO service_role;
