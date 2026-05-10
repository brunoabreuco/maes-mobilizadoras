-- =============================================================================
-- migrations/20260426140000_add_pending_phone_to_users.sql
-- =============================================================================
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS pending_phone varchar(20) NULL;