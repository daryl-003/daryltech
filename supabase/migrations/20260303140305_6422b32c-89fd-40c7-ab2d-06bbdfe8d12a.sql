
-- Add video_url to blog_posts
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS video_url text;

-- Create internship_offers table
CREATE TABLE public.internship_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id text NOT NULL,
  student_name text NOT NULL,
  course text NOT NULL,
  offer_type text NOT NULL DEFAULT 'Internship Offer Letter',
  file_url text NOT NULL,
  file_name text NOT NULL,
  description text,
  issued_by text NOT NULL DEFAULT 'Daryl Tech Educational Network',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.internship_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage internship offers"
  ON public.internship_offers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view internship offers"
  ON public.internship_offers FOR SELECT
  USING (true);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-videos', 'blog-videos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('offer-letters', 'offer-letters', false);

-- Blog videos storage policies
CREATE POLICY "Anyone can view blog videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-videos');

CREATE POLICY "Admins can upload blog videos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog videos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-videos' AND public.has_role(auth.uid(), 'admin'));

-- Offer letters storage policies
CREATE POLICY "Admins can upload offer letters"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'offer-letters' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view offer letters"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'offer-letters' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete offer letters"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'offer-letters' AND public.has_role(auth.uid(), 'admin'));

-- Enable realtime for tables not yet added
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.enrollments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.internship_offers;
