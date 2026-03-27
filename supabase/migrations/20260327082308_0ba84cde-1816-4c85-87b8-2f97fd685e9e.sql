CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'thumbnail-uploads');

CREATE POLICY "Allow anon uploads" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'thumbnail-uploads');

CREATE POLICY "Allow public read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'thumbnail-uploads');