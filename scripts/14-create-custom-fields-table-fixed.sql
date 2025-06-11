-- Create table to store custom industries and roles for AI learning
CREATE TABLE IF NOT EXISTS custom_fields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  field_type VARCHAR(20) NOT NULL CHECK (field_type IN ('industry', 'role')),
  field_value TEXT NOT NULL,
  user_id UUID NOT NULL,
  usage_count INTEGER DEFAULT 1,
  first_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add unique constraint for proper conflict resolution
  UNIQUE(field_type, field_value, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_custom_fields_type ON custom_fields(field_type);
CREATE INDEX IF NOT EXISTS idx_custom_fields_value ON custom_fields(field_value);
CREATE INDEX IF NOT EXISTS idx_custom_fields_usage ON custom_fields(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_custom_fields_user ON custom_fields(user_id);

-- Simple function to record custom fields (no conflict resolution for now)
CREATE OR REPLACE FUNCTION record_custom_field(
  p_field_type VARCHAR(20),
  p_field_value TEXT,
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Insert new record or do nothing if exists
  INSERT INTO custom_fields (field_type, field_value, user_id, usage_count)
  VALUES (p_field_type, LOWER(TRIM(p_field_value)), p_user_id, 1)
  ON CONFLICT (field_type, field_value, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample data to test
INSERT INTO custom_fields (field_type, field_value, user_id) VALUES
('industry', 'fintech', gen_random_uuid()),
('industry', 'edtech', gen_random_uuid()),
('role', 'ml engineer', gen_random_uuid()),
('role', 'product owner', gen_random_uuid())
ON CONFLICT DO NOTHING;
