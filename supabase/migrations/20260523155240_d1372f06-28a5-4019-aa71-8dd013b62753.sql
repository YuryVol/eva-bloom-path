DROP POLICY "Users can view own onboarding" ON public.onboarding_progress;
DROP POLICY "Users can insert own onboarding" ON public.onboarding_progress;
DROP POLICY "Users can update own onboarding" ON public.onboarding_progress;

CREATE POLICY "Users can view own onboarding"
  ON public.onboarding_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding"
  ON public.onboarding_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding"
  ON public.onboarding_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);