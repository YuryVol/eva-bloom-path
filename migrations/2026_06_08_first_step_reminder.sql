-- Migration: Add first_step reminder columns to profiles
-- Run this in Supabase SQL Editor before deploying

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_step_text text,
  ADD COLUMN IF NOT EXISTS first_step_reminder_at timestamptz,
  ADD COLUMN IF NOT EXISTS first_step_reminded boolean DEFAULT false;
