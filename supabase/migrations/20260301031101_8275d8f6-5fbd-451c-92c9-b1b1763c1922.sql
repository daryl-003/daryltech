-- Allow anonymous users to upload CVs to student-cvs bucket
CREATE POLICY "Anyone can upload CV"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'student-cvs');

-- Allow admins to read CVs
CREATE POLICY "Admins can read CVs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'student-cvs' AND EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
));