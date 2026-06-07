-- Add Telegram integration fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS telegram_chat_id bigint,
  ADD COLUMN IF NOT EXISTS notify_return boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_practices boolean NOT NULL DEFAULT true;
