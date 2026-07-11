-- Allow anyone to update task_submissions where status is 'assigned' (student uploading their file)
CREATE POLICY "Students can submit assigned tasks"
ON public.task_submissions FOR UPDATE
USING (status = 'assigned')
WITH CHECK (status = 'pending');