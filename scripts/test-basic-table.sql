-- Test 1: Can we create a simple table?
CREATE TABLE IF NOT EXISTS test_table (
    id SERIAL PRIMARY KEY,
    name TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Test 2: Can we insert data?
INSERT INTO test_table (name) VALUES ('test');

-- Test 3: Can we select data?
SELECT * FROM test_table;

-- Test 4: Check if UUID extension is available
SELECT uuid_generate_v4();

-- Test 5: Check available extensions
SELECT * FROM pg_available_extensions WHERE name LIKE '%uuid%';

-- Clean up
DROP TABLE IF EXISTS test_table;
