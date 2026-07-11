
-- Add grading columns to task_submissions
ALTER TABLE public.task_submissions ADD COLUMN IF NOT EXISTS grade_score integer;
ALTER TABLE public.task_submissions ADD COLUMN IF NOT EXISTS grade_letter text;

-- Staff members table
CREATE TABLE IF NOT EXISTS public.staff_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id text UNIQUE NOT NULL,
  user_id uuid,
  full_name text NOT NULL,
  email text NOT NULL,
  department text,
  created_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid
);

ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage staff" ON public.staff_members FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff can view staff list" ON public.staff_members FOR SELECT USING (public.has_role(auth.uid(), 'staff'::app_role));
