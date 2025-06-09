-- Minimal analytics table with basic types only
CREATE TABLE analytics_simple (
    id SERIAL PRIMARY KEY,
    event_name TEXT NOT NULL,
    user_id TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Test insert
INSERT INTO analytics_simple (event_name, user_id) 
VALUES ('test_event', 'test_user');

-- Test select
SELECT * FROM analytics_simple;
