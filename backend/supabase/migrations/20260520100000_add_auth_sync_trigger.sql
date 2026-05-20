-- =============================================================================
-- migrations/20260520100000_add_auth_sync_trigger.sql
-- =============================================================================

-- Função para garantir que exista um registro em auth.users antes de inserir em public.users.
-- Isso resolve o erro de Foreign Key quando criamos perfis via backend (OTP).

CREATE OR REPLACE FUNCTION public.handle_new_user_sync_auth()
RETURNS TRIGGER AS $$
DECLARE
  existing_id uuid;
BEGIN
  -- 1. Verifica se já existe um usuário com este telefone em auth.users
  SELECT id INTO existing_id FROM auth.users WHERE phone = NEW.phone LIMIT 1;
  
  IF existing_id IS NOT NULL THEN
    -- Se existe, forçamos o ID do perfil a ser o mesmo do auth.users
    NEW.id := existing_id;
  ELSE
    -- 2. Se não existe, criamos o registro básico em auth.users
    INSERT INTO auth.users (
      id,
      phone,
      aud,
      role,
      phone_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.phone,
      'authenticated',
      'authenticated',
      now(),
      '{"provider":"phone","providers":["phone"]}',
      jsonb_build_object('full_name', NEW.full_name),
      now(),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger disparada ANTES do insert para satisfazer a FK PRIMARY KEY REFERENCES auth.users(id)
DROP TRIGGER IF EXISTS trg_create_auth_user_before_profile ON public.users;
CREATE TRIGGER trg_create_auth_user_before_profile
  BEFORE INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_sync_auth();
