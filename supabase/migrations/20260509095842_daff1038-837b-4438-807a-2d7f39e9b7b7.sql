
CREATE TABLE public.jael_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  rating TEXT NOT NULL CHECK (rating IN ('up', 'down')),
  question TEXT,
  answer TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.jael_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit jael feedback"
  ON public.jael_feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view jael feedback"
  ON public.jael_feedback FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete jael feedback"
  ON public.jael_feedback FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_jael_feedback_rating_created ON public.jael_feedback (rating, created_at DESC);
