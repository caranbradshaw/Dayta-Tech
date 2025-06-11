-- Create table to store custom industries and roles for AI learning
CREATE TABLE IF NOT EXISTS custom_fields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  field_type VARCHAR(20) NOT NULL CHECK (field_type IN ('industry', 'role')),
  field_value TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_count INTEGER DEFAULT 1,
  first_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_custom_fields_type ON custom_fields(field_type);
CREATE INDEX IF NOT EXISTS idx_custom_fields_value ON custom_fields(field_value);
CREATE INDEX IF NOT EXISTS idx_custom_fields_usage ON custom_fields(usage_count DESC);

-- Enable RLS
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own custom fields" ON custom_fields
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own custom fields" ON custom_fields
  FOR SELECT USING (auth.uid() = user_id);

-- Admin policy to view all custom fields for AI learning
CREATE POLICY "Admins can view all custom fields" ON custom_fields
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Function to increment usage count for existing custom fields
CREATE OR REPLACE FUNCTION increment_custom_field_usage(
  p_field_type VARCHAR(20),
  p_field_value TEXT,
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO custom_fields (field_type, field_value, user_id, usage_count)
  VALUES (p_field_type, p_field_value, p_user_id, 1)
  ON CONFLICT (field_type, field_value, user_id) 
  DO UPDATE SET 
    usage_count = custom_fields.usage_count + 1,
    last_used_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
