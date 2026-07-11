
-- Task submissions table
CREATE TABLE IF NOT EXISTS public.task_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id text NOT NULL,
  student_name text NOT NULL,
  student_email text NOT NULL,
  course text NOT NULL,
  task_title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_feedback text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone
);

ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert task submissions"
ON public.task_submissions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view task submissions"
ON public.task_submissions FOR SELECT
USING (true);

CREATE POLICY "Admins can update task submissions"
ON public.task_submissions FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete task submissions"
ON public.task_submissions FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.notify_new_task_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, metadata)
  VALUES (
    'task_submission',
    'New Task Submission',
    NEW.student_name || ' submitted "' || NEW.task_title || '" for ' || NEW.course,
    jsonb_build_object('enrollment_id', NEW.enrollment_id, 'email', NEW.student_email, 'task_title', NEW.task_title)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_task_submission
AFTER INSERT ON public.task_submissions
FOR EACH ROW EXECUTE FUNCTION public.notify_new_task_submission();

ALTER PUBLICATION supabase_realtime ADD TABLE public.task_submissions;

-- Create storage bucket for task submissions
INSERT INTO storage.buckets (id, name, public) VALUES ('task-submissions', 'task-submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for task submissions bucket
CREATE POLICY "Anyone can upload task files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'task-submissions');

CREATE POLICY "Anyone can view task files"
ON storage.objects FOR SELECT
USING (bucket_id = 'task-submissions');
