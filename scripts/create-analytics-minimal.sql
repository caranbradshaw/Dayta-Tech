-- Absolute minimal analytics table with no dependencies
CREATE TABLE IF NOT EXISTS minimal_analytics (
  id SERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  user_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test data
INSERT INTO minimal_analytics (event_name, user_id) 
VALUES ('page_view', 'test-user');

-- Select to verify
SELECT * FROM minimal_analytics;
