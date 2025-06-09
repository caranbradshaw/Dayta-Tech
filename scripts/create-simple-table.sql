-- Create the simplest possible table
CREATE TABLE IF NOT EXISTS test_table (
    id SERIAL PRIMARY KEY,
    name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a test row
INSERT INTO test_table (name) VALUES ('Test entry');

-- Select from the table to verify
SELECT * FROM test_table;
