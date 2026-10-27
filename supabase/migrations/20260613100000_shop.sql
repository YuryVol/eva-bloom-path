-- Add purchased_practices to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS purchased_practices jsonb DEFAULT '[]'::jsonb;

-- Shop purchases log
CREATE TABLE IF NOT EXISTS shop_purchases (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id text NOT NULL,
  item_category text NOT NULL,
  coins_spent integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shop_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own purchases"
  ON shop_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own purchases"
  ON shop_purchases FOR SELECT
  USING (auth.uid() = user_id);
