CREATE OR REPLACE FUNCTION public.flag_user_by_email(p_email text, p_flagged boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email LIMIT 1;
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  UPDATE public.user_credits SET is_flagged = p_flagged, updated_at = now() WHERE user_id = v_user_id;
  RETURN true;
END;
$$;