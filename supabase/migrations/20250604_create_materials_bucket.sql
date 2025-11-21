
-- Create a storage bucket for materials thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'Materials Thumbnails', true);

-- Allow anyone to read files from the materials bucket
CREATE POLICY "Anyone can view materials thumbnails" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'materials');
    
-- Allow authenticated users to upload files to the materials bucket
CREATE POLICY "Authenticated users can upload files" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'materials');

-- Allow users to update their own files
CREATE POLICY "Users can update their own files" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'materials' AND auth.uid() = owner);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'materials' AND auth.uid() = owner);
