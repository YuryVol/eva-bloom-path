-- Premium CTA events table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS premium_cta_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  context text NOT NULL,
  format text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('shown', 'clicked')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE premium_cta_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_cta" ON premium_cta_events
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "admin_cta" ON premium_cta_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX IF NOT EXISTS premium_cta_events_user_id_idx ON premium_cta_events (user_id);
CREATE INDEX IF NOT EXISTS premium_cta_events_context_idx ON premium_cta_events (context);
