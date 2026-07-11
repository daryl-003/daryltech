-- Storage bucket for AI assistant assets
INSERT INTO storage.buckets (id, name, public) VALUES ('ai-assets', 'ai-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for ai-assets bucket
DO $$ BEGIN
  CREATE POLICY "AI assets are publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'ai-assets');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can upload ai assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ai-assets' AND has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update ai assets" ON storage.objects FOR UPDATE USING (bucket_id = 'ai-assets' AND has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete ai assets" ON storage.objects FOR DELETE USING (bucket_id = 'ai-assets' AND has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Simple key/value app settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can read app settings" ON public.app_settings FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can insert app settings" ON public.app_settings FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update app settings" ON public.app_settings FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN null; END $$;