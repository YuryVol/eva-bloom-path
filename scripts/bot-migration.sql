-- Bot migration: new profile fields + notification_log table
-- Run in Supabase SQL Editor

-- Telegram secure linking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tg_link_token text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tg_link_token_expires_at timestamptz;

-- Notification pause
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_paused_until timestamptz;

-- Preferred hour (MSK, 0-23)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_hour integer DEFAULT 10;

-- Oath postpone counter
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_step_postpone_count integer DEFAULT 0;

-- Premium notification flags
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_diary boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_world_state boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_guardians boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_guardian_last_sent timestamptz;

-- Joy archive (free & premium return reminders)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS joy_archive jsonb DEFAULT '[]'::jsonb;

-- Onboarding state (for multi-step /start flow)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tg_onboarding_step integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tg_onboarding_msg_id bigint;

-- Notification analytics log
CREATE TABLE IF NOT EXISTS notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'practice','return','digest','diary','world_state','guardian','milestone','oath'
  )),
  variant integer,
  is_premium boolean DEFAULT false,
  sent_at timestamptz DEFAULT now(),
  clicked_at timestamptz
);

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notification_log' AND policyname = 'admin_log'
  ) THEN
    CREATE POLICY "admin_log" ON notification_log FOR ALL
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS notification_log_user_id_idx ON notification_log (user_id);
CREATE INDEX IF NOT EXISTS notification_log_type_idx ON notification_log (type);
CREATE INDEX IF NOT EXISTS notification_log_sent_at_idx ON notification_log (sent_at);
