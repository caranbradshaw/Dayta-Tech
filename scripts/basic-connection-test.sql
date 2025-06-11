-- Basic connection test - create a simple test table
CREATE TABLE IF NOT EXISTS connection_test (
  id SERIAL PRIMARY KEY,
  test_message TEXT DEFAULT 'Connection successful',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert a test record
INSERT INTO connection_test (test_message) 
VALUES ('Database setup working correctly');

-- Clean up the test table
DROP TABLE IF EXISTS connection_test;
