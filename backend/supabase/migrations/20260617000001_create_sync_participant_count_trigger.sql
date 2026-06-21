-- =============================================================================
-- migrations/20260617000001_create_sync_participant_count_trigger.sql
-- Cria a função e o trigger que mantém events.participant_count sincronizado
-- com event_participations.
--
-- Este trigger foi originalmente definido em 20260426130814, mas como as
-- tabelas foram criadas via db.create_all() do SQLAlchemy, aquela migration
-- nunca foi aplicada e o trigger não existe no banco.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.sync_participant_count()
  RETURNS trigger
  LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE public.events
       SET participant_count = participant_count + 1
     WHERE id = NEW.event_id;

  ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmed' THEN
    UPDATE public.events
       SET participant_count = GREATEST(participant_count - 1, 0)
     WHERE id = OLD.event_id;

  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'confirmed' AND OLD.status <> 'confirmed' THEN
      UPDATE public.events
         SET participant_count = participant_count + 1
       WHERE id = NEW.event_id;
    ELSIF OLD.status = 'confirmed' AND NEW.status <> 'confirmed' THEN
      UPDATE public.events
         SET participant_count = GREATEST(participant_count - 1, 0)
       WHERE id = NEW.event_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_participant_count ON public.event_participations;

CREATE TRIGGER trg_sync_participant_count
  AFTER INSERT OR UPDATE OF status OR DELETE ON public.event_participations
  FOR EACH ROW EXECUTE FUNCTION public.sync_participant_count();