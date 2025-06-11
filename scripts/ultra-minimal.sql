-- Ultra minimal table creation
CREATE TABLE IF NOT EXISTS test_table (
  id SERIAL PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a test row
INSERT INTO test_table (name) VALUES ('Test entry');

-- Verify it worked
SELECT * FROM test_table;
