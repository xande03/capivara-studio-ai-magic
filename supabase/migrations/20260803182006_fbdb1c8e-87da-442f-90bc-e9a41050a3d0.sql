-- Remove broad SELECT policy: public bucket files stay reachable via their
-- exact public URL, but clients can no longer list/enumerate bucket contents.
DROP POLICY IF EXISTS "Allow public read qr-files" ON storage.objects;

-- Tighten anonymous uploads with path/extension validation
DROP POLICY IF EXISTS "Allow anon upload qr-files" ON storage.objects;

CREATE POLICY "Anon can upload validated qr-files"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'qr-files'
  AND array_length(regexp_split_to_array(name, '/'), 1) = 1
  AND length(name) BETWEEN 5 AND 200
  AND name !~ '\.\.'
  AND lower(name) ~ '\.(pdf|docx?|xlsx?|pptx?|txt|csv|png|jpe?g|webp|gif|svg)$'
);