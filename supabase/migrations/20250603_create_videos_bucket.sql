
-- Create videos storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('videos', 'videos', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow uploads to thumbnails folder
CREATE POLICY "Allow authenticated users to upload thumbnails" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'videos' AND path LIKE 'thumbnails/%');
  
-- Allow anyone to read thumbnails
CREATE POLICY "Allow anyone to read thumbnails" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'videos');
