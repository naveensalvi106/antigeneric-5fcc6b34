CREATE OR REPLACE FUNCTION public.add_credits_by_email(p_email text, p_credits integer)
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
  
  INSERT INTO public.user_credits (user_id, credits, is_flagged)
  VALUES (v_user_id, p_credits, false)
  ON CONFLICT (user_id) DO UPDATE SET credits = user_credits.credits + p_credits, is_flagged = false, updated_at = now();
  
  RETURN true;
END;
$$;