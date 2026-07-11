
-- Course progress tracking table
CREATE TABLE public.course_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id TEXT NOT NULL,
  module_name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view progress" ON public.course_progress FOR SELECT USING (true);
CREATE POLICY "Admins can manage progress" ON public.course_progress FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Admin notifications table
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view notifications" ON public.admin_notifications FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update notifications" ON public.admin_notifications FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert notifications" ON public.admin_notifications FOR INSERT WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;

-- Function to auto-create notification on new enrollment
CREATE OR REPLACE FUNCTION public.notify_new_enrollment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, metadata)
  VALUES (
    'enrollment',
    'New Student Enrolled',
    NEW.full_name || ' enrolled in ' || NEW.course,
    jsonb_build_object('enrollment_id', NEW.enrollment_id, 'email', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_enrollment
  AFTER INSERT ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_enrollment();

-- Function to auto-create notification on new contact
CREATE OR REPLACE FUNCTION public.notify_new_contact()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, metadata)
  VALUES (
    'contact',
    'New Contact Submission',
    NEW.name || ' - ' || NEW.subject,
    jsonb_build_object('email', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_contact
  AFTER INSERT ON public.contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_contact();

-- Default course modules for progress tracking
-- We'll seed some modules per course type
