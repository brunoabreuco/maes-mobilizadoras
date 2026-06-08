DROP TRIGGER IF EXISTS trg_create_auth_user_before_profile ON public.users;
DROP FUNCTION IF EXISTS public.handle_new_user_sync_auth();
