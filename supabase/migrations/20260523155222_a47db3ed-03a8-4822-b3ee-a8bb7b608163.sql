CREATE TABLE public.onboarding_progress (
  user_id uuid PRIMARY KEY,
  intro_seen boolean NOT NULL DEFAULT false,
  disclaimer_seen boolean NOT NULL DEFAULT false,
  user_name text,
  user_age integer,
  user_roles text[] NOT NULL DEFAULT '{}',
  auth_type text NOT NULL DEFAULT 'guest',
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding"
  ON public.onboarding_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding"
  ON public.onboarding_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding"
  ON public.onboarding_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER set_onboarding_progress_updated_at
  BEFORE UPDATE ON public.onboarding_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();