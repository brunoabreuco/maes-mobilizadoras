-- =============================================================================
-- rollback_20260617000000.sql
-- Desfaz a migration 20260617000000_fix_participant_count_nulls.sql
-- Restaura NULL em eventos que não possuem nenhuma participação confirmada,
-- revertendo ao estado anterior à correção.
-- =============================================================================
UPDATE public.events
SET participant_count = NULL
WHERE NOT EXISTS (
    SELECT 1
    FROM public.event_participations ep
    WHERE ep.event_id = events.id
      AND ep.status = 'confirmed'
);