-- =============================================================================
-- migrations/20260617000000_fix_participant_count_nulls.sql
-- Corrige eventos com participant_count NULL causados por registros inseridos
-- antes do DEFAULT 0 estar garantido no banco (via db.create_all).
-- Recalcula a partir das participações confirmadas existentes.
-- =============================================================================
UPDATE public.events
SET participant_count = (
    SELECT COUNT(*)
    FROM public.event_participations ep
    WHERE ep.event_id = events.id
      AND ep.status = 'confirmed'
)
WHERE participant_count IS NULL;