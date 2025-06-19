-- Create storage buckets for file uploads and PDFs
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('user-uploads', 'user-uploads', false),
  ('daytatech-pdfs', 'daytatech-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user uploads
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'user-uploads' 
  AND auth.role() = 'authenticated' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email_verified = TRUE
  )
);

CREATE POLICY "Allow users to view their own uploads" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'user-uploads' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policies for PDF reports
CREATE POLICY "Allow authenticated users to upload PDFs" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'daytatech-pdfs' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to view PDF reports" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'daytatech-pdfs' 
  AND auth.role() = 'authenticated'
);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
