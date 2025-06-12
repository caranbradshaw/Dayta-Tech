-- Simple database debug script that should work
SELECT 
  'Database Connection Test' as test_name,
  current_database() as database_name,
  current_user as current_user,
  version() as postgres_version,
  now() as current_time;

-- Check if we can create a simple table
CREATE TABLE IF NOT EXISTS debug_test (
  id SERIAL PRIMARY KEY,
  test_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert a test record
INSERT INTO debug_test (test_message) VALUES ('Debug test successful');

-- Check the record
SELECT * FROM debug_test ORDER BY created_at DESC LIMIT 1;

-- Clean up
DROP TABLE IF EXISTS debug_test;

-- Final success message
SELECT 'Database debug completed successfully' as result;
