INSERT INTO storage.buckets (id, name, public) VALUES ('qr-files', 'qr-files', true);
CREATE POLICY "Allow public read qr-files" ON storage.objects FOR SELECT USING (bucket_id = 'qr-files');
CREATE POLICY "Allow anon upload qr-files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'qr-files');