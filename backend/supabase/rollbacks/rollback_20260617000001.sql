-- =============================================================================
-- rollback_20260617000001.sql
-- =============================================================================

DROP TRIGGER IF EXISTS trg_sync_participant_count ON public.event_participations;
DROP FUNCTION IF EXISTS public.sync_participant_count();