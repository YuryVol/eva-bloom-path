-- ════════════════════════════════════════════════════════
--  EVA Admin Panel — Migration
--  Запустить в Supabase Dashboard → SQL Editor
-- ════════════════════════════════════════════════════════

-- 1. Роль в profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Установить себе admin (заменить на реальный user_id):
-- UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID_HERE';

-- 2. Таблица сессий
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer
);
CREATE INDEX IF NOT EXISTS user_sessions_user_started ON user_sessions (user_id, started_at);

-- 3. События онбординга
CREATE TABLE IF NOT EXISTS onboarding_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  step text NOT NULL,
  action text NOT NULL CHECK (action IN ('entered','completed','skipped')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS onboarding_events_user ON onboarding_events (user_id, step, created_at);

-- 4. Шаги путешествия
CREATE TABLE IF NOT EXISTS journey_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  journey_id uuid REFERENCES journeys ON DELETE CASCADE,
  step_name text NOT NULL,
  action text NOT NULL CHECK (action IN ('entered','completed','skipped','abandoned')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS journey_steps_journey ON journey_steps (journey_id, step_name);

-- 5. RLS: admin видит все profiles
DROP POLICY IF EXISTS admin_all_profiles ON profiles;
CREATE POLICY admin_all_profiles ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR id = auth.uid()
  );

-- RLS для новых таблиц
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_sessions_own ON user_sessions FOR ALL USING (user_id = auth.uid());
CREATE POLICY user_sessions_admin ON user_sessions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

ALTER TABLE onboarding_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY onboarding_events_own ON onboarding_events FOR ALL USING (user_id = auth.uid());
CREATE POLICY onboarding_events_admin ON onboarding_events FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

ALTER TABLE journey_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY journey_steps_own ON journey_steps FOR ALL USING (user_id = auth.uid());
CREATE POLICY journey_steps_admin ON journey_steps FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
