CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id text UNIQUE NOT NULL,
  customer_id text NOT NULL,
  overall_status text DEFAULT 'draft',
  current_step text,
  insurance_type text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_activity_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon full access on applications"
  ON public.applications FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access on applications"
  ON public.applications FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_applications_application_id ON public.applications(application_id);
CREATE INDEX idx_applications_customer_id ON public.applications(customer_id);

CREATE TABLE public.application_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  step_key text NOT NULL,
  title text,
  step_order integer NOT NULL,
  status text DEFAULT 'locked',
  locked boolean DEFAULT true,
  data jsonb DEFAULT '{}',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_steps TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_steps TO authenticated;
GRANT ALL ON public.application_steps TO service_role;

ALTER TABLE public.application_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon full access on application_steps"
  ON public.application_steps FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access on application_steps"
  ON public.application_steps FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_application_steps_application_id ON public.application_steps(application_id);
CREATE INDEX idx_application_steps_step_key ON public.application_steps(step_key);

CREATE TABLE public.application_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  step_key text,
  actor text,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_history TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_history TO authenticated;
GRANT ALL ON public.application_history TO service_role;

ALTER TABLE public.application_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon full access on application_history"
  ON public.application_history FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access on application_history"
  ON public.application_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_application_history_application_id ON public.application_history(application_id);

CREATE TABLE public.submission_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  step_id uuid NOT NULL REFERENCES public.application_steps(id) ON DELETE CASCADE,
  step_key text NOT NULL,
  version_number integer NOT NULL,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.submission_versions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submission_versions TO authenticated;
GRANT ALL ON public.submission_versions TO service_role;

ALTER TABLE public.submission_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon full access on submission_versions"
  ON public.submission_versions FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access on submission_versions"
  ON public.submission_versions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_submission_versions_application_id ON public.submission_versions(application_id);
CREATE INDEX idx_submission_versions_step_id ON public.submission_versions(step_id);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  step_key text,
  type text,
  title text,
  message text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon full access on notifications"
  ON public.notifications FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated full access on notifications"
  ON public.notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_notifications_application_id ON public.notifications(application_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_application_steps_updated_at
  BEFORE UPDATE ON public.application_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
